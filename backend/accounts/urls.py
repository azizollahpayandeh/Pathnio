from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CompanyRegisterView, DriverRegisterView, DriverListView, SiteSettingsView,
    CompanyMeView, ContactMessageCreateView, SupportTicketListCreateView,
    SupportTicketReplyView, LoginView, LogoutView, PasswordChangeView,
    UserProfileView, ActivityLogView, SecurityStatusView, check_auth_status,
    DriverDetailView, UserListView, UserRoleUpdateView, AllMessagesView, ProfileAPIView,
    UserCreateView, UserUpdateView, UserDeleteView,
    UserAlertsView, AdminAlertsView,
    VehicleViewSet, TripViewSet, ExpenseViewSet, DriverViewSet,
    LocationIngestView,
    DriverRegisterMobileView, DriverMeView, DriverActivateView,
    DriverInvitationView, DriverInvitationRevokeView, DriverInvitationRegenerateView,
)

router = DefaultRouter()
router.register(r'vehicles', VehicleViewSet, basename='vehicle')
router.register(r'trips', TripViewSet, basename='trip')
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'drivers', DriverViewSet, basename='driver')

urlpatterns = [
    # Authentication
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/check/', check_auth_status, name='check_auth_status'),

    # User management
    path('auth/password/change/', PasswordChangeView.as_view(), name='password_change'),
    path('auth/profile/', UserProfileView.as_view(), name='user_profile'),
    path('auth/activity/', ActivityLogView.as_view(), name='activity_log'),
    path('auth/security/', SecurityStatusView.as_view(), name='security_status'),

    # Registration
    path('register/company/', CompanyRegisterView.as_view(), name='register-company'),
    path('register/driver/', DriverRegisterView.as_view(), name='register-driver'),

    # Profile
    path('company/me/', CompanyMeView.as_view(), name='company-me'),
    path('contact/', ContactMessageCreateView.as_view(), name='contact-message'),
    # Drivers CRUD is now served by DriverViewSet via the router below.

    # Alerts
    path('alerts/', UserAlertsView.as_view(), name='user-alerts'),
    path('alerts/<int:alert_id>/', UserAlertsView.as_view(), name='alert-mark-read'),
    path('admin/alerts/', AdminAlertsView.as_view(), name='admin-alerts'),
    path('site-settings/', SiteSettingsView.as_view(), name='site-settings'),

    # Support
    path('support/tickets/', SupportTicketListCreateView.as_view(), name='support-tickets'),
    path('support/tickets/<int:pk>/reply/', SupportTicketReplyView.as_view(), name='support-ticket-reply'),
    path('users/all/', UserListView.as_view(), name='user-list'),
    path('users/<int:user_id>/role/', UserRoleUpdateView.as_view(), name='user-role-update'),
    path('admin/messages/', AllMessagesView.as_view(), name='all-messages'),

    # User CRUD
    path('users/', UserCreateView.as_view(), name='user-create'),
    path('users/<int:user_id>/', UserUpdateView.as_view(), name='user-update'),
    path('users/<int:user_id>/delete/', UserDeleteView.as_view(), name='user-delete'),

    path('profile/', ProfileAPIView.as_view(), name='profile'),

    # Mobile driver app — GPS ingest
    path('locations/', LocationIngestView.as_view(), name='location-ingest'),

    # Phase 3 — secure driver invitation + mobile activation
    path('driver/register/', DriverRegisterMobileView.as_view(), name='driver-register-mobile'),
    path('driver/me/', DriverMeView.as_view(), name='driver-me'),
    path('driver-invitations/activate/', DriverActivateView.as_view(), name='driver-activate'),
    path('drivers/<int:driver_id>/invitation/', DriverInvitationView.as_view(), name='driver-invitation'),
    path('drivers/<int:driver_id>/invitation/revoke/', DriverInvitationRevokeView.as_view(), name='driver-invitation-revoke'),
    path('drivers/<int:driver_id>/invitation/regenerate/', DriverInvitationRegenerateView.as_view(), name='driver-invitation-regenerate'),

    # Fleet resources (vehicles / trips / expenses / drivers)
    path('', include(router.urls)),
]
