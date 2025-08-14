from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"tickets", views.ServiceTicketViewSet, basename="serviceticket")
router.register(r"notes", views.ServiceNoteViewSet, basename="servicenote")
router.register(
    r"knowledge-categories",
    views.KnowledgeBaseCategoryViewSet,
    basename="knowledgebasecategory",
)
router.register(r"knowledge-base", views.KnowledgeBaseViewSet, basename="knowledgebase")
router.register(r"faq", views.FAQViewSet, basename="faq")

urlpatterns = [
    path("", include(router.urls)),
]
