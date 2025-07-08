from django.urls import path
from .views import CompanyRegisterView, DriverRegisterView
from .views import CompanyMeView, ContactMessageCreateView

urlpatterns = [
    path('register/company/', CompanyRegisterView.as_view(), name='register-company'),
    path('register/driver/', DriverRegisterView.as_view(), name='register-driver'),
    path('company/me/', CompanyMeView.as_view(), name='company-me'),
    path('contact/', ContactMessageCreateView.as_view(), name='contact-message'),
] 