from django.urls import path

from application_management.api import views


urlpatterns = [
     path('create_form_api/',views.create_form_api,name='create_form_api'),
     path('create_category_api/',views.create_category_api,name='create_category_api'),
    path('assign_question_and_category_to_form_api/'
         ,views.assign_question_and_category_to_form_api,name='assign_question_and_category_to_form_api'),





]