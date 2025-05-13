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
    

