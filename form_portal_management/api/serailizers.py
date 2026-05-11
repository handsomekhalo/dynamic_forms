# serializers.py

from rest_framework import serializers
from application_management.models import FormQuestionAssignment, FormResponse, MainCategory

from form_portal_management.models import Document
from question_management.models import Question, Option


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
