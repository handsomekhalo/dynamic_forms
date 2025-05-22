
import logging
from django.forms import ValidationError
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from application_management.models import FormQuestionAssignment, FormType, MainCategory
from question_management.api.serializers import AssignQuestionToCategorySerializer, FormQuestionAssignmentSerializer, GetAssignedQuestionToCategoryQuestionSerializer, GetQuestionSerializer, QuestionSerializer, QuestionTypeSerializer, QuestionUpdateSerializer, RemoveQuestionAssignmentSerializer
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



@api_view(['POST'])
def assign_or_update_question_api(request):
    """
    Assign a question to a category or update an existing assignment
    
    Request Body:
    {
        "form_type_id": 1,
        "main_category_id": 2,
        "question_id": 3,
        "old_question_id": 4,  // Optional - for updating existing assignment
        "order": 0  // Optional - display order
    }
    """
    
    # Validate input using serializer
    serializer = AssignQuestionToCategorySerializer(data=request.data)
    if not serializer.is_valid():
        return Response({
            "status": "error",
            "message": "Invalid input data",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Extract validated data
    validated_data = serializer.validated_data
    form_type_id = validated_data['form_type_id']
    main_category_id = validated_data['main_category_id']
    question_id = validated_data['question_id']
    old_question_id = validated_data.get('old_question_id')
    order = validated_data.get('order', 0)
    
    try:
        # If updating an existing assignment
        if old_question_id:
            updated_count = FormQuestionAssignment.objects.filter(
                form_type_id=form_type_id,
                main_category_id=main_category_id,
                question_id=old_question_id
            ).update(question_id=question_id, order=order)
            
            if updated_count:
                # Get all assignments after update
                assignments = FormQuestionAssignment.objects.filter(
                    form_type_id=form_type_id,
                    main_category_id=main_category_id
                )
                assigned_question_ids = [assignment.question_id for assignment in assignments]
                
                # Format response using serializer
                response_data = {
                    "status": "success",
                    "message": "Question updated successfully.",
                    "assigned_questions": assigned_question_ids
                }
                response_serializer = GetAssignedQuestionToCategoryQuestionSerializer(response_data)
                return Response(response_serializer.data, status=status.HTTP_200_OK)
            else:
                response_data = {
                    "status": "error",
                    "message": "No existing assignment to update."
                }
                response_serializer = GetAssignedQuestionToCategoryQuestionSerializer(response_data)
                return Response(response_serializer.data, status=status.HTTP_404_NOT_FOUND)
        
        # If assigning a new question
        else:
            if FormQuestionAssignment.objects.filter(
                form_type_id=form_type_id,
                main_category_id=main_category_id,
                question_id=question_id
            ).exists():
                # Get all assignments (including existing one)
                assignments = FormQuestionAssignment.objects.filter(
                    form_type_id=form_type_id,
                    main_category_id=main_category_id
                )
                assigned_question_ids = [assignment.question_id for assignment in assignments]
                
                # Format response using serializer
                response_data = {
                    "status": "success",
                    "message": "This question is already assigned to this category.",
                    "assigned_questions": assigned_question_ids
                }
                response_serializer = GetAssignedQuestionToCategoryQuestionSerializer(response_data)
                return Response(response_serializer.data, status=status.HTTP_200_OK)
            
            # Create new assignment
            new_assignment = FormQuestionAssignment.objects.create(
                form_type_id=form_type_id,
                main_category_id=main_category_id,
                question_id=question_id,
                order=order
            )
            
            # Get all assignments after creation
            assignments = FormQuestionAssignment.objects.filter(
                form_type_id=form_type_id,
                main_category_id=main_category_id
            )
            assigned_question_ids = [assignment.question_id for assignment in assignments]
            
            # Format response using serializer
            response_data = {
                "status": "success",
                "message": "Question assigned to category successfully.",
                "assigned_questions": assigned_question_ids
            }
            response_serializer = GetAssignedQuestionToCategoryQuestionSerializer(response_data)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        response_data = {
            "status": "error",
            "message": f"An unexpected error occurred: {str(e)}"
        }
        response_serializer = GetAssignedQuestionToCategoryQuestionSerializer(response_data)
        return Response(response_serializer.data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# @api_view(['GET'])
# def get_questions_assigned_to_category_api(request, form_type_id, main_category_id):
#     """
#     Get all questions assigned to a specific category within a form type
    
#     URL: /api/forms/{form_type_id}/categories/{main_category_id}/questions/
#     """
#     try:
#         # Get all assignments for this form type and category
#         assignments = FormQuestionAssignment.objects.filter(
#             form_type_id=form_type_id,
#             main_category_id=main_category_id
#         ).order_by('order')
        
#         # Extract just the question IDs
#         assigned_question_ids = [assignment.question_id for assignment in assignments]
        
#         # Prepare response data and format using serializer
#         response_data = {
#             "status": "success",
#             "assigned_questions": assigned_question_ids
#         }
        
#         # Use the serializer to format the response
#         serializer = GetAssignedQuestionToCategoryQuestionSerializer(response_data)
#         return Response(serializer.data, status=status.HTTP_200_OK)
        
#     except Exception as e:
#         response_data = {
#             "status": "error",
#             "message": f"An unexpected error occurred: {str(e)}"
#         }
#         serializer = GetAssignedQuestionToCategoryQuestionSerializer(response_data)
#         return Response(serializer.data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Optional: Additional API to get all questions for a form type (across all categories)
@api_view(['GET'])
def get_all_questions_assigned_to_all_categories_api(request, form_type_id):
    """
    Get all questions assigned to all categories within a form type
    
    URL: /api/forms/{form_type_id}/questions/
    """
    try:
        # Get all assignments for this form type
        assignments = FormQuestionAssignment.objects.filter(
            form_type_id=form_type_id
        ).order_by('main_category_id', 'order')
        
        # Group questions by category
        questions_by_category = {}
        for assignment in assignments:
            category_id = assignment.main_category_id
            if category_id not in questions_by_category:
                questions_by_category[category_id] = []
            questions_by_category[category_id].append(assignment.question_id)
        
        return Response({
            "status": "success",
            "questions_by_category": questions_by_category
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            "status": "error",
            "message": f"An unexpected error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['POST'])
def remove_assigned_question_api(request):
    """
    Remove a question assignment from a category within a form type
    """
    # Validate input data
    data= request.data
    serializer = RemoveQuestionAssignmentSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({
            "status": "error",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    form_type_id = serializer.validated_data['form_type_id']
    main_category_id = serializer.validated_data['main_category_id']
    question_id = serializer.validated_data['question_id']
    
    try:
        # Delete the assignment
        deleted, _ = FormQuestionAssignment.objects.filter(
            form_type_id=form_type_id,
            main_category_id=main_category_id,
            question_id=question_id
        ).delete()
        
        if deleted == 0:
            return Response({
                "status": "error",
                "message": "No question assignment found to remove."
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Get remaining assignments for this form type and category
        assignments = FormQuestionAssignment.objects.filter(
            form_type_id=form_type_id,
            main_category_id=main_category_id
        ).order_by('order')
        
        assignment_data = FormQuestionAssignmentSerializer(assignments, many=True).data
        assigned_question_ids = [assignment.question_id for assignment in assignments]
        
        # Prepare response with both IDs and full assignment details
        response_data = {
            "status": "success",
            "message": "Question assignment removed successfully.",
            "assigned_questions": assigned_question_ids,
            "assignments": assignment_data
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            "status": "error",
            "message": f"An unexpected error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# @api_view(['GET'])
# def get_assigned_questions_api(request, form_type_id, main_category_id):
#     """
#     Get the questions assigned to a specific category within a form type.
#     """
#     try:
#         # Get the assignments for the given form_type_id and main_category_id
#         assignments = FormQuestionAssignment.objects.filter(
#             form_type_id=form_type_id,
#             main_category_id=main_category_id
#         ).order_by('order')
        
#         # If no assignments are found, return empty list with success
#         if not assignments.exists():
#             return Response({
#                 "status": "success",
#                 "assigned_questions": []
#             }, status=status.HTTP_200_OK)
        
#         # Extract the assigned questions
#         assigned_questions = [assignment.question for assignment in assignments]
        
#         # Serialize the questions
#         question_serializer = QuestionSerializer(assigned_questions, many=True)
        
#         # Prepare the response data
#         response_data = {
#             "status": "success",
#             "assigned_questions": question_serializer.data
#         }
        
#         return Response(response_data, status=status.HTTP_200_OK)
        
#     except Exception as e:
#         return Response({
#             "status": "error",
#             "message": f"An unexpected error occurred: {str(e)}"
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# @api_view(['GET'])
# def get_questions_assigned_to_category_api(request, form_type_id, main_category_id):
#     """
#     Get questions assigned to a specific category within a form type.
#     Use ?detail=true to get full question data instead of just IDs.
#     """
#     try:
#         # Fetch all assignments for this form type and category
#         assignments = FormQuestionAssignment.objects.filter(
#             form_type_id=form_type_id,
#             main_category_id=main_category_id
#         ).order_by('order')

#         # Check if the client wants full details
#         detail = request.query_params.get('detail', 'false').lower() == 'true'

#         if not assignments.exists():
#             response_data = {
#                 "status": "success",
#                 "assigned_questions": []
#             }
#             serializer = GetAssignedQuestionToCategoryQuestionSerializer(response_data)
#             return Response(serializer.data, status=status.HTTP_200_OK)

#         if detail:
#             # Serialize full question data
#             assigned_questions = [assignment.question for assignment in assignments]
#             serialized_questions = QuestionSerializer(assigned_questions, many=True).data
#         else:
#             # Only return question IDs
#             serialized_questions = [assignment.question_id for assignment in assignments]

#         response_data = {
#             "status": "success",
#             "assigned_questions": serialized_questions
#         }

#         print('response_data for ',response_data)

#         serializer = GetAssignedQuestionToCategoryQuestionSerializer(response_data)
#         return Response(serializer.data, status=status.HTTP_200_OK)

#     except Exception as e:
#         response_data = {
#             "status": "error",
#             "message": f"An unexpected error occurred: {str(e)}"
#         }
#         serializer = GetAssignedQuestionToCategoryQuestionSerializer(response_data)
#         return Response(serializer.data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_questions_assigned_to_category_api(request, form_type_id, main_category_id):
    """
    Get questions assigned to a specific category within a form type.
    Use ?detail=true to get full question data instead of just IDs.
    """
    try:
        assignments = FormQuestionAssignment.objects.filter(
            form_type_id=form_type_id,
            main_category_id=main_category_id
        ).order_by('order')

        detail = request.query_params.get('detail', 'false').lower() == 'true'

        if not assignments.exists():
            return Response({
                "status": "success",
                "assigned_questions": []
            }, status=status.HTTP_200_OK)

        if detail:
            assigned_questions = [assignment.question for assignment in assignments]
            serialized_questions = QuestionSerializer(assigned_questions, many=True).data
        else:
            serialized_questions = [assignment.question_id for assignment in assignments]

        return Response({
            "status": "success",
            "assigned_questions": serialized_questions
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            "status": "error",
            "message": f"An unexpected error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
