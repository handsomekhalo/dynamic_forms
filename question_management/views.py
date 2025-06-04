from asyncio import constants
import traceback
from urllib.parse import urlencode
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse, reverse_lazy
import requests
import json
from django.views.decorators.csrf import csrf_exempt
from question_management.api.serializers import QuestionSerializer
from system_management.decorators import admin_required, check_token_in_session, session_timeout
from system_management.general_func_classes import api_connection, host_url
from django.http import JsonResponse


@csrf_exempt
def get_questions(request):
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

        # Save token in session
        request.session["token"] = token
        request.session.modified = True

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Token {token}",
        }

        url = f"{host_url(request)}{reverse('get_question_type_and_questions_api')}"
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        response_data = response.json()

        return JsonResponse({
            "status": "success",
            "data": response_data
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
def add_questions(request):
    if request.method != 'POST':
        return JsonResponse({
            "status": "error",
            "message": "Method not allowed"
        }, status=405)

    try:
        # Extract Authorization token
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

        request.session["token"] = token
        request.session.modified = True

        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)

        # Extract required fields (but no validation or processing)
        question = data.get('question')
        question_number = data.get('question_number')
        question_type = data.get('question_type')
        mandatory = data.get('mandatory', True)
        other_field = data.get('other_field')
        options = data.get('options', [])

        payload = {
            'question': question,
            'question_number': question_number,
            'question_type': question_type,
            'mandatory': mandatory,
            'other_field': other_field,
            'options': options,
        }

        url = f"{host_url(request)}{reverse('add_question_api')}"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Token {token}",
        }

        try:
            response = requests.post(url, headers=headers, json=payload, timeout=10)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return JsonResponse({'status': 'error', 'message': f'Error while sending data to API: {str(e)}'}, status=500)

        try:
            response_data = response.json()
        except ValueError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON response from API'}, status=500)

        return JsonResponse(response_data, status=response.status_code)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Unexpected server error: {str(e)}"
        }, status=500)

@csrf_exempt
def get_question_detail(request, question_id):
    if request.method != "GET":
        return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)

    try:
        # Extract token
        auth_header = request.headers.get("Authorization", "")
        token = None
        if auth_header.startswith("Token "):
            token = auth_header.split("Token ")[-1]
        elif auth_header.startswith("Bearer "):
            token = auth_header.split("Bearer ")[-1]

        if not token:
            return JsonResponse({"status": "error", "message": "Authorization token is required."}, status=401)

        url = f"{host_url(request)}{reverse('get_question_detail_api', args=[question_id])}"
        headers = {
            "Authorization": f"Token {token}",
        }

        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        response_data = response.json()


        return JsonResponse({
            "status": "success",
            "data": response_data.get("data", {})
        }, status=200)
        

    except requests.exceptions.RequestException as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)


# @csrf_exempt
# def update_question(request, question_id):
#     if request.method != 'PUT':
#         return JsonResponse({
#             "status": "error",
#             "message": "Method not allowed"
#         }, status=405)

#     try:
#         # Extract token
#         auth_header = request.headers.get("Authorization", "")
#         token = None
#         if auth_header.startswith("Token "):
#             token = auth_header.split("Token ")[-1]
#         elif auth_header.startswith("Bearer "):
#             token = auth_header.split("Bearer ")[-1]

#         if not token:
#             return JsonResponse({
#                 "status": "error",
#                 "message": "Authorization token is required."
#             }, status=401)

#         request.session["token"] = token
#         request.session.modified = True

#         # Parse JSON
#         try:
#             data = json.loads(request.body)
#         except json.JSONDecodeError:
#             return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)

#         # Construct payload (without question_id, since it's in URL)
#         payload = {
#             'question': data.get('question'),
#             'question_number': data.get('question_number'),
#             'question_type': data.get('question_type'),
#             'mandatory': data.get('mandatory'),
#             'other_field': data.get('other_field'),
#             'options': data.get('options', []),
#             'delete_options': data.get('delete_options', False),
#         }

#         # Call the internal API using PUT
#         url = f"{host_url(request)}{reverse('update_question_api', args=[question_id])}"
#         headers = {
#             "Content-Type": "application/json",
#             "Authorization": f"Token {token}",
#         }

