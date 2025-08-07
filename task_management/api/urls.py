from django.urls import path
from . import views

urlpatterns = [

    path('create_task_api/', views.create_task_api, name='create_task_api'),

    path('get_all_task_api/', views.get_all_task_api, name="get_all_task_api"),
    path('get_task_by_id_api/', views.get_task_by_id_api, name="get_task_by_id_api"),
    path('update_task_api/', views.update_task_api, name="update_task_api"),
    path('delete_task_api/', views.delete_task_api, name="delete_task_api"),
    path('suggest_task_api/', views.suggest_task_api, name="suggest_task_api"),
]