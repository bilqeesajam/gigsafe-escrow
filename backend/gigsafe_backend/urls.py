# gigsafe_backend/urls.py
from django.contrib import admin
from django.urls import path, include
from pricing import views as pricing_views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", pricing_views.HealthView.as_view()),
    path("api/pricing/config/", pricing_views.PricingConfigView.as_view()),
    path("api/pricing/history/", pricing_views.PricingHistoryView.as_view()),
    path("api/pricing/quote/", pricing_views.PricingQuoteView.as_view()),
    path("api/pricing/overrides/", pricing_views.PricingOverrideListView.as_view()),
    path("api/pricing/overrides/decision/", pricing_views.PricingOverrideDecisionView.as_view()),
    # path("api/gigs/create/", pricing_views.GigCreateView.as_view()),
    
    
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
    path('api/users/', include('users.urls')),
    path('api/gigs/', include('gigs.urls')),
    path('api/transactions/', include('transactions.urls')),
    path('api/disputes/', include('disputes.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/admin/', include('adminPanel.urls')),
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
