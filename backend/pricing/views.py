from decimal import Decimal, InvalidOperation
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import BasePermission
from django.conf import settings
from .services import calculate_pricing


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        role = getattr(request.user, "role", None)
        user_type = getattr(request.user, "user_type", None)
        return role == "admin" or user_type == "admin"


class IsClientRole(BasePermission):
    def has_permission(self, request, view):
        role = getattr(request.user, "role", None)
        user_type = getattr(request.user, "user_type", None)
        return role == "client" or user_type == "client"


def to_decimal(value, default=None):
    try:
        return Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError):
        return default


def to_number(value):
    if isinstance(value, Decimal):
        return float(value)
    return value


def supabase_user_id(request):
    # Supabase-authenticated users are mirrored into Django users where
    # username stores the upstream UUID and id is the local Django PK.
    return str(getattr(request.user, "username", "") or getattr(request.user, "id", ""))


def supabase_request(method, path, token, params=None, payload=None, prefer=None):
    if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
        raise ValueError("Supabase not configured")

    headers = {
        "apikey": settings.SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {token}",
    }
    if payload is not None:
        headers["Content-Type"] = "application/json"
    if prefer:
        headers["Prefer"] = prefer

    url = f"{settings.SUPABASE_URL}/rest/v1/{path}"
    resp = requests.request(method, url, headers=headers, params=params, json=payload, timeout=15)
    return resp


def sb_select(table, token, filters=None, select="*"):
    params = {"select": select}
    if filters:
        params.update(filters)
    resp = supabase_request("GET", table, token, params=params)
    if resp.status_code >= 300:
        raise ValueError(resp.text)
    return resp.json()


def sb_single(table, token, filters=None, select="*"):
    data = sb_select(table, token, filters=filters, select=select)
    return data[0] if data else None


class PricingConfigView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        try:
            data = sb_select(
                "pricing_config",
                request.auth,
                filters={"order": "category.asc"},
            )
        except Exception as exc:
            return Response({"error": str(exc)}, status=500)
        return Response({"data": data})

    def post(self, request):
        payload = request.data or {}
        change_reason = payload.get("change_reason")
        config = payload.get("config", payload)

        if not change_reason or not str(change_reason).strip():
            return Response({"error": "change_reason is required"}, status=400)

        category = config.get("category")
        if not category:
            return Response({"error": "category is required"}, status=400)

        complexity = config.get("complexity_multipliers")
        if not isinstance(complexity, dict):
            return Response({"error": "complexity_multipliers must be a JSON object"}, status=400)

        for key, value in complexity.items():
            num = to_decimal(value)
            if num is None or num <= 0:
                return Response({"error": f"complexity_multipliers.{key} must be a positive number"}, status=400)

        base_hourly = to_decimal(config.get("base_hourly_rate"))
        per_km = to_decimal(config.get("per_km_rate"))
        fee_pct = to_decimal(config.get("platform_fee_percentage"))
        min_budget = to_decimal(config.get("min_budget"))
        max_budget = to_decimal(config.get("max_budget"))
        band_pct = to_decimal(config.get("suggested_band_pct"), Decimal("20"))

        if any(v is None or v < 0 for v in [base_hourly, per_km, fee_pct, min_budget, max_budget]):
            return Response({"error": "Rates and budgets must be non-negative numbers"}, status=400)

        if min_budget > max_budget:
            return Response({"error": "min_budget cannot exceed max_budget"}, status=400)

        values = {
            "base_hourly_rate": base_hourly,
            "per_km_rate": per_km,
            "complexity_multipliers": complexity,
            "platform_fee_percentage": fee_pct,
            "min_budget": min_budget,
            "max_budget": max_budget,
            "suggested_band_pct": band_pct,
            "updated_by": supabase_user_id(request),
            "updated_reason": str(change_reason).strip(),
        }

        payload = {"category": category, **{k: to_number(v) for k, v in values.items()}}
        try:
            resp = supabase_request(
                "POST",
                "pricing_config",
                request.auth,
                params={"on_conflict": "category"},
                payload=payload,
                prefer="resolution=merge-duplicates,return=representation",
            )
            if resp.status_code >= 300:
                return Response({"error": resp.text}, status=resp.status_code)
            data = resp.json()
            return Response({"data": data[0] if data else payload})
        except Exception as exc:
            return Response({"error": str(exc)}, status=500)


