# serializers.py

from rest_framework import serializers
from application_management.models import FormQuestionAssignment, MainCategory

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
# class GetCategoryWithQuestionsAssignedSerializer(serializers.ModelSerializer):
#     questions = serializers.SerializerMethodField()

#     class Meta:
#         model = MainCategory
#         fields = ['id', 'name', 'description', 'questions']

#     def get_questions(self, category):
#         # Only include active questions in the category
#         questions = category.question_set.filter(is_active=True).order_by('id')  # or order_by('order') if field exists
#         return GetQuestionsAssignedSerializer(questions, many=True).data
