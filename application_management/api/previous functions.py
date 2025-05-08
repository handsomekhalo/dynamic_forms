# @api_view(['POST'])
# def assign_category_to_form_api(request):
#     print('api layer')
#     """
#     Assign a category to a form type, preventing duplicates.
#     """
#     serializer = AssignCategoryToFormSerializer(data=request.data)
    
#     if serializer.is_valid():
#         main_category = serializer.validated_data['main_category']
#         form_type = serializer.validated_data['form_type']

#         # Check if this assignment already exists
#         exists = FormCategoryAssignment.objects.filter(
#             main_category=main_category,
#             form_type=form_type
#         ).exists()

#         if exists:
#             return Response({
#                 "status": "error",
#                 "message": "This category is already assigned to this form."
#             }, status=status.HTTP_400_BAD_REQUEST)

#         try:
#             with transaction.atomic():
#                 assignment = serializer.save()
#                 return Response({
#                     "status": "success",
#                     "message": "Category assigned to form successfully.",
#                     "assignment": AssignCategoryToFormSerializer(assignment).data
#                 }, status=status.HTTP_201_CREATED)
#         except Exception as e:
#             return Response({
#                 "status": "error",
#                 "message": f"An error occurred: {str(e)}"
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def assign_category_to_form_api(request):
    print('api layer executing')
    print('request data:', request.data)
    print('request headers:', request.headers)
    
    """
    Assign a category to a form type, preventing duplicates.
    """
    # Transform the incoming data to match what the serializer expects
    form_type_id = request.data.get('form_type_id')
    main_category_id = request.data.get('main_category_id')

    
    print(f"Processing: form_type_id={form_type_id}, main_category_id={main_category_id}")
    
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
            print('exisitng')
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
    


@api_view(['POST'])
def assign_or_update_category_api(request):
    print('API Layer executing')
    print('Request Data:', request.data)

    form_type_id = request.data.get('form_type_id')
    old_main_category_id = request.data.get('main_category_id')
    new_main_category_id = request.data.get('old_main_category_id')  # Optional for update

    if not form_type_id or not new_main_category_id:
        return Response({
            "status": "error",
            "message": "form_type_id and main_category_id are required fields"
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Update case: when old_main_category_id is present
        if old_main_category_id:
            updated_count = FormCategoryAssignment.objects.filter(
                form_type_id=form_type_id,
                main_category_id=old_main_category_id
            ).update(main_category_id=new_main_category_id)

            if updated_count:
                return Response({
                    "status": "success",
                    "message": "Category updated successfully."
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    "status": "error",
                    "message": "No existing assignment to update."
                }, status=status.HTTP_404_NOT_FOUND)

        # Create case (POST)
        else:
            if FormCategoryAssignment.objects.filter(
                form_type_id=form_type_id,
                main_category_id=new_main_category_id
            ).exists():
                return Response({
                    "status": "success",
                    "message": "This category is already assigned to this form."
                }, status=status.HTTP_200_OK)

            # Create assignment
            serializer = AssignCategoryToFormSerializer(data={
                'form_type': form_type_id,
                'main_category': new_main_category_id
            })
            if serializer.is_valid():
                assignment = serializer.save()
                return Response({
                    "status": "success",
                    "message": "Category assigned to form successfully.",
                    "assignment": updateAssignCategoryToFormSerializer(assignment).data
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    "status": "error",
                    "error": serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({
            "status": "error",
            "message": f"An unexpected error occurred: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# @api_view(['POST'])
# def assign_category_to_form_api(request):
#     print('api layer executing')
#     print('request data:', request.data)
#     print('request headers:', request.headers)
    
#     """
#     Assign a category to a form type, preventing duplicates.
#     """
#     # Transform the incoming data to match what the serializer expects
#     form_type_id = request.data.get('form_type_id')
#     main_category_id = request.data.get('main_category_id')
#     action = request.data.get('action', 'add')
    
#     print(f"Processing: form_type_id={form_type_id}, main_category_id={main_category_id}, action={action}")
    
#     # Check if we have the required data
#     if not form_type_id or not main_category_id:
#         return Response({
#             "status": "error",
#             "message": "form_type_id and main_category_id are required fields"
#         }, status=status.HTTP_400_BAD_REQUEST)
    
#     # Transform the data format to match the serializer's expectations
#     transformed_data = {
#         'form_type': form_type_id,
#         'main_category': main_category_id
#     }
    
#     # Check if we need to remove the assignment
#     if action == 'remove':
#         try:
#             # Try to find and delete the existing assignment
#             assignment = FormCategoryAssignment.objects.get(
#                 main_category_id=main_category_id,
#                 form_type_id=form_type_id
#             )
#             assignment.delete()
#             return Response({
#                 "status": "success",
#                 "message": "Category assignment removed successfully."
#             }, status=status.HTTP_200_OK)
#         except FormCategoryAssignment.DoesNotExist:
#             return Response({
#                 "status": "error",
#                 "message": "This category was not assigned to this form."
#             }, status=status.HTTP_404_NOT_FOUND)
#         except Exception as e:
#             return Response({
#                 "status": "error", 
#                 "message": f"An error occurred while removing: {str(e)}"
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
#     # If we're adding, continue with normal flow
#     serializer = AssignCategoryToFormSerializer(data=transformed_data)
    
#     if serializer.is_valid():
#         main_category = serializer.validated_data['main_category']
#         form_type = serializer.validated_data['form_type']

#         # Check if this assignment already exists
#         exists = FormCategoryAssignment.objects.filter(
#             main_category=main_category,
#             form_type=form_type
#         ).exists()

#         if exists:
#             return Response({
#                 "status": "success",  # Changed to success since already assigned
#                 "message": "This category is already assigned to this form."
#             }, status=status.HTTP_200_OK)  # Changed to 200 OK since not an error

#         try:
#             with transaction.atomic():
#                 assignment = serializer.save()
#                 return Response({
#                     "status": "success",
#                     "message": "Category assigned to form successfully.",
#                     "assignment": AssignCategoryToFormSerializer(assignment).data
#                 }, status=status.HTTP_201_CREATED)
#         except Exception as e:
#             print(f"Error saving assignment: {str(e)}")
#             return Response({
#                 "status": "error",
#                 "message": f"An error occurred: {str(e)}"
#             }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#     else:
#         print("Serializer errors:", serializer.errors)
#         return Response({
#             "status": "error", 
#             "error": serializer.errors
#         }, status=status.HTTP_400_BAD_REQUEST)
    

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