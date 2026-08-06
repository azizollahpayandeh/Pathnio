import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0009_alert'),
    ]

    operations = [
        migrations.CreateModel(
            name='Vehicle',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('plate_number', models.CharField(max_length=32)),
                ('vehicle_type', models.CharField(choices=[('Truck', 'Truck'), ('Van', 'Van'), ('Sedan', 'Sedan'), ('Pickup', 'Pickup')], default='Truck', max_length=16)),
                ('model', models.CharField(blank=True, max_length=128)),
                ('driver', models.CharField(blank=True, max_length=255)),
                ('status', models.CharField(choices=[('Active', 'Active'), ('Inactive', 'Inactive'), ('Maintenance', 'Maintenance')], default='Active', max_length=16)),
                ('capacity', models.CharField(blank=True, max_length=32)),
                ('color', models.CharField(blank=True, max_length=32)),
                ('fuel_level', models.PositiveIntegerField(default=100)),
                ('odometer', models.PositiveIntegerField(default=0)),
                ('efficiency', models.CharField(blank=True, max_length=32)),
                ('last_maintenance', models.DateField(blank=True, null=True)),
                ('total_trips', models.PositiveIntegerField(default=0)),
                ('lat', models.FloatField(default=0)),
                ('lng', models.FloatField(default=0)),
                ('speed', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('company', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='vehicles', to='accounts.company')),
            ],
            options={'ordering': ['-created_at']},
        ),
        migrations.CreateModel(
            name='Trip',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('origin', models.CharField(max_length=128)),
                ('destination', models.CharField(max_length=128)),
                ('driver', models.CharField(blank=True, max_length=255)),
                ('plate_number', models.CharField(blank=True, max_length=32)),
                ('distance', models.PositiveIntegerField(default=0)),
                ('status', models.CharField(choices=[('Ongoing', 'Ongoing'), ('Completed', 'Completed'), ('Scheduled', 'Scheduled'), ('Cancelled', 'Cancelled')], default='Scheduled', max_length=16)),
                ('cargo', models.CharField(blank=True, max_length=128)),
                ('revenue', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('start_time', models.DateTimeField(default=django.utils.timezone.now)),
                ('end_time', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('company', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='trips', to='accounts.company')),
            ],
            options={'ordering': ['-start_time']},
        ),
        migrations.CreateModel(
            name='Expense',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('category', models.CharField(choices=[('Fuel', 'Fuel'), ('Maintenance', 'Maintenance'), ('Tolls', 'Tolls'), ('Insurance', 'Insurance'), ('Salary', 'Salary'), ('Other', 'Other')], default='Fuel', max_length=16)),
                ('amount', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('date', models.DateField(default=django.utils.timezone.now)),
                ('plate_number', models.CharField(blank=True, max_length=32)),
                ('driver', models.CharField(blank=True, max_length=255)),
                ('status', models.CharField(choices=[('Paid', 'Paid'), ('Pending', 'Pending')], default='Paid', max_length=16)),
                ('description', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('company', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='expenses', to='accounts.company')),
            ],
            options={'ordering': ['-date']},
        ),
    ]
