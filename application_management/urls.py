from django.urls import path
from application_management import views

urlpatterns = [
     path('get_all_categories/',views.get_all_categories,name='get_all_categories'),
      path('get_all_forms/',views.get_all_forms,name='get_all_forms'),

     
    #  path('update_questions/',views.update_questions,name='update_questions'),
    #  path('deactivate_question/', views.deactivate_question, name='deactivate_question'),
    #  path('activate_question/', views.activate_question, name='activate_question')
]