from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
import requests
import json
from django.views.decorators.csrf import csrf_exempt

from question_management.api.serializers import QuestionSerializer
from system_management.decorators import admin_required, check_token_in_session, session_timeout
from system_management.general_func_classes import host_url

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
# @admin_required
# @session_timeout
# @check_token_in_session
def add_questions(request):
    if request.method != 'POST':
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

        # Read incoming data
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)

        question_serializer_data = QuestionSerializer(data=data)

        if question_serializer_data.is_valid():
            validated_data = question_serializer_data.validated_data

            # Clean options if provided
            option_list = [opt for opt in data.get('option', []) if opt.strip()]
            validated_data['option'] = option_list

            payload = json.dumps(validated_data)
            url = f"{host_url(request)}{reverse('add_question_api')}"

            try:
                response = requests.post(url, headers=headers, data=payload, timeout=10)
                response.raise_for_status()
            except requests.exceptions.RequestException as e:
                return JsonResponse({'status': 'error', 'message': f'Error while saving question: {str(e)}'}, status=500)

            try:
                response_data = response.json()
            except ValueError:
                return JsonResponse({'status': 'error', 'message': 'Invalid response from save_question_api'}, status=500)

            if response.status_code == 200 and response_data.get('status') == 'success':
                return JsonResponse({
                    "status": "success",
                    "message": "Question saved successfully"
                }, status=200)
            else:
                return JsonResponse({
                    "status": "error",
                    "message": response_data.get('message', 'Failed to save question')
                }, status=400)

        else:
            return JsonResponse({
                "status": "error",
                "message": "Invalid question data submitted",
                "errors": question_serializer_data.errors
            }, status=400)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)
