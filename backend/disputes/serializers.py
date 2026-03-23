# disputes/ serializers.py
from rest_framework import serializers
from .models import Dispute

class DisputeSerializer(serializers.ModelSerializer):
    """Dispute serializer"""
    raised_by_email = serializers.EmailField(source='raised_by.email', read_only=True)
    transaction_reference = serializers.SerializerMethodField()
    gig_id = serializers.UUIDField(source='transaction.gig_id', read_only=True, allow_null=True)

    def get_transaction_reference(self, obj):
        return obj.transaction_reference
    
    class Meta:
        model = Dispute
        fields = ['id', 'transaction', 'transaction_reference', 'raised_by', 
                 'raised_by_email', 'reason', 'admin_notes', 'status', 'created_at', 
                 'updated_at', 'resolved_at', 'resolved_by', 'gig_id', 'supabase_id']
        read_only_fields = ['created_at', 'updated_at', 'resolved_at', 'raised_by', 'resolved_by']