class PricingHistoryView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        category = request.query_params.get("category")
        filters = {"order": "created_at.desc"}
        if category:
            filters["category"] = f"eq.{category}"
        try:
            data = sb_select("pricing_config_history", request.auth, filters=filters)
        except Exception as exc:
            return Response({"error": str(exc)}, status=500)
        for item in data:
            if "before" not in item and "before_data" in item:
                item["before"] = item.get("before_data")
            if "after" not in item and "after_data" in item:
                item["after"] = item.get("after_data")
        return Response({"data": data})


class PricingQuoteView(APIView):
    def post(self, request):
        payload = request.data or {}
        category = payload.get("category")
        hours = to_decimal(payload.get("hours"))
        distance_km = to_decimal(payload.get("distance_km"))
        complexity_keys = payload.get("complexity_keys") or []

        if not category:
            return Response({"error": "category is required"}, status=400)
        if hours is None or hours < 0:
            return Response({"error": "hours must be non-negative"}, status=400)
        if distance_km is None or distance_km < 0:
            return Response({"error": "distance_km must be non-negative"}, status=400)

        config = sb_single("pricing_config", request.auth, filters={"category": f"eq.{category}"})
        if not config:
            return Response({"error": "Pricing config not found"}, status=404)

        result = calculate_pricing(config, hours, distance_km, complexity_keys)
        complexity_options = [
            {"key": key, "multiplier": value}
            for key, value in (config.get("complexity_multipliers") or {}).items()
        ]

        return Response({
            "category": category,
            "currency": "ZAR",
            "base_hourly_rate": str(config.get("base_hourly_rate")),
            "per_km_rate": str(config.get("per_km_rate")),
            "platform_fee_percentage": str(config.get("platform_fee_percentage")),
            "min_budget": str(config.get("min_budget")),
            "max_budget": str(config.get("max_budget")),
            "suggested_band_pct": str(config.get("suggested_band_pct")),
            "complexity_options": complexity_options,
            "complexity_multiplier": str(result.complexity_multiplier),
            "subtotal": str(result.subtotal),
            "fee": str(result.fee),
            "total": str(result.total),
            "band_min": str(result.band_min),
            "band_max": str(result.band_max),
        })


