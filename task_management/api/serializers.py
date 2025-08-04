
from rest_framework import serializers
from task_management.models import Task



class TaskSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.email')
    
    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'due_date',
            'priority',
            'recurrence',
            'user'
        ]

class GetAllTaskSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.email')
    
    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'due_date',
            'priority',
            'recurrence',
            'user'
        ]



class GetSingleTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'due_date', 'completed']



class UpdateTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['title', 'description', 'due_date', 'priority', 'recurrence', 'completed']
