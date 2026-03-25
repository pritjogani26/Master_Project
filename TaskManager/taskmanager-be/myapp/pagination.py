# myapp/paginations.py
from rest_framework.pagination import PageNumberPagination

class CustomPageNumberPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'  # Allows client to control page size
    max_page_size = 10
    page_query_param = 'p'  # Custom query parameter (e.g., ?p=2)