class GigCreateView(APIView):
    permission_classes = [IsClientRole]

    def post(self, request):
        payload = request.data or {}
        actor_id = supabase_user_id(request)
        title = str(payload.get("title", "")).strip()
        description = str(payload.get("description", "")).strip()
        location = str(payload.get("location", "")).strip()
        category = payload.get("category")
        hours = to_decimal(payload.get("hours"))
        distance_km = to_decimal(payload.get("distance_km"))
        requested_total = to_decimal(payload.get("requested_total"))
        cart_value = to_decimal(payload.get("cart_value"))
        complexity_keys = payload.get("complexity_keys") or []
        override_reason = str(payload.get("override_reason", "")).strip()

        if not title or not description or not location or not category:
            return Response({"error": "Missing required fields"}, status=400)
        if hours is None or hours <= 0:
            return Response({"error": "hours must be greater than 0"}, status=400)
        if distance_km is None or distance_km < 0:
            return Response({"error": "distance_km must be non-negative"}, status=400)
        if requested_total is None or requested_total <= 0:
            return Response({"error": "requested_total must be greater than 0"}, status=400)

        config = sb_single("pricing_config", request.auth, filters={"category": f"eq.{category}"})
        if not config:
            return Response({"error": "Pricing config not found"}, status=404)

        result = calculate_pricing(config, hours, distance_km, complexity_keys)

        if requested_total < Decimal(str(config.get("min_budget", 0))):
            return Response({"error": "Price below minimum budget"}, status=400)

        exceeds_max = Decimal(str(config.get("max_budget", 0))) > 0 and requested_total > Decimal(str(config.get("max_budget", 0)))
        out_of_band = requested_total < result.band_min or requested_total > result.band_max
        requires_approval = exceeds_max or out_of_band

        if requires_approval and not override_reason:
            return Response({"error": "override_reason is required for out-of-band pricing"}, status=400)

        profile = sb_single("profiles", request.auth, filters={"id": f"eq.{actor_id}"}, select="id,balance")
        if not profile:
            return Response({"error": "Profile not found"}, status=404)

        balance = Decimal(str(profile.get("balance") or 0))
        if balance < requested_total:
            return Response({"error": "Insufficient balance"}, status=400)

        adjustment_pct = Decimal("0")
        if result.total > 0:
            adjustment_pct = (requested_total - result.total) / result.total * Decimal("100")

        pricing_status = "pending_admin" if requires_approval else "auto_approved"
        gig_status = "disputed" if requires_approval else "open"
        pricing_snapshot = {
            "category": config.get("category"),
            "base_hourly_rate": str(config.get("base_hourly_rate")),
            "per_km_rate": str(config.get("per_km_rate")),
            "complexity_multipliers": config.get("complexity_multipliers"),
            "platform_fee_percentage": str(config.get("platform_fee_percentage")),
            "min_budget": str(config.get("min_budget")),
            "max_budget": str(config.get("max_budget")),
            "suggested_band_pct": str(config.get("suggested_band_pct")),
        }

        try:
            balance_resp = supabase_request(
                "PATCH",
                "profiles",
                request.auth,
                params={"id": f"eq.{actor_id}"},
                payload={"balance": float(balance - requested_total)},
                prefer="return=representation",
            )
            if balance_resp.status_code >= 300:
                return Response({"error": balance_resp.text}, status=500)

            gig_resp = supabase_request(
                "POST",
                "gigs",
                request.auth,
                payload={
                    "client_id": actor_id,
                    "title": title,
                    "description": description,
                    "location": location,
                    "category": category,
                    "status": gig_status,
                    "budget": float(requested_total),
                    "pricing_config_id": config.get("id"),
                    "pricing_snapshot": pricing_snapshot,
                    "pricing_inputs": {
                        "hours": str(hours),
                        "distance_km": str(distance_km),
                        "complexity_keys": complexity_keys,
                        "cart_value": str(cart_value) if cart_value is not None else None,
                    },
                    "pricing_subtotal": float(result.subtotal),
                    "pricing_fee": float(result.fee),
                    "pricing_total": float(requested_total),
                    "pricing_adjustment_pct": float(adjustment_pct),
                    "pricing_complexity_multiplier": float(result.complexity_multiplier),
                    "pricing_status": pricing_status,
                    "platform_fee_percentage": float(Decimal(str(config.get("platform_fee_percentage")))),
                    "cart_value": float(cart_value) if cart_value is not None else None,
                },
                prefer="return=representation",
            )
            if gig_resp.status_code >= 300:
                return Response({"error": gig_resp.text}, status=500)
            gig = gig_resp.json()[0]

            txn_resp = supabase_request(
                "POST",
                "transactions",
                request.auth,
                payload={
                    "from_user_id": actor_id,
                    "gig_id": gig.get("id"),
                    "amount": float(requested_total),
                    "subtotal_amount": float(result.subtotal),
                    "fee_amount": float(result.fee),
                    "fee_percentage": float(Decimal(str(config.get("platform_fee_percentage")))),
                    "total_amount": float(requested_total),
                    "type": "hold",
                },
                prefer="return=representation",
            )
            if txn_resp.status_code >= 300:
                supabase_request(
                    "PATCH",
                    "gigs",
                    request.auth,
                    params={"id": f"eq.{gig.get('id')}"},
                    payload={"status": "cancelled", "pricing_status": "rejected"},
                )
                return Response({"error": txn_resp.text}, status=500)

            if requires_approval:
                supabase_request(
                    "POST",
                    "pricing_overrides",
                    request.auth,
                    payload={
                        "gig_id": gig.get("id"),
                        "client_id": actor_id,
                        "category": category,
                        "requested_budget": float(requested_total),
                        "suggested_budget": float(result.total),
                        "adjustment_pct": float(adjustment_pct),
                        "reason": override_reason,
                        "status": "pending",
                    },
                )
        except Exception as exc:
            return Response({"error": str(exc)}, status=500)

        return Response({
            "gig_id": str(gig.get("id")),
            "pricing_status": pricing_status,
            "subtotal": str(result.subtotal),
            "fee": str(result.fee),
            "total": str(requested_total),
            "suggested_total": str(result.total),
            "band_min": str(result.band_min),
            "band_max": str(result.band_max),
            "requires_approval": requires_approval,
        })


