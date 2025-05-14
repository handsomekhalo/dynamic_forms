
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from question_management.api.serializers import QuestionSerializer, QuestionTypeSerializer
from question_management.models import Option, Question, QuestionType


@api_view(['GET'])
def get_question_type_and_questions_api(request):
    """
    This API returns all question types and their associated questions.
    """
    question_type_data = QuestionType.objects.all()
    questions_data = Question.objects.all().order_by('-id')

    question_type_serializer = QuestionTypeSerializer(question_type_data, many=True)
    question_serializer = QuestionSerializer(questions_data, many=True)
    total_questions = Question.objects.count()

    response = {
        "question_types": question_type_serializer.data,
        "questions": question_serializer.data,
        "total_questions": total_questions
    }

    return Response(response, status=status.HTTP_200_OK)


def create_question(question_text, question_number, question_type, mandatory, other_field):
    """
    Helper function to create a new question based on the input attributes.
    """
    question_type_obj = QuestionType.objects.get(id=question_type)

    question = Question.objects.create(
        text=question_text,
        question_type=question_type_obj,
        order=question_number,
        is_required=mandatory,
        allow_other_option=other_field is not None,
    )
    
    if other_field:
        question.allow_other_option = True
        question.save()
    
    return question


@api_view(['POST'])
def add_question_api(request):
    """
    This API saves a new question to the question bank.
    """
    question_data = request.data
    question_text = question_data.get('question')

    if question_text:
        question_text = question_text.strip() 

    question_number = question_data.get('question_number')
    question_type = question_data.get('question_type')
    mandatory = question_data.get('mandatory', True)
    other_field = question_data.get('other_field')
    options = question_data.get('options', [])

   
    try:
        question_type_obj = QuestionType.objects.get(id=question_type)
    except QuestionType.DoesNotExist:
        return Response({"error": "Invalid question type"}, status=status.HTTP_400_BAD_REQUEST)

    # 🔥 Check if question already exists (case-insensitive and no space errors)
    if Question.objects.filter(text__iexact=question_text, question_type=question_type_obj).exists():
        return Response({"error": "Question already exists."}, status=status.HTTP_400_BAD_REQUEST)

    # Create the question
    question = create_question(question_text, question_number, question_type, mandatory, other_field)

    # Handle options if provided
    for option in options:
        Option.objects.create(question=question, text=option)

    return Response(status=status.HTTP_200_OK)


@api_view(['POST'])
def update_question_api(request):
    """
    This API updates an existing question in the question bank.
    """
    question_data = request.data
    question_id = question_data.get('question_id')
    question_text = question_data.get('question')
    question_number = question_data.get('question_number')
    question_type = question_data.get('question_type')
    mandatory = question_data.get('mandatory')
    other_field = question_data.get('other_field')
    options = question_data.get('options', [])
    delete_options = question_data.get('delete_options', False)

    try:
        question = Question.objects.get(id=question_id)
    except Question.DoesNotExist:
        return Response({"error": "Question does not exist."}, status=status.HTTP_404_NOT_FOUND)

    
    question.text = question_text
    question.order = question_number
    question.is_required = mandatory
    question.allow_other_option = other_field is not None
    question.save()

    
    if delete_options:
        Option.objects.filter(question=question).delete()

    for option in options:
        Option.objects.create(question=question, text=option)

    return Response({"status": "success", "message": "Question updated successfully"}, status=status.HTTP_200_OK)


@api_view(['POST'])
def change_question_status_api(request):
    """
    This API allows toggling the active/inactive status of a question.
    """
    body = request.data
    question_id = body.get('question_id')
    status_value = body.get('status_value')

    if not question_id or status_value not in ['Active', 'Inactive']:
        return Response({"error": "Invalid request: question_id or status_value is missing."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        question = Question.objects.get(id=question_id)
    except Question.DoesNotExist:
        return Response({"error": f"Question with id {question_id} does not exist."}, status=status.HTTP_400_BAD_REQUEST)

    # Update status
    if status_value == 'Active':
        question.is_active = True
        status_message = "activated"
    else:
        question.is_active = False
        status_message = "deactivated"

    question.save()

    return Response({"status": "success", "message": f"Question {status_message} successfully."}, status=status.HTTP_200_OK)

