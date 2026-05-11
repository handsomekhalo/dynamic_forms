from rest_framework import serializers

from application_management.models import FormCategoryAssignment, FormQuestionAssignment, FormType, MainCategory
from form_portal_management.api.serailizers import GetCategoryWithQuestionsAssignedSerializer


class FormTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormType
        fields = ['id', 'name', 'description', 'is_active', 'date_created']
        read_only_fields = ['id', 'date_created']


class CreateMainCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MainCategory
        fields = ['id', 'name', 'description', 'order', 'date_created']
        read_only_fields = ['id', 'date_created']



class AssignQuestionToFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormQuestionAssignment
        fields = ['question', 'main_category', 'form_type', 'order']

    def validate(self, data):
        # Check if this assignment already exists
        if FormQuestionAssignment.objects.filter(
            question=data['question'],
            main_category=data['main_category'],
            form_type=data['form_type']
        ).exists():
            raise serializers.ValidationError("This question is already assigned to this category and form.")
        return data

# # serializers.py
# class AssignQuestionToFormSerializer(serializers.Serializer):
#     form_type_id = serializers.IntegerField()
#     main_category_id = serializers.IntegerField()
#     question_text = serializers.CharField(max_length=1000)

#     def validate(self, data):
#         form_type_id = data['form_type_id']
#         main_category_id = data['main_category_id']

#         # Ensure the category belongs to the form
#         try:
#             form_type = FormType.objects.get(id=form_type_id)
#         except FormType.DoesNotExist:
#             raise serializers.ValidationError("Form type does not exist.")

#         if not form_type.categories.filter(id=main_category_id).exists():
#             raise serializers.ValidationError("Main category is not assigned to this form.")

#         data['form_type'] = form_type
#         data['main_category'] = MainCategory.objects.get(id=main_category_id)
#         return data


class SelectAllCategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = MainCategory
        fields = ['id', 'name', 'description', 'order']


class SelectCategoryBasedOnIdSerializer(serializers.ModelSerializer):
    class Meta:
        model = MainCategory
        fields = ['id', 'name', 'description', 'order']


class GetAllFormTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormType
        fields = ['id', 'name', 'description', 'is_active', 'date_created']


class GetAllFormTypeSerializer(serializers.ModelSerializer):
    categories = serializers.SerializerMethodField()

    class Meta:
        model = FormType
        fields = ['id', 'name', 'description', 'is_active', 'date_created', 'categories']

    def get_categories(self, obj):
        assignments = FormCategoryAssignment.objects.filter(form_type=obj)
        return [{'id': a.main_category.id, 'name': a.main_category.name} for a in assignments]
class GetUnassignedCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MainCategory
        fields = ['id', 'name', 'description']

class AssignCategoryToFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormCategoryAssignment
        fields = ['form_type', 'main_category']
        read_only_fields = ['date_created']


class updateAssignCategoryToFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormCategoryAssignment
        fields = ['form_type_id', 'main_category']
        read_only_fields = ['date_created']


class UnassignCategorySerializer(serializers.Serializer):
    form_type_id = serializers.IntegerField()
    main_category_id = serializers.IntegerField()
    deactivate = serializers.BooleanField(default=False)



# Serializer for returning form category assignments
class FormCategoryAssignmentSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='main_category.name', read_only=True)
    
    class Meta:
        model = FormCategoryAssignment
        fields = ['id', 'form_type', 'main_category', 'category_name', 'date_created']
        read_only_fields = ['date_created']

# Serializer for the GET form-categories endpoint
class FormCategoriesResponseSerializer(serializers.Serializer):
    assigned_categories = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="List of category IDs assigned to the form"
    )
    
    # Optional - include more category details
    category_details = serializers.SerializerMethodField()
    
    def get_category_details(self, obj):
        # This assumes obj contains 'assigned_categories' list of IDs
        category_ids = obj.get('assigned_categories', [])
        categories = MainCategory.objects.filter(id__in=category_ids)
        return [
            {
                'id': category.id,
                'name': category.name,
                'description': category.description,
                'order': category.order
            }
            for category in categories
        ]

# Input serializer for removing category assignment
class RemoveCategoryAssignmentSerializer(serializers.Serializer):
    form_type_id = serializers.IntegerField(required=True)
    main_category_id = serializers.IntegerField(required=True)
    
    def validate(self, data):
        """
        Check that the assignment exists before attempting to remove it
        """
        form_type_id = data.get('form_type_id')
        main_category_id = data.get('main_category_id')
        
        # Verify the form type exists
        try:
            form_type = FormType.objects.get(id=form_type_id)
        except FormType.DoesNotExist:
            raise serializers.ValidationError(f"Form type with ID {form_type_id} does not exist.")
        
        # Verify the category exists
        try:
            category = MainCategory.objects.get(id=main_category_id)
        except MainCategory.DoesNotExist:
            raise serializers.ValidationError(f"Category with ID {main_category_id} does not exist.")
        
        # Verify the assignment exists
        assignment_exists = FormCategoryAssignment.objects.filter(
            form_type_id=form_type_id,
            main_category_id=main_category_id
        ).exists()
        
        if not assignment_exists:
            raise serializers.ValidationError(
                f"No assignment exists between form type {form_type_id} and category {main_category_id}."
            )
        
        return data

class MainCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MainCategory
        fields = ['id', 'name', 'description', 'order', 'is_active']



class UpdateFormeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormType
        fields = ['id', 'name', 'description', 'is_active', 'date_created']
        read_only_fields = ['id', 'date_created']


class GetFormDetailsSerializer(serializers.ModelSerializer):
    categories = serializers.SerializerMethodField()

    class Meta:
        model = FormType
        fields = ['id', 'name', 'description', 'is_active', 'categories']

    def get_categories(self, obj):
        category_links = FormCategoryAssignment.objects.filter(form_type_id=obj.id)
        categories = MainCategory.objects.filter(
            id__in=category_links.values_list('main_category_id', flat=True)
        ).order_by('order')
        return GetCategoryWithQuestionsAssignedSerializer(
            categories,
            many=True,
            context={'form_id': obj.id}
        ).data


