from django.urls import path
from .views import CompanyRegisterView, DriverRegisterView, DriverListView, SiteSettingsView
from .views import CompanyMeView, ContactMessageCreateView
from .views import SupportTicketListCreateView, SupportTicketReplyView

urlpatterns = [
    path('register/company/', CompanyRegisterView.as_view(), name='register-company'),
    path('register/driver/', DriverRegisterView.as_view(), name='register-driver'),
    path('company/me/', CompanyMeView.as_view(), name='company-me'),
    path('contact/', ContactMessageCreateView.as_view(), name='contact-message'),
    path('drivers/', DriverListView.as_view(), name='drivers-list'),
    path('site-settings/', SiteSettingsView.as_view(), name='site-settings'),
    path('support/tickets/', SupportTicketListCreateView.as_view(), name='support-tickets'),
    path('support/tickets/<int:pk>/reply/', SupportTicketReplyView.as_view(), name='support-ticket-reply'),
] 