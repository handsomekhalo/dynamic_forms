import json
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
    


@csrf_exempt
def get_categories_with_form_id(request, formId):
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

        # Construct URL to call the existing API
        url = f"{host_url(request)}{reverse_lazy('get_all_categories_by_form_id_api', kwargs={'formId': formId})}"

        # Make the GET request to the existing get_all_categories_api
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        # Parse the response
        response_data = response.json()

        # Return the categories along with the formId if needed
        return JsonResponse({
            "status": "success",
            "formId": formId,
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
    



@csrf_exempt
def create_form(request):
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

        # Step 2: Read and Parse JSON Payload
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)

        # Step 3: Validate Form Data (Example)
        name = data.get('name')
        description = data.get('description', '')
        is_active = data.get('is_active', True)

        if not name:
            return JsonResponse({
                "status": "error",
                "message": "Form name is required."
            }, status=400)

        # Optional: You could add more validation if needed here (e.g., checking for duplicate form names)
        
        form_data = {
            "name": name,
            "description": description,
            "is_active": is_active
        }

        # Step 4: Send the Data to the Internal API to Create the Form
        api_url = f"{host_url(request)}{reverse_lazy('create_form_api')}"

        try:
            response = requests.post(api_url, headers=headers, data=json.dumps(form_data), timeout=10)
            response.raise_for_status()
        except requests.RequestException as e:
            return JsonResponse({'status': 'error', 'message': f'Error while creating form: {str(e)}'}, status=500)

        # Step 5: Process the Response from the Internal API
        try:
            response_data = response.json()
        except ValueError:
            return JsonResponse({'status': 'error', 'message': 'Invalid response from create_form_api'}, status=500)

        if response.status_code == 201 and response_data.get('status') == 'success':
            return JsonResponse({
                "status": "success",
                "message": "Form created successfully",
                "form": response_data.get('form')  # Returning form data if needed
            }, status=201)
        else:
            return JsonResponse({
                "status": "error",
                "message": response_data.get('message', 'Failed to create form')
            }, status=400)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)



@csrf_exempt
def create_category(request):
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

        # Step 2: Parse JSON Payload
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON data'}, status=400)

        # Step 3: Validate Category Name
        name = data.get('name')
        if not name:
            return JsonResponse({
                "status": "error",
                "message": "Category name is required."
            }, status=400)

        category_data = {"name": name}

        # Step 4: Send Data to the Internal API to Create Category
        api_url = f"{host_url(request)}{reverse_lazy('create_category_api')}"
        try:
            response = requests.post(api_url, headers=headers, data=json.dumps(category_data), timeout=10)
            response.raise_for_status()
        except requests.RequestException as e:
            return JsonResponse({'status': 'error', 'message': f'Error while creating category: {str(e)}'}, status=500)

        # Step 5: Handle API Response
        try:
            response_data = response.json()
        except ValueError:
            return JsonResponse({'status': 'error', 'message': 'Invalid response from create_category_api'}, status=500)

        if response.status_code == 201 and response_data.get('status') == 'success':
            return JsonResponse({
                "status": "success",
                "message": "Category created successfully.",
                "category": response_data.get('category')
            }, status=201)
        else:
            return JsonResponse({
                "status": "error",
                "message": response_data.get('error', 'Failed to create category.')
            }, status=400)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)
    



