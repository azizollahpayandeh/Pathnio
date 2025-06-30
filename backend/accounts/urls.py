from django.urls import path
from .views import CompanyRegisterView, DriverRegisterView

urlpatterns = [
    path('register/company/', CompanyRegisterView.as_view(), name='register-company'),
    path('register/driver/', DriverRegisterView.as_view(), name='register-driver'),
] 