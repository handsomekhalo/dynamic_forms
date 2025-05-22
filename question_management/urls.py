from django.urls import path
from . import views

urlpatterns = [
    path('add_questions/',views.add_questions,name='add_questions'),
    path('get_questions/',views.get_questions,name='get_questions'),
    # path('update_question/<int:question_id>/',views.update_question,name='update_question'),
    path('update_question/<int:question_id>/', views.update_question, name='update_question'),

    path('get_question_detail/<int:question_id>/',views.get_question_detail,
         name='get_question_detail'),
    path('change_question_status/',views.change_question_status,name='change_question_status'),
    path('add_or_assign_questions_to_category/',
         views.add_or_assign_questions_to_category,name='add_or_assign_questions_to_category'),
#     path('get_questions_assigned_to_category/<int:formId>/categories/<int:category>/questions/',
#             views.get_questions_assigned_to_category, name="get_questions_assigned_to_category"),
    path('get_questions_assigned_to_category/<int:formId>/categories/<int:category>/questions/',
     views.get_questions_assigned_to_category, name="get_questions_assigned_to_category"),
    path('remove_assigned_question/',views.remove_assigned_question,name='remove_assigned_question'),


]