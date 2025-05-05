from django.db import models
from django.utils import timezone
from question_management.models import Question
from system_management.models import User

# Create your models here.
class FormType(models.Model):
    name = models.CharField(max_length=250)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    date_created = models.DateTimeField(default=timezone.now)
    categories = models.ManyToManyField('MainCategory', blank=True)


    def __str__(self):
        return self.name


class MainCategory(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    date_created = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name


class FormQuestionAssignment(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    main_category = models.ForeignKey(MainCategory, on_delete=models.CASCADE)
    form_type = models.ForeignKey(FormType, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']



class FormSubmission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # applicant
    form_type = models.ForeignKey(FormType, on_delete=models.CASCADE)
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_complete = models.BooleanField(default=True)  # you can support partial drafts later

    def __str__(self):
        return f"{self.user.email} - {self.form_type.name}"


class FormResponse(models.Model):
    submission = models.ForeignKey(FormSubmission, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    response_text = models.TextField(blank=True, null=True) 
    file_upload = models.FileField(upload_to="form_uploads/", null=True, blank=True)  # if file type

    def __str__(self):
        return f"{self.submission.user.email} - {self.question.text[:30]}"


# class Document(models.Model):
#     name = models.CharField(max_length=255)
#     file = models.FileField(upload_to="documents/")
#     uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
#     form_submission = models.ForeignKey(FormSubmission, on_delete=models.SET_NULL, null=True, blank=True)
#     uploaded_at = models.DateTimeField(default=timezone.now)
#     last_modified = models.DateTimeField(auto_now=True)





# class Form(models.Model):
#     name = models.CharField(max_length=255)
#     description = models.TextField(blank=True)
#     created_by = models.ForeignKey(User, on_delete=models.CASCADE)
#     created_at = models.DateTimeField(auto_now_add=True)
#     is_public = models.BooleanField(default=False)

# class FormDispatch(models.Model):
#     form = models.ForeignKey(Form, on_delete=models.CASCADE)
#     sent_by = models.ForeignKey(User, on_delete=models.CASCADE)
#     target_group = models.CharField(max_length=100)  # e.g., 'NPO', 'Civic Society', 'General Public'
#     audience_count = models.IntegerField(default=0)  # How many were targeted
#     sent_at = models.DateTimeField(auto_now_add=True)
#     price = models.DecimalField(max_digits=10, decimal_places=2)
#     payment_status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('paid', 'Paid')])
