from flask import Flask,request, jsonify
from werkzeug.security import check_password_hash
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_cors import CORS
import os
import re

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

PRODUCT_CATEGORIES = {
    "Electronics",
    "Home & Kitchen",
    "Fashion & Apparel",
    "Beauty & Personal Care",
    "Health & Wellness",
    "Toys & Hobbies",
    "Sports & Outdoors",
    "Books & Media",
    "Pet Supplies",
    "Automotive",
    "Grocery & Gourmet Food",
    "Baby Essentials",
    "Household Essentials",
    "Office Supplies",
    "Tools & Home Improvement",
    "Furniture",
    "Musical Instruments",
    "Others",
}

app=Flask(__name__)
CORS(app)

MONGODB_URI = os.environ.get("MONGODB_URI")
if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI environment variable is not set (see .env.example)")

client= MongoClient(MONGODB_URI)
db=client["Tradehub"]
userInfo=db["userInfo"]
productInfo = db["productInfo"]

"""userInfo.insert_one({'username':'1234','password':'1234'})"""
'''productInfo.insert_one({'user':'1234','name':'NoteBook','price':'20000','detail':'Asus notebook AMDryzen2909'})'''

@app.route('/')
def test():
    return '<h1>hello</h1>'

def get_user_information(username):
    if not username:
        return None

    user = userInfo.find_one({"username": username})
    if not user:
        return None

    return {
        "_id": str(user["_id"]),
        "username": user["username"]
    }

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    username = data.get('username')
    password = data.get('password')

    user = userInfo.find_one({"username": username})

    if not user:
        return jsonify({"message": "User not found"}), 404

    if (user["password"]!= password):
        return jsonify({"message": "Wrong password"}), 401

    return jsonify({
        "username": user["username"]
    }), 200

@app.route('/getUserInfo', methods=['POST'])
def getUserInfo():
    data = request.get_json() or {}
    username = data.get('username')

    user = get_user_information(username)

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify(user), 200

@app.route('/signUp', methods=['POST'])
def signUp():
    data = request.get_json()

    username = data.get('username')
    password = data.get('password')

    user = userInfo.find_one({"username": username})

    if not user:
        userInfo.insert_one({'username':username,'password':password})
        return jsonify({"username": username}), 200

    return jsonify({"message": "Username has been taken"}), 401

@app.route('/getUserProducts', methods=['POST'])
def getUserProducts():
    data = request.get_json()
    product= productInfo.find({"user":data.get('username')})
    all_product = list(product)
    for p in all_product:
        p["_id"] = str(p["_id"])
    return jsonify({'all_product': all_product}), 200

@app.route('/getAllProducts', methods=['POST'])
def getAllProducts():
    data = request.get_json() or {}
    keyword = data.get('keyword', '').strip()

    if keyword:
        search_regex = {'$regex': re.escape(keyword), '$options': 'i'}
        product= productInfo.find({
            '$or': [
                {'name': search_regex},
                {'detail': search_regex},
                {'category': search_regex},
                {'contactDetails': search_regex},
                {'locationName': search_regex}
            ]
        })
    else:
        product= productInfo.find()

    all_product = list(product)
    for p in all_product:
        p["_id"] = str(p["_id"])
    return jsonify({'all_product': all_product}), 200

@app.route('/addProduct', methods=['POST'])
def addProduct():
    data = request.get_json()
    name = data.get('name')
    user = data.get('user')
    detail = data.get('detail')
    price = data.get('price')
    date = data.get('date')
    category = data.get('category', '')
    contact_details = data.get('contactDetails', '')
    image_uri = data.get('imageUri', '')
    location_name = data.get('locationName', '')
    latitude = data.get('latitude', '')
    longitude = data.get('longitude', '')

    if category not in PRODUCT_CATEGORIES:
        return jsonify({"message": "Invalid category"}), 400

    productInfo.insert_one({
        'user':user,
        'name':name,
        'price':price,
        'detail':detail,
        'date':date,
        'category': category,
        'contactDetails': contact_details,
        'imageUri': image_uri,
        'locationName': location_name,
        'latitude': latitude,
        'longitude': longitude
    })
    return jsonify({"message": ""}), 200

@app.route('/updateProduct', methods=['POST'])
def updateProduct():
    data = request.get_json()
    product_id = data.get('productId')
    user = data.get('user')
    name = data.get('name')
    detail = data.get('detail')
    price = data.get('price')
    category = data.get('category', '')
    contact_details = data.get('contactDetails', '')
    image_uri = data.get('imageUri', '')
    location_name = data.get('locationName', '')
    latitude = data.get('latitude', '')
    longitude = data.get('longitude', '')

    if category not in PRODUCT_CATEGORIES:
        return jsonify({"message": "Invalid category"}), 400

    result = productInfo.update_one(
        {
            '_id': ObjectId(product_id),
            'user': user
        },
        {
            '$set': {
                'name': name,
                'price': price,
                'detail': detail,
                'category': category,
                'contactDetails': contact_details,
                'imageUri': image_uri,
                'locationName': location_name,
                'latitude': latitude,
                'longitude': longitude
            }
        }
    )

    if result.matched_count == 0:
        return jsonify({"message": "Product not found"}), 404

    return jsonify({"message": "Product updated"}), 200

@app.route('/deleteProduct', methods=['POST'])
def deleteProduct():
    data = request.get_json()
    product_id = data.get('product_id')
    username = data.get('username')

    result = productInfo.delete_one({
        '_id': ObjectId(product_id),
        'user': username
    })

    if result.deleted_count == 0:
        return jsonify({"message": "Product not found"}), 404

    return jsonify({"message": "Product deleted"}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
