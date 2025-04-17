

import json
from requests import Response
from system_management import constants
from system_management.api.serializers import RegisterSerializer
from system_management.models import User, UserType
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token

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

                print('user_type',user_type)
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


        print('skipped')
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
