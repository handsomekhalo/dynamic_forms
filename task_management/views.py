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

def create_task(request):
    """Create task functionality."""

    if request.method == 'POST':
        token = request.session.get('token')
        title = request.POST.get('title')
        print('title',title)
        description = request.POST.get('description')
        print('description',description)
        due_date = request.POST.get('due_date')

        headers = {
            'Content-Type': 'application/json',
            "Authorization": f"Token {token}"
        }

        # Prepare payload for the suggestive API
        suggestive_payload = json.dumps({
            'input': description  # You might want to use title or description as input for suggestions
        })

        print('suggestive_payload:', suggestive_payload)

        # Suggestive API URL
        suggestive_url = f"{host_url(request)}{reverse_lazy('suggest_task_api')}"
        suggestive_response = requests.post(suggestive_url, headers=headers, data=suggestive_payload, timeout=10)

        # Check if the suggestive API returned a valid response
        if suggestive_response.status_code == 200:
            suggested_data = suggestive_response.json().get('suggestion', {})

            # Include suggested title and description if needed
            title = title or suggested_data.get('title', title)
            description = description or suggested_data.get('description', description)

            # Prepare payload for task creation
            payload = json.dumps({
                'title': title,
                'description': description,
                'due_date': due_date,
            })

            # Task creation URL
            create_url = f"{host_url(request)}{reverse_lazy('create_task_api')}"
            response_data = requests.post(create_url, headers=headers, data=payload, timeout=10)

            # Check if task creation was successful
            if response_data.status_code == 201:
                return JsonResponse({'status': 'success', 'data': response_data.json()})  # Return created task data
            else:
                return JsonResponse({'error': 'Error creating task', 'details': response_data.json()}, status=400)
        else:
            return JsonResponse({'error': 'Error fetching suggestion', 'details': suggestive_response.json()}, status=400)

# def create_task(request):
#     """Create task functiona;ity."""

#     if request.method == 'POST':
#         token = request.session.get('token')
#         title = request.POST.get('title')
#         description = request.POST.get('description')
#         due_date = request.POST.get('due_date')

#         headers = {
#             'Content-Type': 'application/json',
#             "Authorization": f"Token {token}"
#         }

#         payload = json.dumps({
#             'title': title,
#             'description': description,
#             'due_date': due_date,
#         })

#         url = f"{host_url(request)}{reverse_lazy('create_task_api')}"
#         suggestive_url = f"{host_url(request)}{reverse_lazy('suggest_task_api')}"
        
        

#         response_data = requests.post(url, headers=headers, data=payload, timeout=10)
#         suggestive_url_response = requests.post(suggestive_url, headers=headers, data=payload, timeout=10)

#         if response_data.status_code == 201 and  suggestive_url_response.status_code ==200: # Check for Created status
#             return JsonResponse({'status': 'success', 'data': response_data.json()})  # Send back the task data if needed
#         else:
#             return JsonResponse({'error': 'Error creating task', 'details': response_data.json()}, status=400)
        
        

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
    


def update_task(request):
    """Update task details via POST request."""
    if request.method == "POST":
        task_id = request.POST.get('task_id')
        title = request.POST.get('title')
        description = request.POST.get('description')
        due_date = request.POST.get('due_date')
        token = request.session.get('token')
        url = f"{host_url(request)}{reverse_lazy('update_task_api')}"
        
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

        response_data = api_connection(method="PUT", url=url, data=json.dumps(payload), headers=headers)

        return JsonResponse(response_data, safe=False)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)


@csrf_exempt  # Only if you want to bypass CSRF protection (not recommended)
def delete_task(request):
    """Update task details via POST request."""
    if request.method == "POST":
        try:
            # Parse JSON data from the request body
            data = json.loads(request.body)
            print('data', data)

            # Extract task_id and token from the parsed data
            task_id = data.get('task_id')
            print('task_id', task_id)

            # Assuming token is sent in the request headers
            token = request.headers.get('Authorization').split(' ')[-1] if 'Authorization' in request.headers else None
            print('token', token)

            url = f"{host_url(request)}{reverse_lazy('delete_task_api')}"
            headers = {
                'Content-Type': 'application/json',
                "Authorization": f"Token {token}" if token else ''
            }

            payload = {
                'task_id': task_id,
            }
            print('payload', payload)

            # Send request to external API
            response_data = requests.post(url, headers=headers, json=payload, timeout=10)  # Use json= to send as JSON

            # Return response from the external API
            return JsonResponse(response_data.json(), safe=False)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON format'}, status=400)

        except Exception as e:
            print('Unexpected error:', e)
            return JsonResponse({'error': f"An error occurred: {str(e)}"}, status=500)

    else:
        return JsonResponse({'error': 'Invalid request method'}, status=400)
    

    