from django.shortcuts import render
from rest_framework import generics
from .models import Company, Driver
from .serializers import CompanySerializer, DriverSerializer

# Create your views here.

class CompanyRegisterView(generics.CreateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

class DriverRegisterView(generics.CreateAPIView):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
