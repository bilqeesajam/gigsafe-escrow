from django.contrib import admin
from django.urls import path
from django.urls.converters import UUIDConverter
from pricing import views as pricing_views
from admin_dispute_manager import views as dispute_views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", pricing_views.HealthView.as_view()),
    path("api/pricing/config/", pricing_views.PricingConfigView.as_view()),
    path("api/pricing/history/", pricing_views.PricingHistoryView.as_view()),
    path("api/pricing/quote/", pricing_views.PricingQuoteView.as_view()),
    path("api/pricing/overrides/", pricing_views.PricingOverrideListView.as_view()),
    path("api/pricing/overrides/decision/", pricing_views.PricingOverrideDecisionView.as_view()),
    path("api/gigs/create/", pricing_views.GigCreateView.as_view()),
    
    # Dispute Management Routes
    path('api/disputes/', dispute_views.list_disputes, name='list_disputes'),
    
    # UUID-based routes (must come before status routes to avoid conflicts)
    path('api/disputes/<uuid:dispute_id>/admin-notes/', dispute_views.dispute_internal_notes, name='dispute_admin_notes'),
    path('api/disputes/<uuid:dispute_id>/internal-notes/', dispute_views.dispute_internal_notes, name='dispute_internal_notes_legacy'),
    path('api/disputes/<uuid:dispute_id>/decisions/release-to-seller/', dispute_views.dispute_decision_release_to_seller, name='dispute_decision_release_to_seller'),
    path('api/disputes/<uuid:dispute_id>/decisions/refund-buyer/', dispute_views.dispute_decision_refund_buyer, name='dispute_decision_refund_buyer'),
    path('api/disputes/<uuid:dispute_id>/decisions/split/', dispute_views.dispute_decision_split, name='dispute_decision_split'),
    path('api/disputes/<uuid:dispute_id>/decision-logs/', dispute_views.dispute_decision_logs, name='dispute_decision_logs'),
    path('api/disputes/<uuid:dispute_id>/sla/', dispute_views.dispute_sla, name='dispute_sla'),
    path('api/disputes/<uuid:dispute_id>/', dispute_views.dispute_detail, name='dispute_detail'),
    
    # Status routes (route more specifically for status endpoints)
    path('api/disputes/status/open', dispute_views.list_disputes_by_status, {'status': 'open'}, name='list_disputes_open'),
    path('api/disputes/status/under_review/', dispute_views.list_disputes_by_status, {'status': 'under_review'}, name='list_disputes_under_review'),
    path('api/disputes/status/resolved_client/', dispute_views.list_disputes_by_status, {'status': 'resolved_client'}, name='list_disputes_resolved_client'),
    path('api/disputes/status/resolved_hustler/', dispute_views.list_disputes_by_status, {'status': 'resolved_hustler'}, name='list_disputes_resolved_hustler'),
    path('api/disputes/status/<str:status>/', dispute_views.list_disputes_by_status, name='list_disputes_by_status'),
]
