# transactions/admin.py

from django.contrib import admin
from django.contrib import messages
from .models import Transaction, PlatformFee
from .release import ReleaseService


@admin.register(PlatformFee)
class PlatformFeeAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'platform_percentage',
        'platform_fixed',
        'payfast_percentage',
        'payfast_fixed',
        'is_active',
        'created_at',
        'updated_at',
    ]
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Configuration Name', {
            'fields': ('name', 'is_active')
        }),
        ('Platform Fees (Your Escrow Charge)', {
            'fields': ('platform_percentage', 'platform_fixed'),
            'description': 'Example: 5.00% + R2.00'
        }),
        ('PayFast Fees (Payment Gateway)', {
            'fields': ('payfast_percentage', 'payfast_fixed'),
            'description': 'Example: 3.5% + R2.00'
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
        }),
    )


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'from_user_id',
        'to_user_id',
        'amount',
        'type',
        'created_at',
    ]
    list_filter = ['type', 'created_at']
    search_fields = ['id', 'from_user_id', 'to_user_id', 'note', 'payfast_payment_id']
    readonly_fields = [
        'id',
        'created_at',
        'delivered_at',
        'release_requested_at',
        'released_at',
        'auto_release_at',
    ]

    fieldsets = (
        ('Core Transaction Info', {
            'fields': ('id', 'gig_id', 'from_user_id', 'to_user_id', 'type', 'note')
        }),
        ('Financial Details', {
            'fields': ('amount', 'fee_amount', 'fee_percentage', 'subtotal_amount', 'total_amount')
        }),
        ('Payment Processing', {
            'fields': ('payfast_payment_id',)
        }),
        ('Timeline', {
            'fields': ('created_at', 'delivered_at', 'release_requested_at', 'released_at', 'auto_release_at')
        }),
    )

    actions = ['manual_release_funds', 'manual_refund_funds']

    def manual_release_funds(self, request, queryset):
        for transaction in queryset:
            if transaction.type == 'hold':
                try:
                    release_service = ReleaseService(transaction)
                    result = release_service.release_funds()
                    if result.get('success'):
                        self.message_user(request, f"Released R{transaction.amount} for transaction {transaction.id}", messages.SUCCESS)
                    else:
                        self.message_user(request, f"Failed: {result.get('error')}", messages.ERROR)
                except Exception as e:
                    self.message_user(request, f"Error: {str(e)}", messages.ERROR)
            else:
                self.message_user(request, f"Transaction {transaction.id} is not in hold state", messages.WARNING)

    def manual_refund_funds(self, request, queryset):
        updated = queryset.filter(type='hold').update(type='refund')
        self.message_user(request, f"{updated} transaction(s) marked as refunded", messages.SUCCESS)

    manual_release_funds.short_description = "Release funds for selected transactions"
    manual_refund_funds.short_description = "Refund selected transactions"