import json
import os
from urllib.parse import urlencode
from django.forms import ValidationError
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.urls import reverse_lazy
import requests
   # Import your models
import base64
from django.core.files.base import ContentFile
from application_management.models import FormType, MainCategory, FormSubmission, FormResponse, FormQuestionAssignment, FormCategoryAssignment
from application_management.models import FormType, MainCategory, FormResponse, FormQuestionAssignment
from dynamic_forms import settings
from form_portal_management.api.serailizers import RetreiveDocumentSerializer
from question_management.models import Question
       
from application_management.models import FormCategoryAssignment, FormQuestionAssignment, FormResponse, FormSubmission, FormType, MainCategory
from form_portal_management.models import Document, FormInvite
from system_management.backblazes3 import upload_to_backblaze_s3,open_back_blaze_s3_file
from system_management.general_func_classes import host_url
from rest_framework.response import Response
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.db import IntegrityError
from django.core.validators import validate_email
from datetime import datetime
import requests
from rest_framework.authtoken.models import Token
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json, requests
import pandas as pd
from system_management.models import User  # or your custom one

from system_management.api.api_helpers import send_email_api
import threading
import json
from django.core import signing
from django.core.mail import send_mail
from django.db.models import Max

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from application_management.models import FormType
from form_portal_management.tokens import generate_form_token, validate_form_token

User = get_user_model()

@csrf_exempt
def get_all_form_details(request, formId):
    if request.method != 'GET':
        return JsonResponse({
            "status": "error",
            "message": "Method not allowed"
        }, status=405)

    try:
        # Extract token
        auth_header = request.headers.get("Authorization", "")
        token = None
        if auth_header.startswith("Token "):
            token = auth_header.split("Token ")[-1]
        elif auth_header.startswith("Bearer "):
            token = auth_header.split("Bearer ")[-1]

        if not token:
            return JsonResponse({
                "status": "error",
                "message": "Authorization token is required."
            }, status=401)

        # Save token in session (optional)
        request.session["token"] = token
        request.session.modified = True

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Token {token}",
        }

        # URL to your DRF API that gives form categories and questions
        url = f"{host_url(request)}{reverse_lazy('get_all_form_details_api', kwargs={'form_id': formId})}"

        # Call the DRF API
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        response_data = response.json()

        return JsonResponse({
            "status": "success",
            "formId": formId,
            "formDetails": response_data
        }, status=200)

    except requests.exceptions.RequestException as e:
        return JsonResponse({'status': 'error', 'message': f'Request failed: {str(e)}'}, status=500)
    except ValueError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON response from API'}, status=500)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)


@csrf_exempt
def get_all_form_details_no_token(request, formId):
    if request.method != 'GET':
        return JsonResponse({
            "status": "error",
            "message": "Method not allowed"
        }, status=405)

    try:
        # 👇 Remove token check completely
        # Save token in session (optional)
        # request.session["token"] = token
        # request.session.modified = True

        # Directly call the API without Authorization
        url = f"{host_url(request)}{reverse_lazy('get_all_form_details_api', kwargs={'form_id': formId})}"

        response = requests.get(url, timeout=10)  # 👈 No headers here
        response.raise_for_status()

        response_data = response.json()

        return JsonResponse({
            "status": "success",
            "formId": formId,
            "formDetails": response_data
        }, status=200)

    except requests.exceptions.RequestException as e:
        return JsonResponse({'status': 'error', 'message': f'Request failed: {str(e)}'}, status=500)
    except ValueError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON response from API'}, status=500)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)


# @csrf_exempt
# def submit_category_answers(request):
#     try:
#         # Ensure Content-Type is application/json
#         if request.content_type != 'application/json':
#             return JsonResponse({
#                 "status": "error",
#                 "message": "Content-Type must be application/json"
#             }, status=400)

#         # Load and debug the data
#         try:
#             data = json.loads(request.body)
#         except json.JSONDecodeError:
#             return JsonResponse({
#                 "status": "error",
#                 "message": "Invalid JSON format"
#             }, status=400)

#         # Extract Authorization Token - try from headers first, then from data
#         auth_header = request.headers.get("Authorization", "")
#         token = None
        
#         if auth_header.startswith("Token "):
#             token = auth_header.split("Token ")[-1]
#         elif auth_header.startswith("Bearer "):
#             token = auth_header.split("Bearer ")[-1]
#         elif 'headers' in data and 'Authorization' in data['headers']:
#             # Extract from nested headers if not in request headers
#             auth_value = data['headers']['Authorization']
#             if auth_value.startswith("Token "):
#                 token = auth_value.split("Token ")[-1]
#             elif auth_value.startswith("Bearer "):
#                 token = auth_value.split("Bearer ")[-1]

#         if not token:
#             return JsonResponse({
#                 "status": "error",
#                 "message": "Authorization token is required."
#             }, status=401)

#         # Authenticate user based on token
#         try:
#             token_obj = Token.objects.get(key=token)
#             user = token_obj.user
#         except Token.DoesNotExist:
#             return JsonResponse({
#                 "status": "error",
#                 "message": "Invalid token"
#             }, status=401)

#         # Extract the actual payload data - check multiple possible locations
#         if 'headers' in data and 'payload' in data['headers']:
#             # Data is nested under headers.payload
#             payload_data = data['headers']['payload']
#         elif 'payload' in data:
#             # Data is nested under 'payload'
#             payload_data = data['payload']
#         else:
#             # Data is at root level
#             payload_data = data

#         # Extract the expected fields from the correct data structure
#         form_id = payload_data.get("form_id")
#         category_id = payload_data.get("category_id")
#         answers = payload_data.get("answers", [])

#         print('answers', answers)

#         # Validation
#         if form_id is None:
#             return JsonResponse({"status": "error", "message": "form_id is required"}, status=400)
#         if category_id is None:
#             return JsonResponse({"status": "error", "message": "category_id is required"}, status=400)
#         if not answers or not isinstance(answers, list):
#             return JsonResponse({"status": "error", "message": "answers must be a non-empty list"}, status=400)

