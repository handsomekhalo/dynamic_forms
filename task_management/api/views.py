"""
case management api views containing all the api functions
The following api is stored here:
    *`view list of all clients`
    *`get_client_dropdowns_api`
"""
from datetime import datetime, timezone
import json
from datetime import datetime
from anthropic import Anthropic
from django.shortcuts import get_object_or_404
# import openai
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count,Sum
from django.db.models import Q
from django.db.models.functions import TruncMonth,Coalesce
from rest_framework.decorators import api_view
from task_management.api.serializers import GetAllTaskSerializer, GetSingleTaskSerializer, TaskSerializer, UpdateTaskSerializer
from task_management.models import Task
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
# from openai import OpenAI
from django.conf import settings
import os
# openai.api_key = settings.OPEN_AI_API_KEY
# from transformers import AutoModelForCausalLM, AutoTokenizer
# import torch


# Load the model and tokenizer once at the module level
# model_name = "distilgpt2" 
# model_name = "distilgpt2" 
#  # You can change this to any suitable model, e.g., 'gpt-2'
# tokenizer = AutoTokenizer.from_pretrained(model_name)
# model = AutoModelForCausalLM.from_pretrained(model_name)


# @api_view(['POST'])
def create_task_api(request):
    """Create a new task API."""
    
    try:
        # The @api_view(['POST']) decorator already handles method validation,
        # but we can add this check for extra safety
        if request.method != "POST":
            return Response({
                "status": "error",
                "message": "Method not allowed. Use POST."
            }, status=status.HTTP_405_METHOD_NOT_ALLOWED)

        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            return Response({
                "status": "error",
                "message": "Authentication required."
            }, status=status.HTTP_401_UNAUTHORIZED)

        body = request.data
        
        # Validate that we have data
        if not body:
            return Response({
                "status": "error",
                "message": "Request body is required."
            }, status=status.HTTP_400_BAD_REQUEST)
                
        serializer = TaskSerializer(data=body)
                
        if serializer.is_valid():
            try:
                # Ensure task is saved with the current user
                task = serializer.save(user=request.user)
                
                return Response({
                    "status": "success",
                    "message": "Task created successfully.",
                    "task": GetAllTaskSerializer(task).data,
                    "task_id": task.id
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                print(f'Error saving task: {str(e)}')
                return Response({
                    "status": "error",
                    "message": "Failed to create task.",
                    "details": str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            print('Serializer errors:', serializer.errors)
            return Response({
                "status": "error",
                "message": "Invalid data provided.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        print(f'Unexpected error in create_task_api: {str(e)}')
        import traceback
        traceback.print_exc()
        return Response({
            "status": "error",
            "message": "An unexpected error occurred.",
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['GET'])
def get_all_task_api(request):
    # Get all tasks for the current user
    all_tasks = Task.objects.filter(user=request.user)
    
    serializer = GetAllTaskSerializer(all_tasks, many=True).data
    
    data = json.dumps({
        "status": "success",
        "message": "All your tasks retrieved successfully!",
        'data': serializer
    })
    
    return Response(data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_task_by_id_api(request):
    task_id = request.data.get('task_id')
    if not task_id:
        return Response({
            "status": "error",
            "message": "Task ID is required"
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        task = Task.objects.get(id=task_id)
        # Check if the current user owns this task
        if task.user.email != request.user.email:
            return Response({
                "status": "error",
                "message": "You are not authorized to access this task."
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = GetSingleTaskSerializer(task)
        return Response(json.dumps(serializer.data), status=status.HTTP_200_OK)
    except Task.DoesNotExist:
        return Response({
            "status": "error",
            "message": "Task not found"
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
def update_task_api(request):
    body = json.loads(request.body)
    task_id = body.get('task_id')

    if not task_id:
        return Response({
            "status": "error",
            "message": "Task ID is required"
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        task = Task.objects.get(id=task_id)
        # Check ownership
        if task.user.email != request.user.email:
            return Response({
                "status": "error",
                "message": "You are not authorized to update this task."
            }, status=status.HTTP_403_FORBIDDEN)

        serializer = UpdateTaskSerializer(task, data=body)
        if serializer.is_valid():
            serializer.save()
            return Response(json.dumps({
                'status': 'success',
                'message': 'Task updated successfully',
                'data': serializer.data
            }), status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except Task.DoesNotExist:
        return Response({
            "status": "error",
            "message": "Task not found"
        }, status=status.HTTP_404_NOT_FOUND)



@api_view(['POST'])
def delete_task_api(request):
    task_id = request.data.get('task_id')

    if not task_id:
        return Response({
            "status": "error",
            "message": "Task ID is required"
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        task = Task.objects.get(id=task_id)
        # Check ownership
        if task.user.email != request.user.email:
            return Response({
                "status": "error",
                "message": "You are not authorized to delete this task."
            }, status=status.HTTP_403_FORBIDDEN)

        task.delete()
        return Response({
            "status": "success",
            "message": "Task deleted successfully"
        }, status=status.HTTP_200_OK)
    except Task.DoesNotExist:
        return Response({
            "status": "error",
            "message": "Task not found"
        }, status=status.HTTP_404_NOT_FOUND)


# Set OpenAI API key
# openai.api_key = settings.OPENAI_API_KEY




# @api_view(['POST'])
# def suggest_task_api(request):
    """Suggest a title or description for a new task based on keywords provided."""
    user_input = request.data.get("input", "")
    
    if not user_input:
        return Response({
            "status": "error",
            "message": "No input provided for task suggestion."
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Prepare input for the model
        input_ids = tokenizer.encode(f"Suggest a task based on: {user_input}", return_tensors="pt")

        # Generate the response
        with torch.no_grad():
            output = model.generate(input_ids, max_length=50, num_return_sequences=1, temperature=0.7)

        # Decode the output into text
        suggestion = tokenizer.decode(output[0], skip_special_tokens=True).strip()

        return Response({
            "status": "success",
            "suggestion": suggestion
        }, status=status.HTTP_200_OK)

    except Exception as e:  # Catch general exceptions
        return Response({
            "status": "error",
            "message": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)