import os
import uuid
from flask import Blueprint, request, jsonify
import json
from datetime import datetime
from werkzeug.utils import secure_filename
from src.models.chat import db, Conversation, Message, EvidenceUpload, ChatLead
from src.services.chat_ai import (
    analyze_initial_story,
    analyze_story_and_document
)
from src.services.document_analysis import (
    analyze_document,
    format_analysis_for_user
)

chat_bp = Blueprint('chat', __name__, url_prefix='/api/chat')

UPLOAD_FOLDER = '/tmp/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@chat_bp.route('/start', methods=['POST'])
def start_conversation():
    """Start a new chat conversation with basic info"""
    try:
        data = request.get_json()
        
        # Create conversation with user info
        conversation = Conversation(
            session_id=str(uuid.uuid4()),
            category=data.get('category', 'consumer_rights'),
            status='info_collected',
            message_count=0
        )
        db.session.add(conversation)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'conversation_id': conversation.id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@chat_bp.route('/upload', methods=['POST'])
def upload_document():
    """Upload and analyze a document"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        conversation_id = request.form.get('conversation_id')
        
        if not conversation_id:
            return jsonify({'error': 'Conversation ID required'}), 400
        
        conversation = Conversation.query.get(conversation_id)
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, f"{conversation_id}_{filename}")
        file.save(filepath)
        
        # Analyze document with OpenAI vision
        analysis_result = analyze_document(filepath, conversation.category)
        
        if not analysis_result['success']:
            return jsonify({'error': 'Failed to analyze document'}), 500
        
        analysis = analysis_result['analysis']
        
        # Save evidence upload record
        evidence = EvidenceUpload(
            conversation_id=conversation.id,
            file_key=filename,
            file_url=filepath,  # In production, this would be S3 URL
            filename=filename,
            mime_type=file.content_type,
            file_size=len(file.read())
        )
        db.session.add(evidence)
        
        # Update conversation
        conversation.evidence_count += 1
        conversation.status = 'document_analyzed'
        
        # Create AI message with analysis
        analysis_message = format_analysis_for_user(analysis)
        
        ai_msg = Message(
            conversation_id=conversation.id,
            role='assistant',
            content=analysis_message,
            msg_metadata=json.dumps(analysis)
        )
        db.session.add(ai_msg)
        conversation.message_count += 1
        
        db.session.commit()
        
        # Clean up temp file
        os.remove(filepath)
        
        return jsonify({
            'success': True,
            'file_url': filepath,
            'analysis_message': analysis_message,
            'recommended_questions': analysis.get('recommended_questions', [])
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@chat_bp.route('/analyze-intake', methods=['POST'])
def analyze_intake():
    """Analyze story and document, provide professional summary and next steps"""
    try:
        data = request.get_json()
        conversation_id = data.get('conversation_id')
        story = data.get('story', '').strip()
        
        if not conversation_id or not story:
            return jsonify({'error': 'Conversation ID and story required'}), 400
        
        conversation = Conversation.query.get(conversation_id)
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        # Get document analysis if available
        document_analysis = None
        messages = Message.query.filter_by(conversation_id=conversation.id).order_by(Message.timestamp).all()
        for msg in messages:
            if msg.role == 'assistant' and msg.msg_metadata:
                try:
                    document_analysis = json.loads(msg.msg_metadata)
                    break
                except:
                    pass
        
        # Generate comprehensive analysis
        ai_response = analyze_story_and_document(
            story=story,
            document_analysis=document_analysis,
            category=conversation.category
        )
        
        # Save story as user message
        user_msg = Message(
            conversation_id=conversation.id,
            role='user',
            content=story
        )
        db.session.add(user_msg)
        
        # Save AI analysis
        ai_msg = Message(
            conversation_id=conversation.id,
            role='assistant',
            content=ai_response
        )
        db.session.add(ai_msg)
        
        conversation.message_count += 2
        conversation.status = 'intake_complete'
        db.session.commit()
        
        return jsonify({
            'success': True,
            'analysis': ai_response
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@chat_bp.route('/analyze', methods=['POST'])
def generate_action_plan():
    """Generate final action plan with pricing"""
    try:
        data = request.get_json()
        conversation_id = data.get('conversation_id')
        
        if not conversation_id:
            return jsonify({'error': 'Conversation ID required'}), 400
        
        conversation = Conversation.query.get(conversation_id)
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        # Get all messages
        messages = Message.query.filter_by(conversation_id=conversation.id).order_by(Message.timestamp).all()
        
        # Analyze case
        analysis = generate_case_analysis(
            [{'role': m.role, 'content': m.content} for m in messages],
            conversation.category
        )
        
        # Generate pricing based on complexity
        pricing_map = {
            'eviction': '$199',
            'debt': '$149',
            'tax': '$249',
            'wage': '$199',
            'medical': '$149',
            'benefits': '$199',
            'auto': '$179',
            'consumer': '$149'
        }
        
        pricing = pricing_map.get(conversation.category, '$199')
        
        # Save summary
        conversation.summary = analysis.get('summary', '')
        conversation.status = 'action_plan_generated'
        db.session.commit()
        
        return jsonify({
            'success': True,
            'summary': analysis.get('summary', ''),
            'actions': analysis.get('recommended_actions', []),
            'pricing': pricing,
            'timeline': 'Most actions completed within 24-48 hours'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@chat_bp.route('/conversation/<int:conversation_id>', methods=['GET'])
def get_conversation(conversation_id):
    """Get full conversation history"""
    try:
        conversation = Conversation.query.get(conversation_id)
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        messages = Message.query.filter_by(conversation_id=conversation.id).order_by(Message.timestamp).all()
        evidence = EvidenceUpload.query.filter_by(conversation_id=conversation.id).all()
        
        return jsonify({
            'conversation': conversation.to_dict(),
            'messages': [m.to_dict() for m in messages],
            'evidence': [e.to_dict() for e in evidence]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
