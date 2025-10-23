from flask import Blueprint, jsonify, request

user_bp = Blueprint('user', __name__)

# Database routes disabled for Render deployment
# These routes are not used by the frontend for the intake form

@user_bp.route('/users', methods=['GET'])
def get_users():
    return jsonify([])

@user_bp.route('/users', methods=['POST'])
def create_user():
    return jsonify({'message': 'User creation disabled'}), 201

@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    return jsonify({'error': 'Not found'}), 404

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    return jsonify({'error': 'Not found'}), 404

@user_bp.route('/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    return '', 204

