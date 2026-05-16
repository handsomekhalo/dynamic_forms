from django.urls import path
from . import views

urlpatterns = [
        path('get_all_form_details/<int:formId>/', views.get_all_form_details,
           name="get_all_form_details"),

        path('submit_category_answers/', views.submit_category_answers,
           name="submit_category_answers"),
        path('get_form_answers_from_user/<int:formId>/', views.get_form_answers_from_user,
           name="get_form_answers_from_user"),
        path('get_all_documents_for_user/', views.get_all_documents_for_user,
                     name='get_all_documents_for_user'),
        
        path('get_all_form_details_no_token/<int:formId>/', views.get_all_form_details_no_token,
           name="get_all_form_details_no_token"),
        path('send_form_invitation/', views.send_form_invitation, name='send_form_invitation'),
        path('send_bulk_invitations/', views.send_bulk_form_invitations_view, name='send_bulk_invitations'),
        path('validate_token/<str:token>/', views.validate_form_token_view, name='validate_token'),
        path('get_all_submissions/<int:form_id>/', views.get_all_submissions, name='get_all_submissions'),
        path('get_submission_detail/<int:submission_id>/', views.get_submission_detail, name='get_submission_detail'),
        path('update_submission_status/<int:submission_id>/', views.update_submission_status, name='update_submission_status'),
        path('get_all_submissions_admin/', views.get_all_submissions_admin, name='get_all_submissions_admin'),
         path('get_dashboard_stats/', views.get_dashboard_stats, name='get_dashboard_stats'),


]