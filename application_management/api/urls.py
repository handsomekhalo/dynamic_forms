from django.urls import path

from application_management.api import views


urlpatterns = [
     path('create_form_api/',views.create_form_api,name='create_form_api'),
    #  path('get_questions/',views.get_questions,name='get_questions'),

     
    #  path('update_questions/',views.update_questions,name='update_questions'),
    #  path('deactivate_question/', views.deactivate_question, name='deactivate_question'),
    #  path('activate_question/', views.activate_question, name='activate_question')
]