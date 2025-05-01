from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse_lazy
import requests
from django.views.decorators.csrf import csrf_exempt
from system_management.general_func_classes import host_url

# Create your views here.
@csrf_exempt
def get_all_categories(request):
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

        # Save token in session (optional based on your logic)
        request.session["token"] = token
        request.session.modified = True

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Token {token}",
        }


        url = f"{host_url(request)}{reverse_lazy('get_all_categories_api')}"

        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        response_data = response.json()

        print('response_data',response_data)

        return JsonResponse({
            "status": "success",
            "categories": response_data
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
    


    # Create your views here.
@csrf_exempt
def get_all_forms(request):
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

        # Save token in session (optional based on your logic)
        request.session["token"] = token
        request.session.modified = True

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Token {token}",
        }


        url = f"{host_url(request)}{reverse_lazy('get_all_forms_api')}"

        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        response_data = response.json()

        print('response_data',response_data)

        return JsonResponse({
            "status": "success",
            "forms": response_data
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