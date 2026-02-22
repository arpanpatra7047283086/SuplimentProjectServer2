from utils.jwt_helper import decode_token
from bson import ObjectId
from datetime import datetime
import uuid
import math

from utils.jwt_helper import decode_token
from bson import ObjectId
from datetime import datetime
import uuid
import math

from utils.jwt_helper import decode_token
from bson import ObjectId
from datetime import datetime
import uuid
import math

def CreateOrderUser(auth_header, data, users_collection, orders_collection):
    try:
        # -------- AUTH --------
        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        user_id = payload["user_id"]

        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise ValueError("User not found")
        
        print(f"DEBUG: User {user_id} STARTS with {user.get('points', 0)} points")

        # -------- VALIDATE INPUT --------
        items = data.get("items", [])
        coins_used = int(data.get("coins_used", 0))
        total_paid = float(data.get("total", 0))
        
        if not items:
            raise ValueError("No items in order")

        # -------- CALCULATE ACTUAL SUBTOTAL --------
        actual_subtotal = sum(
            float(i["price"]) * int(i["quantity"])
            for i in items
        )

        shipping_fee = float(data.get("shipping_fee", 0))
        cart_total = actual_subtotal + shipping_fee
        
        print(f"DEBUG: actual_subtotal={actual_subtotal}, shipping_fee={shipping_fee}, cart_total={cart_total}")
        print(f"DEBUG: Frontend sent coins_used={coins_used}, total_paid={total_paid}")

        # -------- 4% COINS VALIDATION --------
        MAX_COIN_PERCENT = 0.04
        COIN_VALUE = 0.2
        
        max_coin_discount_value = round(cart_total * MAX_COIN_PERCENT, 2)
        max_coins_allowed = math.floor(max_coin_discount_value / COIN_VALUE)
        
        print(f"DEBUG: max_coins_allowed={max_coins_allowed}")

        # ✅ AUTO-CORRECT coins
        if coins_used > max_coins_allowed:
            coins_used = max_coins_allowed
            print(f"✅ AUTO-CORRECTED: coins_used={coins_used}")
        if coins_used < 0:
            coins_used = 0

        # ✅ COINS DEDUCTION - HANDLE ZERO COINS CORRECTLY
        current_points = user.get("points", 0)
        print(f"DEBUG: current_points={current_points}, coins_used={coins_used}")
        
        if coins_used > 0:  # ✅ ONLY deduct if coins_used > 0
            if current_points < coins_used:
                raise ValueError(f"Insufficient coins. Need {coins_used}, have {current_points}")
            
            # -------- DEDUCT COINS FIRST --------
            deduct_result = users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$inc": {"points": -coins_used}}
            )
            
            if deduct_result.modified_count == 0:
                raise ValueError("Failed to deduct coins")
            
            print(f"✅ DEDUCTED {coins_used} coins successfully")
        else:
            print("✅ No coins to deduct (coins_used=0)")

        # -------- EARN COINS --------
        earned_coins = 0 #math.floor(actual_subtotal * 0.04 / 0.2)  # ✅ 4% of items only
        print(f"DEBUG: coins_used={coins_used}, earned_coins={earned_coins}")

        # -------- ORDER ID --------
        order_id = str(uuid.uuid4())[:8].upper()

        # -------- ORDER ITEMS --------
        order_items = []
        for item in items:
            order_items.append({
                "product_id": str(item.get("productId")),
                "name": item.get("name"),
                "price": float(item.get("price")),
                "quantity": int(item.get("quantity")),
                "total": float(item.get("price")) * int(item.get("quantity")),
                "flavor": item.get("selectedFlavor", "N/A"),
                "weight": item.get("selectedWeight", "N/A"),
            })

        # -------- SAVE ORDER --------
        orders_collection.insert_one({
            "_id": ObjectId(),
            "order_id": order_id,
            "user_id": user_id,
            "actual_subtotal": round(actual_subtotal, 2),
            "shipping_fee": round(shipping_fee, 2),
            "cart_total": round(cart_total, 2),
            "coins_used": coins_used,
            "coin_discount_value": round(coins_used * COIN_VALUE, 2),
            "cash_paid": round(total_paid, 2),
            "earned_points": earned_coins,
            "order_items": order_items,
            "payment_method": data.get("payment_method", "cod"),
            "utr_number": data.get("utr_number"),
            "address": data.get("address", {}),
            "status": "pending",
            "created_at": datetime.utcnow()
        })

        # -------- ADD EARNED COINS --------
        if earned_coins > 0:  # ✅ Only if earned > 0
            users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$inc": {"points": earned_coins}}
            )
            print(f"✅ ADDED {earned_coins} earned coins")

        # ✅ FINAL POINTS CHECK
        final_user = users_collection.find_one({"_id": ObjectId(user_id)})
        final_points = final_user.get("points", 0) if final_user else current_points - coins_used + earned_coins
        
        print(f"✅ FINAL: User {user_id} points = {final_points} (used {coins_used}, earned {earned_coins})")

        return order_id, earned_coins, final_points

    except Exception as e:
        print("Order Error:", str(e))
        # ✅ ROLLBACK only if we actually deducted coins
        try:
            if 'coins_used' in locals() and coins_used > 0:
                # Check current points after potential deduction
                current_after = users_collection.find_one({"_id": ObjectId(user_id)}).get("points", 0)
                if current_after < user.get("points", 0):  # Coins were deducted
                    users_collection.update_one(
                        {"_id": ObjectId(user_id)},
                        {"$inc": {"points": coins_used}}
                    )
                    print(f"✅ ROLLBACK: Added back {coins_used} coins")
        except:
            pass
        raise ValueError(str(e))
