from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Transaction
from .serializers import TransactionSerializer, TransactionCreateUpdateSerializer


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.select_related('customer', 'order')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['transaction_type', 'payment_method', 'status', 'customer', 'order', 'currency']
    search_fields = ['transaction_id', 'customer__first_name', 'customer__last_name', 'gateway_transaction_id']
    ordering_fields = ['transaction_id', 'amount', 'created_at', 'processed_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TransactionCreateUpdateSerializer
        return TransactionSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)
