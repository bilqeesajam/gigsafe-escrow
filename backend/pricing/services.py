from decimal import Decimal
from typing import Iterable


class PricingResult:
    def __init__(
        self,
        subtotal: Decimal,
        fee: Decimal,
        total: Decimal,
        band_min: Decimal,
        band_max: Decimal,
        complexity_multiplier: Decimal,
    ):
        self.subtotal = subtotal
        self.fee = fee
        self.total = total
        self.band_min = band_min
        self.band_max = band_max
        self.complexity_multiplier = complexity_multiplier


def calculate_pricing(config: dict, hours: Decimal, distance_km: Decimal, complexity_keys: Iterable[str]) -> PricingResult:
    multipliers = config.get("complexity_multipliers") or {}
    complexity_multiplier = Decimal("1")
    for key in complexity_keys:
        value = multipliers.get(key)
        if isinstance(value, (int, float, str)):
            try:
                multiplier = Decimal(str(value))
            except Exception:
                continue
            if multiplier > 0:
                complexity_multiplier *= multiplier

    subtotal = (Decimal(str(config.get("base_hourly_rate", 0))) * hours * complexity_multiplier) + (
        Decimal(str(config.get("per_km_rate", 0))) * distance_km
    )
    fee = subtotal * (Decimal(str(config.get("platform_fee_percentage", 0))) / Decimal("100"))
    total = subtotal + fee
    band_pct = Decimal(str(config.get("suggested_band_pct") or 20))
    band_min = total * (Decimal("1") - band_pct / Decimal("100"))
    band_max = total * (Decimal("1") + band_pct / Decimal("100"))

    return PricingResult(subtotal, fee, total, band_min, band_max, complexity_multiplier)
