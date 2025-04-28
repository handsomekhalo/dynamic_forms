from django.urls import path
from . import views

urlpatterns = [
    path('get_question_type_and_questions_api/', views.get_question_type_and_questions_api,
          name="get_question_type_and_questions_api"),
    path('save_question_api/', views.save_question_api, name="save_question_api"),
    path('update_question_api/',views.update_question_api,name="update_question_api"),
    path('change_question_status_api/', views.change_question_status_api, name="change_question_status_api"),
]
