import json
import secrets
import string
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.middleware.csrf import get_token
import requests
from rest_framework.authtoken.models import Token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.urls import reverse, reverse_lazy
from django.views.decorators.csrf import csrf_exempt
import requests
from system_management import constants
from system_management.api.serializers import UserTypeModelSerializer
from system_management.decorators import session_timeout
from system_management.general_func_classes import api_connection, host_url
from system_management.models import User, UserType



# Create your views here.


@ensure_csrf_cookie
def csrf(request):
    """
    Sets the CSRF cookie and returns the token
    """
    token = get_token(request)
    return JsonResponse({'csrfToken': token})



# def csrf(request):
#     return JsonResponse({'csrfToken': get_token(request)})

# def csrf(request):
#     return JsonResponse({'csrfToken': get_token(request)})

def get_data_on_success(response_data):
    status = response_data.get('status')
    if status == 'success':
        data = response_data.get('data')
    else:
        data = []
    return data


def generate_password(length=12, include_digits=True, include_special_chars=True):
    letters = string.ascii_letters
    digits = string.digits if include_digits else ''
    special_chars = string.punctuation if include_special_chars else ''

    characters = letters + digits + special_chars

    length = max(length, 8)

    password = ''.join(secrets.choice(characters) for _ in range(length))

    return password



def set_csrf_token(request):
     response = JsonResponse({'detail': 'CSRF cookie set'})
     response.set_cookie('csrftoken', get_token(request)) 
     return response

# @ensure_csrf_cookie     
# def login_view(request):
#     """User login function with API."""

#     if request.method == "GET":
    
#         # Update this path to point to your React app's index.html
#         return render(request, 'index.html')  # Adj
    

# View that redirects to Next.js
def login_view(request):
    # return redirect("http://localhost:3000/")  # Next.js is running here
    return redirect('http://52.14.111.23:3000/')  # or your real domain



@csrf_exempt
def register_user(request):
    
    if request.method != 'POST':
        return JsonResponse({
            "status": "error",
            "message": "Method not allowed"
        }, status=405)

    try:
        # Parse request data
        data = json.loads(request.body)

        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')
        password = data.get('password')
        confirm_password = data.get('confirm_password')

        # Check if all fields are provided
        if not all([first_name, last_name, email, password, confirm_password]):
            return JsonResponse({
                "status": "error",
                "message": "All fields are required."
            }, status=400)

        # Check if password matches confirm_password
        if password != confirm_password:
            return JsonResponse({
                "status": "error",
                "message": "Passwords do not match."
            }, status=400)

        # Prepare API call to register user
        url = f"{host_url(request)}{reverse_lazy('register_api')}"
        payload = json.dumps({
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "password": password,
            "confirm_password": confirm_password
        })

        headers = {
            'Content-Type': 'application/json',  # Ensure this is set correctly
        }

        # Make the API call via the api_connection helper
        response_data = api_connection(method="POST", url=url, headers=headers, data=payload)

        # Check the response from the registration API
        if response_data and response_data.get("status") == "success":
            return JsonResponse({
                "status": "success",
                "message": "User registered successfully",
                "user_id": response_data.get("user_id")
            })

        return JsonResponse({
            "status": "error",
            "message": response_data.get("message", "Registration failed"),
            "errors": response_data.get("errors", {})
        }, status=400)

    except json.JSONDecodeError:
        return JsonResponse({
            "status": "error",
            "message": "Invalid JSON data"
        }, status=400)
    except Exception as e:
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)


