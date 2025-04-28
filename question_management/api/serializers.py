from rest_framework import serializers
from question_management.models import QuestionType, Question, Option


class QuestionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionType
        fields = ['id', 'name', 'description', 'date_created']  


class QuestionSerializer(serializers.ModelSerializer):
    options = serializers.SerializerMethodField()
    question_type = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = (
            'id',
            'text',  
            'is_required',
            'question_type',
            'order',  
            'is_active',
            'allow_other_option', 
            'options',  
        )

    def get_options(self, question):
        """
        Dynamically fetch options based on question type (Checkbox or Selection).
        """
        options = []
        if question.input_type == 'checkbox':
            checkbox_options = question.options.filter(is_default=True)  # Assuming we want only default options
            options = [{"id": option.id, "text": option.text} for option in checkbox_options]
        elif question.input_type == 'select':
            selection_options = question.options.all()  # Fetch all options for 'select' type
            options = [{"id": option.id, "text": option.text} for option in selection_options]
        return options

    def get_question_type(self, question):
        """
        Fetch and return the question type's name.
        """
        return question.question_type.name
