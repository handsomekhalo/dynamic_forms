# serializers.py

from rest_framework import serializers
from application_management.models import FormQuestionAssignment, FormResponse, MainCategory

from form_portal_management.models import Document
from question_management.models import Question, Option


class GettOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text']


class GetQuestionsAssignedSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ['id', 'text', 'input_type', 'order', 'is_required', 'options']

    def get_options(self, obj):
        if obj.input_type in ['select', 'checkbox']:
            return GettOptionSerializer(obj.options.all(), many=True).data
        return []


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





# Update your GetAnsweredQuestionFromFormResponseSerializer
# class GetAnsweredQuestionFromFormResponseSerializer(serializers.ModelSerializer):
#     question_text = serializers.CharField(source='question.text', read_only=True)
#     input_type = serializers.CharField(source='question.input_type', read_only=True)
#     selected_option_text = serializers.SerializerMethodField()
#     category_id = serializers.SerializerMethodField()  # Add this line
    
#     class Meta:
#         model = FormResponse
#         fields = [
#             'question', 'question_text', 'input_type', 
#             'response_text', 'response_number', 'response_date', 
#             'response_boolean', 'file_upload', 'selected_option_text',
#             'category_id', 'created_at'  # Add category_id here
#         ]
    
#     def get_selected_option_text(self, obj):
#         if hasattr(obj, 'selected_option') and obj.selected_option:
#             return obj.selected_option.text
#         return None
    
#     def get_category_id(self, obj):
#         # Get category_id from the question assignment
#         try:
#             assignment = FormQuestionAssignment.objects.filter(
#                 question_id=obj.question_id,
#                 form_type_id=obj.submission.form_type_id
#             ).first()
#             return assignment.main_category_id if assignment else None
#         except:
#             return None


class GetAnsweredQuestionFromFormResponseSerializer(serializers.ModelSerializer):
    question_id = serializers.IntegerField(source="question.id")
    category_id = serializers.IntegerField(source="category.id", required=False)
    form_type_id = serializers.IntegerField(source="form_type.id")
    input_type = serializers.CharField(source="question.input_type")
    question_text = serializers.CharField(source="question.text")

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
