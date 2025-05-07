from django.urls import path

from application_management.api import views


urlpatterns = [
     path('create_form_api/',views.create_form_api,name='create_form_api'),
     path('create_category_api/',views.create_category_api,name='create_category_api'),
     path('assign_question_and_category_to_form_api/'
         ,views.assign_question_and_category_to_form_api,name='assign_question_and_category_to_form_api'),
     path('get_all_categories_api/',views.get_all_categories_api,name='get_all_categories_api'),
     path('get_all_forms_api/',views.get_all_forms_api,name='get_all_forms_api'),
     path('get_unassigned_categories_api/<int:form_type_id>/',views.get_unassigned_categories_api,
             name='get_unassigned_categories_api'),

     # path('form-types/<int:form_type_id>/unassigned-categories/', views.get_unassigned_categories, name='unassigned-categories'),

     # path('get_all_categories/<int:formId>/', views.get_all_categories, name="get_all_categories"),





]