@csrf_exempt
def unassign_category(request):
    if request.method != 'POST':
        return JsonResponse({
            "status": "error",
            "message": "Method not allowed"
        }, status=405)

    try:
        # Step 1: Extract Token
        auth_header = request.headers.get("Authorization", "")
        token = None
        if auth_header.startswith("Token "):
            token = auth_header[6:]
        elif auth_header.startswith("Bearer "):
            token = auth_header[7:]

        if not token:
            return JsonResponse({
                "status": "error",
                "message": "Authorization token is required."
            }, status=401)

        request.session["token"] = token
        request.session.modified = True

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Token {token}",
        }

        # Step 2: Parse JSON
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)

        form_type_id = data.get('form_type_id')
        main_category_id = data.get('main_category_id')
        deactivate = data.get('deactivate', False)

        if not form_type_id or not main_category_id:
            return JsonResponse({
                'status': 'error',
                'message': 'Both form_type_id and main_category_id are required.'
            }, status=400)

        # Step 3: Internal API Call
        api_url = f"{host_url(request)}{reverse_lazy('unassign_category_api')}"

        payload = {
            'form_type_id': form_type_id,
            'main_category_id': main_category_id,
            'deactivate': deactivate
        }

        try:
            response = requests.post(api_url, headers=headers, json=payload, timeout=10)
            response.raise_for_status()
        except requests.RequestException as e:
            return JsonResponse({'status': 'error', 'message': f'API request error: {str(e)}'}, status=500)

        try:
            response_data = response.json()
        except ValueError:
            return JsonResponse({'status': 'error', 'message': 'Invalid response from unassign_category_api'}, status=500)

        # Successfully processed - just check for HTTP 200 status code
        if response.status_code == 200:
            return JsonResponse({
                "status": "success",
                "message": response_data.get('message', f"Category {main_category_id} unassigned successfully from form type {form_type_id}")
            }, status=200)
        else:
            return JsonResponse({
                "status": "error",
                "message": response_data.get('error', 'Failed to unassign category.')
            }, status=response.status_code)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)
    




@csrf_exempt
# def get_unassigned_categories(request,form_type_id):
    # views.py
