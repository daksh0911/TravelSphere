from django.urls import path
from . import views

urlpatterns = [
    # Auth (Tasks 7, 10, 12, 13)
    path('auth/register', views.register, name='register'),
    path('auth/login', views.login, name='login'),
    path('auth/forgot-password', views.forgot_password, name='forgot_password'),
    path('auth/reset-password', views.reset_password, name='reset_password'),

    # User Dashboard (Task 14)
    path('user-dashboard-data', views.user_dashboard_data, name='user_dashboard_data'),

    # Payments & Coupons (Tasks 1 & 2)
    path('payments', views.process_payment, name='process_payment'),
    path('coupons/validate', views.validate_coupon, name='validate_coupon'),

    # Hotels (Task 3)
    path('hotels', views.hotel_list_create, name='hotel_list_create'),
    path('hotel-bookings/<int:booking_id>/status', views.hotel_booking_action, name='hotel_booking_action'),

    # Vehicles & Transports (Task 4)
    path('vehicles', views.vehicle_list_create, name='vehicle_list_create'),
    path('transport-bookings/<int:booking_id>/status', views.transport_booking_action, name='transport_booking_action'),

    # Travel Agent (Task 5)
    path('agent-bookings/<int:booking_id>/status', views.agent_booking_action, name='agent_booking_action'),

    # Admin Management & Provider Approval (Tasks 6 & 7)
    path('destinations', views.destination_list_create, name='destination_list_create'),
    path('destinations/<int:pk>', views.destination_detail_modify, name='destination_detail_modify'),
    path('admin/providers/<str:role>/<int:provider_id>/approve', views.admin_provider_approval, {'action': 'APPROVE'}, name='admin_provider_approve'),
    path('admin/providers/<str:role>/<int:provider_id>/reject', views.admin_provider_approval, {'action': 'REJECT'}, name='admin_provider_reject'),

    # Trip Plans (Task 8)
    path('trip-plans', views.trip_plans, name='trip_plans'),

    # Tour Guides, FAQs, Reviews (Tasks 9 & 10)
    path('tour-guides', views.tour_guide_list, name='tour_guide_list'),
    path('faqs', views.faq_list, name='faq_list'),
    path('faqs/<int:pk>', views.faq_delete, name='faq_delete'),
    path('reviews', views.review_list, name='review_list'),
    path('reviews/<int:pk>', views.review_delete, name='review_delete'),

    # Packages (Task 6 & 14)
    path('packages', views.package_list_create, name='package_list_create'),
    path('packages/<int:pk>', views.package_modify, name='package_modify'),

    # Coupons (Task 6)
    path('coupons', views.coupon_list_create, name='coupon_list_create'),
    path('coupons/<int:pk>', views.coupon_delete, name='coupon_delete'),

    # Providers Lists (Task 9)
    path('hotel-managers', views.hotel_managers_list, name='hotel_managers_list'),
    path('transport-providers', views.transport_providers_list, name='transport_providers_list'),
    path('travel-agents', views.travel_agents_list, name='travel_agents_list'),
    path('admins', views.admin_list, name='admin_list'),
]
