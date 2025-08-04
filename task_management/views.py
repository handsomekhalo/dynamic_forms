from django.shortcuts import render

# Create your views here.
from audioop import reverse
import json
from django.http import JsonResponse
from django.shortcuts import render
import requests
from django.urls import reverse_lazy
from django.middleware.csrf import get_token
from system_management.general_func_classes import api_connection, host_url
from django.views.decorators.csrf import csrf_exempt  # Use if CSRF token is not required



def get_data_on_success(response_data):
    status = response_data.get('status')
    if status == 'success':
        data = response_data.get('data')
    else:
        data = []
    return data

# Create your views here.

@csrf_exempt
def create_task(request):
    """Create task functionality."""
    
    if request.method != 'POST':
        return JsonResponse({
            "status": "error",
            "message": "Method not allowed. Use POST."
        }, status=405)

    try:
        # Extract token from Authorization header
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

        # Store token in session
        request.session["token"] = token
        request.session.modified = True

        # Parse JSON body
        data = json.loads(request.body)
        
        title = data.get('title')
        description = data.get('description')
        due_date = data.get('due_date')

        print('title:', title)
        print('description:', description)

        # Validate required fields
        if not description:
            return JsonResponse({
                "status": "error",
                "message": "Description is required."
            }, status=400)

        headers = {
            'Content-Type': 'application/json',
            "Authorization": f"Token {token}"
        }

        # Prepare payload for the suggestive API
        suggestive_payload = {
            'input': description  # You might want to use title or description as input for suggestions
        }

        print('suggestive_payload:', suggestive_payload)

        # Suggestive API URL
        suggestive_url = f"{host_url(request)}{reverse_lazy('suggest_task_api')}"
        
        try:
            suggestive_response = requests.post(
                suggestive_url, 
                headers=headers, 
                json=suggestive_payload, 
                timeout=10
            )
        except requests.exceptions.RequestException as e:
            return JsonResponse({
                "status": "error",
                "message": f"Error connecting to suggestion service: {str(e)}"
            }, status=500)

        # Check if the suggestive API returned a valid response
        if suggestive_response.status_code == 200:
            try:
                suggested_data = suggestive_response.json().get('suggestion', {})
            except ValueError:
                return JsonResponse({
                    "status": "error",
                    "message": "Invalid response from suggestion service"
                }, status=500)

            # Include suggested title and description if needed
            title = title or suggested_data.get('title', title)
            description = description or suggested_data.get('description', description)

            # Prepare payload for task creation
            task_payload = {
                'title': title,
                'description': description,
                'due_date': due_date,
            }

            # Task creation URL
            create_url = f"{host_url(request)}{reverse_lazy('create_task_api')}"
            
            try:
                response_data = requests.post(
                    create_url, 
                    headers=headers, 
                    json=task_payload, 
                    timeout=10
                )
            except requests.exceptions.RequestException as e:
                return JsonResponse({
                    "status": "error",
                    "message": f"Error connecting to task creation service: {str(e)}"
                }, status=500)

            # Check if task creation was successful
            if response_data.status_code == 201:
                try:
                    task_data = response_data.json()
                    return JsonResponse({
                        "status": "success",
                        "message": "Task created successfully",
                        "data": task_data
                    })
                except ValueError:
                    return JsonResponse({
                        "status": "error",
                        "message": "Invalid response from task creation service"
                    }, status=500)
            else:
                try:
                    error_details = response_data.json()
                    return JsonResponse({
                        "status": "error",
                        "message": error_details.get('message', 'Error creating task'),
                        "details": error_details
                    }, status=400)
                except ValueError:
                    return JsonResponse({
                        "status": "error",
                        "message": "Error creating task"
                    }, status=400)
        else:
            try:
                error_details = suggestive_response.json()
                return JsonResponse({
                    "status": "error",
                    "message": error_details.get('message', 'Error fetching suggestion'),
                    "details": error_details
                }, status=400)
            except ValueError:
                return JsonResponse({
                    "status": "error",
                    "message": "Error fetching suggestion"
                }, status=400)

    except json.JSONDecodeError:
        return JsonResponse({
            "status": "error",
            "message": "Invalid JSON data"
        }, status=400)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)


def get_all_tasks(request):
    """User login function with api."""

    if request.method == "GET":

        token = request.session.get('token')

        headers = {
            'Content-Type': 'application/json',
            "Authorization": f"Token {token}"
        }

        url = f"{host_url(request)}{reverse_lazy('get_all_task_api')}"  # Replace with the correct 
        all_tasks_response = api_connection(method="GET", url=url, headers=headers, data={})
        all_tasks = get_data_on_success(all_tasks_response)

        task_url = f"{host_url(request)}{reverse_lazy('get_task_by_id_api')}"
        task_response = api_connection(method="GET", url=task_url, headers=headers, data={})
        task = get_data_on_success(task_response)

        context = {
            'all_tasks': all_tasks,
            'task':task
        }
        
        return render(request, 'index.html', context)
    


