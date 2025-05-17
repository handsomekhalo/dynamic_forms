from django.urls import path
from . import views

urlpatterns = [
    path('get_question_type_and_questions_api/', views.get_question_type_and_questions_api,
          name="get_question_type_and_questions_api"),
    path('add_question_api/', views.add_question_api, name="add_question_api"),
#     path('update_question_api/<int:question_id>',views.update_question_api,name="update_question_api"),
    path('update_question_api/<int:question_id>/', views.update_question_api, name='update_question_api'),
    path('get_question_detail_api/<int:question_id>/', views.get_question_detail_api,
          name="get_question_detail_api"),
    path('change_question_status_api/', views.change_question_status_api,name="change_question_status_api"),

        
]