#         try:
#             form_id = int(form_id)
#             category_id = int(category_id)
#         except (ValueError, TypeError):
#             return JsonResponse({
#                 "status": "error",
#                 "message": "form_id and category_id must be valid integers"
#             }, status=400)

#         # Validate that the form and category exist

#         try:
#             form_type = FormType.objects.get(id=form_id)
#         except FormType.DoesNotExist:
#             return JsonResponse({"status": "error", "message": "Invalid form_id"}, status=400)

#         try:
#             main_category = MainCategory.objects.get(id=category_id)
#         except MainCategory.DoesNotExist:
#             return JsonResponse({"status": "error", "message": "Invalid category_id"}, status=400)

#         if not FormCategoryAssignment.objects.filter(form_type=form_type, main_category=main_category).exists():
#             return JsonResponse({
#                 "status": "error",
#                 "message": "Category is not assigned to this form"
#             }, status=400)

#         # Save submission record (create if not exists)
#         submission, created = FormSubmission.objects.get_or_create(
#             user=user,
#             form_type=form_type,
#             defaults={'is_complete': False}
#         )

#         # Save the answers
#         saved_count = save_category_answers(submission, form_id, category_id, answers, request, user)
#         # Check if form is now complete and notify
#         check_form_complete_and_notify(submission, request)

#         return JsonResponse({
#             "status": "success",
#             "message": f"Successfully saved {saved_count} answers for category '{main_category.name}'",
#             "formId": form_id,
#             "categoryId": category_id,
#             "savedAnswers": saved_count
#         }, status=200)

#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         return JsonResponse({
#             "status": "error",
#             "message": f"Server error occurred: {str(e)}"
#         }, status=500)

@csrf_exempt
def submit_category_answers(request):
    try:
        if request.content_type != 'application/json':
            return JsonResponse({
                "status": "error",
                "message": "Content-Type must be application/json"
            }, status=400)

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({
                "status": "error",
                "message": "Invalid JSON format"
            }, status=400)

        # -----------------------------
        # AUTH TOKEN EXTRACTION
        # -----------------------------
        auth_header = request.headers.get("Authorization", "")
        token = None

        if auth_header.startswith("Token "):
            token = auth_header.split("Token ")[-1]
        elif auth_header.startswith("Bearer "):
            token = auth_header.split("Bearer ")[-1]
        elif 'headers' in data and 'Authorization' in data['headers']:
            auth_value = data['headers']['Authorization']
            if auth_value.startswith("Token "):
                token = auth_value.split("Token ")[-1]
            elif auth_value.startswith("Bearer "):
                token = auth_value.split("Bearer ")[-1]

        # -----------------------------
        # PAYLOAD EXTRACTION
        # -----------------------------
        if 'headers' in data and 'payload' in data['headers']:
            payload_data = data['headers']['payload']
        elif 'payload' in data:
            payload_data = data['payload']
        else:
            payload_data = data

        form_id = payload_data.get("form_id")
        category_id = payload_data.get("category_id")
        answers = payload_data.get("answers", [])
        magic_link_token = payload_data.get("magic_link_token")

        # -----------------------------
        # USER RESOLUTION
        # -----------------------------
        authenticated_user = None

        if token:
            try:
                token_obj = Token.objects.get(key=token)
                authenticated_user = token_obj.user
            except Token.DoesNotExist:
                if not magic_link_token:
                    return JsonResponse({
                        "status": "error",
                        "message": "Invalid token"
                    }, status=401)

        elif not magic_link_token:
            return JsonResponse({
                "status": "error",
                "message": "Authorization token or magic link token is required."
            }, status=401)

        # Default submission user to authenticated user
        submission_user = authenticated_user

        # -----------------------------
        # MAGIC LINK RESOLUTION
        # -----------------------------
        if magic_link_token:
            try:
                invite = FormInvite.objects.select_related(
                    'recipient', 'form_type'
                ).get(token=magic_link_token)

                submission_user = invite.recipient

                # Validate form matches invite
                if form_id and int(form_id) != invite.form_type.id:
                    return JsonResponse({
                        "status": "error",
                        "message": "Invalid form for this invite"
                    }, status=403)

            except FormInvite.DoesNotExist:
                return JsonResponse({
                    "status": "error",
                    "message": "Invalid magic link token"
                }, status=401)

        if not submission_user:
            return JsonResponse({
                "status": "error",
                "message": "Could not resolve submission user"
            }, status=401)

        # -----------------------------
        # VALIDATION
        # -----------------------------
        if form_id is None:
            return JsonResponse({
                "status": "error",
                "message": "form_id is required"
            }, status=400)

        if category_id is None:
            return JsonResponse({
                "status": "error",
                "message": "category_id is required"
            }, status=400)

        if not answers or not isinstance(answers, list):
            return JsonResponse({
                "status": "error",
                "message": "answers must be a non-empty list"
            }, status=400)

        try:
            form_id = int(form_id)
            category_id = int(category_id)
        except (ValueError, TypeError):
            return JsonResponse({
                "status": "error",
                "message": "form_id and category_id must be valid integers"
            }, status=400)

        try:
            form_type = FormType.objects.get(id=form_id)
        except FormType.DoesNotExist:
            return JsonResponse({
                "status": "error",
                "message": "Invalid form_id"
            }, status=400)

        try:
            main_category = MainCategory.objects.get(id=category_id)
        except MainCategory.DoesNotExist:
            return JsonResponse({
                "status": "error",
                "message": "Invalid category_id"
            }, status=400)

        if not FormCategoryAssignment.objects.filter(
            form_type=form_type,
            main_category=main_category
        ).exists():
            return JsonResponse({
                "status": "error",
                "message": "Category is not assigned to this form"
            }, status=400)

        # -----------------------------
        # CREATE SUBMISSION
        # -----------------------------
        submission, created = FormSubmission.objects.get_or_create(
            user=submission_user,
            form_type=form_type,
            defaults={'is_complete': False}
        )

        # -----------------------------
        # SAVE ANSWERS
        # -----------------------------
        saved_count = save_category_answers(
            submission,
            form_id,
            category_id,
            answers,
            request,
            submission_user
        )

        # -----------------------------
        # COMPLETION CHECK
        # -----------------------------
        check_form_complete_and_notify(submission, request)

        return JsonResponse({
            "status": "success",
            "message": f"Successfully saved {saved_count} answers",
            "formId": form_id,
            "categoryId": category_id,
            "savedAnswers": saved_count,
            "submissionId": submission.id,
            "submissionUser": submission_user.email,
        }, status=200)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)

