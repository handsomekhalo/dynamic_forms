from django.urls import path
from . import views

urlpatterns = [
    path('get_all_form_details/<int:formId>/', views.get_all_form_details,
           name="get_all_form_details"),
    path('submit_category_answers/', views.submit_category_answers,
           name="submit_category_answers"),
   


]