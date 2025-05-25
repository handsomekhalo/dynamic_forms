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
    path('assign_or_update_question_api/', views.assign_or_update_question_api,name="assign_or_update_question_api"),
    path('get_questions_assigned_to_category_api/<int:form_type_id>/categories/<int:main_category_id>/questions/',
            views.get_questions_assigned_to_category_api, name="get_questions_assigned_to_category_api"),
    path('get_all_questions_assigned_to_all_categories_api/<int:form_type_id>',
         views.get_all_questions_assigned_to_all_categories_api,name="get_all_questions_assigned_to_all_categories_api"),
    #  path('remove_assigned_question_api/', views.remove_assigned_question_api,name="remove_assigned_question_api"),
    path('remove_assigned_question_api/', views.remove_assigned_question_api, name="remove_assigned_question_api"),

    # path('get_assigned_questions_api/<int:form_type_id>/categories/<int:main_category_id>/questions/',
    #     views.get_assigned_questions_api,name='get_assigned_questions_api'
    # ),
        
]

