import json
from django.forms import ValidationError
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.urls import reverse_lazy
import requests
   # Import your models
from application_management.models import FormType, MainCategory, FormSubmission, FormResponse, FormQuestionAssignment, FormCategoryAssignment
    
from application_management.models import FormCategoryAssignment, FormQuestionAssignment, FormResponse, FormSubmission, FormType, MainCategory
from system_management.general_func_classes import host_url
from rest_framework.response import Response
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.db import IntegrityError
from django.core.validators import validate_email
from datetime import datetime
import requests


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
            print('Raw data:', data)
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
        from rest_framework.authtoken.models import Token
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
        from application_management.models import FormType, MainCategory, FormSubmission, FormCategoryAssignment

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
        saved_count = save_category_answers(submission, form_id, category_id, answers, request)

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


def save_category_answers(submission, form_id, category_id, answers, request):
    """
    Save category answers and return count of successfully saved answers
    """
    from application_management.models import FormType, MainCategory, FormResponse, FormQuestionAssignment
    from question_management.models import Question
    
    saved_count = 0
    
    for answer in answers:
        question_id = answer.get("question_id")
        response_text = answer.get("answer", "")
        other_option = answer.get("other_option")

        if not question_id:
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

            # Handle different input types and store in appropriate field
            if question.input_type == 'file':
                uploaded_file = request.FILES.get(f"file_{question_id}")
                if uploaded_file:
                    response_data['file_upload'] = uploaded_file
                    response_data['response_text'] = uploaded_file.name
                else:
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

            # Skip empty required fields
            if hasattr(question, 'is_required') and question.is_required:
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






# def get_form_details_directly(request, form_id):
#     try:
#         form = FormType.objects.get(id=form_id)

#         # Step 1: Get all categories assigned to this form
#         category_assignments = FormCategoryAssignment.objects.filter(form_type=form).select_related('main_category')

#         form_data = []

#         for assignment in category_assignments:
#             category = assignment.main_category

#             # Step 2: Get all questions linked to this form + category
#             question_assignments = FormQuestionAssignment.objects.filter(
#                 form_type=form,
#                 main_category=category
#             ).select_related('question')

#             questions = []
#             for q_ass in question_assignments:
#                 question = q_ass.question
#                 questions.append({
#                     "question_id": question.id,
#                     "question_text": question.text,
#                     "input_type": question.input_type,
#                     "is_required": question.is_required,
#                     "allow_other_option": question.allow_other_option,
#                     # Add more if needed
#                 })

#             form_data.append({
#                 "category_id": category.id,
#                 "category_name": category.name,
#                 "questions": questions
#             })

#         return JsonResponse({
#             "status": "success",
#             "formId": form_id,
#             "formDetails": form_data
#         }, status=200)

#     except FormType.DoesNotExist:
#         return JsonResponse({"status": "error", "message": "Form not found"}, status=404)
