import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.automation import automation_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Enable CORS for cross-origin requests
CORS(app)

app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(automation_bp)

# Database disabled for Render deployment (uses temporary file system)
# Uncomment below if you need to use database with persistent storage
# app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# db.init_app(app)
# with app.app_context():
#     db.create_all()

# ============================================================================
# PAGE ROUTES - Serve specific HTML pages for each route
# ============================================================================

@app.route('/')
def home():
    """Landing page"""
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/intake')
def intake():
    """Intake form page where users submit their cases"""
    return send_from_directory(app.static_folder, 'intake_ai.html')

@app.route('/admin')
def admin():
    """Admin dashboard for case management"""
    return send_from_directory(app.static_folder, 'admin_ai.html')

@app.route('/confirmation')
def confirmation():
    """Confirmation page after form submission"""
    return send_from_directory(app.static_folder, 'confirmation.html')

@app.route('/privacy-policy')
def privacy_policy():
    """Privacy policy page"""
    return send_from_directory(app.static_folder, 'privacy_policy.html')

@app.route('/terms')
def terms():
    """Terms of service page"""
    return send_from_directory(app.static_folder, 'terms_of_service.html')

@app.route('/disclaimer')
def disclaimer():
    """Legal disclaimer page"""
    return send_from_directory(app.static_folder, 'disclaimer.html')

# ============================================================================
# STATIC FILE HANDLER - Serve CSS, JS, images, and other static assets
# ============================================================================

@app.route('/<path:path>')
def serve_static(path):
    """Serve static files (CSS, JS, images, etc.)"""
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404
    
    file_path = os.path.join(static_folder_path, path)
    if os.path.exists(file_path):
        return send_from_directory(static_folder_path, path)
    
    # If file not found, return 404 instead of falling back to index.html
    return "File not found", 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

