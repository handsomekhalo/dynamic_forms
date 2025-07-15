# views.py

from http.client import responses
import json
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from application_management.models import FormCategoryAssignment, FormQuestionAssignment, FormResponse, FormSubmission, FormType, MainCategory
from form_portal_management.api.serailizers import GetAnsweredQuestionFromFormResponseSerializer, GetCategoryWithQuestionsAssignedSerializer, RetreiveDocumentSerializer
from django.db.models import Max

from form_portal_management.models import Document
from question_management.models import Question
from rest_framework.permissions import AllowAny
from rest_framework.decorators import (
    # api_view,
    # authentication_classes,
    permission_classes
)



@api_view(['GET'])
def get_all_form_details_api(request, form_id):
    try:
        # Get all MainCategories assigned to this form
        category_links = FormCategoryAssignment.objects.filter(form_type_id=form_id)
        categories = MainCategory.objects.filter(
            id__in=category_links.values_list('main_category_id', flat=True)
        ).order_by('order')

        serializer = GetCategoryWithQuestionsAssignedSerializer(
            categories,
            many=True,
            context={'form_id': form_id}
        )

        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'status': 'error', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])

def get_form_answers_from_user_api(request, form_id, client_id):
    """
    Get answers submitted by a specific user for a given form,
    and return unanswered questions per main category if any.
    """

    if request.method == 'GET':
        try:
            # Get parameters from URL path (already available) and query parameters
            user_id = client_id
            form_type_id = form_id

            # Get optional main_category_id from query parameters
            main_category_id = request.GET.get("main_category_id")  # optional

            if not user_id or not form_type_id:
                return Response({
                    "status": "error",
                    "message": "user_id and form_type_id are required."
                }, status=status.HTTP_400_BAD_REQUEST)
            


            # Retrieve the user's submission
            submission = FormSubmission.objects.filter(user_id=user_id, form_type_id=form_type_id).first()
            if not submission:
                return Response({
                    "status": "error",
                    "message": "No submission found for the specified user and form."
                }, status=status.HTTP_404_NOT_FOUND)

            # Get form responses
            responses = FormResponse.objects.filter(submission=submission)
            if main_category_id:
                responses = responses.filter(category_id=main_category_id)



            # Get latest response ID per question for the submission
            # latest_response_ids = FormResponse.objects.filter(submission=submission) \
            #     .values('question_id') \
            #     .annotate(latest_id=Max('id')) \
            #     .values_list('latest_id', flat=True)
                # Get the latest response ID for each (question_id, category_id)
            latest_per_category = FormResponse.objects.filter(submission=submission) \
                .values('question_id', 'category_id') \
                .annotate(latest_id=Max('id'))

            latest_ids = [entry['latest_id'] for entry in latest_per_category]

            responses = FormResponse.objects.filter(id__in=latest_ids)

              

            # Filter only latest responses
            # responses = FormResponse.objects.filter(id__in=latest_response_ids)
            serialized_responses = GetAnsweredQuestionFromFormResponseSerializer(responses, many=True).data

            # Get all assigned questions for this form (optionally filtered by category)
            question_assignments = FormQuestionAssignment.objects.filter(
                form_type_id=form_type_id
            )
            if main_category_id:
                question_assignments = question_assignments.filter(main_category_id=main_category_id)
            assigned_questions = {qa.question_id: qa.question for qa in question_assignments}

            # Identify unanswered question IDs
            answered_question_ids = set(responses.values_list('question_id', flat=True))
            unanswered_questions = [
                {
                    "question_id": q.id,
                    "question_text": q.text,
                    "input_type": q.input_type
                }
                for qid, q in assigned_questions.items() if qid not in answered_question_ids
            ]
            
            return Response({
                "status": "success",
                "message": "Form answers retrieved successfully.",
                "data": {
                    "answers": serialized_responses,
                    "unanswered_questions": unanswered_questions
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f'Error in API: {str(e)}')
            import traceback
            traceback.print_exc()
            
            return Response({
                "status": "error",
                "message": f"An error occurred: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
        "status": "error",
        "message": "Invalid request method."
    }, status=status.HTTP_405_METHOD_NOT_ALLOWED)



@api_view(['POST'])
def get_all_documents_for_user_api(request):
    """
    Retrieves all Z83 documents for a specific user.
    Expected input: { "user_id": "some-id" }
    """
    try:
        body = json.loads(request.body)
        user_id = body.get("user_id")

        if not user_id:
            return Response({"status": "error", "message": "Missing user_id"}, status=400)

        # Get all documents uploaded by this user
        documents = Document.objects.filter(uploaded_by_id=user_id).order_by('-uploaded_at')

        serializer = RetreiveDocumentSerializer(documents, many=True)

        return Response({
            "status": "success",
            "message": "User documents retrieved successfully.",
            "documents": serializer.data,
        }, status=200)

    except Exception as e:
        return Response({
            "status": "error",
            "message": str(e)
        }, status=500)


# @api_view(['POST'])
# def get_all_documents_for_user_api(request):
#     """
#     Retrieves all Z83 documents for a specific user.
#     Expected input: { "user_id": "some-id" }
#     """
#     try:
#         body = json.loads(request.body)
#         user_id = body.get("user_id")

#         print('user_id', user_id)

#         if not user_id:
#             print('No user id')
#             return Response({"status": "error", "message": "Missing user_id"}, status=400)

#         # ✅ FIXED: Filter by uploaded_by instead of id
#         # documents = Document.objects.filter(uploaded_by=user_id)
#         # documents =Document.objects.filter(form_submission=submission, question=question,main_category=category).order_by('-uploaded_at').first()
#         # Build a lookup for documents
#         document_map = {}
#         documents = Document.objects.filter(form_submission=submission)
#         for doc in documents:
#             key = f"{doc.question_id}-{doc.main_category_id}"
#             document_map[key] = doc.file  # or use full serializer if needed

#         # Then when looping through responses
#         for response in responses:
#             key = f"{response.question.id}-{response.category.id}"
#             document_url = document_map.get(key)
#             response_data = {
#                 "question": response.question.id,
#                 "question_text": response.question.text,
#                 # Add other key/value pairs as needed
#                 "file_upload": document_url,  # attach actual file
#             }

#         # Optional: Add ordering for consistent results
#         documents = documents.order_by('-uploaded_at')
        
#         serializer = RetreiveDocumentSerializer(documents, many=True)

#         return Response({
#             "status": "success",
#             "message": "User documents retrieved successfully.",
#             "documents": serializer.data,
#             # "unanswered_questions": unanswered_questions
#         }, status=200)

#     except Exception as e:
#         return Response({
#             "status": "error",
#             "message": str(e)
#         }, status=500)