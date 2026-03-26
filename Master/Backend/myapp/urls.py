from django.urls import path
from .views import LoginView, Projects,ModuleView

urlpatterns = [   
               path('projects/', Projects.as_view(), name='projects'),
               path('login/', LoginView.as_view(), name='login'),   
               path('modules/', ModuleView.as_view(), name='modules'), 
            
]