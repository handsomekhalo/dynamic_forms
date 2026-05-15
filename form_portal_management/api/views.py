# views.py

from http.client import responses
import json
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from application_management.models import FormCategoryAssignment, FormQuestionAssignment, FormResponse, FormSubmission, FormType, MainCategory
from form_portal_management.api.serailizers import GetAnsweredQuestionFromFormResponseSerializer, GetCategoryWithQuestionsAssignedSerializer, RetreiveDocumentSerializer, SubmissionDetailSerializer, SubmissionListSerializer
from django.db.models import Max

from form_portal_management.models import Document, FormInvite
from question_management.models import Question
from rest_framework.permissions import AllowAny
from rest_framework.decorators import (
    # api_view,
    # authentication_classes,
    permission_classes
)
from rest_framework.permissions import IsAuthenticated, AllowAny




@api_view(['GET'])
@permission_classes([AllowAny])
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



# @api_view(['POST'])
# def get_all_documents_for_user_api(request):
#     """
#     Retrieves all Z83 documents for a specific user.
#     Expected input: { "user_id": "some-id" }
#     """
#     try:
#         body = json.loads(request.body)
#         user_id = body.get("user_id")

#         if not user_id:
#             return Response({"status": "error", "message": "Missing user_id"}, status=400)

#         # Get all documents uploaded by this user
#         documents = Document.objects.filter(uploaded_by_id=user_id).order_by('-uploaded_at')

#         serializer = RetreiveDocumentSerializer(documents, many=True)

#         return Response({
#             "status": "success",
#             "message": "User documents retrieved successfully.",
#             "documents": serializer.data,
#         }, status=200)

#     except Exception as e:
#         return Response({
#             "status": "error",
#             "message": str(e)
#         }, status=500)

@api_view(['POST'])
def get_all_documents_for_user_api(request):
    try:
        body = json.loads(request.body)
        user_id = body.get("user_id")

        if not user_id:
            return Response({"status": "error", "message": "Missing user_id"}, status=400)

        documents = Document.objects.filter(
            uploaded_by_id=user_id,
            file__isnull=False,   # ← guard 1: no null files
        ).exclude(
            file=''               # ← guard 2: no empty string files
        ).order_by('-uploaded_at')

        serializer = RetreiveDocumentSerializer(documents, many=True)
        
        # Filter out any docs where serializer returned null file_upload
        # (orphaned Backblaze files)
        valid_docs = [d for d in serializer.data if d.get('file')]

        return Response({
            "status": "success",
            "message": "User documents retrieved successfully.",
            "documents": valid_docs,
        }, status=200)

    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=500)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_submissions_api(request, form_id):
    try:
        submissions = FormSubmission.objects.filter(
            form_type_id=form_id
        ).select_related('user', 'form_type').order_by('-submitted_at')

        serializer = SubmissionListSerializer(submissions, many=True)

        return Response({
            'status': 'success',
            'count': submissions.count(),
            'submissions': serializer.data,
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'status': 'error', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_submission_detail_api(request, submission_id):
    try:
        submission = FormSubmission.objects.select_related(
            'user', 'form_type', 'reviewed_by'
        ).get(id=submission_id)

        # Only admin or the submission owner can view
        if request.user != submission.user and not request.user.is_staff:
            return Response(
                {'status': 'error', 'message': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = SubmissionDetailSerializer(submission)
        print(f"Fetched submission detail for submission_id {submission_id}: {serializer.data}")
        return Response({
            'status': 'success',
            'submission': serializer.data,
        }, status=status.HTTP_200_OK)

    except FormSubmission.DoesNotExist:
        return Response(
            {'status': 'error', 'message': 'Submission not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'status': 'error', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_submission_status_api(request, submission_id):
    try:
        submission = FormSubmission.objects.get(id=submission_id)

        # Only staff/admin can update status
        if not request.user.is_staff:
            return Response(
                {'status': 'error', 'message': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
        )

        new_status = request.data.get('status')
        review_notes = request.data.get('review_notes', None)

        valid_statuses = ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'returned']
        if new_status not in valid_statuses:
            return Response(
                {'status': 'error', 'message': f'Invalid status. Must be one of: {valid_statuses}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        submission.status = new_status
        if review_notes is not None:
            submission.review_notes = review_notes
        submission.reviewed_by = request.user
        submission.reviewed_at = timezone.now()
        submission.save()

        return Response({
            'status': 'success',
            'message': f'Submission status updated to {new_status}',
            'submission_id': submission.id,
            'new_status': submission.status,
            'reviewed_by': request.user.email,
            'reviewed_at': submission.reviewed_at,
        }, status=status.HTTP_200_OK)

    except FormSubmission.DoesNotExist:
        return Response(
            {'status': 'error', 'message': 'Submission not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'status': 'error', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def get_all_submissions_admin_api(request):
#     try:
#         submissions = FormSubmission.objects.select_related(
#             'user', 'form_type'
#         ).order_by('-submitted_at')

#         # Optional filters from query params
#         form_id = request.GET.get('form_id')
#         status_filter = request.GET.get('status')

#         if form_id:
#             submissions = submissions.filter(form_type_id=form_id)
#         if status_filter:
#             submissions = submissions.filter(status=status_filter)

#         serializer = SubmissionListSerializer(submissions, many=True)

#         return Response({
#             'status': 'success',
#             'count': submissions.count(),
#             'submissions': serializer.data,
#         }, status=200)

#     except Exception as e:
#         return Response(
#             {'status': 'error', 'message': str(e)},
#             status=500
#         )

from django.db.models import Q

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_submissions_admin_api(request):
    try:

        invites = FormInvite.objects.filter(
            sent_by=request.user
        )

        query = Q()

        for invite in invites:
            query |= Q(
                user=invite.recipient,
                form_type=invite.form_type
            )

        submissions = FormSubmission.objects.select_related(
            'user',
            'form_type'
        ).filter(query).order_by('-submitted_at')

        serializer = SubmissionListSerializer(
            submissions,
            many=True
        )

        return Response({
            'status': 'success',
            'count': submissions.count(),
            'submissions': serializer.data,
        }, status=200)

    except Exception as e:
        return Response(
            {
                'status': 'error',
                'message': str(e)
            },
            status=500
        )