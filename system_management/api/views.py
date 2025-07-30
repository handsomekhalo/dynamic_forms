

import datetime
from datetime import datetime
import json
import random
from requests import Response
from system_management import constants
from system_management.api.serializers import GetAlltUserModelSerializer, RegisterSerializer, UserModelSerializer, UserTypeModelSerializer, UserUpdateSerializer,CreateUserSerializer
from system_management.models import Profile, User, UserType
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework import status


from rest_framework.decorators import api_view, permission_classes

from rest_framework import (
    status,
    permissions,
    authentication
)

from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes
)



@api_view(["POST"])
@permission_classes((AllowAny,))
def register_api(request):
    """
    Register API for applicants
    Args:
        request:
    Returns:
        JSON response with status and message or user_id
    """
    if request.method == "POST":
        data = json.loads(request.body)
        serializer = RegisterSerializer(data=data)

        
        if serializer.is_valid():
            first_name = serializer.validated_data['first_name']
            last_name = serializer.validated_data['last_name']
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            confirm_password = serializer.validated_data['confirm_password']

            try:
                user_type = UserType.objects.get(name=constants.APPLICANT)

            except UserType.DoesNotExist:
                response_data = json.dumps({
                    "status": "error",
                    "message": "Applicant role not found"
                })
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

            if User.objects.filter(email=email).exists():
                response_data = json.dumps({
                    "status": "error",
                    "message": "User already exists"
                })
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

            if password != confirm_password:
                response_data = json.dumps({
                    "status": "error",
                    "message": "Passwords do not match"
                })
                return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

            new_user = User.objects.create_user(
                first_name=first_name,
                last_name=last_name,
                email=email,
                password=password,
                user_type=user_type
            )

            response_data = json.dumps({
                "status": "success",
                "user_id": new_user.id
            })
            return Response(response_data, status=status.HTTP_201_CREATED)



        # If serializer is invalid
        response_data = json.dumps({
            "status": "error",
            "message": "Invalid data",
            "errors": serializer.errors
        })
        return Response(response_data, status=status.HTTP_400_BAD_REQUEST)

    # Handle unsupported methods
    response_data = json.dumps({
        "status": "error",
        "message": "Invalid request method"
    })
    return Response(response_data, status=status.HTTP_405_METHOD_NOT_ALLOWED)




