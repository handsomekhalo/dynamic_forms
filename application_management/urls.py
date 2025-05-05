from django.urls import path
from application_management import views

urlpatterns = [
    # path('get_all_categories/',views.get_all_categories,name='get_all_categories'),
    #  path('get_all_categories/',views.get_all_categories,name='get_all_categories'),
    path('get_all_categories/<int:formId>/', views.get_all_categories, name="get_all_categories"),

    path('get_all_forms/',views.get_all_forms,name='get_all_forms'),
    path('create_form/',views.create_form,name='create_form'),
    path('create_category/',views.create_category,name='create_category'),
     path('get_categories_with_form_id/<int:formId>/', views.get_categories_with_form_id, name="get_categories_with_form_id"),

      

     
    #  path('update_questions/',views.update_questions,name='update_questions'),
    #  path('deactivate_question/', views.deactivate_question, name='deactivate_question'),
    #  path('activate_question/', views.activate_question, name='activate_question')
]