@csrf_exempt
def get_all_tasks(request):
    """Get all tasks function with api."""

    if request.method != 'GET':
        return JsonResponse({
            "status": "error",
            "message": "Method not allowed. Use GET."
        }, status=405)

    try:
        # Extract token from Authorization header
        auth_header = request.headers.get("Authorization", "")
        token = None
        if auth_header.startswith("Token "):
            token = auth_header.split("Token ")[-1]
        elif auth_header.startswith("Bearer "):
            token = auth_header.split("Bearer ")[-1]

        # Fallback to session token if no header token
        if not token:
            token = request.session.get('token')

        if not token:
            return JsonResponse({
                "status": "error",
                "message": "Authorization token is required."
            }, status=401)

        # Store token in session
        request.session["token"] = token
        request.session.modified = True

        headers = {
            'Content-Type': 'application/json',
            "Authorization": f"Token {token}"
        }

        # Get all tasks
        all_tasks_url = f"{host_url(request)}{reverse_lazy('get_all_task_api')}"
        try:
            all_tasks_response = requests.get(all_tasks_url, headers=headers, timeout=10)
        except requests.exceptions.RequestException as e:
            return JsonResponse({
                "status": "error",
                "message": f"Error connecting to tasks service: {str(e)}"
            }, status=500)

        # Get single task (if this is needed)
        task_url = f"{host_url(request)}{reverse_lazy('get_task_by_id_api')}"
        try:
            task_response = requests.get(task_url, headers=headers, timeout=10)
        except requests.exceptions.RequestException as e:
            return JsonResponse({
                "status": "error",
                "message": f"Error connecting to task service: {str(e)}"
            }, status=500)

        # Process responses
        all_tasks = None
        task = None

        if all_tasks_response.status_code == 200:
            try:
                all_tasks = all_tasks_response.json()
            except ValueError:
                return JsonResponse({
                    "status": "error",
                    "message": "Invalid response from tasks service"
                }, status=500)
        else:
            return JsonResponse({
                "status": "error",
                "message": "Failed to fetch tasks"
            }, status=all_tasks_response.status_code)

        if task_response.status_code == 200:
            try:
                task = task_response.json()
            except ValueError:
                task = None  # Optional, so we can continue without it

        context = {
            'all_tasks': all_tasks,
            'task': task
        }
        
        return render(request, 'index.html', context)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)


@csrf_exempt
def update_task(request):
    """Update task details via POST request."""
    
    if request.method != 'POST':
        return JsonResponse({
            "status": "error",
            "message": "Method not allowed. Use POST."
        }, status=405)

    try:
        # Extract token from Authorization header
        auth_header = request.headers.get("Authorization", "")
        token = None
        if auth_header.startswith("Token "):
            token = auth_header.split("Token ")[-1]
        elif auth_header.startswith("Bearer "):
            token = auth_header.split("Bearer ")[-1]

        # Fallback to session token if no header token
        if not token:
            token = request.session.get('token')

        if not token:
            return JsonResponse({
                "status": "error",
                "message": "Authorization token is required."
            }, status=401)

        # Store token in session
        request.session["token"] = token
        request.session.modified = True

        # Parse JSON body
        data = json.loads(request.body)
        
        task_id = data.get('task_id')
        title = data.get('title')
        description = data.get('description')
        due_date = data.get('due_date')

        # Validate required fields
        if not task_id:
            return JsonResponse({
                "status": "error",
                "message": "Task ID is required."
            }, status=400)

        if not all([title, description]):
            return JsonResponse({
                "status": "error",
                "message": "Title and description are required."
            }, status=400)

        headers = {
            'Content-Type': 'application/json',
            "Authorization": f"Token {token}"
        }

        payload = {
            'task_id': task_id,
            'title': title,
            'description': description,
            'due_date': due_date,
        }

        url = f"{host_url(request)}{reverse_lazy('update_task_api')}"
        
        try:
            response_data = requests.post(url, headers=headers, json=payload, timeout=10)
        except requests.exceptions.RequestException as e:
            return JsonResponse({
                "status": "error",
                "message": f"Error connecting to update service: {str(e)}"
            }, status=500)

        try:
            response_json = response_data.json()
        except ValueError:
            return JsonResponse({
                "status": "error",
                "message": "Invalid response from update service"
            }, status=500)

        if response_data.status_code == 200:
            return JsonResponse({
                "status": "success",
                "message": "Task updated successfully",
                "data": response_json
            })
        else:
            return JsonResponse({
                "status": "error",
                "message": response_json.get('message', 'Update failed'),
                "details": response_json
            }, status=response_data.status_code)

    except json.JSONDecodeError:
        return JsonResponse({
            "status": "error",
            "message": "Invalid JSON data"
        }, status=400)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)


@csrf_exempt
def delete_task(request):
    """Delete task via POST request."""
    
    if request.method != 'POST':
        return JsonResponse({
            "status": "error",
            "message": "Method not allowed. Use POST."
        }, status=405)

    try:
        # Extract token from Authorization header
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

        # Store token in session
        request.session["token"] = token
        request.session.modified = True

        # Parse JSON body
        data = json.loads(request.body)
        
        task_id = data.get('task_id')
        print('task_id:', task_id)

        # Validate required fields
        if not task_id:
            return JsonResponse({
                "status": "error",
                "message": "Task ID is required."
            }, status=400)

        headers = {
            'Content-Type': 'application/json',
            "Authorization": f"Token {token}"
        }

        payload = {
            'task_id': task_id,
        }
        print('payload:', payload)

        url = f"{host_url(request)}{reverse_lazy('delete_task_api')}"
        
        try:
            response_data = requests.post(url, headers=headers, json=payload, timeout=10)
        except requests.exceptions.RequestException as e:
            return JsonResponse({
                "status": "error",
                "message": f"Error connecting to delete service: {str(e)}"
            }, status=500)

        try:
            response_json = response_data.json()
        except ValueError:
            return JsonResponse({
                "status": "error",
                "message": "Invalid response from delete service"
            }, status=500)

        if response_data.status_code == 200:
            return JsonResponse({
                "status": "success",
                "message": "Task deleted successfully",
                "data": response_json
            })
        else:
            return JsonResponse({
                "status": "error",
                "message": response_json.get('message', 'Delete failed'),
                "details": response_json
            }, status=response_data.status_code)

    except json.JSONDecodeError:
        return JsonResponse({
            "status": "error",
            "message": "Invalid JSON data"
        }, status=400)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)