# @csrf_exempt
# def submit_category_answers(request):
#     try:

#         if request.content_type != 'application/json':
#             return JsonResponse({
#                 "status": "error",
#                 "message": "Content-Type must be application/json"
#             }, status=400)

#         try:
#             data = json.loads(request.body)

#         except json.JSONDecodeError:
#             return JsonResponse({
#                 "status": "error",
#                 "message": "Invalid JSON format"
#             }, status=400)

#         auth_header = request.headers.get("Authorization", "")
#         token = None

#         if auth_header.startswith("Token "):
#             token = auth_header.split("Token ")[-1]

#         elif auth_header.startswith("Bearer "):
#             token = auth_header.split("Bearer ")[-1]

#         elif 'headers' in data and 'Authorization' in data['headers']:

#             auth_value = data['headers']['Authorization']

#             if auth_value.startswith("Token "):
#                 token = auth_value.split("Token ")[-1]

#             elif auth_value.startswith("Bearer "):
#                 token = auth_value.split("Bearer ")[-1]

#         if not token:
#             return JsonResponse({
#                 "status": "error",
#                 "message": "Authorization token is required."
#             }, status=401)

#         try:
#             token_obj = Token.objects.get(key=token)
#             authenticated_user = token_obj.user

#         except Token.DoesNotExist:
#             return JsonResponse({
#                 "status": "error",
#                 "message": "Invalid token"
#             }, status=401)

#         # -----------------------------
#         # PAYLOAD EXTRACTION
#         # -----------------------------

#         if 'headers' in data and 'payload' in data['headers']:
#             payload_data = data['headers']['payload']

#         elif 'payload' in data:
#             payload_data = data['payload']

#         else:
#             payload_data = data

#         form_id = payload_data.get("form_id")
#         category_id = payload_data.get("category_id")
#         answers = payload_data.get("answers", [])

#         # -----------------------------
#         # MAGIC LINK SUPPORT
#         # -----------------------------

#         magic_link_token = payload_data.get("magic_link_token")

#         submission_user = authenticated_user

#         if magic_link_token:

#             try:
#                 invite = FormInvite.objects.select_related(
#                     'recipient',
#                     'form_type'
#                 ).get(token=magic_link_token)

#                 submission_user = invite.recipient

#                 # Optional security validation
#                 if int(form_id) != invite.form_type.id:
#                     return JsonResponse({
#                         "status": "error",
#                         "message": "Invalid form for this invite"
#                     }, status=403)

#             except FormInvite.DoesNotExist:
#                 return JsonResponse({
#                     "status": "error",
#                     "message": "Invalid magic link token"
#                 }, status=401)

#         # -----------------------------
#         # VALIDATION
#         # -----------------------------

#         if form_id is None:
#             return JsonResponse({
#                 "status": "error",
#                 "message": "form_id is required"
#             }, status=400)

#         if category_id is None:
#             return JsonResponse({
#                 "status": "error",
#                 "message": "category_id is required"
#             }, status=400)

#         if not answers or not isinstance(answers, list):
#             return JsonResponse({
#                 "status": "error",
#                 "message": "answers must be a non-empty list"
#             }, status=400)

#         try:
#             form_id = int(form_id)
#             category_id = int(category_id)

#         except (ValueError, TypeError):
#             return JsonResponse({
#                 "status": "error",
#                 "message": "form_id and category_id must be valid integers"
#             }, status=400)

#         try:
#             form_type = FormType.objects.get(id=form_id)

#         except FormType.DoesNotExist:
#             return JsonResponse({
#                 "status": "error",
#                 "message": "Invalid form_id"
#             }, status=400)

#         try:
#             main_category = MainCategory.objects.get(id=category_id)

#         except MainCategory.DoesNotExist:
#             return JsonResponse({
#                 "status": "error",
#                 "message": "Invalid category_id"
#             }, status=400)

#         if not FormCategoryAssignment.objects.filter(
#             form_type=form_type,
#             main_category=main_category
#         ).exists():

#             return JsonResponse({
#                 "status": "error",
#                 "message": "Category is not assigned to this form"
#             }, status=400)

#         # -----------------------------
#         # CREATE SUBMISSION
#         # -----------------------------

#         submission, created = FormSubmission.objects.get_or_create(
#             user=submission_user,
#             form_type=form_type,
#             defaults={
#                 'is_complete': False
#             }
#         )

#         # -----------------------------
#         # SAVE ANSWERS
#         # -----------------------------

#         saved_count = save_category_answers(
#             submission,
#             form_id,
#             category_id,
#             answers,
#             request,
#             submission_user
#         )

#         # -----------------------------
#         # COMPLETION CHECK
#         # -----------------------------

#         check_form_complete_and_notify(
#             submission,
#             request
#         )

#         return JsonResponse({
#             "status": "success",
#             "message": f"Successfully saved {saved_count} answers",
#             "formId": form_id,
#             "categoryId": category_id,
#             "savedAnswers": saved_count,
#             "submissionId": submission.id,
#             "submissionUser": submission_user.email,
#         }, status=200)

#     except Exception as e:

#         import traceback
#         traceback.print_exc()

#         return JsonResponse({
#             "status": "error",
#             "message": f"Server error occurred: {str(e)}"
#         }, status=500)

