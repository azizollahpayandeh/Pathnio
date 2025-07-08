from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Company, Driver, ContactMessage
from .serializers import CompanySerializer, DriverSerializer, ContactMessageSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

# Create your views here.

class CompanyRegisterView(generics.CreateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

class DriverRegisterView(generics.CreateAPIView):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer

class ContactMessageCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = []

class CompanyMeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            company = request.user.company_profile
        except Company.DoesNotExist:
            return Response({'detail': 'Company profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CompanySerializer(company)
        return Response(serializer.data)

    def patch(self, request):
        try:
            company = request.user.company_profile
        except Company.DoesNotExist:
            return Response({'detail': 'Company profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CompanySerializer(company, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
