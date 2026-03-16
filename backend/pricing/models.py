from django.db import models


class Profile(models.Model):
    id = models.UUIDField(primary_key=True)
    role = models.CharField(max_length=20)
    balance = models.DecimalField(max_digits=12, decimal_places=2, null=True)

    class Meta:
        db_table = "profiles"
        managed = False


class PricingConfig(models.Model):
    id = models.UUIDField(primary_key=True)
    category = models.CharField(max_length=32)
    base_hourly_rate = models.DecimalField(max_digits=12, decimal_places=2)
    per_km_rate = models.DecimalField(max_digits=12, decimal_places=2)
    complexity_multipliers = models.JSONField(default=dict)
    platform_fee_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    min_budget = models.DecimalField(max_digits=12, decimal_places=2)
    max_budget = models.DecimalField(max_digits=12, decimal_places=2)
    suggested_band_pct = models.DecimalField(max_digits=5, decimal_places=2, default=20)
    updated_by = models.UUIDField(null=True)
    updated_reason = models.TextField(null=True)
    created_at = models.DateTimeField(null=True)
    updated_at = models.DateTimeField(null=True)

    class Meta:
        db_table = "pricing_config"
        managed = False


class PricingConfigHistory(models.Model):
    id = models.UUIDField(primary_key=True)
    pricing_config_id = models.UUIDField(null=True)
    category = models.CharField(max_length=32)
    change_type = models.CharField(max_length=20)
    changed_by = models.UUIDField(null=True)
    change_reason = models.TextField()
    before = models.JSONField(null=True)
    after = models.JSONField(null=True)
    created_at = models.DateTimeField(null=True)

    class Meta:
        db_table = "pricing_config_history"
        managed = False


class PricingOverride(models.Model):
    id = models.UUIDField(primary_key=True)
    gig_id = models.UUIDField(null=True)
    client_id = models.UUIDField()
    category = models.CharField(max_length=32)
    requested_budget = models.DecimalField(max_digits=12, decimal_places=2)
    suggested_budget = models.DecimalField(max_digits=12, decimal_places=2)
    adjustment_pct = models.DecimalField(max_digits=8, decimal_places=4)
    reason = models.TextField(null=True)
    status = models.CharField(max_length=20)
    admin_id = models.UUIDField(null=True)
    admin_note = models.TextField(null=True)
    created_at = models.DateTimeField(null=True)
    updated_at = models.DateTimeField(null=True)

    class Meta:
        db_table = "pricing_overrides"
        managed = False


class Gig(models.Model):
    id = models.UUIDField(primary_key=True)
    client_id = models.UUIDField()
    hustler_id = models.UUIDField(null=True)
    title = models.TextField()
    description = models.TextField()
    location = models.TextField()
    category = models.CharField(max_length=32)
    status = models.CharField(max_length=32)
    budget = models.DecimalField(max_digits=12, decimal_places=2)
    pricing_config_id = models.UUIDField(null=True)
    pricing_snapshot = models.JSONField(null=True)
    pricing_inputs = models.JSONField(null=True)
    pricing_subtotal = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    pricing_fee = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    pricing_total = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    pricing_adjustment_pct = models.DecimalField(max_digits=8, decimal_places=4, null=True)
    pricing_complexity_multiplier = models.DecimalField(max_digits=8, decimal_places=4, null=True)
    pricing_status = models.CharField(max_length=20, null=True)
    platform_fee_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    cart_value = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    created_at = models.DateTimeField(null=True)
    updated_at = models.DateTimeField(null=True)

    class Meta:
        db_table = "gigs"
        managed = False


class Transaction(models.Model):
    id = models.UUIDField(primary_key=True)
    gig_id = models.UUIDField(null=True)
    from_user_id = models.UUIDField(null=True)
    to_user_id = models.UUIDField(null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    fee_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    fee_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    subtotal_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    type = models.CharField(max_length=20)
    created_at = models.DateTimeField(null=True)

    class Meta:
        db_table = "transactions"
        managed = False