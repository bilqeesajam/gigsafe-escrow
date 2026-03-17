import requests
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class SupabaseUser:
    def __init__(self, user_id: str, role: str | None):
        self.id = user_id
        self.role = role

    @property
    def is_authenticated(self) -> bool:
        return True


class SupabaseJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None

        token = auth_header.replace("Bearer ", "", 1).strip()
        if not token:
            # raise AuthenticationFailed("Invalid token")
            return None

        if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
            # raise AuthenticationFailed("Supabase is not configured")
            return None

        resp = requests.get(
            f"{settings.SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": settings.SUPABASE_ANON_KEY,
            },
            timeout=10,
        )

        if resp.status_code != 200:
            # raise AuthenticationFailed("Invalid token")
            return None

        payload = resp.json()
        user_id = payload.get("id")
        if not user_id:
            # raise AuthenticationFailed("Invalid token")
            return None

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
            # raise AuthenticationFailed("Profile not found")
            return None

        profiles = profile_resp.json()
        if not profiles:
            # raise AuthenticationFailed("Profile not found")
            return None

        profile = profiles[0]

        return SupabaseUser(str(profile["id"]), profile.get("role")), token