def get_unassigned_categories(request, form_type_id):

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

        # Construct URL to call the existing API
        # url = f"{host_url(request)}{reverse_lazy('get_unassigned_categories_api')}"
        url = f"{host_url(request)}{reverse_lazy('get_unassigned_categories_api', kwargs={'form_type_id': form_type_id})}"


        # Make the GET request to the existing get_all_categories_api
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        # Parse the response
        response_data = response.json()

        # Return the categories along with the formId if needed
        return JsonResponse({
            "status": "success",
            "form_type_id": form_type_id,
            "unassigned_categories": response_data
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
def assign_or_update_category(request):

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

        assignments = data.get('assignments', [])
        action = data.get('action', 'add')

        if not assignments:
            return JsonResponse({
                "status": "error",
                "message": "No assignments provided."
            }, status=400)

        responses = []

        # Step 3: Process each assignment
        for assignment in assignments:
            form_type_id = assignment.get('form_type_id')
            main_category_id = assignment.get('category_id')



            if not form_type_id or not main_category_id:
                return JsonResponse({
                    "status": "error",
                    "message": "Form type and main category are required."
                }, status=400)

            api_url = f"{host_url(request)}{reverse_lazy('assign_or_update_category_api')}"
            payload = {
                "form_type_id": form_type_id,
                "main_category_id": main_category_id,
                "action": action
            }
            
            # Try different auth formats sequentially until one works
            auth_formats = [
                {"Authorization": f"Token {token}"},    # Django Rest Framework default
                {"Authorization": f"Bearer {token}"},   # OAuth style 
                {"Authorization": token},               # Plain token
            ]
            
            response = None
            success = False
            
            for auth_format in auth_formats:
                headers = {"Content-Type": "application/json", **auth_format}
                try:
                    print(f"Trying authentication format: {auth_format}")
                    response = requests.post(api_url, headers=headers, json=payload, timeout=10)
                    if response.status_code != 401:  # If not unauthorized
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
def get_form_categories(request, formId):

    if request.method != 'GET':
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

        # Create the API URL with the form ID
        api_url = f"{host_url(request)}{reverse_lazy('get_form_categories_api', kwargs={'form_type_id': formId})}"
        
        # Try different auth formats sequentially until one works
        auth_formats = [
            {"Authorization": f"Token {token}"},    # Django Rest Framework default
            {"Authorization": f"Bearer {token}"},   # OAuth style 
            {"Authorization": token},               # Plain token
        ]
        
        response = None
        success = False
        
        for auth_format in auth_formats:
            headers = {"Content-Type": "application/json", **auth_format}
            try:
                print(f"Trying authentication format: {auth_format}")
                response = requests.get(api_url, headers=headers, timeout=10)
                if response.status_code != 401:  # If not unauthorized
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

            response_data = response.json()
            return JsonResponse(response_data, status=200)
        except requests.RequestException as e:
            print(f"Error getting form categories: {str(e)}")
            return JsonResponse({
                "status": "error",
                "message": f"API request failed: {str(e)}"
            }, status=response.status_code)

    except Exception as e:
        import traceback
        print("Exception occurred:")
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)


@csrf_exempt
def remove_category_assignment(request):
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

        # Get the category ID to remove
        main_category_id = data.get('main_category_id')
        # form_type_id = formId  # Using the URL parameter for form ID
        form_type_id = data.get('form_type_id')  # Using the URL parameter for form ID


        if not main_category_id:
            return JsonResponse({
                "status": "error",
                "message": "Category ID is required."
            }, status=400)

        # Step 3: Make API call to remove category assignment
        api_url = f"{host_url(request)}{reverse_lazy('remove_category_assignment_api')}"
        payload = {
            "form_type_id": form_type_id,
            "main_category_id": main_category_id
        }
        
        # Try different auth formats sequentially until one works
        auth_formats = [
            {"Authorization": f"Token {token}"},    # Django Rest Framework default
            {"Authorization": f"Bearer {token}"},   # OAuth style 
            {"Authorization": token},               # Plain token
        ]
        
        response = None
        success = False
        
        for auth_format in auth_formats:
            headers = {"Content-Type": "application/json", **auth_format}
            try:
                print(f"Trying authentication format: {auth_format}")
                response = requests.post(api_url, headers=headers, json=payload, timeout=10)
                if response.status_code != 401:  # If not unauthorized
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
            return JsonResponse(response.json(), status=200)
        except requests.RequestException as e:
            print(f"Error removing category assignment: {str(e)}")
            return JsonResponse({
                "status": "error",
                "message": f"API request failed: {str(e)}",
                "details": response.text if response else "No response"
            }, status=response.status_code if response else 500)

    except Exception as e:
        import traceback
        print("Exception occurred:")
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)
    

@csrf_exempt
def get_assigned_categories(request, form_type_id):

    if request.method != 'GET':
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
        

        if not form_type_id:
            return JsonResponse({
                "status": "error",
                "message": "Form type ID is required."
            }, status=400)


        # Step 3: Make API call to fetch assigned categories
        api_url = f"{host_url(request)}{reverse_lazy('get_assigned_categories_api', kwargs={'form_type_id': form_type_id})}"
        
        # Try different auth formats sequentially until one works
        auth_formats = [
            {"Authorization": f"Token {token}"},    # Django Rest Framework default
            {"Authorization": f"Bearer {token}"},   # OAuth style 
            {"Authorization": token},               # Plain token
        ]
        
        response = None
        success = False
        
        for auth_format in auth_formats:
            headers = {"Content-Type": "application/json", **auth_format}
            try:
                print(f"Trying authentication format: {auth_format}")
                response = requests.get(api_url, headers=headers, timeout=10)
                if response.status_code != 401:  # If not unauthorized
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
            return JsonResponse(response.json(), status=200)
        except requests.RequestException as e:
            print(f"Error fetching assigned categories: {str(e)}")
            return JsonResponse({
                "status": "error",
                "message": f"API request failed: {str(e)}",
                "details": response.text if response else "No response"
            }, status=response.status_code if response else 500)

    except Exception as e:
        import traceback
        print("Exception occurred:")
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)
