import base64
import json
import requests
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from users.models import User


class SupabaseJWTAuthentication(BaseAuthentication):
    def _normalize_role(self, role: str | None) -> str:
        if role in ("admin", "super_admin"):
            return "admin"
        if role in ("hustler", "client"):
            return role
        return "client"

    def _get_or_create_django_user(self, user_id: str, email: str | None, role: str | None) -> User:
        username = str(user_id)
        defaults = {
            "email": email or "",
            "user_type": self._normalize_role(role),
            "is_active": True,
        }
        user, created = User.objects.get_or_create(username=username, defaults=defaults)
        if created:
            user.set_unusable_password()
            user.save(update_fields=["password"])
        else:
            # Backfill email or user_type if missing
            changed = False
            if email and not user.email:
                user.email = email
                changed = True
            normalized_role = self._normalize_role(role)
            if user.user_type != normalized_role:
                user.user_type = normalized_role
                changed = True
            if changed:
                user.save(update_fields=["email", "user_type"])
        return user

    def _looks_like_supabase_jwt(self, token: str) -> bool:
        parts = token.split(".")
        if len(parts) != 3:
            return False
        # Decode payload without verifying signature to inspect issuer/ref
        try:
            padded = parts[1] + "=" * (-len(parts[1]) % 4)
            payload_json = base64.urlsafe_b64decode(padded.encode("utf-8")).decode("utf-8")
            payload = json.loads(payload_json)
        except (ValueError, json.JSONDecodeError):
            return False

        iss = payload.get("iss", "")
        ref = payload.get("ref", "")
        return "supabase" in iss or bool(ref)

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None

        token = auth_header.replace("Bearer ", "", 1).strip()
        if not token:
            # raise AuthenticationFailed("Invalid token")
            return None

        # Only attempt Supabase auth if the token looks like a Supabase JWT.
        if not self._looks_like_supabase_jwt(token):
            return None

        if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
            raise AuthenticationFailed("Supabase is not configured")

        resp = requests.get(
            f"{settings.SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": settings.SUPABASE_ANON_KEY,
            },
            timeout=10,
        )

        if resp.status_code != 200:
            raise AuthenticationFailed("Invalid Supabase token")

        payload = resp.json()
        user_id = payload.get("id")
        email = payload.get("email")
        if not user_id:
            raise AuthenticationFailed("Invalid Supabase token")

        profile_resp = requests.get(
            f"{settings.SUPABASE_URL}/rest/v1/profiles",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": settings.SUPABASE_ANON_KEY,
            },
            params={
                "select": "id,role",
                "id": f"eq.{user_id}",
            },
            timeout=10,
        )
        if profile_resp.status_code != 200:
            raise AuthenticationFailed("Profile not found")

        profiles = profile_resp.json()
        if not profiles:
            raise AuthenticationFailed("Profile not found")

        profile = profiles[0]
        role = profile.get("role")

        user = self._get_or_create_django_user(str(profile["id"]), email, role)
        return user, token
