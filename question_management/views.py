from django.shortcuts import render

# Create your views here.
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
import requests
import json

from question_management.api.serializers import QuestionSerializer
from system_management.decorators import admin_required, check_token_in_session, session_timeout
from system_management.general_func_classes import host_url

@admin_required
@session_timeout
@check_token_in_session
def add_questions(request):

    token = request.session.get("token")
    
    if not token:
        return redirect('login')  # or handle the case when token is missing
    
    headers = {
        "Content-Type": "application/json",  # Assuming JSON is the content type
        "Authorization": f"Token {token}",
    }

    if request.method == 'GET':
        # Fetch question types and existing questions
        url = f"{host_url(request)}{reverse('get_question_type_and_questions_api')}"
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            response_data = response.json()
        except requests.exceptions.RequestException as e:
            return JsonResponse({'error': str(e)}, status=500)

        context = response_data
        return render(request, 'question_management/add_questions.html', context)

    elif request.method == 'POST':
        data = request.POST
        question_serializer_data = QuestionSerializer(data=data)

        if question_serializer_data.is_valid():
            validated_data = question_serializer_data.validated_data
            option_list = [option for option in data.getlist('option[]') if option.strip()]
            validated_data['option'] = option_list

            # Send the data to save the question
            url = f"{host_url(request)}{reverse('save_question_api')}"
            payload = json.dumps(validated_data)

            try:
                response = requests.post(url, headers=headers, data=payload, timeout=10)
            except requests.exceptions.RequestException as e:
                return JsonResponse({'error': f'Error making request: {str(e)}'}, status=500)

            if response.status_code == 200:
                return JsonResponse({'status': 'success', 'message': 'Question saved successfully'})
            else:
                return JsonResponse({'error': f'Could not create the question: {response.text}'}, status=response.status_code)
        
        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid data submitted'}, status=400)
