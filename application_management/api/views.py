from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from application_management.api.serializers import FormTypeSerializer
from application_management.models import FormType



@api_view(['POST'])
def create_form_api(request):
    """
    This API creates a new form type (defines the purpose of the form).
    """
    data = request.data
    name = data.get('name')
    description = data.get('description', '')
    is_active = data.get('is_active', True)

    # Validation
    if not name:
        return Response({"error": "Form name is required."}, status=status.HTTP_400_BAD_REQUEST)

    # Check if form with this name already exists
    if FormType.objects.filter(name=name).exists():
        return Response({"error": "A form with this name already exists."}, status=status.HTTP_400_BAD_REQUEST)

    # Create form
    form_type = FormType.objects.create(
        name=name,
        description=description,
        is_active=is_active
    )

    serializer = FormTypeSerializer(form_type)

    return Response({
        "status": "success",
        "message": "Form created successfully.",
        "form": serializer.data
    }, status=status.HTTP_201_CREATED)