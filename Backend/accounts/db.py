"""Mongo collection helpers used by admin views."""

from pymongo import MongoClient
from django.conf import settings

_client = MongoClient(settings.MONGO_URI)
_db = _client[settings.MONGO_DB_NAME]


def get_users_collection():
    return _db["users"]


def get_referrals_collection():
    return _db["referrals"]


def get_orders_collection():
    return _db["orders"]


def get_products_collection():
    return _db["products"]


def get_admins_collection():
    return _db["admins"]
