from django.urls import path
from . import views

urlpatterns = [
    path('get_all_form_details/<int:formId>/', views.get_all_form_details,
           name="get_all_form_details"),
   


]