@ensure_csrf_cookie  # This ensures the CSRF cookie is set
def login(request):
    """User login function with API."""
    if request.method != "POST":
        return JsonResponse({
            'status': 'error', 
            'message': 'Only POST requests are allowed'
        }, status=405)

    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        # remember_me = data.get('rememberMe', False)

        if not email or not password:
            return JsonResponse({
                'status': 'error',
                'message': 'Email and password are required'
            }, status=400)

        # Get the existing token if any
        token = request.session.get('token')
        
        headers = {
            'Content-Type': 'application/json',
            "Authorization": f"Token {token}" if token else ""
        }

        payload = json.dumps({
            'email': email,
            'password': password,
            # 'remember_me': remember_me
        })

        url = f"{host_url(request)}{reverse_lazy('login_api')}"
        
        try:
            response_data = requests.post(
                url, 
                headers=headers, 
                data=payload, 
                timeout=10
            )
            
            if response_data.status_code == 200:
                response_json = response_data.json()
                
                # Store token in session if remember_me is True
                # if remember_me and 'token' in response_json:
                #     request.session['token'] = response_json['token']
                
                return JsonResponse({
                    'status': 'success', 
                    'data': response_json
                })
            
            
            return JsonResponse({
                'status': 'error',
                'message': response_data.json().get('message', 'Login failed'),
            }, status=response_data.status_code)

        except requests.exceptions.RequestException as e:
            return JsonResponse({
                'status': 'error',
                'message': f'API request failed: {str(e)}'
            }, status=500)

    except json.JSONDecodeError:
        return JsonResponse({
            'status': 'error', 
            'message': 'Invalid JSON data'
        }, status=400)



@csrf_exempt
def get_all_users(request):
    
    if request.method == "GET":
        """Returns all user information for user management template."""
        try:
            # user =request.data
            token = request.session.get("token")
            # token = request.headers.get("Authorization", "").split("Token ")[-1]
            auth_header = request.headers.get("Authorization", "")
            if auth_header.startswith("Token "):
                token = auth_header.split("Token ")[-1]
            elif auth_header.startswith("Bearer "):
                token = auth_header.split("Bearer ")[-1]
            else:
                token = None


            if token:
                    request.session["token"] = token
                    request.session.modified = True

            if not token:
                return JsonResponse({
                    "status": "error",
                    "message": "Token not found in session or headers"
                })

            # API call to fetch users
            url = f"{host_url(request)}{reverse('get_users_api')}"

            payload = json.dumps({
                'token': token  # Adding token to payload
            })

            headers = {
                'Authorization': f'Token {token}',
                'Content-Type': constants.JSON_APPLICATION
            }

            response_data = api_connection(method="GET", url=url, headers=headers, data=payload)

            users = []
            if response_data.get('status') == 'success':
                users = response_data.get('users', [])

            # API call to fetch user types
            url = f"{host_url(request)}{reverse_lazy('get_user_types_api')}"

            # url = f"{host_url(request)}{reverse('get_user_types_api')}"
            

            response_data = api_connection(method="GET", url=url, headers=headers, data=payload)

            roles = []
            if response_data.get('status') == 'success':
                roles = response_data.get('user_types', [])

            return JsonResponse({
                'status': 'success',
                'users': users,
                'user_types': roles
            })

        except Exception as e:
            return JsonResponse({
                'status': 'error',
                'message': str(e)
            })

    return JsonResponse({
        'status': 'error',
        'message': 'Invalid request method'
    })


# @csrf_exempt
# def get_roles(request):
#     """
#     View function to get all roles/user types.
#     Handles both session and header-based token authentication.
#     """

#     if request.method != "GET":
#         return JsonResponse({
#             'status': 'error',
#             'message': 'Only GET requests are allowed'
#         }, status=405)

#     try:
#         # Get token from session or Authorization header
#         token = request.session.get("token")
#             # token = request.headers.get("Authorization", "").split("Token ")[-1]
#         auth_header = request.headers.get("Authorization", "")
#         if auth_header.startswith("Token "):
#             token = auth_header.split("Token ")[-1]
#         elif auth_header.startswith("Bearer "):
#             token = auth_header.split("Bearer ")[-1]
#         else:
#             token = None


#         if token:
#             request.session["token"] = token
#             request.session.modified = True

#         if not token:
#             return JsonResponse({
#                 "status": "error",
#                 "message": "Token not found in session or headers"
#             }, status=401)

#         url = f"{host_url(request)}{reverse('get_user_types_api')}"

#         payload = json.dumps({
#             'token': token
#         })

#         headers = {
#             'Authorization': f'Token {token}',
#             'Content-Type': constants.JSON_APPLICATION
#         }

#         response_data = api_connection(
#             method="GET",
#             url=url,
#             headers=headers,
#             data=payload
#         )

#         if response_data.get('status') == 'success':
#             return JsonResponse({
#                 'status': 'success',
#                 'roles': response_data.get('user_types', [])
#             })
        
