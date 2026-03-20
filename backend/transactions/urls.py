# transactions/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('my-transactions/', views.my_transactions, name='my_transactions'),
    path('<uuid:transaction_id>/confirm-delivery/', views.confirm_delivery, name='confirm_delivery'),
    path('<uuid:transaction_id>/request-release/', views.request_release, name='request_release'),
    path('<uuid:transaction_id>/fund/', views.fund_escrow, name='fund_escrow'),
    path('create-from-gig/', views.create_from_gig, name='create_from_gig'),
    path('funding-success/', views.funding_success, name='funding_success'),
    path('funding-cancelled/', views.funding_cancelled, name='funding_cancelled'),
    path('payfast-webhook/', views.payfast_webhook, name='payfast_webhook'),
]