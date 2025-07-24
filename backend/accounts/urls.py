from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CompanyRegisterView, DriverRegisterView, DriverListView, SiteSettingsView,
    CompanyMeView, ContactMessageCreateView, SupportTicketListCreateView, 
    SupportTicketReplyView, LoginView, LogoutView, PasswordChangeView,
    UserProfileView, ActivityLogView, SecurityStatusView, check_auth_status,
    DriverDetailView
)

urlpatterns = [
    # Authentication URLs
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/check/', check_auth_status, name='check_auth_status'),
    
    # User Management URLs
    path('auth/password/change/', PasswordChangeView.as_view(), name='password_change'),
    path('auth/profile/', UserProfileView.as_view(), name='user_profile'),
    path('auth/activity/', ActivityLogView.as_view(), name='activity_log'),
    path('auth/security/', SecurityStatusView.as_view(), name='security_status'),
    
    # Registration URLs
    path('register/company/', CompanyRegisterView.as_view(), name='register-company'),
    path('register/driver/', DriverRegisterView.as_view(), name='register-driver'),
    
    # Profile URLs
    path('company/me/', CompanyMeView.as_view(), name='company-me'),
    path('contact/', ContactMessageCreateView.as_view(), name='contact-message'),
    path('drivers/', DriverListView.as_view(), name='drivers-list'),
    path('drivers/<int:pk>/', DriverDetailView.as_view(), name='driver-detail'),
    path('site-settings/', SiteSettingsView.as_view(), name='site-settings'),
    
    # Support URLs
    path('support/tickets/', SupportTicketListCreateView.as_view(), name='support-tickets'),
    path('support/tickets/<int:pk>/reply/', SupportTicketReplyView.as_view(), name='support-ticket-reply'),
] 