from django.urls import path
from . import views

urlpatterns = [
       path('get_all_form_details/<int:formId>/', views.get_all_form_details,
           name="get_all_form_details"),

       path('submit_category_answers/', views.submit_category_answers,
           name="submit_category_answers"),
       path('get_form_answers_from_user/<int:formId>/', views.get_form_answers_from_user,
           name="get_form_answers_from_user"),
       path('get_all_documents_for_user/', views.get_all_documents_for_user,
                     name='get_all_documents_for_user'),
        
        path('get_all_form_details_no_token/<int:formId>/', views.get_all_form_details_no_token,
           name="get_all_form_details_no_token"),
]