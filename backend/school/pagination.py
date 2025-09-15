from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    """Page-number pagination compatible with react-admin.

    - Default page size: 25 (react-admin List default)
    - Allow clients to override via ?page_size=
    - Cap maximum to avoid abuse in dev
    """

    page_size = 25
    page_size_query_param = "page_size"
    max_page_size = 200