def save_category_answers(submission, form_id, category_id, answers, request, user):
    """
    Save category answers and return count of successfully saved answers
    """

    saved_count = 0
    
    for answer in answers:
        question_id = answer.get("question_id")
        response_text = answer.get("answer", "")
        print('Processing answer for question_id:', question_id)
        print('response_text:', response_text)
        other_option = answer.get("other_option")

        if not question_id:
            print("Skipping answer - no question_id")
            continue

        try:
            # Convert question_id to integer if it's a string
            question_id = int(question_id)
            question = Question.objects.get(id=question_id)



            # Validate that this question belongs to this category and form
                        # Validate that this question belongs to this category and form
            exists = FormQuestionAssignment.objects.filter(
                form_type_id=form_id,
                main_category_id=category_id,
                question_id=question_id
            ).exists()

            print(f"DEBUG -> Q:{question_id} Form:{form_id} Cat:{category_id} Exists:{exists}")

            if not exists:
                print(f"SKIPPING Question {question_id} (not assigned)")
                continue
            # if not FormQuestionAssignment.objects.filter(
            #     form_type_id=form_id,
            #     main_category_id=category_id,
            #     question_id=question_id
            # ).exists():
            #     print(f"Question {question_id} not assigned to form {form_id}, category {category_id}")
                        

            # assignment_qs = FormQuestionAssignment.objects.filter(
            #     form_type_id=form_id,
            #     question_id=question_id
            # )

            # # If the question is assigned to multiple categories, allow saving if current category matches any
            # if not assignment_qs.filter(main_category_id=category_id).exists():
            #     print(f"Skipping Question {question_id} — not assigned to category {category_id} in form {form_id}")
            #     continue


            # Get form_type and category objects
            form_type = FormType.objects.get(id=form_id)
            main_category = MainCategory.objects.get(id=category_id)

            # Prepare response data
            response_data = {
                'response_text': None,
                'response_number': None,
                'response_date': None,
                'response_boolean': None,
                'file_upload': None,
            }

            
            is_s3_url = (
                response_text
                and isinstance(response_text, str)
                and response_text.startswith("http")
)
            # Handle file uploads
            # if question.input_type == 'file':

            if question.input_type == 'file':

    # CASE 1: Already uploaded file (S3 URL)
                if is_s3_url:
                    print("Using S3 URL directly")

                    response_data['file_upload'] = response_text
                    response_data['response_text'] = os.path.basename(response_text)

                    form_response, created = FormResponse.objects.update_or_create(
                        submission=submission,
                        form_type=form_type,
                        category=main_category,
                        question=question,
                        defaults=response_data
                    )

                    saved_count += 1
                    continue

                
                
                print(f"Processing file upload for question {question_id}")
                
                # Check if this is a base64 encoded file
                if answer.get('is_file') and response_text and response_text.startswith('data:'):
                    try:
                        print(f"Processing base64 file upload for question {question_id}")
                        
                        # Validate base64 format
                        if ';base64,' not in response_text:
                            print(f"Invalid base64 format for question {question_id}")
                            continue
                            
                        # Handle base64 encoded file
                        format_part, imgstr = response_text.split(';base64,', 1)
                        
                        # Extract file extension from MIME type
                        if 'data:' in format_part:
                            mime_type = format_part.replace('data:', '')
                            ext_map = {
                                'application/pdf': 'pdf',
                                'image/jpeg': 'jpg',
                                'image/jpg': 'jpg',
                                'image/png': 'png',
                                'image/gif': 'gif',
                                'text/plain': 'txt',
                                'application/msword': 'doc',
                                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
                            }
                            ext = ext_map.get(mime_type, 'bin')
                        else:
                            ext = 'pdf'  # default fallback
                        
                        # Get filename from answer or generate one
                        filename = answer.get('filename')
                        if not filename:
                            filename = f'file_{question_id}_{submission.id}.{ext}'
                        
                        # Ensure filename has correct extension
                        if not filename.lower().endswith(f'.{ext}'):
                            filename = f"{os.path.splitext(filename)[0]}.{ext}"
                        
                        print(f'Processing file: {filename}')
                        
                        # Decode base64 - add padding if needed
                        try:
                            # Add padding if needed
                            missing_padding = len(imgstr) % 4
                            if missing_padding:
                                imgstr += '=' * (4 - missing_padding)
                            
                            file_data = base64.b64decode(imgstr)
                            print(f'Decoded file size: {len(file_data)} bytes')
                            
                            if len(file_data) == 0:
                                print(f"Decoded file is empty for question {question_id}")
                                continue
                                
                        except Exception as decode_error:
                            print(f"Base64 decode error for question {question_id}: {decode_error}")
                            continue
                        
                        # Create a Django file object
                        django_file = ContentFile(file_data, name=filename)
                        
                        # Upload to S3 and get the public file URL
                        try:
                            full_s3_url = upload_to_backblaze_s3(django_file, filename)
                            
                            if not full_s3_url:
                                continue

                            # Save Document record
                            # document = Document.objects.create(
                            #     name=filename,
                            #     file=full_s3_url,
                            #     uploaded_by=user,  # Use the passed user parameter
                            #     form_submission=submission,
                            # )
                            Document.objects.create(
                                name=filename,
                                file=full_s3_url,
                                uploaded_by=user, 
                                form_submission=submission,
                                question=question,  # ← you must now explicitly store the question
                                main_category=main_category,  # ← and the main category
                            )

                                                        # Save to FormResponse
                            response_data['file_upload'] = full_s3_url
                            response_data['response_text'] = filename
                            
                        except Exception as upload_error:
                            print(f"S3 upload failed for question {question_id}: {upload_error}")
                            continue
                            
                    except Exception as e:
                        print(f"Base64 file processing failed for question {question_id}: {e}")
                        import traceback
                        traceback.print_exc()
                        continue
                        
                elif answer.get('is_file'):
                    # File was expected but base64 data is missing or invalid
                    print(f"File expected but invalid base64 data for question {question_id}")
                    continue
                    
                else:
                    
                    # Look for file in request.FILES (for multipart uploads)
                    uploaded_file = request.FILES.get(f"file_{question_id}")
                    
                    if uploaded_file:
                        try:
                            # Upload to S3 and get the public file URL
                            file_name = uploaded_file.name
                            full_s3_url = upload_to_backblaze_s3(uploaded_file, file_name)
                            
                            if not full_s3_url:
                                continue

                            # Save Document record
                            Document.objects.create(
                                name=file_name,
                                # file=uploaded_file,
                                file=full_s3_url,  # ✅ The URL returned from your manual S3 upload

                                uploaded_by=user,
                                form_submission=submission,
                            )

                            # Save to FormResponse
                            response_data['file_upload'] = full_s3_url
                            response_data['response_text'] = file_name
                            print('Multipart file uploaded successfully:', response_data)
                        except Exception as e:
                            print(f"Multipart file upload failed for question {question_id}: {e}")
                            continue
                    else:
                        # No file found
                        print(f"No file found for file question {question_id}")
                        if response_text and response_text.strip():
                            print(f"Received text instead: {response_text}")
                        continue

            elif question.input_type == 'checkbox':
                if isinstance(response_text, list):
                    response_data['response_text'] = ", ".join(map(str, response_text))
                elif str(response_text).lower() in ['checked', 'true', 'yes', '1']:
                    response_data['response_boolean'] = True
                    response_data['response_text'] = "Yes" 
                else:
                    response_data['response_boolean'] = False
                    response_data['response_text'] = "No"

            elif question.input_type == 'email':
                if response_text:  # Only validate if not empty
                    try:
                        validate_email(response_text)
                        response_data['response_text'] = response_text
                    except ValidationError:
                        print(f"Invalid email format for question {question_id}: {response_text}")
                        continue
                else:
                    response_data['response_text'] = ""

            elif question.input_type == 'date':
                if response_text:  # Only validate if not empty
                    try:
                        parsed_date = datetime.strptime(response_text, "%Y-%m-%d").date()
                        response_data['response_date'] = parsed_date
                        response_data['response_text'] = response_text
                    except ValueError:
                        print(f"Invalid date format for question {question_id}: {response_text}")
                        continue
                else:
                    response_data['response_text'] = ""

            elif question.input_type == 'number':
                if response_text:  # Only validate if not empty
                    try:
                        number_value = float(response_text)
                        response_data['response_number'] = number_value
                        response_data['response_text'] = str(response_text)
                    except ValueError:
                        print(f"Invalid number format for question {question_id}: {response_text}")
                        continue
                else:
                    response_data['response_text'] = ""

            else:  # text, textarea, etc.
                response_data['response_text'] = str(response_text).strip()

            # Handle "other" option
            if hasattr(question, 'allow_other_option') and question.allow_other_option and other_option:
                response_data['response_text'] = str(other_option).strip()

            # Skip empty required fields (but not for file uploads which are handled above)
            if (hasattr(question, 'is_required') and question.is_required and 
                question.input_type != 'file'):
                if (not response_data['response_text'] or 
                    (response_data['response_text'] and response_data['response_text'].strip() == "")):
                    print(f"Required question {question_id} has empty response")
                    continue

            # Save or update the response using the correct field names from your model
            form_response, created = FormResponse.objects.update_or_create(
                submission=submission,
                form_type=form_type,  # Use the object, not ID
                category=main_category,  # Use the object, not ID  
                question=question,  # Use the object, not ID
                defaults=response_data
            )
            
            saved_count += 1
            print(f"{'Created' if created else 'Updated'} response for question {question_id}")

        except (ValueError, TypeError) as e:
            print(f"Data type error for question {question_id}: {str(e)}")
            continue
        except Question.DoesNotExist:
            print(f"Question with id {question_id} does not exist")
            continue
        except (FormType.DoesNotExist, MainCategory.DoesNotExist) as e:
            print(f"Form or category does not exist: {str(e)}")
            continue
        except IntegrityError as e:
            print(f"Database integrity error for question {question_id}: {str(e)}")
            continue
        except Exception as e:
            print(f"Unexpected error saving question {question_id}: {str(e)}")
            import traceback
            traceback.print_exc()
            continue

    return saved_count



