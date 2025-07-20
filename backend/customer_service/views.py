from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, F
from django.utils import timezone
from datetime import timedelta

from .models import ServiceTicket, ServiceNote, KnowledgeBase, KnowledgeBaseCategory, FAQ
from .serializers import (
    ServiceTicketListSerializer, ServiceTicketDetailSerializer, ServiceTicketCreateUpdateSerializer,
    ServiceNoteSerializer, KnowledgeBaseListSerializer, KnowledgeBaseDetailSerializer,
    KnowledgeBaseCreateUpdateSerializer, KnowledgeBaseCategorySerializer,
    FAQSerializer, FAQCreateUpdateSerializer
)


class ServiceTicketViewSet(viewsets.ModelViewSet):
    """客服工單 ViewSet"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'category', 'assigned_to', 'customer']
    search_fields = ['ticket_number', 'title', 'description', 'customer__full_name', 'customer__email']
    ordering_fields = ['created_at', 'updated_at', 'priority', 'status']
    ordering = ['-created_at']

    def get_queryset(self):
        return ServiceTicket.objects.select_related(
            'customer', 'assigned_to', 'created_by'
        ).prefetch_related('notes')

    def get_serializer_class(self):
        if self.action == 'list':
            return ServiceTicketListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ServiceTicketCreateUpdateSerializer
        else:
            return ServiceTicketDetailSerializer

    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        """新增客服記錄"""
        ticket = self.get_object()
        serializer = ServiceNoteSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            note = serializer.save(ticket=ticket, created_by=request.user)
            
            # 更新工單的 first_response_at
            if not ticket.first_response_at and note.note_type in ['customer', 'resolution']:
                ticket.first_response_at = timezone.now()
                ticket.save()
            
            return Response(ServiceNoteSerializer(note).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def close_ticket(self, request, pk=None):
        """關閉工單"""
        ticket = self.get_object()
        
        if ticket.status not in ['resolved', 'closed']:
            return Response(
                {'error': '只有已解決的工單才能關閉'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ticket.status = 'closed'
        ticket.closed_at = timezone.now()
        ticket.save()
        
        return Response({'message': '工單已關閉'})

    @action(detail=True, methods=['post'])
    def resolve_ticket(self, request, pk=None):
        """解決工單"""
        ticket = self.get_object()
        
        ticket.status = 'resolved'
        ticket.resolved_at = timezone.now()
        ticket.save()
        
        # 新增解決記錄
        if request.data.get('resolution_note'):
            ServiceNote.objects.create(
                ticket=ticket,
                content=request.data['resolution_note'],
                note_type='resolution',
                created_by=request.user,
                is_visible_to_customer=True
            )
        
        return Response({'message': '工單已解決'})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """客服統計"""
        # 基本統計
        total_tickets = ServiceTicket.objects.count()
        open_tickets = ServiceTicket.objects.filter(status='open').count()
        in_progress_tickets = ServiceTicket.objects.filter(status='in_progress').count()
        resolved_tickets = ServiceTicket.objects.filter(status='resolved').count()
        
        # 今日新建工單
        today = timezone.now().date()
        today_tickets = ServiceTicket.objects.filter(created_at__date=today).count()
        
        # 本月統計
        month_start = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_tickets = ServiceTicket.objects.filter(created_at__gte=month_start).count()
        month_resolved = ServiceTicket.objects.filter(
            resolved_at__gte=month_start
        ).count()
        
        # 平均回應時間（小時）
        avg_response_time = ServiceTicket.objects.filter(
            first_response_at__isnull=False
        ).aggregate(
            avg_time=timezone.now()
        )
        
        # 按優先級統計
        priority_stats = ServiceTicket.objects.values('priority').annotate(
            count=Count('id')
        ).order_by('priority')
        
        # 按分類統計
        category_stats = ServiceTicket.objects.values('category').annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        return Response({
            'total_tickets': total_tickets,
            'open_tickets': open_tickets,
            'in_progress_tickets': in_progress_tickets,
            'resolved_tickets': resolved_tickets,
            'today_tickets': today_tickets,
            'month_tickets': month_tickets,
            'month_resolved': month_resolved,
            'priority_stats': list(priority_stats),
            'category_stats': list(category_stats)
        })


class ServiceNoteViewSet(viewsets.ModelViewSet):
    """客服記錄 ViewSet"""
    queryset = ServiceNote.objects.select_related('ticket', 'created_by').all()
    serializer_class = ServiceNoteSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['ticket', 'note_type', 'is_visible_to_customer']
    ordering_fields = ['created_at']
    ordering = ['created_at']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class KnowledgeBaseCategoryViewSet(viewsets.ModelViewSet):
    """知識庫分類 ViewSet"""
    queryset = KnowledgeBaseCategory.objects.filter(is_active=True)
    serializer_class = KnowledgeBaseCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering = ['sort_order', 'name']

    @action(detail=True, methods=['get'])
    def articles(self, request, pk=None):
        """取得分類下的文章"""
        category = self.get_object()
        articles = KnowledgeBase.objects.filter(
            category=category, is_active=True
        ).order_by('-updated_at')
        
        serializer = KnowledgeBaseListSerializer(articles, many=True)
        return Response(serializer.data)


class KnowledgeBaseViewSet(viewsets.ModelViewSet):
    """知識庫 ViewSet"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'content_type', 'is_public', 'is_featured']
    search_fields = ['title', 'content', 'summary', 'tags']
    ordering_fields = ['created_at', 'updated_at', 'view_count']
    ordering = ['-updated_at']

    def get_queryset(self):
        return KnowledgeBase.objects.filter(is_active=True).select_related(
            'category', 'created_by', 'updated_by'
        )

    def get_serializer_class(self):
        if self.action == 'list':
            return KnowledgeBaseListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return KnowledgeBaseCreateUpdateSerializer
        else:
            return KnowledgeBaseDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        """獲取詳情時增加瀏覽次數"""
        instance = self.get_object()
        instance.view_count = F('view_count') + 1
        instance.save(update_fields=['view_count'])
        # 重新載入實例以獲取更新後的值
        instance.refresh_from_db()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_helpful(self, request, pk=None):
        """標記為有用"""
        article = self.get_object()
        article.helpful_count = F('helpful_count') + 1
        article.save(update_fields=['helpful_count'])
        return Response({'message': '感謝您的反饋'})

    @action(detail=True, methods=['post'])
    def mark_not_helpful(self, request, pk=None):
        """標記為無用"""
        article = self.get_object()
        article.not_helpful_count = F('not_helpful_count') + 1
        article.save(update_fields=['not_helpful_count'])
        return Response({'message': '感謝您的反饋'})

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """獲取精選文章"""
        articles = self.get_queryset().filter(is_featured=True)[:10]
        serializer = KnowledgeBaseListSerializer(articles, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        """搜尋知識庫"""
        query = request.query_params.get('q', '')
        if not query:
            return Response([])
        
        articles = self.get_queryset().filter(
            Q(title__icontains=query) |
            Q(content__icontains=query) |
            Q(summary__icontains=query)
        ).order_by('-view_count')[:20]
        
        serializer = KnowledgeBaseListSerializer(articles, many=True)
        return Response(serializer.data)


class FAQViewSet(viewsets.ModelViewSet):
    """FAQ ViewSet"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_active', 'is_featured']
    search_fields = ['question', 'answer']
    ordering_fields = ['sort_order', 'view_count', 'created_at']
    ordering = ['-is_featured', 'sort_order']

    def get_queryset(self):
        return FAQ.objects.filter(is_active=True).select_related('category', 'created_by')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return FAQCreateUpdateSerializer
        else:
            return FAQSerializer

    def retrieve(self, request, *args, **kwargs):
        """獲取詳情時增加瀏覽次數"""
        instance = self.get_object()
        instance.view_count = F('view_count') + 1
        instance.save(update_fields=['view_count'])
        instance.refresh_from_db()
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """獲取精選 FAQ"""
        faqs = self.get_queryset().filter(is_featured=True)
        serializer = FAQSerializer(faqs, many=True)
        return Response(serializer.data)