class PricingOverrideListView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        try:
            data = sb_select(
                "pricing_overrides",
                request.auth,
                filters={"status": "eq.pending", "order": "created_at.asc"},
            )
        except Exception as exc:
            return Response({"error": str(exc)}, status=500)
        return Response({"data": data})


class PricingOverrideDecisionView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request):
        payload = request.data or {}
        override_id = payload.get("override_id")
        action = payload.get("action")
        admin_note = str(payload.get("admin_note", "")).strip()

        if not override_id or action not in ["approve", "reject"]:
            return Response({"error": "override_id and valid action are required"}, status=400)

        override = sb_single("pricing_overrides", request.auth, filters={"id": f"eq.{override_id}"})
        if not override:
            return Response({"error": "Override not found"}, status=404)

        new_status = "approved" if action == "approve" else "rejected"
        resp = supabase_request(
            "PATCH",
            "pricing_overrides",
            request.auth,
            params={"id": f"eq.{override_id}"},
            payload={"status": new_status, "admin_id": supabase_user_id(request), "admin_note": admin_note},
            prefer="return=representation",
        )
        if resp.status_code >= 300:
            return Response({"error": resp.text}, status=500)

        if override.get("gig_id"):
            if action == "approve":
                supabase_request(
                    "PATCH",
                    "gigs",
                    request.auth,
                    params={"id": f"eq.{override.get('gig_id')}"},
                    payload={"pricing_status": "approved", "status": "open"},
                )
            else:
                gig = sb_single(
                    "gigs",
                    request.auth,
                    filters={"id": f"eq.{override.get('gig_id')}"},
                    select="id,budget,client_id,pricing_fee,pricing_subtotal,pricing_total",
                )
                if gig:
                    profile = sb_single("profiles", request.auth, filters={"id": f"eq.{gig.get('client_id')}"}, select="id,balance")
                    if profile:
                        current_balance = Decimal(str(profile.get("balance") or 0))
                        supabase_request(
                            "PATCH",
                            "profiles",
                            request.auth,
                            params={"id": f"eq.{gig.get('client_id')}"},
                            payload={"balance": float(current_balance + Decimal(str(gig.get("budget") or 0)))},
                        )

                    supabase_request(
                        "POST",
                        "transactions",
                        request.auth,
                        payload={
                            "gig_id": gig.get("id"),
                            "to_user_id": gig.get("client_id"),
                            "amount": float(Decimal(str(gig.get("pricing_total") or gig.get("budget")))),
                            "subtotal_amount": float(Decimal(str(gig.get("pricing_subtotal") or gig.get("budget")))),
                            "fee_amount": float(Decimal(str(gig.get("pricing_fee") or 0))),
                            "total_amount": float(Decimal(str(gig.get("pricing_total") or gig.get("budget")))),
                            "type": "refund",
                        },
                    )

                    supabase_request(
                        "PATCH",
                        "gigs",
                        request.auth,
                        params={"id": f"eq.{gig.get('id')}"},
                        payload={"pricing_status": "rejected", "status": "cancelled"},
                    )

        return Response({"status": new_status})


class HealthView(APIView):
    def get(self, request):
        if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
            return Response({"status": "error", "detail": "Supabase not configured"}, status=500)

        try:
            token = request.auth or ""
            resp = requests.get(
                f"{settings.SUPABASE_URL}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": settings.SUPABASE_ANON_KEY,
                },
                timeout=10,
            )
            if resp.status_code != 200:
                return Response({"status": "error", "detail": resp.text}, status=500)
        except Exception as exc:
            return Response({"status": "error", "detail": str(exc)}, status=500)

        return Response({"status": "ok"})
