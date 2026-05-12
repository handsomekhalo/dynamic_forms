# serializers.py

from rest_framework import serializers
from application_management.models import FormQuestionAssignment, FormResponse, FormSubmission, MainCategory

from form_portal_management.models import Document
from question_management.models import Question, Option
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class GettOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text']


# class GetQuestionsAssignedSerializer(serializers.ModelSerializer):
#     options = serializers.SerializerMethodField()

#     class Meta:
#         model = Question
#         fields = ['id', 'text', 'input_type', 'order', 'is_required', 'options']

#     def get_options(self, obj):
#         if obj.input_type in ['select', 'checkbox']:
#             return GettOptionSerializer(obj.options.all(), many=True).data
#         return []
class GetQuestionsAssignedSerializer(serializers.ModelSerializer):

    question_type = serializers.CharField(
        source='question_type.name',
        read_only=True
    )

    class Meta:
        model = Question
        fields = [
            'id',
            'text',
            'question_type',
            'input_type',
            'is_required'
        ]
class GetCategoryWithQuestionsAssignedSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()

    class Meta:
        model = MainCategory
        fields = ['id', 'name', 'description', 'questions']

    def get_questions(self, category):
        form_id = self.context.get('form_id')
        question_assignments = FormQuestionAssignment.objects.filter(
            form_type_id=form_id,
            main_category=category
        ).select_related('question').order_by('order')

        questions = [qa.question for qa in question_assignments]
        return GetQuestionsAssignedSerializer(questions, many=True).data


class GetAnsweredQuestionFromFormResponseSerializer(serializers.ModelSerializer):
    question_id = serializers.IntegerField(source="question.id")
    category_id = serializers.IntegerField(source="category.id", required=False)
    form_type_id = serializers.IntegerField(source="form_type.id")
    input_type = serializers.CharField(source="question.input_type")
    question_text = serializers.CharField(source="question.text")

    file_upload = serializers.SerializerMethodField()

    class Meta:
        model = FormResponse
        fields = [
            "question_id",
            "category_id",
            "form_type_id",
            "input_type",
            "question_text",
            "response_text",
            "file_upload",
            "response_number",
            "response_date",
            "response_boolean",
        ]
        
    def get_file_upload(self, obj):
        if obj.file_upload:
            from system_management.backblazes3 import open_back_blaze_s3_file
            try:
                url = open_back_blaze_s3_file(obj.file_upload)
                # If head_object failed, it returns the raw filepath string (not a presigned URL)
                # Don't serve broken paths to the frontend
                if url and str(url).startswith('http') and 'X-Amz-Signature' in str(url):
                    return url
                elif url and str(url).startswith('http') and 'backblazeb2.com' in str(url):
                    return url  # direct URL fallback
                return None  # orphaned file — don't expose broken path
            except Exception:
                return None
        return None
    # def get_file_upload(self, obj):
        # if obj.file_upload:
        #     from system_management.backblazes3 import open_back_blaze_s3_file  # adjust import
        #     return open_back_blaze_s3_file(obj.file_upload)
        # return None

# class RetreiveDocumentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Document
#         fields = ['id','file', 'uploaded_at', 'form_submission']
class RetreiveDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = [
            'id',
            'file',
            'uploaded_at',
            'form_submission',
            'question',
            'main_category',
        ]




class FormResponseSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.text', read_only=True)
    question_input_type = serializers.CharField(source='question.input_type', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    selected_option_text = serializers.CharField(source='selected_option.text', read_only=True, default=None)

    class Meta:
        model = FormResponse
        fields = [
            'id',
            'question',
            'question_text',
            'question_input_type',
            'category',
            'category_name',
            'response_text',
            'response_number',
            'response_date',
            'response_boolean',
            'selected_option_text',
            'file_upload',
            'created_at',
        ]

class SubmissionListSerializer(serializers.ModelSerializer):
    applicant_name = serializers.SerializerMethodField()
    applicant_email = serializers.CharField(source='user.email', read_only=True)
    form_name = serializers.CharField(source='form_type.name', read_only=True)

    class Meta:
        model = FormSubmission
        fields = [
            'id',
            'applicant_name',
            'applicant_email',
            'form_name',
            'form_type',
            'status',
            'submitted_at',
            'is_complete',
        ]

    def get_applicant_name(self, obj):
        first = obj.user.first_name or ''
        last = obj.user.last_name or ''
        return f"{first} {last}".strip() or obj.user.email


class SubmissionDetailSerializer(serializers.ModelSerializer):
    applicant_name = serializers.SerializerMethodField()
    applicant_email = serializers.CharField(source='user.email', read_only=True)
    form_name = serializers.CharField(source='form_type.name', read_only=True)
    responses = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = FormSubmission
        fields = [
            'id',
            'applicant_name',
            'applicant_email',
            'form_name',
            'form_type',
            'status',
            # 'review_notes',
            'reviewed_by_name',
            'reviewed_at',
            'submitted_at',
            'is_complete',
            'responses',
        ]

    def get_applicant_name(self, obj):
        first = obj.user.first_name or ''
        last = obj.user.last_name or ''
        return f"{first} {last}".strip() or obj.user.email

    def get_reviewed_by_name(self, obj):
        if not obj.reviewed_by:
            return None
        first = obj.reviewed_by.first_name or ''
        last = obj.reviewed_by.last_name or ''
        return f"{first} {last}".strip() or obj.reviewed_by.email

    def get_responses(self, obj):
        responses = FormResponse.objects.filter(
            submission=obj
        ).select_related('question', 'category').order_by('category__order', 'question__id')
        return FormResponseSerializer(responses, many=True).data