from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
# AssignCategoryToFormSerializer,
from application_management.models import FormCategoryAssignment, FormQuestionAssignment, FormType, MainCategory

from rest_framework import status
from .serializers import AssignCategoryToFormSerializer, AssignQuestionToFormSerializer, CreateMainCategorySerializer, FormCategoriesResponseSerializer, FormCategoryAssignmentSerializer, FormTypeSerializer, GetAllFormTypeSerializer, GetUnassignedCategorySerializer, MainCategorySerializer, RemoveCategoryAssignmentSerializer, SelectAllCategoriesSerializer, SelectCategoryBasedOnIdSerializer, UnassignCategorySerializer,UpdateFormeSerializer
from django.db import transaction




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
    

# @api_view(['POST'])
# def assign_question_to_form_api(request):
#     """
#     Assign a question to a specific form and category (activates it if previously soft-deleted).
#     """
#     serializer = AssignQuestionToFormSerializer(data=request.data)

#     if not serializer.is_valid():
#         return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

#     form_type = serializer.validated_data['form_type']
#     main_category = serializer.validated_data['main_category']
#     question_text = serializer.validated_data['question_text']

#     try:
#         # Check if the question already exists (even if inactive)
#         existing_question = main_category.question_set.filter(question=question_text).first()

#         if existing_question:
#             if existing_question.is_active:
#                 return Response({
#                     "status": "error",
#                     "message": "This question is already active in this category."
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             # Reactivate it
#             existing_question.is_active = True
#             existing_question.save()

#             return Response({
#                 "status": "success",
#                 "message": "Question reactivated and assigned successfully.",
#                 "question_id": existing_question.id
#             }, status=status.HTTP_200_OK)

#         # Create new question
#         new_question = Question.objects.create(
#             question=question_text,
#             main_category=main_category,
#             is_active=True
#         )

#         return Response({
#             "status": "success",
#             "message": "Question assigned to form successfully.",
#             "question_id": new_question.id
#         }, status=status.HTTP_201_CREATED)

#     except Exception as e:
#         return Response({
#             "status": "error",
#             "message": f"An unexpected error occurred: {str(e)}"
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)






