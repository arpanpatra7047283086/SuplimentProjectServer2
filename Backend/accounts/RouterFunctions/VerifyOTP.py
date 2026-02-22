from rest_framework.response import Response
from rest_framework import status
from datetime import datetime


def VOtp(request, otps_col) : 
    phone = request.data.get('phone', '').strip()
    email = request.data.get('email', '').strip()
    otp_code = request.data.get('otp', '').strip()

    if not all([phone, email, otp_code]):
        return Response({
            "success": False, 
            "error": "Phone, email, OTP required"
        }, status=status.HTTP_400_BAD_REQUEST)

    otp_doc = otps_col.find_one({
        '$or': [{'phone': phone, 'email': email}, {'phone': phone}, {'email': email}],
        'otp': otp_code,
        'is_used': False,
        'expires_at': {'$gt': datetime.now()}
    })
    
    if not otp_doc:
        return Response({
            "success": False, 
            "error": "Invalid or expired OTP"
        }, status=status.HTTP_400_BAD_REQUEST)

    otps_col.update_one({'_id': otp_doc['_id']}, {'$set': {'is_used': True}})
    #print("OTP VERIFIED!")
    
    return Response({
        "success": True,
        "message": "OTP verified! Reset your password."
    })