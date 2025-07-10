from django.shortcuts import render
from rest_framework import generics, permissions
from .models import Company, Driver, ContactMessage, SiteSettings
from .serializers import CompanySerializer, DriverSerializer, ContactMessageSerializer, SiteSettingsSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

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

class DriverListView(generics.ListAPIView):
    queryset = Driver.objects.all()
    serializer_class = DriverSerializer
    permission_classes = [IsAuthenticated]

class SiteSettingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        settings = SiteSettings.objects.first()
        if not settings:
            settings = SiteSettings.objects.create()
        serializer = SiteSettingsSerializer(settings)
        return Response(serializer.data)
    def patch(self, request):
        settings = SiteSettings.objects.first()
        if not settings:
            settings = SiteSettings.objects.create()
        serializer = SiteSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SupportTicketListCreateView(generics.ListCreateAPIView):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # ادمین همه تیکت‌ها را می‌بیند، کاربر فقط تیکت‌های خودش را
        user = self.request.user
        if user.is_staff:
            return ContactMessage.objects.all().order_by('-created_at')
        return ContactMessage.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, name=self.request.user.get_full_name() or self.request.user.username, email=self.request.user.email)

class SupportTicketReplyView(APIView):
    permission_classes = [permissions.IsAdminUser]
    def post(self, request, pk):
        try:
            ticket = ContactMessage.objects.get(pk=pk)
        except ContactMessage.DoesNotExist:
            return Response({'detail': 'Ticket not found.'}, status=status.HTTP_404_NOT_FOUND)
        reply = request.data.get('reply')
        if not reply:
            return Response({'detail': 'Reply is required.'}, status=status.HTTP_400_BAD_REQUEST)
        ticket.reply = reply
        ticket.status = 'answered'
        from django.utils import timezone
        ticket.answered_at = timezone.now()
        ticket.save()
        return Response(ContactMessageSerializer(ticket).data)