# 
@csrf_exempt
def get_form_answers_from_user(request, formId):
    if request.method != 'GET':
        return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)

    try:
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.replace("Token ", "").replace("Bearer ", "").strip()

        # For magic link users — accept client_id from query param
        override_client_id = request.GET.get("user_id")

        if token:
            try:
                user = Token.objects.select_related('user').get(key=token).user
                client_id = int(override_client_id) if override_client_id else user.id
            except Token.DoesNotExist:
                return JsonResponse({"status": "error", "message": "Invalid or expired token."}, status=401)
        elif override_client_id:
            # Magic link user — no token but user_id provided
            client_id = int(override_client_id)
            token = ""  # no token needed for API call headers
        else:
            return JsonResponse({"status": "error", "message": "Authorization token or user_id is required."}, status=401)

        print('client_id', client_id)

        base_url = host_url(request)
        query_string = f"?{urlencode({'detail': 'true'})}" if request.GET.get("detail", "").lower() == "true" else ""

        api_path = reverse_lazy(
            'get_form_answers_from_user_api',
            kwargs={'form_id': formId, 'client_id': client_id}
        )
        api_url = f"{base_url}{api_path}{query_string}"

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Token {token}" if token else "",
        }

        response = requests.get(api_url, headers=headers, timeout=60)
        # 404 means no submission yet — return empty answers gracefully
        if response.status_code == 404:
            return JsonResponse({
                "status": "success",
                "data": {"answers": []},
                "message": "No answers submitted yet."
            }, status=200)

       
        response.raise_for_status()
        response_data = response.json()

        answers = response_data.get("data", {}).get("answers", [])
        print('answers', answers)

        # Enhance file answers with presigned URLs
        for ans in answers:
            file_url = ans.get("file_upload") or ans.get("file") or ans.get("value")
            if file_url and any(
                str(file_url).endswith(ext)
                for ext in [".pdf", ".jpg", ".jpeg", ".png", ".mp4", ".docx", ".xlsx"]
            ):
                try:
                    ans["file_preview_url"] = open_back_blaze_s3_file(str(file_url))
                except Exception as e:
                    print(f"[Preview URL Error] {e}")
                    ans["file_preview_url"] = file_url

        return JsonResponse({
            "status": "success",
            "data": {"answers": answers},
            "message": "Answers retrieved successfully." if answers else "No answers submitted yet."
        }, status=200)

    except requests.RequestException as e:
        return JsonResponse({"status": "error", "message": f"Failed to retrieve answers: {str(e)}"}, status=500)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"status": "error", "message": f"Server error occurred: {str(e)}"}, status=500)