#         try:
#             response = requests.put(url, headers=headers, json=payload, timeout=10)
#             response.raise_for_status()
#         except requests.exceptions.RequestException as e:
#             return JsonResponse({'status': 'error', 'message': f'Error while sending data to API: {str(e)}'}, status=500)

#         try:
#             response_data = response.json()
#         except ValueError:
#             return JsonResponse({'status': 'error', 'message': 'Invalid JSON response from API'}, status=500)

#         return JsonResponse(response_data, status=response.status_code)

#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         return JsonResponse({
#             "status": "error",
#             "message": f"Unexpected server error: {str(e)}"
#         }, status=500)

@csrf_exempt
def update_question(request, question_id):
    if request.method != 'PUT':
        return JsonResponse({
            "status": "error",
            "message": "Method not allowed"
        }, status=405)
    
    try:
        # Authentication handling (unchanged)
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Token "):
            token = auth_header.split("Token ")[-1]
        elif auth_header.startswith("Bearer "):
            token = auth_header.split("Bearer ")[-1]
        else:
            token = None
        
        if not token:
            return JsonResponse({
                "status": "error",
                "message": "Authorization token is required."
            }, status=401)
        
        request.session["token"] = token
        request.session.modified = True
        
        # Parse JSON data (unchanged)
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)
        
    #     # Prepare payload (unchanged)
    #     payload = {
    #     'text': data.get('text'),
    #     'order': data.get('order'),
    #     'input_type': data.get('input_type'),
    #     'is_required': data.get('is_required'),
    #     'allow_other_option': data.get('allow_other_option'),
    #     'is_active': data.get('is_active', True),
    #     'options': data.get('options', []),
    #     'delete_options': data.get('delete_options', False),
    # }
        
        payload = {
        'text': data.get('text'),
        'order': data.get('order'),
        'input_type': data.get('input_type'),
        'question_type': data.get('question_type'),  # This should be an ID
        'is_required': data.get('is_required'),
        'allow_other_option': data.get('allow_other_option'),
        'is_active': data.get('is_active', True),
        'options': data.get('options', []),
        'delete_options': data.get('delete_options', False),
    }
        payload = {k: v for k, v in payload.items() if v is not None}

        url = request.build_absolute_uri(reverse('update_question_api', kwargs={'question_id': question_id}))
  
        headers = {
            "Content-Type": "application/json",
            # "Authorization": f"Token {token}",
            "Authorization": f"Token {token}",

        }
        
        try:
            response = requests.put(url, headers=headers, json=payload, timeout=10)
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            return JsonResponse({
                'status': 'error', 
                'message': f'Error while sending data to API: {str(e)}',
                'requested_url': url  # Include this for debugging
            }, status=500)
        
        # Parse and return response (unchanged)
        try:
            response_data = response.json()
        except ValueError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON response from API'}, status=500)
        
        return JsonResponse(response_data, status=response.status_code)
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Unexpected server error: {str(e)}"
        }, status=500)
    


@csrf_exempt
def deactivate_question(request):
    return change_question_status(request, status_value="Inactive")


@csrf_exempt
def activate_question(request):
    return change_question_status(request, status_value="Active")

@csrf_exempt
def change_question_status(request):
    """
    Internal handler for activating/deactivating questions.
    """
    if request.method != "POST":
        return JsonResponse({'status': 'error', 'message': 'Method not allowed'}, status=405)

    try:
        # Extract token from Authorization header
        auth_header = request.headers.get("Authorization", "")
        token = None
        if auth_header.startswith("Token "):
            token = auth_header.split("Token ")[-1]
        elif auth_header.startswith("Bearer "):
            token = auth_header.split("Bearer ")[-1]

        if not token:
            return JsonResponse({"status": "error", "message": "Authorization token is required."}, status=401)

        # Extract POST parameters
        question_id = request.POST.get('question_id')
        status_value = request.POST.get('status_value')

        if not question_id:
            return JsonResponse({'status': 'error', 'message': 'Question ID is required'}, status=400)

        if not status_value:
            return JsonResponse({'status': 'error', 'message': 'Status value is required'}, status=400)

        # Build internal API URL
        url = f"{host_url(request)}{reverse('change_question_status_api')}"

        # Prepare JSON payload
        payload = json.dumps({
            "question_id": question_id,
            "status_value": status_value
        })

        headers = {
            'Authorization': f'Token {token}',
            'Content-Type': 'application/json'
        }

        # Make internal POST request
        response = requests.post(url, headers=headers, data=payload, timeout=10)
        response.raise_for_status()

        response_data = response.json()

        return JsonResponse(data=response_data, safe=False)

    except requests.exceptions.RequestException as e:
        return JsonResponse({
            "status": "error",
            "message": f"Error calling internal API: {str(e)}"
        }, status=500)

    except Exception as e:
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Unexpected server error: {str(e)}"
        }, status=500)
    



