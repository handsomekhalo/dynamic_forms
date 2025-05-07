from rest_framework import serializers

from application_management.models import FormQuestionAssignment, FormType, MainCategory


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



class SelectAllCategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = MainCategory
        fields = ['id', 'name', 'description', 'order']


class SelectCategoryBasedOnIdSerializer(serializers.ModelSerializer):
    class Meta:
        model = MainCategory
        fields = ['id', 'name', 'description', 'order']

# class AssignQuestionToFormSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FormQuestionAssignment
#         fields = ['question', 'main_category', 'form_type', 'order']

#     def validate(self, data):
#         # Check if this assignment already exists
#         if FormQuestionAssignment.objects.filter(
#             question=data['question'],
#             main_category=data['main_category'],
#             form_type=data['form_type']
#         ).exists():
#             raise serializers.ValidationError("This question is already assigned to this category and form.")
#         return data
    

# class AssignCategoryToFormSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FormQuestionAssignment
#         fields = ['form_type', 'main_category', 'question', 'order']  # Add order if necessary

class GetAllFormTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormType
        fields = ['id', 'name', 'description', 'is_active', 'date_created']


class GetUnassignedCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MainCategory
        fields = ['id', 'name', 'description']