@api_view(["POST"])
@permission_classes((AllowAny,))
def login_api(request):
    """
    Login api for user authentication
    Args:
        request:
    Returns:    
        Response:
        data:
            - status
            - message
        status code:
    """
    if request.method == "POST":
    
        body = json.loads(request.body)
        email = body["email"]
        password = body["password"]

        if email is None or password is None:
            data = json.dumps({
                "status": "error",
                "message": 'Please provide both username and password'
            })
            return Response(data,
                            status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(email=email, password=password)

        if not user:

            data = json.dumps({
                "status": "error",
                "message": 'Invalid Credentials'
            })
            return Response(data, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_active:
            data = json.dumps({
                "status": "error",
                "message": 'User is inactive, please contact admin'
            })

            return Response(data, status=status.HTTP_400_BAD_REQUEST)

        token, _ = Token.objects.get_or_create(user=user)
        

        try:
            profile = Profile.objects.get(user_id=user.id)
            first_login = profile.first_login
            user_number = profile.phone_number

        except Profile.DoesNotExist:
            first_login = True
            user_number = ''


        otp = ''.join([str(random.randint(0, 9)) for _ in range(5)])

        # OneTimePin.objects.update_or_create(
        #     user_id=user.id,
        #     defaults={
        #         'pin': otp
        #     }
        # )

        user.last_login = datetime.now()
        user.save()

        user_serlializer = UserModelSerializer(user)

        response_data ={
            "status": "success",
            "token": token.key,
            "first_login": first_login,
            "user_number": user_number,
            "new_pin": otp,
            "user": user_serlializer.data
        }


        return Response(response_data,status=status.HTTP_200_OK)

    else:
        data = {
            'status': "error",
            'message': constants.INVALID_REQUEST_METHOD
        }
        return Response(data, status.HTTP_405_METHOD_NOT_ALLOWED)



@permission_classes([AllowAny])
@api_view(['GET'])
def get_user_types_api(request):
    """
    Get all user types in the database

    Args:
        request:
    Returns:
        Response:
            data:
                status:
                message:
                data:
            status code:
    """
 
    if request.method == 'GET':

        user_types = UserType.objects.all()
        serializer = UserTypeModelSerializer(user_types, many=True)

        try:
            data = {
                'status': "success",
                'user_types': serializer.data
            }
            return Response(data, status=status.HTTP_200_OK)

        except KeyError:
            data = {
                'status': "error",
                'message': "Error during getting user types."
            }
            return Response(data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    else:
        data = {
            'status': "error",
            'message': constants.INVALID_REQUEST_METHOD
        }
        return Response(data, status.HTTP_405_METHOD_NOT_ALLOWED)



@api_view(['GET'])
def get_users_api(request):

    """
    Get all users api

    Args:
        request:
    Returns:
        Response:
            data:
                - status
                - message
                - data
            status code:
    """
    if request.method == "GET":
        users = User.objects.all()

        serializer = GetAlltUserModelSerializer(users, many=True).data

        try:
            data = {
                'status': "success",
                'users': serializer
            }
            return Response(data, status=status.HTTP_200_OK)

        except KeyError:
            data = {
                'status': "error",
                'message': "Error during getting users."
            }
            return Response(data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    else:
        data = {
            'status': "error",
            'message': "Invalid request method."
        }
        return Response(data, status.HTTP_405_METHOD_NOT_ALLOWED)



@api_view(['POST', 'PUT'])
def update_user_api(request):
    print('executing update_user_api')
    if request.method == 'POST':
        try:
            # More robust way to parse request body
            if isinstance(request.body, bytes) and request.body:
                try:
                    body = json.loads(request.body)
                except json.JSONDecodeError:
                    print("Failed to parse JSON from bytes body")
                    body = request.data
            else:
                body = request.data
            
            
            # If body is empty or None, use request.data
            if not body:
                body = request.data
            
            serializer = UserUpdateSerializer(data=body)

            if serializer.is_valid():
                validated_data = serializer.validated_data
                user_id = validated_data.get('user_id')
                email = validated_data.get('email')

                # Check for duplicate email
                if User.objects.exclude(id=user_id).filter(email=email).exists():
                    return Response({
                        'status': "error",
                        'message': f"User with email {email} already exists."
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Fetch the user
                try:
                    user = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    return Response({
                        'status': "error",
                        'message': f"User with id {user_id} does not exist."
                    }, status=status.HTTP_400_BAD_REQUEST)

                user_type_id = validated_data.get('user_type_id')
                try:
                    user_type = UserType.objects.get(id=user_type_id)
                except UserType.DoesNotExist:
                    return Response({
                        'status': "error",
                        'message': f"User type with id {user_type_id} does not exist."
                    }, status=status.HTTP_400_BAD_REQUEST)

                email_change = False
                if not user.email == validated_data.get('email'):
                    email_change = True

                # Update user data
                user.first_name = validated_data.get('first_name')
                user.last_name = validated_data.get('last_name')
                user.email = validated_data.get('email')
                user.user_type_id = user_type.id
                user.save()

                return Response({
                    'status': "success",
                    'message': "User updated successfully.",
                    'user_type': str(user_type.name).lower(),
                    "email_change": email_change
                }, status=status.HTTP_200_OK)

            else:
                print('Serializer errors:', serializer.errors)
                return Response({
                    'status': "error",
                    'message': str(serializer.errors)
                }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            print(f"Exception in update_user_api: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({
                'status': "error",
                'message': f"An error occurred: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        return Response({
            'status': "error",
            'message': "Invalid request method. Use POST."
        }, status=status.HTTP_405_METHOD_NOT_ALLOWED)


@api_view(['POST'])
@authentication_classes([authentication.TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def logout_api(request):
    """
    Logout api for user authentication

    Args:
        request:
    Returns:
        Response:
            data:
                - status
                - message
            status code:
                - message
    """
    token = request.auth
    token.delete()
    response_data = json.dumps({'message': 'Logged out'})
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes((AllowAny,))
def create_users_api(request):
    """
    Create user API for user registration
    Args:
        request: HTTP request containing user data
    Returns:
        Response:
            data:
                - status
                - message
                - user (optional)
                - token (optional)
            status code:
    """
    if request.method == "POST":
        try:
            # Parse request body
            if request.content_type == 'application/json':
                body = json.loads(request.body)
            else:
                body = request.data

            # Validate required fields
            required_fields = [
                'email', 'password', 'confirm_password', 'first_name', 
                'last_name', 'user_type_id', 'phone_number', 'street_address',
                'suburb', 'city', 'province'
            ]
            
            missing_fields = [field for field in required_fields if not body.get(field)]
            if missing_fields:
                data = {
                    "status": "error",
                    "message": f"Missing required fields: {', '.join(missing_fields)}"
                }
                return Response(data, status=status.HTTP_400_BAD_REQUEST)

            # Create serializer instance
            serializer = CreateUserSerializer(data=body)
            
            if serializer.is_valid():
                # Create user
                user = serializer.save()
                
                # Set user_created_by if provided in request
                if body.get('user_created_by'):
                    try:
                        created_by_user = User.objects.get(id=body['user_created_by'])
                        user.user_created_by = created_by_user
                        user.save()
                    except User.DoesNotExist:
                        pass  # Continue without setting created_by if user doesn't exist
                
                # Generate token for the new user
                token, _ = Token.objects.get_or_create(user=user)
                
                # Generate OTP (if needed)
                otp = ''.join([str(random.randint(0, 9)) for _ in range(5)])
                
                # Get profile information
                try:
                    profile = Profile.objects.get(user_id=user.id)
                    first_login = profile.first_login
                    user_number = profile.phone_number
                except Profile.DoesNotExist:
                    first_login = True
                    user_number = body.get('phone_number', '')
                
                # Update last login
                user.last_login = datetime.now()
                user.save()
                
                # Serialize user data
                user_serializer = UserModelSerializer(user)
                
                response_data = {
                    "status": "success",
                    "message": "User created successfully",
                    "token": token.key,
                    "first_login": first_login,
                    "user_number": user_number,
                    "new_pin": otp,
                    "user": user_serializer.data
                }
                
                return Response(response_data, status=status.HTTP_201_CREATED)
            
            else:
                # Return validation errors
                error_messages = []
                for field, errors in serializer.errors.items():
                    for error in errors:
                        error_messages.append(f"{field}: {error}")
                
                data = {
                    "status": "error",
                    "message": "; ".join(error_messages)
                }
                return Response(data, status=status.HTTP_400_BAD_REQUEST)
                
        except json.JSONDecodeError:
            data = {
                "status": "error",
                "message": "Invalid JSON format"
            }
            return Response(data, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            data = {
                "status": "error",
                "message": f"An error occurred: {str(e)}"
            }
            return Response(data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    else:
        data = {
            'status': "error",
            'message': constants.INVALID_REQUEST_METHOD
        }
        return Response(data, status=status.HTTP_405_METHOD_NOT_ALLOWED)