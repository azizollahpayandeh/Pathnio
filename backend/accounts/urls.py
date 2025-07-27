from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CompanyRegisterView, DriverRegisterView, DriverListView, SiteSettingsView,
    CompanyMeView, ContactMessageCreateView, SupportTicketListCreateView, 
    SupportTicketReplyView, LoginView, LogoutView, PasswordChangeView,
    UserProfileView, ActivityLogView, SecurityStatusView, check_auth_status,
    DriverDetailView, UserListView, UserRoleUpdateView, AllMessagesView, ProfileAPIView,
    UserCreateView, UserUpdateView, UserDeleteView, TestCompanyRegistrationView, TestPhotoUploadView
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
    path('register/company/test/', TestCompanyRegistrationView.as_view(), name='test-register-company'),
    path('register/driver/', DriverRegisterView.as_view(), name='register-driver'),
    
    # Test URLs
    path('test/photo-upload/', TestPhotoUploadView.as_view(), name='test-photo-upload'),
    
    # Profile URLs
    path('company/me/', CompanyMeView.as_view(), name='company-me'),
    path('contact/', ContactMessageCreateView.as_view(), name='contact-message'),
    path('drivers/', DriverListView.as_view(), name='drivers-list'),
    path('drivers/<int:pk>/', DriverDetailView.as_view(), name='driver-detail'),
    path('site-settings/', SiteSettingsView.as_view(), name='site-settings'),
    
    # Support URLs
    path('support/tickets/', SupportTicketListCreateView.as_view(), name='support-tickets'),
    path('support/tickets/<int:pk>/reply/', SupportTicketReplyView.as_view(), name='support-ticket-reply'),
    path('users/all/', UserListView.as_view(), name='user-list'),
    path('users/<int:user_id>/role/', UserRoleUpdateView.as_view(), name='user-role-update'),
    path('admin/messages/', AllMessagesView.as_view(), name='all-messages'),
    
    # New User Management URLs
    path('users/', UserCreateView.as_view(), name='user-create'),
    path('users/<int:user_id>/', UserUpdateView.as_view(), name='user-update'),
    path('users/<int:user_id>/delete/', UserDeleteView.as_view(), name='user-delete'),
] 
urlpatterns += [
    path('profile/', ProfileAPIView.as_view(), name='profile'),
] 