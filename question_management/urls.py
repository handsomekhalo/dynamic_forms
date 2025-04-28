from django.urls import path
from . import views

urlpatterns = [
     path('add_questions/',views.add_questions,name='add_questions'),
    #  path('update_questions/',views.update_questions,name='update_questions'),
    #  path('deactivate_question/', views.deactivate_question, name='deactivate_question'),
    #  path('activate_question/', views.activate_question, name='activate_question')
]