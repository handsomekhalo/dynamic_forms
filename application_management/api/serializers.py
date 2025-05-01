from rest_framework import serializers

from application_management.models import FormType


class FormTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormType
        fields = ['id', 'name', 'description', 'is_active', 'date_created']
        read_only_fields = ['id', 'date_created']
