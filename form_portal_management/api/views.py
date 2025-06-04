# views.py

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from application_management.models import FormCategoryAssignment, MainCategory
from form_portal_management.api.serailizers import GetCategoryWithQuestionsAssignedSerializer



@api_view(['GET'])
def get_all_form_details_api(request, form_id):
    try:
        # Get all MainCategories assigned to this form
        category_links = FormCategoryAssignment.objects.filter(form_type_id=form_id)
        categories = MainCategory.objects.filter(
            id__in=category_links.values_list('main_category_id', flat=True)
        ).order_by('order')

        serializer = GetCategoryWithQuestionsAssignedSerializer(
            categories,
            many=True,
            context={'form_id': form_id}
        )

        return Response(serializer.data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response(
            {'status': 'error', 'message': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