@csrf_exempt
def get_all_documents_for_user(request):
    """
    View to retrieve documents for a user using their token.
    Calls the DRF API endpoint and adds presigned URLs.
    """
    if request.method != 'GET':
        return JsonResponse({
            "status": "error",
            "message": "Method not allowed"
        }, status=405)

    try:
        # 1. Extract token
        auth_header = request.headers.get("Authorization", "")
        token = None
        if auth_header.startswith("Token "):
            token = auth_header.split("Token ")[-1]
        elif auth_header.startswith("Bearer "):
            token = auth_header.split("Bearer ")[-1]

        if not token:
            return JsonResponse({
                "status": "error",
                "message": "Authorization token is required."
            }, status=401)

        # 2. Get the user to pass user_id to the API
        try:
            user = Token.objects.select_related('user').get(key=token).user
        except Token.DoesNotExist:
            return JsonResponse({
                "status": "error",
                "message": "Invalid or expired token."
            }, status=401)

        # 3. Save token in session (optional)
        request.session["token"] = token
        request.session.modified = True

        # 4. Prepare headers and payload for API call
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Token {token}",
        }

        # 5. Prepare the payload with user_id
        payload = {
            "user_id": user.id
        }

        # 6. URL to your DRF API endpoint
        url = f"{host_url(request)}{reverse_lazy('get_all_documents_for_user_api')}"

        # 7. Call the DRF API
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()

        response_data = response.json()

        # 8. Check if API call was successful
        if response_data.get("status") != "success":
            return JsonResponse({
                "status": "error",
                "message": response_data.get("message", "API call failed")
            }, status=400)

        # 9. Get documents from API response (already serialized)
        documents_list = response_data.get("documents", [])

        # 10. Apply presigned URL generation (only presentation logic)
        if documents_list:
            for document in documents_list:
                # Generate presigned URLs for file fields
                if 'file' in document and document['file']:
                    document['file'] = open_back_blaze_s3_file(document['file'])
                
                if 'response' in document and document['response']:
                    document['response'] = open_back_blaze_s3_file(document['response'])

        return JsonResponse({
            "status": "success",
            "data": documents_list,
            "message": "Documents retrieved successfully."
        }, status=200)

    except requests.exceptions.RequestException as e:
        return JsonResponse({
            'status': 'error', 
            'message': f'Request failed: {str(e)}'
        }, status=500)
    except ValueError:
        return JsonResponse({
            'status': 'error', 
            'message': 'Invalid JSON response from API'
        }, status=500)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)








def _send_form_invite_thread(email_url, headers, payload):
    """Background thread — same pattern as create_firm_user"""
    import requests
    try:
        requests.post(email_url, headers=headers, data=payload, timeout=10)
    except Exception as e:
        print(f"[EMAIL THREAD ERROR] {e}")


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_form_invitation(request):
    """
    Send magic link invite to one user for a specific form.
    Body: { "user_id": 5, "form_id": 4 }
    OR:   { "email": "client@example.com", "form_id": 4 }
    """
    form_id = request.data.get('form_id')
    print('form_id', form_id)
    user_id = request.data.get('user_id')
    print('user_id', user_id)
    email = request.data.get('email')
    print('email', email)

    if not form_id:
        return Response({'error': 'form_id is required'}, status=400)

    if not user_id and not email:
        return Response({'error': 'Provide either user_id or email'}, status=400)

    try:
        form = FormType.objects.get(id=form_id)
    except FormType.DoesNotExist:
        return Response({'error': 'Form not found'}, status=404)

    # Resolve user — by ID or by email (create if not exists)
    try:
        if user_id:
            user = User.objects.get(id=user_id)
        else:
            email = email.strip().lower()
            existing = User.objects.filter(email=email).first()
            if existing:
                user = existing
            else:
                try:
                    from system_management.models import UserType
                    applicant_type = UserType.objects.get(name='Applicant')
                except UserType.DoesNotExist:
                    applicant_type = UserType.objects.order_by('id').last()

                user = User.objects.create_user(
                    email=email,
                    password=User.objects.make_random_password(),
                    first_name=email.split('@')[0],
                    last_name='',
                    user_type=applicant_type,
                )
                print(f"[INVITE] Created new user for {email}")

    except User.DoesNotExist:
        return Response({'error': f'No user found with id {user_id}'}, status=404)
    except Exception as e:
        return Response({'error': f'User resolution failed: {str(e)}'}, status=500)
    

    # Generate token and magic link
    token = generate_form_token(user.id, form_id)
    frontend_url = getattr(settings, 'FRONTEND_URL', request.build_absolute_uri('/').rstrip('/'))
    form_link = f"{frontend_url}/form-access/{token}"

    # Record the invite
    FormInvite.objects.create(
        sent_by=request.user,
        recipient=user,
        form_type=form,
        token=token
    )

    print(f"[INVITE] Sending invite to {user.email} for form '{form.name}'")
    print(f"[INVITE] Magic link: {form_link}")

    # Send email
    try:
        from django.template.loader import get_template
        context_data = {
            'first_name': user.first_name or user.email,
            'form_name': form.name,
            'organisation_name': 'Z83 Dynamic Tool',
            'form_link': form_link,
        }
        html_content = get_template('email_temps/form_invite.html').render(context_data)

        thread = threading.Thread(
            target=send_email_api,
            args=(user.email, f"Complete your {form.name} form", html_content)
        )
        thread.start()

    except Exception as e:
        # Email failed but invite record exists — still return success with link
        print(f"[INVITE] Email failed: {str(e)}")
        return Response({
            'status': 'success',
            'message': f'Invite created but email failed to send. Share this link manually.',
            'form_link': form_link,
            'user_id': user.id,
            'email': user.email,
        }, status=200)

    return Response({
        'status': 'success',
        'message': f'Invitation sent to {user.email}',
        'form_link': form_link,
        'user_id': user.id,
        'email': user.email,
        'user_created': not bool(user_id),
    }, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_bulk_form_invitations_view(request):
    """
    Send magic link to multiple users at once — solves the 30 interns problem.
    Body: { "user_ids": [1,2,3,...], "form_id": 4 }
    OR:   { "emails": ["a@b.com", ...], "form_id": 4 }  ← creates users on the fly
    """
    form_id = request.data.get('form_id')
    user_ids = request.data.get('user_ids', [])
    emails = request.data.get('emails', [])

    if not form_id:
        return Response({'error': 'form_id required'}, status=400)
    if not user_ids and not emails:
        return Response({'error': 'Provide user_ids or emails'}, status=400)

    try:
        form = FormType.objects.get(id=form_id)
    except FormType.DoesNotExist:
        return Response({'error': 'Form not found'}, status=404)

    results = {'sent': [], 'failed': []}

    # Handle existing users by ID
    for uid in user_ids:
        try:
            user = User.objects.get(id=uid)
            _dispatch_invite(user, form, request)
            results['sent'].append(user.email)
        except Exception as e:
            results['failed'].append({'id': uid, 'error': str(e)})

    # Handle raw emails — create minimal user if not exists
    for email in emails:
        try:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,
                    'first_name': email.split('@')[0],
                    'is_active': True
                }
            )
            _dispatch_invite(user, form, request)
            results['sent'].append(email)
        except Exception as e:
            results['failed'].append({'email': email, 'error': str(e)})

    return Response({
        'status': 'success',
        'sent_count': len(results['sent']),
        'failed_count': len(results['failed']),
        'results': results
    })