@csrf_exempt
def add_or_assign_questions_to_category(request):
    if request.method != 'POST':
        return JsonResponse({
            "status": "error",
            "message": "Method not allowed"
        }, status=405)

    try:
        # Step 1: Extract Token from Headers
        auth_header = request.headers.get("Authorization", "")
        token = None
        if auth_header.startswith("Token "):
            token = auth_header[6:]
        elif auth_header.startswith("Bearer "):
            token = auth_header[7:]
        else:
            token = auth_header

        if not token:
            return JsonResponse({
                "status": "error",
                "message": "Authorization token is required."
            }, status=401)

        # Step 2: Parse JSON Payload
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)

        # assignments = data.get('assignments', [])
        # action = data.get('action', 'add')

        question_ids = data.get('question_ids', [])
        category_id = data.get('category_id')
        form_type_id = data.get('form_type_id')

        

        if not question_ids or not category_id:
            return JsonResponse({
        "status": "error",
        "message": "Both question_ids and category_id are required."
    }, status=400)

        assignments = [{"question_id": qid,"form_type_id": form_type_id,  "category_id": category_id} for qid in question_ids]

        responses = []

        # Step 3: Process each assignment
        for assignment in assignments:
            question_id = assignment.get('question_id')
            category_id = assignment.get('category_id')
            form_type_id = assignment.get('form_type_id')

            
            if not question_id or not category_id:
                return JsonResponse({
                    "status": "error",
                    "message": "Question ID and Category ID are required."
                }, status=400)

            api_url = f"{host_url(request)}{reverse_lazy('assign_or_update_question_api')}"
            # payload = {
            #     "question_id": question_id,
            #     "category_id": category_id,
            #     # "action": action
            # }
            payload = {
                "question_id": question_id,
                "main_category_id": category_id,  
                "form_type_id":form_type_id                 # ✅ ADD this based on your form type (hardcoded or dynamic)
               
            }

            auth_formats = [
                {"Authorization": f"Token {token}"},
                {"Authorization": f"Bearer {token}"},
                {"Authorization": token},
            ]

            response = None
            success = False

            for auth_format in auth_formats:
                headers = {"Content-Type": "application/json", **auth_format}
                try:
                    print(f"Trying authentication format: {auth_format}")
                    response = requests.post(api_url, headers=headers, json=payload, timeout=10)
                    if response.status_code != 401:
                        success = True
                        break
                except requests.RequestException as e:
                    print(f"Request failed with auth format {auth_format}: {str(e)}")

            if not success or not response:
                return JsonResponse({
                    "status": "error",
                    "message": "Failed to authenticate with the API"
                }, status=401)

            try:
                response.raise_for_status()
                responses.append(response.json())
            except requests.RequestException as e:
                print(f"Error with assignment {assignment}: {str(e)}")
                responses.append({
                    "assignment": assignment,
                    "error": str(e)
                })

        return JsonResponse({"status": "success", "results": responses}, status=200)

    except Exception as e:
        import traceback
        print("Exception occurred:")
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)


