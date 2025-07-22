from django.contrib.auth.models import User
from accounts.models import UserProfile

username = 'Azizollah'
email = 'AzizVPN1@gmail.com'
password = '13861386AzizVPN'

# Delete old user if exists
User.objects.filter(username=username).delete()

# Create new user
user = User.objects.create_user(username=username, email=email, password=password)
profile = user.profile
profile.role = 'superadmin'
profile.save()
print('User Azizollah created as superadmin with requested email and password.') 