#         return JsonResponse({
#             'status': 'error',
#             'message': response_data.get('message', 'Failed to fetch roles')
#         }, status=400)

#     except Exception as e:
#         return JsonResponse({
#             'status': 'error',
#             'message': str(e)
#         }, status=500)

@csrf_exempt
def get_roles(request):
    """
    View function to get all roles/user types.
    Handles both session and header-based token authentication.
    Returns consistent response format like get_questions_assigned_to_category.
    """
    if request.method!= "GET":
        return JsonResponse({
            "status": "error",
            "message": "Only GET requests are allowed"
        }, status=405)

    try:
        # Get token from header or session
        # auth_header = request.headers.get("Authorization", "")
        # token = None
        # if auth_header.startswith("Token "):
        #     token = auth_header[6:]
        # elif auth_header.startswith("Bearer "):
        #     token = auth_header[7:]
        # else:
        #     token = request.session.get("token")

        # if not token:
        #     return JsonResponse({
        #         "status": "error",
        #         "message": "Authorization token is required."
        #     }, status=401)

        # Persist token in session for later use
        # request.session["token"] = token
        # request.session.modified = True

        # Construct internal API call
        url = f"{host_url(request)}{reverse('get_user_types_api')}"
        headers = {
            "Authorization": f"Token {token}",
            "Content-Type": constants.JSON_APPLICATION
        }

        # Attempt calling internal API
        auth_variants = [
            {"Authorization": f"Token {token}"},
            {"Authorization": f"Bearer {token}"},
            {"Authorization": token}
        ]

        response = None
        for auth in auth_variants:
            try:
                response = requests.get(url, headers={**headers, **auth}, timeout=10)
                if response.status_code != 401:
                    break
            except requests.RequestException as e:
                print(f"Token attempt failed using headers {auth}: {str(e)}")

        if not response or response.status_code == 401:
            return JsonResponse({
                "status": "error",
                "message": "Failed to authenticate with the internal API."
            }, status=401)

        response.raise_for_status()
        response_data = response.json()
        roles = response_data.get("user_types", [])

        return JsonResponse({
            "status": "success",
            "data": {
                "roles": roles
            },
            "message": "No roles found." if not roles else ""
        }, status=200)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({
            "status": "error",
            "message": f"Server error occurred: {str(e)}"
        }, status=500)
def _get_user_types_logic():
    """
    Shared logic for getting user types.
    This is the exact same logic as your get_user_types_api function.
    """
    try:
        user_types = UserType.objects.all()
        serializer = UserTypeModelSerializer(user_types, many=True)
        
        return {
            'status': 'success',
            'user_types': serializer.data
        }
        
    except Exception as e:
        return {
            'status': 'error',
            'message': f'Error during getting user types: {str(e)}'
        }

# @csrf_exempt
# def get_roles(request):
#     """
#     View function to get all roles/user types.
#     Handles both session and header-based token authentication.
#     Returns consistent response format like get_questions_assigned_to_category.
#     """
#     if request.method != "GET":
#         return JsonResponse({
#             "status": "error",
#             "message": "Only GET requests are allowed"
#         }, status=405)

#     try:
#         # Get token from header or session
#         auth_header = request.headers.get("Authorization", "")
#         token = None
#         if auth_header.startswith("Token "):
#             token = auth_header[6:]
#         elif auth_header.startswith("Bearer "):
#             token = auth_header[7:]
#         else:
#             token = request.session.get("token")

#         if not token:
#             return JsonResponse({
#                 "status": "error",
#                 "message": "Authorization token is required."
#             }, status=401)

#         # Persist token in session for later use
#         request.session["token"] = token
#         print('here we are',token)
#         request.session.modified = True

#         # TODO: Add token validation here if needed
#         # You might want to validate the token before proceeding
#         # user = authenticate_token(token)  # Your token validation logic

#         # FIXED: Use shared logic instead of HTTP call
#         response_data = _get_user_types_logic()
        
#         if response_data['status'] == 'success':
#             roles = response_data.get('user_types', [])
#             return JsonResponse({
#                 "status": "success",
#                 "data": {
#                     "roles": roles
#                 },
#                 "message": "No roles found." if not roles else ""
#             }, status=200)
#         else:
#             return JsonResponse({
#                 "status": "error",
#                 "message": response_data.get('message', 'Failed to fetch roles')
#             }, status=400)