def _dispatch_invite(user, form, request):
    """Shared invite dispatch — used by both single and bulk views"""
    from django.template.loader import get_template
    from form_portal_management.tokens import generate_form_token

    token = generate_form_token(user.id, form.id)
    frontend_url = request.build_absolute_uri('/').rstrip('/')
    form_link = f"{frontend_url}/form-access/{token}"

    context_data = {
        'first_name': user.first_name or user.email,
        'form_name': form.name,
        'organisation_name': 'Z83 Dynamic Tool',
        'form_link': form_link,
    }

    html_content = get_template('email_temps/form_invite.html').render(context_data)
    thread = threading.Thread(
        target= send_email_api,
        args=(user.email, f"Complete your {form.name} form", html_content)
    )
    thread.start()


@api_view(['GET'])
@permission_classes([AllowAny])
def validate_form_token_view(request, token):
    """
    Frontend calls this when user lands on /form-access/{token}.
    Returns user context + form_id if valid.
    """
    result = validate_form_token(token)

    if 'error' in result:
        if result['error'] == 'expired':
            return Response({
                'status': 'error',
                'message': 'This link has expired. Please contact your administrator for a new one.'
            }, status=401)
        return Response({
            'status': 'error', 
            'message': 'This link is invalid.'
        }, status=401)

    try:
        user = User.objects.get(id=result['user_id'])
        form = FormType.objects.get(id=result['form_id'])
        return Response({
            'status': 'success',
            'user_id': user.id,
            'form_id': form.id,
            'form_name': form.name,
            'first_name': user.first_name,
            'email': user.email,
        })
    except (User.DoesNotExist, FormType.DoesNotExist):
        return Response({'status': 'error', 'message': 'Invalid link.'}, status=404)


@csrf_exempt
def get_all_submissions(request, form_id):
    if request.method != 'GET':
        return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

    try:
        auth_header = request.headers.get('Authorization', '')
        token = None
        if auth_header.startswith('Token '):
            token = auth_header.split('Token ')[-1]
        elif auth_header.startswith('Bearer '):
            token = auth_header.split('Bearer ')[-1]

        if not token:
            return JsonResponse({'status': 'error', 'message': 'Authorization token is required.'}, status=401)

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Token {token}',
        }

        url = f"{host_url(request)}{reverse_lazy('get_all_submissions_api', kwargs={'form_id': form_id})}"
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        return JsonResponse(response.json(), status=200)

    except requests.exceptions.RequestException as e:
        return JsonResponse({'status': 'error', 'message': f'Request failed: {str(e)}'}, status=500)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': f'Server error: {str(e)}'}, status=500)


@csrf_exempt
def get_submission_detail(request, submission_id):
    if request.method != 'GET':
        return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

    try:
        auth_header = request.headers.get('Authorization', '')
        token = None
        if auth_header.startswith('Token '):
            token = auth_header.split('Token ')[-1]
        elif auth_header.startswith('Bearer '):
            token = auth_header.split('Bearer ')[-1]

        if not token:
            return JsonResponse({'status': 'error', 'message': 'Authorization token is required.'}, status=401)

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Token {token}',
        }

        url = f"{host_url(request)}{reverse_lazy('get_submission_detail_api', kwargs={'submission_id': submission_id})}"
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        # print(f"Fetched submission detail for submission_id {submission_id}: {response.json()}")

        return JsonResponse(response.json(), status=200)

    except requests.exceptions.RequestException as e:
        return JsonResponse({'status': 'error', 'message': f'Request failed: {str(e)}'}, status=500)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': f'Server error: {str(e)}'}, status=500)


