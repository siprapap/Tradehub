from flask import Flask,request, jsonify
from werkzeug.security import check_password_hash
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_cors import CORS
import re

app=Flask(__name__)
CORS(app)

client= MongoClient("mongodb+srv://gammmsp_db_user:yh0ViSWlmu6ocLmx@cluster0.hupxpm8.mongodb.net/?appName=Cluster0")
db=client["Tradehub"]
userInfo=db["userInfo"]
productInfo = db["productInfo"]

"""userInfo.insert_one({'username':'1234','password':'1234'})"""
'''productInfo.insert_one({'user':'1234','name':'NoteBook','price':'20000','detail':'Asus notebook AMDryzen2909'})'''

@app.route('/')
def test():
    return '<h1>hello</h1>'

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
                {'detail': search_regex}
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
    username = data.get('username')
    password = data.get('password')
    data = request.get_json()

    name = data.get('name')
    user = data.get('user')
    detail = data.get('detail')
    price = data.get('price')
    date = data.get('date')

    productInfo.insert_one({'user':user,'name':name,'price':price,'detail':detail,'date':date})
    return jsonify({"message": ""}), 200

@app.route('/deletePorduct', methods=['POST'])
def deletePorduct():
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
