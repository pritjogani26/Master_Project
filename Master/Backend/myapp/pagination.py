from rest_framework.pagination import PageNumberPagination


class CustomPagination(PageNumberPagination):
    page_size = 5              # Default items per page
    page_query_param = 'p'          # Use ?p=2 instead of ?page=2
    page_size_query_param = 'size'  # Allows ?size=50 in request
    max_page_size = 100             # Limits client-requested page size