@csrf_exempt
def update_submission_status(request, submission_id):
    if request.method != 'PATCH':
        return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

    try:
        auth_header = request.headers.get('Authorization', '')
        token = None
        if auth_header.startswith('Token '):
            token = auth_header.split('Token ')[-1]
        elif auth_header.startswith('Bearer '):
            token = auth_header.split('Bearer ')[-1]

        if not token:
            return JsonResponse({'status': 'error', 'message': 'Authorization token is required.'}, status=401)

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Token {token}',
        }

        body = json.loads(request.body)
        url = f"{host_url(request)}{reverse_lazy('update_submission_status_api', kwargs={'submission_id': submission_id})}"
        response = requests.patch(url, json=body, headers=headers, timeout=10)
        response.raise_for_status()

        return JsonResponse(response.json(), status=200)

    except requests.exceptions.RequestException as e:
        return JsonResponse({'status': 'error', 'message': f'Request failed: {str(e)}'}, status=500)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': f'Server error: {str(e)}'}, status=500)


def check_form_complete_and_notify(submission, request):
    """
    Check if all assigned questions have been answered.
    If complete, send confirmation to client and alert to whoever sent the invite.
    """
    try:
        form_id = submission.form_type_id
        user_id = submission.user_id

        # Get all assigned questions for this form
        total_assigned = FormQuestionAssignment.objects.filter(
            form_type_id=form_id
        ).count()

        if total_assigned == 0:
            return

        # Get latest unique answered questions
        latest_ids = FormResponse.objects.filter(submission=submission) \
            .values('question_id', 'category_id') \
            .annotate(latest_id=Max('id')) \
            .values_list('latest_id', flat=True)

        answered_count = FormResponse.objects.filter(
            id__in=latest_ids
        ).values('question_id').distinct().count()

        if answered_count < total_assigned:
            return  # Not complete yet, do nothing

        # Mark submission as submitted
        submission.status = 'submitted'
        submission.save()

        # Get the user
        user = submission.user
        form = submission.form_type
        submitted_at = submission.submitted_at.strftime('%d %B %Y at %H:%M')

        # Build frontend URL
        frontend_base = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        review_link = f"{frontend_base}/submissions/{submission.id}"

        # --- Email 1: Client confirmation ---
        client_context = {
            'first_name': user.first_name or user.email,
            'form_name': form.name,
            'submitted_at': submitted_at,
        }
        from django.template.loader import get_template
        client_html = get_template('email_temps/submission_confirmation.html').render(client_context)

        threading.Thread(
            target=send_email_api,
            args=(user.email, f"Your {form.name} submission has been received", client_html)
        ).start()

        # --- Email 2: Alert to whoever sent the invite ---
        invite = FormInvite.objects.filter(
            recipient=user,
            form_type=form
        ).order_by('-sent_at').first()

        if invite and invite.sent_by:
            admin_context = {
                'applicant_name': f"{user.first_name} {user.last_name}".strip() or user.email,
                'applicant_email': user.email,
                'form_name': form.name,
                'submitted_at': submitted_at,
                'review_link': review_link,
            }
            admin_html = get_template('email_temps/admin_submission_alert.html').render(admin_context)

            threading.Thread(
                target=send_email_api,
                args=(invite.sent_by.email, f"New submission: {form.name} — {user.email}", admin_html)
            ).start()

    except Exception as e:
        print(f"[NOTIFY ERROR] {e}")
        import traceback
        traceback.print_exc()



@csrf_exempt
def get_all_submissions_admin(request):
    if request.method != 'GET':
        return JsonResponse(
            {'status': 'error', 'message': 'Method not allowed'},
            status=405
        )

    try:
        auth_header = request.headers.get('Authorization', '')
        token = None

        if auth_header.startswith('Token '):
            token = auth_header.split('Token ')[-1]

        elif auth_header.startswith('Bearer '):
            token = auth_header.split('Bearer ')[-1]

        if not token:
            return JsonResponse(
                {
                    'status': 'error',
                    'message': 'Authorization token required'
                },
                status=401
            )

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Token {token}'
        }

        query_string = request.GET.urlencode()

        url = f"{host_url(request)}{reverse_lazy('get_all_submissions_admin_api')}"

        if query_string:
            url = f"{url}?{query_string}"

        response = requests.get(
            url,
            headers=headers,
            timeout=10
        )

        response.raise_for_status()

        return JsonResponse(response.json(), status=200)

    except requests.exceptions.RequestException as e:
        return JsonResponse(
            {
                'status': 'error',
                'message': f'Request failed: {str(e)}'
            },
            status=500
        )

    except Exception as e:
        return JsonResponse(
            {
                'status': 'error',
                'message': f'Server error: {str(e)}'
            },
            status=500
        )

@csrf_exempt
def get_dashboard_stats(request):

    if request.method != 'GET':
        return JsonResponse(
            {
                'status': 'error',
                'message': 'Method not allowed'
            },
            status=405
        )

    try:

        auth_header = request.headers.get('Authorization', '')
        token = None

        # -----------------------------
        # TOKEN EXTRACTION
        # -----------------------------

        if auth_header.startswith('Token '):
            token = auth_header.split('Token ')[-1]

        elif auth_header.startswith('Bearer '):
            token = auth_header.split('Bearer ')[-1]

        # -----------------------------
        # VALIDATION
        # -----------------------------

        if not token:
            return JsonResponse(
                {
                    'status': 'error',
                    'message': 'Authorization token required'
                },
                status=401
            )

        # -----------------------------
        # HEADERS
        # -----------------------------

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Token {token}'
        }

        # -----------------------------
        # QUERY PARAMS
        # -----------------------------

        query_string = request.GET.urlencode()

        url = f"{host_url(request)}{reverse_lazy('get_dashboard_stats_api')}"

        if query_string:
            url = f"{url}?{query_string}"

        # -----------------------------
        # API REQUEST
        # -----------------------------

        response = requests.get(
            url,
            headers=headers,
            timeout=10
        )

        response.raise_for_status()

        # -----------------------------
        # SUCCESS RESPONSE
        # -----------------------------

        return JsonResponse(
            response.json(),
            status=200
        )

    except requests.exceptions.RequestException as e:

        return JsonResponse(
            {
                'status': 'error',
                'message': f'Request failed: {str(e)}'
            },
            status=500
        )

    except Exception as e:

        return JsonResponse(
            {
                'status': 'error',
                'message': f'Server error: {str(e)}'
            },
            status=500
        )