@csrf_exempt
def remove_assigned_question(request):
    if request.method != 'POST':
        return JsonResponse({
            "status": "error",
            "message": "Method not allowed"
        }, status=405)
    print("Received request:", request.body)  # Log the request body

    try:
        # Step 1: Extract Token from Headers
        auth_header = request.headers.get("Authorization", "")
        token = None
        if auth_header.startswith("Token "):
            token = auth_header[6:]
        elif auth_header.startswith("Bearer "):
            token = auth_header[7:]
        else:
            token = auth_header

        if not token:
            return JsonResponse({
                "status": "error",
                "message": "Authorization token is required."
            }, status=401)

        # Step 2: Parse JSON Payload
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)

        form_type_id = data.get('form_type_id')
        main_category_id = data.get('main_category_id')
        question_id = data.get('question_id')

        if not form_type_id or not main_category_id or not question_id:
            return JsonResponse({
                "status": "error",
                "message": "form_type_id, main_category_id, and question_id are required."
            }, status=400)

        # Step 3: Make API call to remove the question assignment
        api_url = request.build_absolute_uri(reverse('remove_assigned_question_api'))


        payload = {
            "form_type_id": form_type_id,
            "main_category_id": main_category_id,
            "question_id": question_id
        }

        auth_formats = [
            {"Authorization": f"Token {token}"},
            {"Authorization": f"Bearer {token}"},
            {"Authorization": token}
        ]

        response = None
        success = False

        for auth_format in auth_formats:
            headers = {"Content-Type": "application/json", **auth_format}
            try:
                print(f"Trying authentication format: {auth_format}")
                response = requests.post(api_url, headers=headers, json=payload, timeout=10)
                if response.status_code != 401:
                    success = True
                    break
            except requests.RequestException as e:
                print(f"Request failed with auth format {auth_format}: {str(e)}")

        if not success or not response:
            return JsonResponse({
                "status": "error",
                "message": "Failed to authenticate with the API"
            }, status=401)

        try:
            response.raise_for_status()
            return JsonResponse(response.json(), status=response.status_code)
        except requests.RequestException as e:
            return JsonResponse({
                "status": "error",
                "message": f"API request failed: {str(e)}",
                "details": response.text if response else "No response"
            }, status=response.status_code if response else 500)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)


@csrf_exempt
def get_questions_assigned_to_category(request, formId, category):
    if request.method != 'GET':
        return JsonResponse({
            "status": "error",
            "message": "Method not allowed"
        }, status=405)
    
    try:
        # Extract token from headers
        auth_header = request.headers.get("Authorization", "")
        token = None
        if auth_header.startswith("Token "):
            token = auth_header[6:]
        elif auth_header.startswith("Bearer "):
            token = auth_header[7:]
        else:
            token = auth_header

        if not token:
            return JsonResponse({
                "status": "error",
                "message": "Authorization token is required."
            }, status=401)

        # Prepare the internal API URL
        base_url = host_url(request)
        query_string = ""
        if request.GET.get("detail", "").lower() == "true":
            query_string = f"?{urlencode({'detail': 'true'})}"

        api_path = reverse_lazy('get_questions_assigned_to_category_api', kwargs={
            'form_type_id': formId,
            'main_category_id': category  
        })
        api_url = f"{base_url}{api_path}{query_string}"

        # Try different auth header formats
        auth_formats = [
            {"Authorization": f"Token {token}"},
            {"Authorization": f"Bearer {token}"},
            {"Authorization": token},
        ]

        response = None
        for auth_format in auth_formats:
            headers = {"Content-Type": "application/json", **auth_format}
            try:
                print(f"Final API URL being called: {api_url}")
                response = requests.get(api_url, headers=headers, timeout=10)
                if response.status_code != 401:
                    break
            except requests.RequestException as e:
                print(f"Request failed with headers {auth_format}: {str(e)}")

        if not response or response.status_code == 401:
            return JsonResponse({
                "status": "error",
                "message": "Failed to authenticate with the internal API."
            }, status=401)
        
        response.raise_for_status()

        response_data = response.json()
        questions = response_data.get("data", {}).get("assigned_questions", [])

        # Return empty list if no questions assigned — explicit and clear
        return JsonResponse({
            "status": "success",
            "data": {
                "assigned_questions": questions
            },
            "message": "No questions assigned to this category." if not questions else ""
        }, status=200)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)

