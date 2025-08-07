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
from django.views.decorators.csrf import csrf_exempt  
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model

# Use if CSRF token is not required



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
        User = get_user_model()

        try:
            user = Token.objects.get(key=token).user
        except Token.DoesNotExist:
            return JsonResponse({
                "status": "error",
                "message": "Invalid or expired token."
            }, status=401)


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
                    'user': user.id  # Add the user ID from token here

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


# @csrf_exempt
# def get_all_tasks(request):
#     """API view to get all tasks, suggest task and optionally create one."""

#     if request.method != "GET":
#         return JsonResponse({"status": "error", "message": "Only GET method allowed."}, status=405)

#     try:
#         token = request.session.get('token')
#         if not token:
#             return JsonResponse({"status": "error", "message": "Authentication token missing."}, status=401)

#         headers = {
#             'Content-Type': 'application/json',
#             "Authorization": f"Token {token}"
#         }

#         # Load all tasks
#         all_tasks_url = f"{host_url(request)}{reverse_lazy('get_all_task_api')}"
#         all_tasks_response = api_connection(method="GET", url=all_tasks_url, headers=headers, data={})
#         all_tasks = get_data_on_success(all_tasks_response)

#         # Optional: get a single task by ID
#         task_url = f"{host_url(request)}{reverse_lazy('get_task_by_id_api')}"
#         task_response = api_connection(method="GET", url=task_url, headers=headers, data={})
#         task = get_data_on_success(task_response)

#         # Suggestive payload example - modify as needed
#         suggestive_payload = {
#             "context": "planning daily tasks",  # Example data
#         }

#         print('suggestive_payload:', suggestive_payload)

#         # Suggest a task
#         suggestive_url = f"{host_url(request)}{reverse_lazy('suggest_task_api')}"
#         suggestive_response = requests.post(
#             suggestive_url,
#             headers=headers,
#             json=suggestive_payload,
#             timeout=10
#         )

#         if suggestive_response.status_code != 200:
#             return JsonResponse({
#                 "status": "error",
#                 "message": "Error fetching task suggestion",
#                 "data": suggestive_response.json()
#             }, status=400)

#         suggested_data = suggestive_response.json().get("suggestion", {})
#         title = suggested_data.get("title")
#         description = suggested_data.get("description")
#         due_date = suggested_data.get("due_date")  # Assume due_date is returned or set manually

#         # Optional: create the task using the suggestion
#         if title and description and due_date:
#             create_url = f"{host_url(request)}{reverse_lazy('create_task_api')}"
#             task_payload = {
#                 "title": title,
#                 "description": description,
#                 "due_date": due_date
                
#             }

#             create_response = requests.post(
#                 create_url,
#                 headers=headers,
#                 json=task_payload,
#                 timeout=10
#             )

#             if create_response.status_code == 201:
#                 return JsonResponse({
#                     "status": "success",
#                     "message": "Task created successfully",
#                     "data": create_response.json()
#                 })
#             else:
#                 return JsonResponse({
#                     "status": "error",
#                     "message": "Task creation failed",
#                     "details": create_response.json()
#                 }, status=400)

#         print("bunda all_tasks", all_tasks)
#         print("suggested_task", suggested_data)
#         # If no creation, return fetched tasks and suggestion
#         return JsonResponse({
#             "status": "success",
#             "data": all_tasks,
#             "suggested_task": suggested_data
#         })

#     except json.JSONDecodeError:
#         return JsonResponse({"status": "error", "message": "Invalid JSON data"}, status=400)
#     except requests.exceptions.RequestException as e:
#         return JsonResponse({"status": "error", "message": f"Network error: {str(e)}"}, status=500)
#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         return JsonResponse({"status": "error", "message": f"Server error: {str(e)}"}, status=500)

