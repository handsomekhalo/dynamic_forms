from django.utils import timezone

from django.db import models
from application_management.models import FormSubmission, MainCategory
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

# class Document(models.Model):
#     name = models.CharField(max_length=255)
#     # file = models.FileField(upload_to="documents/")  # Later configure for S3 storage backend
#     # file_url = models.CharField(max_length=255)
#     file= models.CharField(max_length=1024)  # ✅ Store full S3 URL here
#     uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
#     form_submission = models.ForeignKey(FormSubmission, on_delete=models.SET_NULL, null=True, blank=True)
#     uploaded_at = models.DateTimeField(default=timezone.now)
#     last_modified = models.DateTimeField(auto_now=True)



