"""
API Views for SSSupplement Admin Backend.
Full CRUD for Users, Referrals, Orders, Products + Auth.
"""

from datetime import datetime, timezone
import os
from bson import ObjectId
from bson.errors import InvalidId
from pymongo.errors import PyMongoError
import bcrypt

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.conf import settings

from .db import (
    get_users_collection,
    get_referrals_collection,
    get_orders_collection,
    get_products_collection,
    get_admins_collection,
)
from .serializers_admin import (
    UserSerializer, UserUpdateSerializer,
    ReferralSerializer, ReferralUpdateSerializer,
    OrderSerializer, OrderUpdateSerializer,
    ProductSerializer, ProductUpdateSerializer,
    LoginSerializer,
)
from .authentication import generate_token, AdminJWTAuthentication


def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable dict."""
    if doc is None:
        return None
    if '_id' in doc:
        doc['_id'] = str(doc['_id'])
    return doc


def serialize_docs(docs):
    """Convert list of MongoDB documents."""
    return [serialize_doc(doc) for doc in docs]


# ─── Auth Views ──────────────────────────────────────────────────────

class LoginView(APIView):
    """Admin login endpoint."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'success': False, 'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        # Check against admin collection first
        admin = None
        try:
            admins = get_admins_collection()
            admin = admins.find_one({'email': email})
        except PyMongoError:
            # If MongoDB is unavailable, continue with env-based admin auth fallback.
            admin = None

        if admin:
            stored_password = admin.get('password', '')
            password_ok = False

            # Support both bcrypt-hashed and legacy plain-text stored passwords.
            if isinstance(stored_password, bytes):
                try:
                    password_ok = bcrypt.checkpw(password.encode('utf-8'), stored_password)
                except ValueError:
                    password_ok = False
            elif isinstance(stored_password, str):
                if stored_password.startswith('$2'):
                    try:
                        password_ok = bcrypt.checkpw(
                            password.encode('utf-8'),
                            stored_password.encode('utf-8')
                        )
                    except ValueError:
                        password_ok = False
                else:
                    password_ok = (password == stored_password)

            if password_ok:
                token = generate_token(admin)
                return Response({
                    'success': True,
                    'token': token,
                    'admin': {
                        '_id': str(admin.get('_id', '')),
                        'email': admin.get('email', email),
                        'name': admin.get('name', 'Admin'),
                    }
                })

        # Fallback: check environment variable credentials
        admin_email = getattr(settings, "ADMIN_EMAIL", None) or os.getenv("ADMIN_EMAIL")
        admin_password = getattr(settings, "ADMIN_PASSWORD", None) or os.getenv("ADMIN_PASSWORD")
        if admin_email and admin_password and email == admin_email and password == admin_password:
            admin_data = {
                '_id': 'env_admin',
                'email': email,
                'name': 'Admin',
            }
            token = generate_token(admin_data)
            return Response({
                'success': True,
                'token': token,
                'admin': admin_data,
            })

        return Response(
            {'success': False, 'error': 'Invalid email or password.'},
            status=status.HTTP_401_UNAUTHORIZED
        )


class MeView(APIView):
    """Get current authenticated admin info."""
    permission_classes = [IsAuthenticated]
    authentication_classes = [AdminJWTAuthentication]

    def get(self, request):
        return Response({
            'success': True,
            'admin': {
                '_id': request.user.id,
                'email': request.user.email,
                'name': request.user.name,
            }
        })


# ─── Dashboard View ──────────────────────────────────────────────────

class DashboardView(APIView):
    """Dashboard stats endpoint."""
    permission_classes = [IsAuthenticated]
    authentication_classes = [AdminJWTAuthentication]

    def get(self, request):
        users = get_users_collection()
        orders = get_orders_collection()
        products = get_products_collection()
        referrals = get_referrals_collection()

        total_users = users.count_documents({})
        total_orders = orders.count_documents({})
        total_products = products.count_documents({})
        total_referrals = referrals.count_documents({})

        # Calculate total revenue from delivered orders
        pipeline = [
            {'$match': {'status': {'$in': ['confirmed', 'shipped', 'delivered']}}},
            {'$group': {'_id': None, 'total': {'$sum': '$cash_paid'}}}
        ]
        revenue_result = list(orders.aggregate(pipeline))
        total_revenue = revenue_result[0]['total'] if revenue_result else 0

        # Pending orders
        pending_orders = orders.count_documents({'status': 'pending'})

        # Recent orders
        recent_orders = list(
            orders.find().sort('created_at', -1).limit(5)
        )

        # Recent referrals
        recent_referrals = list(
            referrals.find().sort('created_at', -1).limit(5)
        )

        return Response({
            'success': True,
            'data': {
                'total_users': total_users,
                'total_orders': total_orders,
                'total_products': total_products,
                'total_referrals': total_referrals,
                'total_revenue': total_revenue,
                'pending_orders': pending_orders,
                'recent_orders': serialize_docs(recent_orders),
                'recent_referrals': serialize_docs(recent_referrals),
            }
        })