@csrf_exempt
def get_all_tasks(request):
    """API view to get all tasks, suggest task and optionally create one."""

    if request.method != "GET":
        return JsonResponse({"status": "error", "message": "Only GET method allowed."}, status=405)

    try:
        # Prioritize Authorization header token, then session token
        token = None
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Token "):
            token = auth_header.split("Token ")[-1]
        elif auth_header.startswith("Bearer "):
            token = auth_header.split("Bearer ")[-1]
        
        if not token:
            token = request.session.get('token')

        if not token:
            return JsonResponse({"status": "error", "message": "Authentication token missing."}, status=401)

        headers = {
            'Content-Type': 'application/json',
            "Authorization": f"Token {token}"
        }

        # --- Fetch All Tasks from internal API ---
        all_tasks_url = f"{host_url(request)}{reverse_lazy('get_all_task_api')}"
        all_tasks_response = api_connection(method="GET", url=all_tasks_url, headers=headers)
        
        # Initialize all_tasks_data as an empty list to ensure it's always an array
        all_tasks_data = []
        if all_tasks_response.get('status') == 'success' and 'data' in all_tasks_response:

            tasks_list = all_tasks_response['data']

             # We perform a final check to ensure it's an array, just in case
        if isinstance(tasks_list, list):
            all_tasks_data = tasks_list

        else:
            print(f"Warning: Internal API's 'data' field is not a list. Received: {tasks_list}")

        #     try:
        #         # Parse the JSON from the internal API call (get_all_task_api)
        #         internal_api_json = all_tasks_response.json()
        #         # CRITICAL: Extract the 'data' array from the internal API's response
        #         if 'data' in internal_api_json and isinstance(internal_api_json['data'], list):
        #             all_tasks_data = internal_api_json['data']
        #         else:
        #             # Log a warning if the internal API's 'data' key is not an array or is missing
        #             print(f"Warning: Internal API response 'data' key is not a list or missing: {internal_api_json}")
        #     except json.JSONDecodeError:
        #         print(f"Error decoding JSON from internal get_all_task_api: {all_tasks_response.text}")
        # else:
        #     print(f"Internal get_all_task_api call failed with status {all_tasks_response.status_code}: {all_tasks_response.text}")

        # --- Suggest a Task (existing logic) ---
        suggestive_payload = {
            "context": "planning daily tasks",
        }
        suggestive_url = f"{host_url(request)}{reverse_lazy('suggest_task_api')}"
        suggestive_response = requests.post(
            suggestive_url,
            headers=headers,
            json=suggestive_payload,
            timeout=10
        )

        suggested_data = {}
        if suggestive_response.status_code == 200:
            try:
                suggested_data = suggestive_response.json().get("suggestion", {})
            except json.JSONDecodeError:
                print(f"Error decoding JSON from suggest_task_api: {suggestive_response.text}")
        else:
            print(f"Suggest task API call failed with status {suggestive_response.status_code}: {suggestive_response.text}")

        # --- Return final response to frontend ---
        # Ensure the 'data' key in this JsonResponse contains the actual array of tasks
        return JsonResponse({
            "status": "success",
            "data": all_tasks_data, # This is now the array of tasks or an empty list
            "suggested_task": suggested_data
        })

    except json.JSONDecodeError:
        return JsonResponse({"status": "error", "message": "Invalid JSON data received from an internal API."}, status=400)
    except requests.exceptions.RequestException as e:
        return JsonResponse({"status": "error", "message": f"Network error during internal API call: {str(e)}"}, status=500)
    except Exception as e:
        traceback.print_exc()
        return JsonResponse({"status": "error", "message": f"Server error occurred: {str(e)}"}, status=500)



# @csrf_exempt
# def get_all_tasks(request):
#     """Get all tasks function with API."""

#     if request.method != 'GET':
#         return JsonResponse({
#             "status": "error",
#             "message": "Method not allowed. Use GET."
#         }, status=405)

#     try:
#         # Extract token from Authorization header
#         auth_header = request.headers.get("Authorization", "")
#         token = None
#         if auth_header.startswith("Token "):
#             token = auth_header.split("Token ")[-1]
#         elif auth_header.startswith("Bearer "):
#             token = auth_header.split("Bearer ")[-1]

#         # Fallback to session token
#         if not token:
#             token = request.session.get('token')

#         if not token:
#             return JsonResponse({
#                 "status": "error",
#                 "message": "Authorization token is required."
#             }, status=401)

#         # Get user from token
#         try:
#             user = Token.objects.get(key=token).user
#         except Token.DoesNotExist:
#             return JsonResponse({
#                 "status": "error",
#                 "message": "Invalid token. User not found."
#             }, status=401)

