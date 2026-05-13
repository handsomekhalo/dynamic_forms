from django.utils import timezone

from django.db import models
from application_management.models import FormSubmission, FormType, MainCategory
from question_management.models import Question
from system_management.models import User

# Create your models here.


class Document(models.Model):
    name = models.CharField(max_length=255)
    file = models.CharField(max_length=1024)  # full S3 URL
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    form_submission = models.ForeignKey(FormSubmission, on_delete=models.SET_NULL, null=True, blank=True)
    question = models.ForeignKey(Question, on_delete=models.SET_NULL, null=True, blank=True)
    main_category = models.ForeignKey(MainCategory, on_delete=models.SET_NULL, null=True, blank=True)
    uploaded_at = models.DateTimeField(default=timezone.now)
    last_modified = models.DateTimeField(auto_now=True)



class FormInvite(models.Model):
    sent_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name='sent_invites'
    )
    recipient = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True,
        related_name='received_invites'
    )
    form_type = models.ForeignKey(FormType, on_delete=models.CASCADE)
    sent_at = models.DateTimeField(auto_now_add=True)
    token = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.sent_by} → {self.recipient} ({self.form_type.name})"



