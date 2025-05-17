
import logging
from django.forms import ValidationError
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from question_management.api.serializers import GetQuestionSerializer, QuestionSerializer, QuestionTypeSerializer, QuestionUpdateSerializer
from question_management.models import Option, Question, QuestionType
logger = logging.getLogger(__name__)


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
    try:
        order_value = int(question_number) if question_number else 0
    except (ValueError, TypeError):
        order_value = 0

    question_type_obj = QuestionType.objects.get(id=question_type)

    input_type = 'text'
    if question_type_obj.name.lower() == 'checkbox':
        input_type = 'checkbox'
    elif question_type_obj.name.lower() == 'selection':
        input_type = 'select'

    # Check if question already exists
    if Question.objects.filter(text__iexact=question_text.strip()).exists():
        raise ValidationError({"question": "A question with this text already exists."})

    question = Question.objects.create(
        text=question_text,
        question_type=question_type_obj,
        input_type=input_type,
        order=order_value,
        is_required=mandatory,
        allow_other_option=other_field is not None and other_field,
    )

    return question


def validate_question_data(data):
    """
    Validate incoming question data and return a tuple of (is_valid, errors)
    """
    errors = {}
    
    # Required fields
    if not data.get('question'):
        errors['question'] = "Question text is required"
    
    if not data.get('question_type'):
        errors['question_type'] = "Question type is required"
    
    # Validate question_number if provided
    question_number = data.get('question_number')
    if question_number:
        try:
            int(question_number)
        except (ValueError, TypeError):
            errors['question_number'] = "Question number must be a valid integer"
    
    # Check if mandatory field is provided
    if 'mandatory' not in data:
        errors['mandatory'] = "Mandatory field is required"
    
    # Check options for select/checkbox types
    question_type_id = data.get('question_type')
    options = data.get('options', [])
    
    if question_type_id:
        try:
            question_type_obj = QuestionType.objects.get(id=question_type_id)
            # If question type is checkbox or selection, options are required
            if question_type_obj.name.lower() in ['checkbox', 'selection'] and not options:
                errors['options'] = f"Options are required for {question_type_obj.name} questions"
        except QuestionType.DoesNotExist:
            errors['question_type'] = "Invalid question type"
    
    return (len(errors) == 0, errors)



@api_view(['POST'])
def add_question_api(request):
    """
    API endpoint to save a new question to the question bank with improved validation.
    """
    question_data = request.data
    
    # Validate incoming data
    is_valid, errors = validate_question_data(question_data)
    if not is_valid:
        return Response({"status": "error", "errors": errors}, status=status.HTTP_400_BAD_REQUEST)
    
    # Extract cleaned data
    question_text = question_data.get('question', '').strip()
    question_number = question_data.get('question_number')
    question_type = question_data.get('question_type')
    mandatory = question_data.get('mandatory', True)
    other_field = question_data.get('other_field')
    options = question_data.get('options', [])

    try:
        question_type_obj = QuestionType.objects.get(id=question_type)
    except QuestionType.DoesNotExist:
        return Response(
            {"status": "error", "message": "Invalid question type"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if question already exists (case-insensitive)
    if Question.objects.filter(text__iexact=question_text, question_type=question_type_obj).exists():
        return Response(
            {"status": "error", "message": "Question already exists."}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Create the question with validation handling
        question = create_question(question_text, question_number, question_type, mandatory, other_field)
        
        # Create options if provided
        if options:
            for option_text in options:
                if option_text.strip():  # Only create non-empty options
                    Option.objects.create(question=question, text=option_text.strip())
        
        return Response({
            "status": "success",
            "message": "Question created successfully",
            "data": {
                "id": question.id,
                "text": question.text
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        # Log the error for debugging
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error creating question: {str(e)}")
        
        return Response({
            "status": "error",
            "message": "Failed to create question. Please try again."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)




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




@api_view(['GET'])
def get_question_detail_api(request, question_id):
    try:
        question = Question.objects.get(pk=question_id)
    except Question.DoesNotExist:
        return Response({'status': 'error', 'message': 'Question not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = GetQuestionSerializer(question)
    return Response({'status': 'success', 'data': serializer.data}, status=status.HTTP_200_OK)



@api_view(['PUT'])
def update_question_api(request, question_id):
    try:
        # Try fetching the Question
        try:
            question = Question.objects.get(pk=question_id)
        except Question.DoesNotExist:
            logger.warning(f"Question with ID {question_id} not found.")
            return Response({"error": "Question not found."}, status=status.HTTP_404_NOT_FOUND)

        # Deserialize and validate data
        serializer = QuestionUpdateSerializer(question, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            logger.info(f"Question ID {question_id} updated successfully.")
            return Response({
                "success": "Question updated successfully.",
                "data": serializer.data
            }, status=status.HTTP_200_OK)

        # Log validation errors
        logger.error(f"Validation failed for question ID {question_id}: {serializer.errors}")
        return Response({
            "error": "Validation failed.",
            "details": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    except ValidationError as ve:
        logger.exception(f"Validation error occurred for question ID {question_id}: {ve}")
        return Response({
            "error": "Invalid input.",
            "details": str(ve)
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.exception(f"Unexpected error occurred while updating question ID {question_id}: {e}")
        return Response({
            "error": "An unexpected error occurred.",
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    