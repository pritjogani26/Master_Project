from django.contrib import admin
from django.urls import path,include
from .views import get_login_report,AllActionsView,LoginView,RegisterView,UserManagementAPIView,ProjectsView,Tasksview,RolesView,Rolepermissions,RolePermissionsView,RoleRightsManagementView,ScreenView,ProjectDetailView,CreateScreenView,ManageScreenActionsView,CreateActionView,Getloginactivity,get_login_report_excel
urlpatterns = [
    path("login/",LoginView.as_view(),name="login"),
    path("register/",RegisterView.as_view(),name="register"),
    path("test/",UserManagementAPIView.as_view(),name="usermanager"),
  
    path('roles/',RolesView.as_view(),name="roles"),
    # path('roles/<int:id>/permissions/',Rolepermissions.as_view(),name="roles"),
    path('roles/permissions/manage/', RoleRightsManagementView.as_view(), name='manage-role-permissions'),
    
    # The GET route we just built to fetch the current checkboxes
    # Notice the <int:role_id> perfectly matches the variable in our view's get() method!
    path('roles/<int:role_id>/permissions/', RolePermissionsView.as_view(), name='role-permissions'),
    
    path('screens/',ScreenView.as_view(),name="screen"),
    path('projects/', ProjectsView.as_view()),
path('projects/<int:pk>/', ProjectDetailView.as_view()),
path('actions/',AllActionsView.as_view(),name="actions"),
path('screens/create/',CreateScreenView.as_view(),name="createscreen"),
path('screens/<int:screen_id>/manage-actions/', ManageScreenActionsView.as_view(), name='manage-screen-actions'),
path('actions/create/', CreateActionView.as_view(), name='create-action'),
path('loginactivity/',Getloginactivity.as_view(),name="loginactivity"),
path('loginreport/',get_login_report.as_view(),name="loginreport"),
path('loginreport/excel/',get_login_report_excel.as_view())

]
