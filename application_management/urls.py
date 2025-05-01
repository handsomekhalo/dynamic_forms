from django.urls import path
from question_management import views

urlpatterns = [
     path('add_questions/',views.add_questions,name='add_questions'),
     path('get_questions/',views.get_questions,name='get_questions'),

     
    #  path('update_questions/',views.update_questions,name='update_questions'),
    #  path('deactivate_question/', views.deactivate_question, name='deactivate_question'),
    #  path('activate_question/', views.activate_question, name='activate_question')
]