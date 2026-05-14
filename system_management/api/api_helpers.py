"""
Global api(s) for the use through the system.
"""
from rest_framework import status
import json
from system_management.api.serializers import SendEmailSerializer
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from rest_framework.decorators import api_view, permission_classes
from django.core.mail import EmailMessage
from django.template.loader import get_template
from django.conf import settings
from django.template import TemplateDoesNotExist
from smtplib import SMTPException

from system_management.email_service import send_email



@api_view(["POST"])
@permission_classes((AllowAny,))
def send_email_api(request):
    body = json.loads(request.body)

    html_tpl_path = body.get("html_tpl_path")
    receiver_email = body.get("receiver_email")
    subject = body.get("subject")
    context_data = body.get("context_data") or {}

    if not html_tpl_path or not receiver_email or not subject:
        return Response(
            {"status": "error", "message": "Missing required fields: html_tpl_path, receiver_email, subject"},
            status=400,
        )

    try:
        html_template = get_template(html_tpl_path).render(context_data)
    except TemplateDoesNotExist:
        return Response(
            {"status": "error", "message": f"Template not found: {html_tpl_path}"},
            status=400,
        )

    status_code = send_email(receiver_email, subject, html_template)

    if status_code == 202:
        return Response({"status": "success", "message": "Email sent successfully"})

    return Response(
        {"status": "error", "message": f"Email sending failed with status: {status_code}"},
        status=500,
    )
# @api_view(["POST"])
# @permission_classes((AllowAny,))
# def send_email_api(request):
#     if request.method == "POST":
#         body = json.loads(request.body)
#         print("Received email API request with body:", body)
#         serializer = SendEmailSerializer(data=body)


#         if serializer.is_valid():
#             print("Serializer is valid. Extracting data...")
#             html_tpl_path = serializer.validated_data['html_tpl_path']
#             print(f"HTML template path: {html_tpl_path}")
#             context_data = serializer.validated_data['context_data']
#             print(f"Context data: {context_data}")
#             subject = serializer.validated_data['subject']
#             print(f"Email subject: {subject}")

#             try:
#                 receiver_email = body['receiver_email']
#                 print(f"Receiver email: {receiver_email}")

#             except Exception as e:
#                 print(f"Error occurred while extracting receiver_email: {str(e)}")
#                 response_dict = json.dumps({
#                     "status": "error", 
#                     "data": serializer.data,
#                     "message": "Invalid or missing receiver_email."
#                 })
#                 return Response(response_dict, status=status.HTTP_400_BAD_REQUEST)

#             try:
#                 email_html_template = get_template(html_tpl_path).render(context_data)

#             except TemplateDoesNotExist as e:
#                 print(f"Error occurred while rendering email template: {str(e)}")
#                 response_dict = json.dumps({
#                     "status": "error",
#                     "data": serializer.data,
#                     "message": f"HTML template not found: {str(e)}"
#                 })

#                 return Response(response_dict, status=status.HTTP_400_BAD_REQUEST)

#             if not context_data:
#                 print("Context data is missing or empty.")
#                 response_dict = json.dumps({
#                     "status": "error",
#                     "data": serializer.data,
#                     "message": "Context data is missing or empty."
#                 })
#                 return Response(response_dict, status=status.HTTP_400_BAD_REQUEST)

#             try:
#                 if not isinstance(receiver_email, str) and not all(isinstance(email, str) for email in receiver_email):
#                     raise ValueError("Invalid receiver_email format")
                    
#                 receiver_emails = receiver_email if isinstance(receiver_email, list) else [receiver_email]
#                 print(f"Receiver emails list: {receiver_emails}")
#                 if not subject:
#                     raise ValueError("Subject is empty")

#                 email_msg = EmailMessage(
#                     subject,
#                     email_html_template,
#                     settings.DEFAULT_FROM_EMAIL,
#                     receiver_emails,
#                     reply_to=[settings.DEFAULT_FROM_EMAIL]
#                 )

#                 email_msg.content_subtype = 'html'
#                 email_msg.send(fail_silently=False)

#                 print("Email sent successfully.")
#                 response_dict = json.dumps({
#                     "status": "success", 
#                     "data": serializer.data,
#                 })

#                 print(f"Response data: {response_dict}")

#                 return Response(response_dict, status=status.HTTP_200_OK)

#             except SMTPException as e:
#                 response_dict = json.dumps({
#                     "status": "error",
#                     "data": serializer.data,
#                     "message": f"SMTP Error: {str(e)}"
#                 })
#                 return Response(response_dict, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#             except ValueError as e:
#                 response_dict = json.dumps({
#                     "status": "error", 
#                     "data": serializer.data,
#                     "message": str(e)
#                 })
#                 return Response(response_dict, status=status.HTTP_400_BAD_REQUEST)

#             except Exception as e:
#                 response_dict = json.dumps({
#                     "status": "error", 
#                     "data": serializer.data,
#                     "message": f"Email sending error: {str(e)}"
#                 })
#                 return Response(response_dict, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#         else:
#             response_dict = json.dumps({
#                 "status": "error", 
#                 "data": serializer.data,
#                 "message": serializer.errors
#             })

#             return Response(response_dict, status=status.HTTP_400_BAD_REQUEST)
