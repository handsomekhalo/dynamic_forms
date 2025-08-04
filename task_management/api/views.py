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


@api_view(['POST'])
def create_task_api(request):
    """Create a new task API."""
    
    if request.method == "POST":
        body = request.data        
        serializer = TaskSerializer(data=body)
        
        if serializer.is_valid():
            task = serializer.save()  # Save the task using the serializer
            return Response({
                "status": "success",
                "message": "Task created successfully.",
                "task": TaskSerializer(task).data,
                "task_id": task.id
            }, status=status.HTTP_201_CREATED)
        else:
            print('Serializer errors:', serializer.errors)  # Log serializer errors
            return Response({
                "status": "error",
                "message": "Invalid data",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_all_task_api(request):
    all_tasks = Task.objects.all()
    all_task_serializer = GetAllTaskSerializer(all_tasks, many=True).data
    data = json.dumps({
            "status": "success",
            "message": "Case data retrieved successfully!",
            'data': all_task_serializer

        })

    return Response(data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_task_by_id_api(request):
    """
    Retrieve a single task by its ID provided in the request body (if required for GET method).
    
    :param request: Django request parameter containing task_id in the request body.
    :return: JSON response with the task details or error.
    """
    if request.method == 'GET':
        try:
            body = json.loads(request.body)

            print('body',body)
            task_id = body.get('task_id')

            if not task_id:
                return Response(json.dumps({
                    'status': "error",
                    'message': "task_id is required"
                }), status=status.HTTP_400_BAD_REQUEST)

            # Get the task by ID
            try:
                task = Task.objects.get(id=task_id)
            except Task.DoesNotExist:
                return Response(json.dumps({
                    'status': "error",
                    'message': "Task not found"
                }), status=status.HTTP_404_NOT_FOUND)

            # Serialize and return the task data
            single_task_serializer = GetSingleTaskSerializer(task)

            data = json.dumps({
            "status": "success",
            "message": "Case data retrieved successfully!",
            'data': single_task_serializer

        })

            return Response(data, status=status.HTTP_200_OK)

        except json.JSONDecodeError:
            return Response(json.dumps({
                'status': "error",
                'message': "Invalid JSON format"
            }), status=status.HTTP_400_BAD_REQUEST)
    else:
        return Response({
            'status': "error",
            'message': "Invalid request method"
        }, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    

@api_view(['PUT'])
def update_task_api(request):
    """
    Update a task by ID, with the task_id received from the request body.
    
    :param request: Django request parameter with task details in the body.
    :return: JSON response with the updated task data or error.
    """
    if request.method == 'PUT':
        print('inside API')
        body = json.loads(request.body)
        print('body',body)
        id = body.get('task_id')
        print('task_id',id)

        # Check if task_id is provided
        if not id:
            return Response({"status": "error", "message": "Task ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Find the task by id
        try:
            task = Task.objects.get(id=id)
            print('TASK IS TASK', task)
        except Task.DoesNotExist:
            print('non exists')
            return Response({"status": "error", "message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)

        # Validate and update task data
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

@api_view(['POST'])
def delete_task_api(request):
    """
    Delete a task by ID, with the task_id received from the request body.

    :param request: Django request parameter with task_id in the body.
    :return: JSON response confirming deletion or error.
    """
    if request.method == 'POST':
        # Extract task_id from the request body
        body = json.loads(request.body)
        task_id = body.get('task_id')

        # Check if task_id is provided
        if not task_id:
            return Response({"status": "error", "message": "Task ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Find the task by id
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response({"status": "error", "message": "Task not found"}, status=status.HTTP_404_NOT_FOUND)

        # Delete the task
        task.delete()

        return Response({
            "status": "success",
            "message": f"Task with ID {task_id} deleted successfully"
        }, status=status.HTTP_200_OK)

    else:
        return Response({
            "status": "error",
            "message": "Invalid request method"
        }, status=status.HTTP_405_METHOD_NOT_ALLOWED)
    


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