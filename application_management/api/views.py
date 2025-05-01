from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
# AssignCategoryToFormSerializer,
from application_management.api.serializers import  AssignQuestionToFormSerializer, FormTypeSerializer, CreateMainCategorySerializer, GetAllFormTypeSerializer, SelectAllCategoriesSerializer
from application_management.models import FormQuestionAssignment, FormType, MainCategory



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




@api_view(['POST'])
def create_category_api(request):
    """
    This API creates a new category (MainCategory) for organizing form sections.
    """
    serializer = CreateMainCategorySerializer(data=request.data)
    
    if serializer.is_valid():
        name = serializer.validated_data.get('name')

        # Check if category with this name already exists
        if MainCategory.objects.filter(name=name).exists():
            return Response({"error": "A category with this name already exists."}, status=status.HTTP_400_BAD_REQUEST)

        category = serializer.save()
        return Response({
            "status": "success",
            "message": "Category created successfully.",
            "category": CreateMainCategorySerializer(category).data
        }, status=status.HTTP_201_CREATED)

    return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)




@api_view(['POST'])
def assign_question_to_form_api(request):
    """
    This API assigns a question to a specific form and category.
    """
    serializer = AssignQuestionToFormSerializer(data=request.data)
    if serializer.is_valid():
        form_type = serializer.validated_data['form_type']
        main_category = serializer.validated_data['main_category']
        question = serializer.validated_data['question']
        
        # Prevent duplicates
        if FormQuestionAssignment.objects.filter(form_type=form_type, main_category=main_category, question=question).exists():
            return Response(
                {"error": "This question is already assigned to the form with this category."},
                status=status.HTTP_400_BAD_REQUEST
            )


        assignment = serializer.save()
        return Response({
            "status": "success",
            "message": "Question assigned to form successfully.",
            "assignment": AssignQuestionToFormSerializer(assignment).data
        }, status=status.HTTP_201_CREATED)
    else:
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
def assign_question_and_category_to_form_api(request):
    """
    This API assigns a question to a specific form and category.
    """
    serializer = AssignQuestionToFormSerializer(data=request.data)
    if serializer.is_valid():
        # Save the new assignment if valid
        assignment = serializer.save()
        return Response({
            "status": "success",
            "message": "Question assigned to form successfully.",
            "assignment": AssignQuestionToFormSerializer(assignment).data
        }, status=status.HTTP_201_CREATED)
    else:
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_all_categories_api(request):
    main_categories = MainCategory.objects.all().order_by('order')
    serializer = SelectAllCategoriesSerializer(main_categories, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)




@api_view(['GET'])
def get_all_forms_api(request):
    forms = FormType.objects.filter(is_active=True).order_by('-date_created')
    serializer = GetAllFormTypeSerializer(forms, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)