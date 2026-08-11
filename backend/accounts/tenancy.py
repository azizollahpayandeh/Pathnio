"""
Centralized multi-tenant authorization.

Every place that needs "which company does this user belong to" or "what is
their role" MUST go through here — never read a company_id from the request
body for authorization. This is the single chokepoint that enforces tenant
isolation across the app.
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import Membership, Company


# --- Resolving company + role from the authenticated user ------------------

def membership_for(user):
    """Return the user's Membership, or None."""
    if not user or not user.is_authenticated:
        return None
    return Membership.objects.filter(user=user).select_related("company").first()


def company_for(user):
    """The Company (tenant) the user belongs to, derived server-side.

    Prefers the authoritative Membership; falls back to the legacy
    company_profile / driver_profile relations so nothing breaks during the
    migration window.
    """
    m = membership_for(user)
    if m:
        return m.company
    # Legacy fallbacks (pre-Membership data / in-flight requests)
    company = getattr(user, "company_profile", None)
    if company is not None:
        return company
    driver = getattr(user, "driver_profile", None)
    return getattr(driver, "company", None) if driver else None


def role_for(user):
    """The user's role string, or None. Staff/superusers act as platform admin."""
    if getattr(user, "is_staff", False) or getattr(user, "is_superuser", False):
        return "PLATFORM_ADMIN"
    m = membership_for(user)
    if m:
        return m.role
    # Legacy fallback
    if getattr(user, "company_profile", None) is not None:
        return Membership.Role.COMPANY_OWNER
    if getattr(user, "driver_profile", None) is not None:
        return Membership.Role.DRIVER
    return None


def is_owner(user):
    return role_for(user) in (
        Membership.Role.COMPANY_OWNER,
        Membership.Role.COMPANY_ADMIN,
        "PLATFORM_ADMIN",
    )


def is_driver(user):
    return role_for(user) == Membership.Role.DRIVER


# --- DRF permissions -------------------------------------------------------

class IsCompanyMember(BasePermission):
    """Authenticated AND belongs to some company."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated
                    and company_for(request.user) is not None)


class IsCompanyOwner(BasePermission):
    """Authenticated company owner/admin (dashboard-side management)."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated
                    and is_owner(request.user))


class IsDriver(BasePermission):
    """Authenticated driver (mobile-side)."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated
                    and is_driver(request.user))


# --- Queryset scoping mixin ------------------------------------------------

class CompanyScopedQuerysetMixin:
    """Mixin for viewsets/generics whose model has a `company` FK.

    Filters every queryset to the caller's company. Staff see everything.
    Because retrieve/update/delete all resolve their object through
    get_queryset(), this also closes object-level (IDOR) access automatically.
    """
    company_field = "company"

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        if getattr(user, "is_staff", False) or getattr(user, "is_superuser", False):
            return qs
        company = company_for(user)
        if company is None:
            return qs.none()
        return qs.filter(**{self.company_field: company})
