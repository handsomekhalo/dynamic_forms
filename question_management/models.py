from django.db import models
from django.utils import timezone

# from application_management.models import MainCategory

class QuestionType(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True, null=True)
    date_created = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name

class Question(models.Model):
    INPUT_TYPES = [
        ('text', 'Text Input'),
        ('number', 'Number Input'),
        ('date', 'Date Picker'),
        ('file', 'File Upload'),
        ('select', 'Dropdown Selection'),
        ('checkbox', 'Checkbox'),
        ('textarea', 'Long Text Area'),
        ('email', 'Email Input'),
        # you can add more as needed
    ]

    question_type = models.ForeignKey(QuestionType, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField(help_text="The question text")
    input_type = models.CharField(max_length=50, choices=INPUT_TYPES)
    order = models.PositiveIntegerField(default=0, help_text="Display order of the question")
    is_active = models.BooleanField(default=True)
    is_required = models.BooleanField(default=True)
    allow_other_option = models.BooleanField(default=False, help_text="Allow 'Other' option for select or checkbox types")
    date_created = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.text[:50]

# class Question(models.Model):
#     INPUT_TYPES = [
#         ('text', 'Text Input'),
#         ('number', 'Number Input'),
#         ('date', 'Date Picker'),
#         ('file', 'File Upload'),
#         ('select', 'Dropdown Selection'),
#         ('checkbox', 'Checkbox'),
#         ('textarea', 'Long Text Area'),
#         ('email', 'Email Input'),
#     ]

#     question_type = models.ForeignKey(QuestionType, on_delete=models.CASCADE, related_name='questions')
#     text = models.TextField(help_text="The question text")
#     input_type = models.CharField(max_length=50, choices=INPUT_TYPES)
#     order = models.PositiveIntegerField(default=0, help_text="Display order of the question")
#     is_active = models.BooleanField(default=True)
#     is_required = models.BooleanField(default=True)
#     allow_other_option = models.BooleanField(default=False, help_text="Allow 'Other' option for select or checkbox types")
#     date_created = models.DateTimeField(default=timezone.now)

#     # ✅ Add this line:
#     # main_category = models.ForeignKey(MainCategory, on_delete=models.CASCADE, related_name='questions')
#     main_category = models.ForeignKey("application_management.MainCategory", on_delete=models.CASCADE)


#     class Meta:
#         ordering = ['order']

#     def __str__(self):
#         return self.text[:50]


class Option(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=255)
    is_default = models.BooleanField(default=False, help_text="Mark this option as selected by default")

    def __str__(self):
        return self.text
