from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Sum, Q
from django.utils import timezone
from .models import Membership, MembershipTier, MembershipHistory
from .serializers import (
    MembershipListSerializer, MembershipDetailSerializer, MembershipCreateUpdateSerializer,
    MembershipTierSerializer, MembershipHistorySerializer
)


class MembershipTierViewSet(viewsets.ModelViewSet):
    queryset = MembershipTier.objects.all()
    serializer_class = MembershipTierSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'priority', 'minimum_spent', 'created_at']
    ordering = ['-priority', 'minimum_spent']

    @action(detail=False, methods=['get'])
    def stats(self, request):
        tiers_with_counts = MembershipTier.objects.annotate(
            member_count=Count('membership'),
            active_member_count=Count('membership', filter=Q(membership__status='active'))
        ).order_by('-priority')
        
        return Response([
            {
                'id': tier.id,
                'name': tier.name,
                'member_count': tier.member_count,
                'active_member_count': tier.active_member_count,
                'minimum_spent': float(tier.minimum_spent),
                'discount_percentage': float(tier.discount_percentage)
            }
            for tier in tiers_with_counts
        ])


class MembershipViewSet(viewsets.ModelViewSet):
    queryset = Membership.objects.select_related('customer', 'tier')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'tier']
    search_fields = ['membership_number', 'customer__first_name', 'customer__last_name']
    ordering_fields = ['join_date', 'expiry_date', 'points_balance', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return MembershipListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return MembershipCreateUpdateSerializer
        return MembershipDetailSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        
        total_members = queryset.count()
        active_members = queryset.filter(status='active').count()
        
        today = timezone.now().date()
        expiring_soon = queryset.filter(
            expiry_date__lte=today + timezone.timedelta(days=30),
            expiry_date__gt=today,
            status='active'
        ).count()
        
        total_points_issued = queryset.aggregate(
            total=Sum('points_earned')
        )['total'] or 0
        
        total_points_redeemed = queryset.aggregate(
            total=Sum('points_redeemed')
        )['total'] or 0
        
        tier_distribution = queryset.values(
            'tier__name'
        ).annotate(
            count=Count('id')
        ).order_by('-count')
        
        return Response({
            'total_members': total_members,
            'active_members': active_members,
            'expiring_soon': expiring_soon,
            'total_points_issued': total_points_issued,
            'total_points_redeemed': total_points_redeemed,
            'points_balance': total_points_issued - total_points_redeemed,
            'tier_distribution': list(tier_distribution)
        })

    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        days = int(request.GET.get('days', 30))
        end_date = timezone.now().date() + timezone.timedelta(days=days)
        
        expiring_memberships = self.get_queryset().filter(
            expiry_date__lte=end_date,
            expiry_date__gt=timezone.now().date(),
            status='active'
        ).order_by('expiry_date')
        
        serializer = self.get_serializer(expiring_memberships, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def add_points(self, request, pk=None):
        membership = self.get_object()
        points = request.data.get('points', 0)
        reason = request.data.get('reason', '')
        
        if points <= 0:
            return Response(
                {'error': 'Points must be greater than 0'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        membership.points_earned += points
        membership.save()
        
        return Response({
            'message': f'Added {points} points to membership',
            'new_balance': membership.points_balance
        })

    @action(detail=True, methods=['post'])
    def redeem_points(self, request, pk=None):
        membership = self.get_object()
        points = request.data.get('points', 0)
        reason = request.data.get('reason', '')
        
        if points <= 0:
            return Response(
                {'error': 'Points must be greater than 0'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if points > membership.points_balance:
            return Response(
                {'error': 'Insufficient points balance'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        membership.points_redeemed += points
        membership.save()
        
        return Response({
            'message': f'Redeemed {points} points from membership',
            'new_balance': membership.points_balance
        })