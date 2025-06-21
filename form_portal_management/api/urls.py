from django.urls import path
from . import views

urlpatterns = [
    path('get_all_form_details_api/<int:form_id>/',views.get_all_form_details_api,
         name='get_all_form_details_api'),
    
    # path('get_form_details_api/<int:form_id>/',views.get_form_details_api,
    #      name='get_form_details_api'),
    path('get_form_answers_from_user_api/<int:form_id>/<int:client_id>/',views.get_form_answers_from_user_api,
         name='get_form_answers_from_user_api'),
     path('get_all_documents_for_user_api/', views.get_all_documents_for_user_api, name="get_all_documents_for_user_api"),


     #     retrieve_user_documents_api
  
  
]