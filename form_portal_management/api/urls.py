from django.urls import path
from . import views

urlpatterns = [
    path('get_all_form_details_api/<int:form_id>/',views.get_all_form_details_api,
         name='get_all_form_details_api'),
  

]