#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         return JsonResponse({
#             "status": "error",
#             "message": f"Server error occurred: {str(e)}"
#         }, status=500)
# @csrf_exempt
# def _get_user_types_logic():
#     """
#     Shared logic for getting user types from the database.
#     """
#     try:
#         user_types = UserType.objects.all()
#         serializer = UserTypeModelSerializer(user_types, many=True)
#         return {
#             'status': 'success',
#             'user_types': serializer.data
#         }
#     except Exception as e:
#         return {
#             'status': 'error',
#             'message': f'Error during getting user types: {str(e)}'
#         }



# @csrf_exempt
# def get_roles(request):
#     """
#     View function to get all roles/user types.
#     Handles both session and header-based token authentication.
#     Avoids internal HTTP calls; uses local DB access via _get_user_types_logic.
#     """

#     if request.method != "GET":
#         return JsonResponse({
#             "status": "error",
#             "message": "Only GET requests are allowed"
#         }, status=405)

#     try:
#         # Extract token from headers or session
#         auth_header = request.headers.get("Authorization", "")
#         token = None

#         if auth_header.startswith("Token "):
#             token = auth_header[6:]
#         elif auth_header.startswith("Bearer "):
#             token = auth_header[7:]
#         else:
#             token = request.session.get("token")

#         if not token:
#             return JsonResponse({
#                 "status": "error",
#                 "message": "Authorization token is required."
#             }, status=401)

#         # Save token in session (optional)
#         request.session["token"] = token
#         request.session.modified = True

#         # TODO: Add token validation here if needed in the future
#         # Example: user = authenticate_token(token)

#         # Use local DB logic instead of HTTP call
#         response_data = _get_user_types_logic()

#         if response_data['status'] == 'success':
#             roles = response_data.get('user_types', [])
#             return JsonResponse({
#                 "status": "success",
#                 "data": {
#                     "roles": roles
#                 },
#                 "message": "No roles found." if not roles else ""
#             }, status=200)
#         else:
#             return JsonResponse({
#                 "status": "error",
#                 "message": response_data.get('message', 'Failed to fetch roles')
#             }, status=400)

#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         return JsonResponse({
#             "status": "error",
#             "message": f"Server error occurred: {str(e)}"
#         }, status=500)


@csrf_exempt
def update_user(request, user_id):
    
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

        # Process role and user_type_id
        role = data.get('role')
        user_type_id = None

        if role not in [None, '', 'null', 'None']:
            user_type_id = int(role)
        else:
            user_type_id = data.get('user_type_id')
            # Convert to int if possible
            if user_type_id not in [None, '', 'null', 'None']:
                try:
                    user_type_id = int(user_type_id)
                except (ValueError, TypeError):
                    return JsonResponse({
                        "status": "error",
                        "message": f"Invalid user type ID format: {user_type_id}"
                    }, status=400)
        
        
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')

        if not all([first_name, last_name, email]):
            return JsonResponse({
                "status": "error",
                "message": "First name, last name, and email are required."
            }, status=400)

        if user_type_id is None:
            return JsonResponse({
                "status": "error",
                "message": "User type ID is required."
            }, status=400)
            
        # Check if user exists
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({
                "status": "error",
                "message": "User not found."
            }, status=404)

        # Prepare payload for API call
        payload = {
            "user_id": user_id,
            "user_type_id": user_type_id,
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
        }


        # Make API call
        url = f"{host_url(request)}{reverse_lazy('update_user_api')}"
        headers = {
            'Authorization': f'Token {token}',
            'Content-Type': 'application/json'  # Make sure content type is correct
        }

        # Use requests directly instead of api_connection to debug
        response = requests.post(url, json=payload, headers=headers)
        
        try:
            response_data = response.json()
        except ValueError:
            return JsonResponse({
                "status": "error",
                "message": "Invalid response from API"
            }, status=500)

        if response_data.get('status') == 'success':
            return JsonResponse({
                "status": "success",
                "message": "User updated successfully"
            })
        else:
            return JsonResponse({
                "status": "error",
                "message": response_data.get('message', 'Update failed')
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