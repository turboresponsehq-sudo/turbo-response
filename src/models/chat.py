from datetime import datetime
from src.models.user import db

class Conversation(db.Model):
    """Tracks each chat conversation session"""
    __tablename__ = 'conversations'
    
    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), unique=True, nullable=False)
    category = db.Column(db.String(50))  # eviction, debt_collection, irs_tax, etc.
    status = db.Column(db.String(20), default='active')  # active, awaiting_upload, analyzing, completed
    summary = db.Column(db.Text)
    message_count = db.Column(db.Integer, default=0)
    evidence_count = db.Column(db.Integer, default=0)
    converted_to_lead = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    messages = db.relationship('Message', backref='conversation', lazy=True, cascade='all, delete-orphan')
    evidence = db.relationship('EvidenceUpload', backref='conversation', lazy=True, cascade='all, delete-orphan')
    lead = db.relationship('ChatLead', backref='conversation', uselist=False, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'session_id': self.session_id,
            'category': self.category,
            'status': self.status,
            'summary': self.summary,
            'message_count': self.message_count,
            'evidence_count': self.evidence_count,
            'converted_to_lead': self.converted_to_lead,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Message(db.Model):
    """Stores individual messages in a conversation"""
    __tablename__ = 'messages'
    
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversations.id'), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # user, assistant, system
    content = db.Column(db.Text, nullable=False)
    metadata = db.Column(db.Text)  # JSON string for additional data
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'role': self.role,
            'content': self.content,
            'metadata': self.metadata,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }


class EvidenceUpload(db.Model):
    """Tracks uploaded evidence files"""
    __tablename__ = 'evidence_uploads'
    
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversations.id'), nullable=False)
    file_url = db.Column(db.String(500), nullable=False)
    file_key = db.Column(db.String(200), nullable=False)
    original_filename = db.Column(db.String(200))
    mime_type = db.Column(db.String(100))
    file_size = db.Column(db.Integer)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'file_url': self.file_url,
            'file_key': self.file_key,
            'original_filename': self.original_filename,
            'mime_type': self.mime_type,
            'file_size': self.file_size,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None
        }


class ChatLead(db.Model):
    """Stores lead information captured from chat"""
    __tablename__ = 'chat_leads'
    
    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey('conversations.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    best_time_to_call = db.Column(db.String(20))  # morning, afternoon, evening
    category = db.Column(db.String(50))
    status = db.Column(db.String(20), default='new')  # new, contacted, qualified, converted, closed
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'best_time_to_call': self.best_time_to_call,
            'category': self.category,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