@api_view(['POST'])
def assign_question_and_category_to_form_api(request):
    """
    Assign a question to a specific form type and category,
    but prevent duplicate assignments.
    """
    serializer = AssignQuestionToFormSerializer(data=request.data)
    
    if serializer.is_valid():
        question = serializer.validated_data['question']
        main_category = serializer.validated_data['main_category']
        form_type = serializer.validated_data['form_type']

        # Check for existing assignment
        exists = FormQuestionAssignment.objects.filter(
            question=question,
            main_category=main_category,
            form_type=form_type
        ).exists()

        if exists:
            return Response({
                "status": "error",
                "message": "This question is already assigned to this form and category."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # Save the new assignment if no duplicate is found
                assignment = serializer.save()
                return Response({
                    "status": "success",
                    "message": "Question assigned to form successfully.",
                    "assignment": AssignQuestionToFormSerializer(assignment).data
                }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                "status": "error",
                "message": f"An error occurred: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['POST'])
# def assign_question_and_category_to_form_api(request):
#     """
#     Assign a question to a form and category — if the category isn't yet added to the form, add it.
#     """
#     serializer = AssignQuestionToFormSerializer(data=request.data)

#     if not serializer.is_valid():
#         return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

#     form_type = serializer.validated_data['form_type']
#     main_category = serializer.validated_data['main_category']
#     question_text = serializer.validated_data['question_text']

#     try:
#         # Attach the category to the form if not already assigned
#         if not form_type.categories.filter(id=main_category.id).exists():
#             form_type.categories.add(main_category)

#         # Check if question exists (even if inactive)
#         existing_question = main_category.question_set.filter(question=question_text).first()

#         if existing_question:
#             if existing_question.is_active:
#                 return Response({
#                     "status": "error",
#                     "message": "This question is already active in this category."
#                 }, status=status.HTTP_400_BAD_REQUEST)

#             # Reactivate it
#             existing_question.is_active = True
#             existing_question.save()

#             return Response({
#                 "status": "success",
#                 "message": "Question reactivated and assigned successfully.",
#                 "question_id": existing_question.id
#             }, status=status.HTTP_200_OK)

#         # Create new question
#         new_question = Question.objects.create(
#             question=question_text,
#             main_category=main_category,
#             is_active=True
#         )

#         return Response({
#             "status": "success",
#             "message": "Question assigned to form successfully.",
#             "question_id": new_question.id
#         }, status=status.HTTP_201_CREATED)

#     except Exception as e:
#         return Response({
#             "status": "error",
#             "message": f"An error occurred: {str(e)}"
#         }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_all_categories_api(request):
    main_categories = MainCategory.objects.all().order_by('order')
    serializer = SelectAllCategoriesSerializer(main_categories, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_all_categories_by_form_id_api(request, formId):
    """
    Get all categories based on formId (this can be customized further)
    """
    try:
        # Optional: Apply filtering logic based on formId if needed in future
        main_categories = MainCategory.objects.all().order_by('order')

        # You can add filtering based on formId here if needed later
        # Example: main_categories = main_categories.filter(form_id=formId)

        # Serialize the categories
        serializer = SelectCategoryBasedOnIdSerializer(main_categories, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f"An error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
def get_all_forms_api(request):
    forms = FormType.objects.filter(is_active=True).order_by('-date_created')
    serializer = GetAllFormTypeSerializer(forms, many=True)

    print('get_all_forms_api serializer:', serializer.data)
    return Response(serializer.data, status=status.HTTP_200_OK)



@api_view(['POST'])
def assign_category_to_form_api(request):

    
    """
    Assign a category to a form type, preventing duplicates.
    """
    # Transform the incoming data to match what the serializer expects
    form_type_id = request.data.get('form_type_id')
    main_category_id = request.data.get('main_category_id')

    
    # Check if we have the required data
    if not form_type_id or not main_category_id:
        return Response({
            "status": "error",
            "message": "form_type_id and main_category_id are required fields"
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Transform the data format to match the serializer's expectations
    transformed_data = {
        'form_type': form_type_id,
        'main_category': main_category_id
    }
    
    # Check if we need to remove the assignment
   
    # If we're adding, continue with normal flow
    serializer = AssignCategoryToFormSerializer(data=transformed_data)
    
    if serializer.is_valid():
        main_category = serializer.validated_data['main_category']
        form_type = serializer.validated_data['form_type']

        # Check if this assignment already exists
        exists = FormCategoryAssignment.objects.filter(
            main_category=main_category,
            form_type=form_type
        ).exists()

        if exists:
            existing = FormCategoryAssignment.objects.get(
                main_category=main_category,
                form_type=form_type
            )
            return Response({
                "status": "success",
                "message": "This category was already assigned.",
                "assignment": AssignCategoryToFormSerializer(existing).data
            }, status=status.HTTP_200_OK)

        # if exists:
        #     return Response({
        #         "status": "success",  # Changed to success since already assigned
        #         "message": "This category is already assigned to this form."
        #     }, status=status.HTTP_200_OK)  # Changed to 200 OK since not an error

        try:
            with transaction.atomic():
                assignment = serializer.save()
                return Response({
                    "status": "success",
                    "message": "Category assigned to form successfully.",
                    "assignment": AssignCategoryToFormSerializer(assignment).data
                }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error saving assignment: {str(e)}")
            return Response({
                "status": "error",
                "message": f"An error occurred: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        print("Serializer errors:", serializer.errors)
        return Response({
            "status": "error", 
            "error": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    


@api_view(["POST"])
def unassign_category_api(request):
    serializer = UnassignCategorySerializer(data=request.data)

    # Check if the serializer is valid
    if serializer.is_valid():
        form_type_id = serializer.validated_data['form_type_id']
        main_category_id = serializer.validated_data['main_category_id']
        deactivate = serializer.validated_data['deactivate']


        try:
            # Retrieve the FormType and MainCategory objects based on the IDs
            form_type = FormType.objects.get(id=form_type_id)

            main_category = MainCategory.objects.get(id=main_category_id)
        except (FormType.DoesNotExist, MainCategory.DoesNotExist) as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

        # Remove the category assignment
        FormCategoryAssignment.objects.filter(
            form_type=form_type,
            main_category=main_category
        ).delete()
        
        # Optionally deactivate the category (soft delete)
        if deactivate:
            if hasattr(main_category, 'is_active'):
                main_category.is_active = False
                main_category.save()

        return Response({"message": "Category unassigned successfully."}, status=status.HTTP_200_OK)



@api_view(['GET'])
def get_unassigned_categories_api(request, form_type_id):
    try:
        form_type = FormType.objects.get(id=form_type_id)
    except FormType.DoesNotExist:
        return Response({'error': 'FormType not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Get all category IDs assigned to this form type
    assigned_ids = form_type.categories.values_list('id', flat=True)

    # Exclude assigned categories
    unassigned_categories = MainCategory.objects.exclude(id__in=assigned_ids)

    serializer = GetUnassignedCategorySerializer(unassigned_categories, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)






@api_view(['POST'])
def assign_or_update_category_api(request):
    
    form_type_id = request.data.get('form_type_id')
    main_category_id = request.data.get('main_category_id')  # always required
    old_main_category_id = request.data.get('old_main_category_id')  # optional
    
    if not form_type_id or not main_category_id:
        return Response({
            "status": "error",
            "message": "form_type_id and main_category_id are required fields"
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # If updating an existing assignment
        if old_main_category_id:
            updated_count = FormCategoryAssignment.objects.filter(
                form_type_id=form_type_id,
                main_category_id=old_main_category_id
            ).update(main_category_id=main_category_id)
            
            if updated_count:
                # Get all assignments after update
                assignments = FormCategoryAssignment.objects.filter(form_type_id=form_type_id)
                assigned_category_ids = [assignment.main_category_id for assignment in assignments]
                
                return Response({
                    "status": "success",
                    "message": "Category updated successfully.",
                    "assigned_categories": assigned_category_ids
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "status": "error",
                    "message": "No existing assignment to update."
                }, status=status.HTTP_404_NOT_FOUND)
        
        # If assigning a new category
        else:
            if FormCategoryAssignment.objects.filter(
                form_type_id=form_type_id,
                main_category_id=main_category_id
            ).exists():
                # Get all assignments (including existing one)
                assignments = FormCategoryAssignment.objects.filter(form_type_id=form_type_id)
                assigned_category_ids = [assignment.main_category_id for assignment in assignments]
                
                return Response({
                    "status": "success",
                    "message": "This category is already assigned to this form.",
                    "assigned_categories": assigned_category_ids
                }, status=status.HTTP_200_OK)
            
            # Create new assignment
            new_assignment = FormCategoryAssignment.objects.create(
                form_type_id=form_type_id,
                main_category_id=main_category_id
            )
            
            # Get all assignments after creation
            assignments = FormCategoryAssignment.objects.filter(form_type_id=form_type_id)
            assigned_category_ids = [assignment.main_category_id for assignment in assignments]
            
            return Response({
                "status": "success",
                "message": "Category assigned to form successfully.",
                "assigned_categories": assigned_category_ids
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        return Response({
            "status": "error",
            "message": f"An unexpected error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

@api_view(['GET'])
def get_form_categories_api(request, form_type_id):
    """
    Get all categories assigned to a specific form type
    """
    try:
        # Get all assignments for this form type
        assignments = FormCategoryAssignment.objects.filter(form_type_id=form_type_id)
        
        # Extract just the category IDs
        assigned_category_ids = [assignment.main_category_id for assignment in assignments]
        
        # Prepare response data
        response_data = {
            "status": "success",
            "assigned_categories": assigned_category_ids
        }
        
        # Use the serializer to format the response
        serializer = FormCategoriesResponseSerializer(response_data)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            "status": "error",
            "message": f"An unexpected error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['POST'])
def remove_category_assignment_api(request):
    """
    Remove a category assignment from a form type
    """
    # Validate input data
    serializer = RemoveCategoryAssignmentSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({
            "status": "error",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    form_type_id = serializer.validated_data['form_type_id']
    main_category_id = serializer.validated_data['main_category_id']
    
    try:
        # Delete the assignment
        deleted, _ = FormCategoryAssignment.objects.filter(
            form_type_id=form_type_id,
            main_category_id=main_category_id
        ).delete()
        
        # Get remaining assignments
        assignments = FormCategoryAssignment.objects.filter(form_type_id=form_type_id)
        assignment_data = FormCategoryAssignmentSerializer(assignments, many=True).data
        assigned_category_ids = [assignment.main_category_id for assignment in assignments]
        
        # Prepare response with both IDs and full assignment details
        response_data = {
            "status": "success",
            "message": "Category assignment removed successfully.",
            "assigned_categories": assigned_category_ids,
            "assignments": assignment_data
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({
            "status": "error",
            "message": f"An unexpected error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

@api_view(['GET'])
def get_assigned_categories_api(request, form_type_id):
    """
    Get the categories assigned to a specific form type.
    """
    try:
        # Get the assignments for the given form_type_id
        assignments = FormCategoryAssignment.objects.filter(form_type_id=form_type_id)
        
        if not assignments.exists():
    # Instead of 404, return empty list with success
            return Response({
                "status": "success",
                "assigned_categories": []
            }, status=status.HTTP_200_OK)

        
        # Extract the assigned main categories
        assigned_categories = [assignment.main_category for assignment in assignments]
        
        # Serialize the categories
        category_serializer = MainCategorySerializer(assigned_categories, many=True)
        
        # Prepare the response data
        response_data = {
            "status": "success",
            "assigned_categories": category_serializer.data
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            "status": "error",
            "message": f"An unexpected error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def update_form_api(request):
    """
    Updates an existing form type based on formId.
    """
    data = request.data
    form_id = data.get('formId')

    if not form_id:
        return Response({"status": "error", "message": "formId is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        form_type = FormType.objects.get(id=form_id)
    except FormType.DoesNotExist:
        return Response({"status": "error", "message": "Form not found."}, status=status.HTTP_404_NOT_FOUND)

    # Update fields if provided
    form_type.name = data.get('name', form_type.name)
    form_type.description = data.get('description', form_type.description)
    form_type.is_active = data.get('is_active', form_type.is_active)
    form_type.save()

    serializer = UpdateFormeSerializer(form_type)
    return Response({
        "status": "success",
        "message": "Form updated successfully.",
        "form": serializer.data
    }, status=status.HTTP_200_OK)
