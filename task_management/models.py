from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings  # This imports your custom User model

class Task(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    RECURRENCE_CHOICES = [
        ('none', 'None'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateField()
    completed = models.BooleanField(default=False)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='low')
    recurrence = models.CharField(max_length=10, choices=RECURRENCE_CHOICES, default='none')
    
    # Add the user relationship
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # References your custom User model
        on_delete=models.CASCADE,  # Delete tasks when user is deleted
        related_name='tasks'       # Allows user.tasks.all() to get all user's tasks
    )
    
    # Optional: Add creation and modification timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']  # Show newest tasks first
        
    def __str__(self):
        return f"{self.title} - {self.user.email}"