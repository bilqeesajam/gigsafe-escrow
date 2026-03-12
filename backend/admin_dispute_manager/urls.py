from django.urls import path
from . import views

urlpatterns = [
    # path('api/users/', views.get_users, name='get_users'),
    # path('api/users/<uuid:user_id>/', views.get_user_by_id, name='get_user_by_id'),
    # 
    path('api/disputes/', views.list_disputes, name='list_disputes'), #GET

    # Explicit enum routes (dispute_status: open, under_review, resolved_client, resolved_hustler)
    path('api/disputes/status/open', views.list_disputes_by_status, {'status': 'open'}, name='list_disputes_open'), #GET
    path('api/disputes/status/under_review/', views.list_disputes_by_status, {'status': 'under_review'}, name='list_disputes_under_review'), #GET
    path('api/disputes/status/resolved_client/', views.list_disputes_by_status, {'status': 'resolved_client'}, name='list_disputes_resolved_client'), #GET
    path('api/disputes/status/resolved_hustler/', views.list_disputes_by_status, {'status': 'resolved_hustler'}, name='list_disputes_resolved_hustler'), #GET

    # Schema-aligned status route (accepts enum values; also supports aliases via view normalization)
    path('api/disputes/status/<str:status>/', views.list_disputes_by_status, name='list_disputes_by_status'), #GET

    # Uses disputes.admin_notes (schema name). Keep internal-notes for back-compat.
    path('api/disputes/<uuid:dispute_id>/admin-notes/', views.dispute_internal_notes, name='dispute_admin_notes'), #GET/POST
    path('api/disputes/<uuid:dispute_id>/internal-notes/', views.dispute_internal_notes, name='dispute_internal_notes_legacy'), #GET/POST
    path('api/disputes/<uuid:dispute_id>/', views.dispute_detail, name='dispute_detail'), #GET

    path('api/disputes/<uuid:dispute_id>/decisions/release-to-seller/', views.dispute_decision_release_to_seller, name='dispute_decision_release_to_seller'), #POST
    path('api/disputes/<uuid:dispute_id>/decisions/refund-buyer/', views.dispute_decision_refund_buyer, name='dispute_decision_refund_buyer'), #POST
    path('api/disputes/<uuid:dispute_id>/decisions/split/', views.dispute_decision_split, name='dispute_decision_split'), #POST

    path('api/disputes/<uuid:dispute_id>/decision-logs/', views.dispute_decision_logs, name='dispute_decision_logs'), #GET
    path('api/disputes/<uuid:dispute_id>/sla/', views.dispute_sla, name='dispute_sla'), #GET
]
