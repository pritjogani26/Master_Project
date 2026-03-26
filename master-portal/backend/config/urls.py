from django.contrib import admin
from django.urls import path
from api.views.master_auth import MasterLoginView
from api.views.master_launch import ModuleLaunchOptionsView
from api.views.master_launch import ModuleLaunchView
from api.views.master_logout_view import MasterLogoutView
from api.views.master_session_status_view import MasterSessionStatusView

from api.views.master_modules import (
    MasterModuleListCreateView,
    MasterModuleDetailView,
    AssignModuleToUserView,
    ActivateModuleView
)
urlpatterns = [
    path("auth/login/",MasterLoginView.as_view(), name="auth-login"),
    path("auth/logout/", MasterLogoutView.as_view(), name="master-logout"),
    path("auth/session-status/", MasterSessionStatusView.as_view(), name="master-session-status"),

    path("modules/", MasterModuleListCreateView.as_view(), name="master-modules"),
    path("modules/<int:module_id>/", MasterModuleDetailView.as_view(), name="master-module-detail"),
    path("users/<int:user_id>/assign-module/", AssignModuleToUserView.as_view(), name="assign-module-to-user"),
    path("modules/<int:module_id>/activate/", ActivateModuleView.as_view()),

    path("modules/<int:module_id>/launch-options/", ModuleLaunchOptionsView.as_view(), name="module-launch-options"),

    path("modules/<int:module_id>/launch/", ModuleLaunchView.as_view(), name="master-launch"),


]