#         # Store token in session
#         request.session["token"] = token
#         request.session.modified = True

#         headers = {
#             'Content-Type': 'application/json',
#             "Authorization": f"Token {token}"
#         }

#         # Get all tasks for this user
#         all_tasks_url = f"{host_url(request)}{reverse_lazy('get_all_task_api')}"
        
        

#         try:
#             all_tasks_response = requests.get(all_tasks_url, headers=headers, timeout=10)
#             all_tasks_data = []

#         except requests.exceptions.RequestException as e:
#             return JsonResponse({
#                 "status": "error",
#                 "message": f"Error connecting to tasks service: {str(e)}"
#             }, status=500)

#         # Process response
#         if all_tasks_response.status_code == 200:
#             try:
#                 all_tasks = all_tasks_response.json()
#             except ValueError:
#                 return JsonResponse({
#                     "status": "error",
#                     "message": "Invalid JSON response from tasks service"
#                 }, status=500)
#             print('all_tasks in logic :', all_tasks)
#             return JsonResponse({
#                 "status": "success",
#                 "message": "Tasks retrieved successfully",
#                 "data": all_tasks
#             }, status=200)
#         else:
#             try:
#                 error_msg = all_tasks_response.json().get("message", "Failed to fetch tasks")
#             except ValueError:
#                 error_msg = "Failed to fetch tasks"

#             return JsonResponse({
#                 "status": "error",
#                 "message": error_msg
#             }, status=all_tasks_response.status_code)

#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         return JsonResponse({
#             "status": "error",
#             "message": f"Server error occurred: {str(e)}"
#         }, status=500)

# Assuming api_connection is now more robust and returns a dictionary
# from the JSON response of the internal APIs.
#
# (api_connection, host_url, etc. remain the same as the last correction)

@csrf_exempt
def get_all_tasks(request):
    """
    API view to get all tasks, suggest a task, and optionally create one.
    """
    if request.method != "GET":
        return JsonResponse({"status": "error", "message": "Only GET method allowed."}, status=405)

    try:
        # Get authentication token
        token = request.session.get('token')
        if not token:
            auth_header = request.headers.get("Authorization", "")
            if auth_header.startswith("Token "):
                token = auth_header.split("Token ")[-1]
            elif auth_header.startswith("Bearer "):
                token = auth_header.split("Bearer ")[-1]

        if not token:
            return JsonResponse({"status": "error", "message": "Authentication token missing."}, status=401)

        headers = {
            'Content-Type': 'application/json',
            "Authorization": f"Token {token}"
        }

        # --- 1. Fetch All Tasks ---
        all_tasks_url = f"{host_url(request)}{reverse_lazy('get_all_task_api')}"
        all_tasks_response_data = api_connection(method="GET", url=all_tasks_url, headers=headers, data={})

        all_tasks_data = [] # Initialize as empty list
        if all_tasks_response_data.get('status') == 'success' and isinstance(all_tasks_response_data.get('data'), list):
            all_tasks_data = all_tasks_response_data['data']
        else:
            print(f"Warning: Internal API's 'data' field is not a list. Received: {all_tasks_response_data}")

        # --- 2. Suggest a Task ---
        suggestive_payload = {"context": "planning daily tasks"}
        suggestive_url = f"{host_url(request)}{reverse_lazy('suggest_task_api')}"
        
        suggested_data = {} # Initialize as empty dictionary
        try:
            suggestive_response = requests.post(
                suggestive_url,
                headers=headers,
                json=suggestive_payload,
                timeout=10
            )
            suggestive_response.raise_for_status() # Raise exception for bad status codes
            suggested_data = suggestive_response.json().get("suggestion", {})
        except (requests.exceptions.RequestException, json.JSONDecodeError) as e:
            # If this fails, we just log the error and proceed without a suggestion
            print(f"Error fetching task suggestion: {e}")

        # --- 3. Return Final Response ---
        return JsonResponse({
            "status": "success",
            "data": all_tasks_data, # This is guaranteed to be an array
            "suggested_task": suggested_data # This is guaranteed to be an object
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"status": "error", "message": f"Server error: {str(e)}"}, status=500)


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