# ─── User Views ──────────────────────────────────────────────────────

class UserListCreateView(APIView):
    """List all users or create a new user."""
    permission_classes = [IsAuthenticated]
    authentication_classes = [AdminJWTAuthentication]

    def get(self, request):
        collection = get_users_collection()

        # Search & filter
        query = {}
        search = request.query_params.get('search', '')
        if search:
            query['$or'] = [
                {'name': {'$regex': search, '$options': 'i'}},
                {'email': {'$regex': search, '$options': 'i'}},
                {'phone': {'$regex': search, '$options': 'i'}},
            ]

        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        skip = (page - 1) * page_size

        total = collection.count_documents(query)
        users = list(
            collection.find(query)
            .sort('created_at', -1)
            .skip(skip)
            .limit(page_size)
        )

        return Response({
            'success': True,
            'data': serialize_docs(users),
            'pagination': {
                'total': total,
                'page': page,
                'page_size': page_size,
                'total_pages': (total + page_size - 1) // page_size,
            }
        })

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'success': False, 'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        collection = get_users_collection()
        data = serializer.validated_data

        # Check duplicate email
        if collection.find_one({'email': data['email']}):
            return Response(
                {'success': False, 'error': 'Email already exists.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Hash password if provided
        password = data.get('password', 'default123')
        hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        now = datetime.now(timezone.utc)
        user_doc = {
            'phone': data['phone'],
            'email': data['email'],
            'name': data['name'],
            'password': hashed.decode('utf-8'),
            'points': data.get('points', 0),
            'referral_code': data.get('referral_code'),
            'created_at': now,
            'updated_at': now,
        }

        result = collection.insert_one(user_doc)
        user_doc['_id'] = str(result.inserted_id)

        return Response(
            {'success': True, 'data': serialize_doc(user_doc)},
            status=status.HTTP_201_CREATED
        )


class UserDetailView(APIView):
    """Retrieve, update, or delete a single user."""
    permission_classes = [IsAuthenticated]
    authentication_classes = [AdminJWTAuthentication]

    def get_object(self, pk):
        collection = get_users_collection()
        try:
            return collection.find_one({'_id': ObjectId(pk)})
        except InvalidId:
            return None

    def get(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response(
                {'success': False, 'error': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response({'success': True, 'data': serialize_doc(user)})

    def put(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response(
                {'success': False, 'error': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = UserUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'success': False, 'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        update_data = {k: v for k, v in serializer.validated_data.items() if v is not None}
        update_data['updated_at'] = datetime.now(timezone.utc)

        collection = get_users_collection()
        collection.update_one(
            {'_id': ObjectId(pk)},
            {'$set': update_data}
        )

        updated_user = self.get_object(pk)
        return Response({'success': True, 'data': serialize_doc(updated_user)})

    def delete(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response(
                {'success': False, 'error': 'User not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        collection = get_users_collection()
        collection.delete_one({'_id': ObjectId(pk)})
        return Response({'success': True, 'message': 'User deleted.'})


# ─── User Address View ───────────────────────────────────────────────

class UserAddressView(APIView):
    """Get addresses for a user from their orders."""
    permission_classes = [IsAuthenticated]
    authentication_classes = [AdminJWTAuthentication]

    def get(self, request, pk):
        orders = get_orders_collection()
        user_orders = list(orders.find({'user_id': pk}, {'address': 1, 'order_id': 1}))
        addresses = []
        for order in user_orders:
            if 'address' in order:
                addr = order['address']
                addr['order_id'] = order.get('order_id', '')
                addresses.append(addr)

        return Response({'success': True, 'data': addresses})


# ─── Referral Views ──────────────────────────────────────────────────

class ReferralListCreateView(APIView):
    """List all referrals or create a new one."""
    permission_classes = [IsAuthenticated]
    authentication_classes = [AdminJWTAuthentication]

    def get(self, request):
        collection = get_referrals_collection()

        query = {}
        status_filter = request.query_params.get('status', '')
        if status_filter:
            query['status'] = status_filter

        search = request.query_params.get('search', '')
        if search:
            query['$or'] = [
                {'referred_user.name': {'$regex': search, '$options': 'i'}},
                {'referred_user.email': {'$regex': search, '$options': 'i'}},
                {'referrer_id': {'$regex': search, '$options': 'i'}},
            ]

        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        skip = (page - 1) * page_size

        total = collection.count_documents(query)
        referrals = list(
            collection.find(query)
            .sort('created_at', -1)
            .skip(skip)
            .limit(page_size)
        )

        return Response({
            'success': True,
            'data': serialize_docs(referrals),
            'pagination': {
                'total': total,
                'page': page,
                'page_size': page_size,
                'total_pages': (total + page_size - 1) // page_size,
            }
        })

    def post(self, request):
        serializer = ReferralSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'success': False, 'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        collection = get_referrals_collection()
        data = serializer.validated_data
        data['created_at'] = datetime.now(timezone.utc)

        result = collection.insert_one(data)
        data['_id'] = str(result.inserted_id)

        return Response(
            {'success': True, 'data': serialize_doc(data)},
            status=status.HTTP_201_CREATED
        )


class ReferralDetailView(APIView):
    """Retrieve, update, or delete a referral."""
    permission_classes = [IsAuthenticated]
    authentication_classes = [AdminJWTAuthentication]

    def get_object(self, pk):
        collection = get_referrals_collection()
        try:
            return collection.find_one({'_id': ObjectId(pk)})
        except InvalidId:
            return None

    def get(self, request, pk):
        referral = self.get_object(pk)
        if not referral:
            return Response(
                {'success': False, 'error': 'Referral not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response({'success': True, 'data': serialize_doc(referral)})

    def put(self, request, pk):
        referral = self.get_object(pk)
        if not referral:
            return Response(
                {'success': False, 'error': 'Referral not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ReferralUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'success': False, 'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        update_data = {k: v for k, v in serializer.validated_data.items() if v is not None}

        collection = get_referrals_collection()
        collection.update_one(
            {'_id': ObjectId(pk)},
            {'$set': update_data}
        )

        updated = self.get_object(pk)
        return Response({'success': True, 'data': serialize_doc(updated)})

    def delete(self, request, pk):
        referral = self.get_object(pk)
        if not referral:
            return Response(
                {'success': False, 'error': 'Referral not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        collection = get_referrals_collection()
        collection.delete_one({'_id': ObjectId(pk)})
        return Response({'success': True, 'message': 'Referral deleted.'})


# ─── Order Views ─────────────────────────────────────────────────────

class OrderListCreateView(APIView):
    """List all orders or create a new one."""
    permission_classes = [IsAuthenticated]
    authentication_classes = [AdminJWTAuthentication]

    def get(self, request):
        collection = get_orders_collection()

        query = {}
        status_filter = request.query_params.get('status', '')
        if status_filter:
            query['status'] = status_filter

        payment_filter = request.query_params.get('payment_method', '')
        if payment_filter:
            query['payment_method'] = payment_filter

        search = request.query_params.get('search', '')
        if search:
            query['$or'] = [
                {'order_id': {'$regex': search, '$options': 'i'}},
                {'address.fullName': {'$regex': search, '$options': 'i'}},
                {'address.phone': {'$regex': search, '$options': 'i'}},
            ]

        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        skip = (page - 1) * page_size

        total = collection.count_documents(query)
        orders = list(
            collection.find(query)
            .sort('created_at', -1)
            .skip(skip)
            .limit(page_size)
        )

        return Response({
            'success': True,
            'data': serialize_docs(orders),
            'pagination': {
                'total': total,
                'page': page,
                'page_size': page_size,
                'total_pages': (total + page_size - 1) // page_size,
            }
        })

    def post(self, request):
        serializer = OrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'success': False, 'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        collection = get_orders_collection()
        data = serializer.validated_data
        data['created_at'] = datetime.now(timezone.utc)

        result = collection.insert_one(data)
        data['_id'] = str(result.inserted_id)

        return Response(
            {'success': True, 'data': serialize_doc(data)},
            status=status.HTTP_201_CREATED
        )


class OrderDetailView(APIView):
    """Retrieve, update, or delete an order."""
    permission_classes = [IsAuthenticated]
    authentication_classes = [AdminJWTAuthentication]

    def get_object(self, pk):
        collection = get_orders_collection()
        try:
            return collection.find_one({'_id': ObjectId(pk)})
        except InvalidId:
            return None

    def get(self, request, pk):
        order = self.get_object(pk)
        if not order:
            return Response(
                {'success': False, 'error': 'Order not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response({'success': True, 'data': serialize_doc(order)})

    def put(self, request, pk):
        order = self.get_object(pk)
        if not order:
            return Response(
                {'success': False, 'error': 'Order not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = OrderUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'success': False, 'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        update_data = {k: v for k, v in serializer.validated_data.items() if v is not None}

        collection = get_orders_collection()
        collection.update_one(
            {'_id': ObjectId(pk)},
            {'$set': update_data}
        )

        updated = self.get_object(pk)
        return Response({'success': True, 'data': serialize_doc(updated)})

    def delete(self, request, pk):
        order = self.get_object(pk)
        if not order:
            return Response(
                {'success': False, 'error': 'Order not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        collection = get_orders_collection()
        collection.delete_one({'_id': ObjectId(pk)})
        return Response({'success': True, 'message': 'Order deleted.'})


class OrderStatusView(APIView):
    """Update order status only."""
    permission_classes = [IsAuthenticated]
    authentication_classes = [AdminJWTAuthentication]

    def patch(self, request, pk):
        new_status = request.data.get('status')
        valid_statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
        if new_status not in valid_statuses:
            return Response(
                {'success': False, 'error': f'Invalid status. Must be one of: {valid_statuses}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        collection = get_orders_collection()
        try:
            result = collection.update_one(
                {'_id': ObjectId(pk)},
                {'$set': {'status': new_status}}
            )
        except InvalidId:
            return Response(
                {'success': False, 'error': 'Invalid order ID.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if result.matched_count == 0:
            return Response(
                {'success': False, 'error': 'Order not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        order = collection.find_one({'_id': ObjectId(pk)})
        return Response({'success': True, 'data': serialize_doc(order)})


# ─── Product Views ───────────────────────────────────────────────────

class ProductListCreateView(APIView):
    """List all products or create a new one."""
    permission_classes = [IsAuthenticated]
    authentication_classes = [AdminJWTAuthentication]

    def get(self, request):
        collection = get_products_collection()

        query = {}
        category = request.query_params.get('category', '')
        if category:
            query['category'] = {'$regex': category, '$options': 'i'}

        brand = request.query_params.get('brand', '')
        if brand:
            query['brand'] = {'$regex': brand, '$options': 'i'}

        in_stock = request.query_params.get('inStock', '')
        if in_stock.lower() == 'true':
            query['inStock'] = True
        elif in_stock.lower() == 'false':
            query['inStock'] = False

        search = request.query_params.get('search', '')
        if search:
            query['$or'] = [
                {'name': {'$regex': search, '$options': 'i'}},
                {'brand': {'$regex': search, '$options': 'i'}},
                {'category': {'$regex': search, '$options': 'i'}},
            ]

        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))
        skip = (page - 1) * page_size

        total = collection.count_documents(query)
        products = list(
            collection.find(query)
            .sort('name', 1)
            .skip(skip)
            .limit(page_size)
        )

        return Response({
            'success': True,
            'data': serialize_docs(products),
            'pagination': {
                'total': total,
                'page': page,
                'page_size': page_size,
                'total_pages': (total + page_size - 1) // page_size,
            }
        })

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'success': False, 'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        collection = get_products_collection()
        data = serializer.validated_data
        data['created_at'] = datetime.now(timezone.utc)

        result = collection.insert_one(data)
        data['_id'] = str(result.inserted_id)

        return Response(
            {'success': True, 'data': serialize_doc(data)},
            status=status.HTTP_201_CREATED
        )


class ProductDetailView(APIView):
    """Retrieve, update, or delete a product."""
    permission_classes = [IsAuthenticated]
    authentication_classes = [AdminJWTAuthentication]

    def get_object(self, pk):
        collection = get_products_collection()
        try:
            return collection.find_one({'_id': ObjectId(pk)})
        except InvalidId:
            # Try by custom 'id' field as well
            return collection.find_one({'id': pk})

    def get(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return Response(
                {'success': False, 'error': 'Product not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response({'success': True, 'data': serialize_doc(product)})

    def put(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return Response(
                {'success': False, 'error': 'Product not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProductUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'success': False, 'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        update_data = {k: v for k, v in serializer.validated_data.items() if v is not None}
        update_data['updated_at'] = datetime.now(timezone.utc)

        collection = get_products_collection()
        collection.update_one(
            {'_id': product['_id']},
            {'$set': update_data}
        )

        updated = collection.find_one({'_id': product['_id']})
        return Response({'success': True, 'data': serialize_doc(updated)})

    def delete(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return Response(
                {'success': False, 'error': 'Product not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        collection = get_products_collection()
        collection.delete_one({'_id': product['_id']})
        return Response({'success': True, 'message': 'Product deleted.'})
