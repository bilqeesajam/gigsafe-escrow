from django.contrib import admin
from django.urls import path
from pricing import views as pricing_views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", pricing_views.HealthView.as_view()),
    path("api/pricing/config/", pricing_views.PricingConfigView.as_view()),
    path("api/pricing/history/", pricing_views.PricingHistoryView.as_view()),
    path("api/pricing/quote/", pricing_views.PricingQuoteView.as_view()),
    path("api/pricing/overrides/", pricing_views.PricingOverrideListView.as_view()),
    path("api/pricing/overrides/decision/", pricing_views.PricingOverrideDecisionView.as_view()),
    path("api/gigs/create/", pricing_views.GigCreateView.as_view()),
]
