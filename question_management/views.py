from asyncio import constants
import traceback
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


@csrf_exempt
def update_question(request, question_id):
    if request.method != 'PUT':
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

        request.session["token"] = token
        request.session.modified = True

        # Parse JSON
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)

        # Construct payload (without question_id, since it's in URL)
        payload = {
            'question': data.get('question'),
            'question_number': data.get('question_number'),
            'question_type': data.get('question_type'),
            'mandatory': data.get('mandatory'),
            'other_field': data.get('other_field'),
            'options': data.get('options', []),
            'delete_options': data.get('delete_options', False),
        }

        # Call the internal API using PUT
        url = f"{host_url(request)}{reverse('update_question_api', args=[question_id])}"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Token {token}",
        }

        try:
            response = requests.put(url, headers=headers, json=payload, timeout=10)
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
        
        # Prepare payload (unchanged)
        payload = {
        'text': data.get('text'),
        'order': data.get('order'),
        'input_type': data.get('input_type'),
        'is_required': data.get('is_required'),
        'allow_other_option': data.get('allow_other_option'),
        'is_active': data.get('is_active', True),
        'options': data.get('options', []),
        'delete_options': data.get('delete_options', False),
    }
        

        url = request.build_absolute_uri(reverse('update_question_api', kwargs={'question_id': question_id}))
  
        headers = {
            "Content-Type": "application/json",
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
    return _change_question_status(request, status_value="Inactive")


@csrf_exempt
def activate_question(request):
    return _change_question_status(request, status_value="Active")

@csrf_exempt
def _change_question_status(request):
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