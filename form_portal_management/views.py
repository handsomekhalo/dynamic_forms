import json
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
from form_portal_management.api.serailizers import RetreiveDocumentSerializer
from question_management.models import Question
       
from application_management.models import FormCategoryAssignment, FormQuestionAssignment, FormResponse, FormSubmission, FormType, MainCategory
from form_portal_management.models import Document
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
def submit_category_answers(request):
    try:
        # Ensure Content-Type is application/json
        if request.content_type != 'application/json':
            return JsonResponse({
                "status": "error",
                "message": "Content-Type must be application/json"
            }, status=400)

        # Load and debug the data
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({
                "status": "error",
                "message": "Invalid JSON format"
            }, status=400)

        # Extract Authorization Token - try from headers first, then from data
        auth_header = request.headers.get("Authorization", "")
        token = None
        
        if auth_header.startswith("Token "):
            token = auth_header.split("Token ")[-1]
        elif auth_header.startswith("Bearer "):
            token = auth_header.split("Bearer ")[-1]
        elif 'headers' in data and 'Authorization' in data['headers']:
            # Extract from nested headers if not in request headers
            auth_value = data['headers']['Authorization']
            if auth_value.startswith("Token "):
                token = auth_value.split("Token ")[-1]
            elif auth_value.startswith("Bearer "):
                token = auth_value.split("Bearer ")[-1]

        if not token:
            return JsonResponse({
                "status": "error",
                "message": "Authorization token is required."
            }, status=401)

        # Authenticate user based on token
        try:
            token_obj = Token.objects.get(key=token)
            user = token_obj.user
        except Token.DoesNotExist:
            return JsonResponse({
                "status": "error",
                "message": "Invalid token"
            }, status=401)

        # Extract the actual payload data - check multiple possible locations
        if 'headers' in data and 'payload' in data['headers']:
            # Data is nested under headers.payload
            payload_data = data['headers']['payload']
        elif 'payload' in data:
            # Data is nested under 'payload'
            payload_data = data['payload']
        else:
            # Data is at root level
            payload_data = data

        # Extract the expected fields from the correct data structure
        form_id = payload_data.get("form_id")
        category_id = payload_data.get("category_id")
        answers = payload_data.get("answers", [])

        print('answers', answers)

        # Validation
        if form_id is None:
            return JsonResponse({"status": "error", "message": "form_id is required"}, status=400)
        if category_id is None:
            return JsonResponse({"status": "error", "message": "category_id is required"}, status=400)
        if not answers or not isinstance(answers, list):
            return JsonResponse({"status": "error", "message": "answers must be a non-empty list"}, status=400)

        try:
            form_id = int(form_id)
            category_id = int(category_id)
        except (ValueError, TypeError):
            return JsonResponse({
                "status": "error",
                "message": "form_id and category_id must be valid integers"
            }, status=400)

        # Validate that the form and category exist

        try:
            form_type = FormType.objects.get(id=form_id)
        except FormType.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Invalid form_id"}, status=400)

        try:
            main_category = MainCategory.objects.get(id=category_id)
        except MainCategory.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Invalid category_id"}, status=400)

        if not FormCategoryAssignment.objects.filter(form_type=form_type, main_category=main_category).exists():
            return JsonResponse({
                "status": "error",
                "message": "Category is not assigned to this form"
            }, status=400)

        # Save submission record (create if not exists)
        submission, created = FormSubmission.objects.get_or_create(
            user=user,
            form_type=form_type,
            defaults={'is_complete': False}
        )

        # Save the answers
        saved_count = save_category_answers(submission, form_id, category_id, answers, request, user)

        return JsonResponse({
            "status": "success",
            "message": f"Successfully saved {saved_count} answers for category '{main_category.name}'",
            "formId": form_id,
            "categoryId": category_id,
            "savedAnswers": saved_count
        }, status=200)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)



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
            if not FormQuestionAssignment.objects.filter(
                form_type_id=form_id,
                main_category_id=category_id,
                question_id=question_id
            ).exists():
                print(f"Question {question_id} not assigned to form {form_id}, category {category_id}")
                continue

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

            # Handle file uploads
            if question.input_type == 'file':
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


@csrf_exempt
def get_form_answers_from_user(request, formId):
    if request.method != 'GET':
        return JsonResponse({
            "status": "error",
            "message": "Method not allowed"
        }, status=405)

    try:
        # Extract token from Authorization header
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Token "):
            token = auth_header[6:]
        elif auth_header.startswith("Bearer "):
            token = auth_header[7:]
        else:
            token = auth_header.strip()

        if not token:
            return JsonResponse({
                "status": "error",
                "message": "Authorization token is required."
            }, status=401)

        # Get user from token - simplified approach
        try:
            user = Token.objects.select_related('user').get(key=token).user
            client_id = user.id
            
        except Token.DoesNotExist:
            return JsonResponse({
                "status": "error",
                "message": "Invalid or expired token."
            }, status=401)

        # Build internal API URL
        base_url = host_url(request)
        query_string = ""
        if request.GET.get("detail", "").lower() == "true":
            query_string = f"?{urlencode({'detail': 'true'})}"

        api_path = reverse_lazy('get_form_answers_from_user_api', kwargs={
            'form_id': formId,
            'client_id': client_id
        })
        api_url = f"{base_url}{api_path}{query_string}"

        # Make the internal API call
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Token {token}"
        }
        
        try:
            response = requests.get(api_url, headers=headers, timeout=10)
            response.raise_for_status()
            response_data = response.json()
            
            answers = response_data.get("data", {}).get("answers", [])
            
            return JsonResponse({
                "status": "success",
                "data": {
                    "answers": answers
                },
                "message": "Answers retrieved successfully." if answers else "No answers submitted yet."
            }, status=200)
            
        except requests.RequestException as e:
            return JsonResponse({
                "status": "error",
                "message": f"Failed to retrieve answers: {str(e)}"
            }, status=500)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)
    

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