# transactions/models.py

import uuid
from django.db import models
from decimal import Decimal


class PlatformFee(models.Model):
    """
    Stores the platform fee configuration.
    Admin can edit these without touching code.
    Only one active config should exist at a time.
    """
    name = models.CharField(max_length=100, default='Default Fee Structure')

    platform_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=5.00,
        help_text="Platform fee percentage e.g. 5.00 for 5%"
    )
    platform_fixed = models.DecimalField(
        max_digits=10, decimal_places=2, default=2.00,
        help_text="Fixed platform fee in rands e.g. 2.00"
    )
    payfast_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=3.50,
        help_text="PayFast fee percentage e.g. 3.50 for 3.5%"
    )
    payfast_fixed = models.DecimalField(
        max_digits=10, decimal_places=2, default=2.00,
        help_text="Fixed PayFast fee in rands e.g. 2.00"
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Platform Fee Configuration"
        verbose_name_plural = "Platform Fee Configurations"

    def __str__(self):
        return f"{self.name} - Platform: {self.platform_percentage}% + R{self.platform_fixed} | PayFast: {self.payfast_percentage}% + R{self.payfast_fixed}"

    @classmethod
    def get_active(cls):
        """Get the active fee config, or create a default one if none exists"""
        config = cls.objects.filter(is_active=True).first()
        if not config:
            config = cls.objects.create(name='Default Fee Structure')
        return config


class Transaction(models.Model):
    """
    Maps to the Supabase transactions table.
    managed=False means Django won't create/modify this table —
    it already exists in Supabase.
    """

    TRANSACTION_TYPE_CHOICES = [
        ('hold', 'Hold - Funds held in escrow'),
        ('release', 'Release - Funds released to hustler'),
        ('refund', 'Refund - Funds returned to client'),
        ('top_up', 'Top Up - Balance top up'),
        ('platform_fee', 'Platform Fee - Fee deducted'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    gig_id = models.UUIDField(null=True, blank=True)
    from_user_id = models.UUIDField(null=True, blank=True)
    to_user_id = models.UUIDField(null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES, default='hold')
    note = models.TextField(null=True, blank=True)
    fee_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    fee_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    subtotal_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    payfast_payment_id = models.CharField(max_length=100, blank=True, null=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    release_requested_at = models.DateTimeField(null=True, blank=True)
    released_at = models.DateTimeField(null=True, blank=True)
    auto_release_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "transactions"
        managed = False

    def __str__(self):
        return f"Transaction {self.id} - {self.type} - R{self.amount}"

    def calculate_fees(self):
        """Calculate fees using the active PlatformFee config"""
        config = PlatformFee.get_active()
        gross = self.amount
        payfast_fee = (gross * Decimal(str(config.payfast_percentage)) / Decimal('100')) + Decimal(str(config.payfast_fixed))
        platform_fee = (gross * Decimal(str(config.platform_percentage)) / Decimal('100')) + Decimal(str(config.platform_fixed))
        total_fee = payfast_fee + platform_fee
        net = gross - total_fee

        if net < 0:
            raise ValueError(f"Fees exceed transaction amount. Gross: R{gross}, Total fees: R{total_fee}")

        self.subtotal_amount = gross
        self.fee_amount = round(total_fee, 2)
        self.fee_percentage = round((total_fee / gross) * Decimal('100'), 2)
        self.total_amount = round(net, 2)

        return self.total_amount

    def get_fee_breakdown(self):
        """Return a readable fee breakdown dict"""
        config = PlatformFee.get_active()
        gross = self.amount
        payfast_fee = (gross * Decimal(str(config.payfast_percentage)) / Decimal('100')) + Decimal(str(config.payfast_fixed))
        platform_fee = (gross * Decimal(str(config.platform_percentage)) / Decimal('100')) + Decimal(str(config.platform_fixed))
        total_fee = payfast_fee + platform_fee
        net = gross - total_fee

        return {
            'gross_amount': float(gross),
            'payfast_fee': round(float(payfast_fee), 2),
            'platform_fee': round(float(platform_fee), 2),
            'total_fee': round(float(total_fee), 2),
            'net_to_seller': round(float(net), 2),
            'payfast_rate': f"{config.payfast_percentage}% + R{config.payfast_fixed}",
            'platform_rate': f"{config.platform_percentage}% + R{config.platform_fixed}",
        }

    def set_auto_release_date(self):
        """Set auto-release to 1 day after delivery"""
        from django.utils import timezone
        from datetime import timedelta
        if self.delivered_at:
            self.auto_release_at = self.delivered_at + timedelta(days=1)
            return self.auto_release_at
        return None