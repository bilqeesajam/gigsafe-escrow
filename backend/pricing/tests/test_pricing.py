from decimal import Decimal
from pricing.services import calculate_pricing


class FakeConfig:
    def __init__(self):
        self.base_hourly_rate = Decimal("100")
        self.per_km_rate = Decimal("10")
        self.platform_fee_percentage = Decimal("10")
        self.suggested_band_pct = Decimal("20")
        self.complexity_multipliers = {"weekend": 1.5}


def test_calculate_pricing_basic():
    config = FakeConfig()
    result = calculate_pricing(config, Decimal("2"), Decimal("5"), [])
    assert result.subtotal == Decimal("250")
    assert result.fee == Decimal("25")
    assert result.total == Decimal("275")


def test_calculate_pricing_complexity():
    config = FakeConfig()
    result = calculate_pricing(config, Decimal("2"), Decimal("0"), ["weekend"])
    assert result.subtotal == Decimal("300")