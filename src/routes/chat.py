import os
import uuid
import json
from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.chat import Conversation, Message, EvidenceUpload, ChatLead
from src.services.chat_ai import (
    analyze_initial_story,
    generate_follow_up_questions,
    generate_ai_response,
    generate_case_analysis,
    generate_hook_message
)

chat_bp = Blueprint('chat', __name__, url_prefix='/api/chat')


@chat_bp.route('/start', methods=['POST'])
def start_conversation():
    """Start a new chat conversation"""
    try:
        data = request.get_json()
        initial_story = data.get('story', '').strip()
        
        if not initial_story:
            return jsonify({'error': 'Story is required'}), 400
        
        # Generate unique session ID
        session_id = str(uuid.uuid4())
        
        # Analyze the initial story
        analysis = analyze_initial_story(initial_story)
        category = analysis.get('category', 'consumer_rights')
        ai_response = analysis.get('response', 'I understand. Let me gather some details.')
        
        # Create conversation
        conversation = Conversation(
            session_id=session_id,
            category=category,
            status='active',
            message_count=2
        )
        db.session.add(conversation)
        db.session.flush()
        
        # Save user message
        user_msg = Message(
            conversation_id=conversation.id,
            role='user',
            content=initial_story
        )
        db.session.add(user_msg)
        
        # Generate follow-up questions
        questions = generate_follow_up_questions(category, initial_story)
        
        # Save AI response with questions
        questions_text = f"{ai_response}\n\nTo help you effectively, I need to gather some specific details:\n\n"
        questions_text += f"**Question 1 of {len(questions)}:** {questions[0]}"
        
        ai_msg = Message(
            conversation_id=conversation.id,
            role='assistant',
            content=questions_text,
            metadata=json.dumps({'questions': questions, 'current_question': 0})
        )
        db.session.add(ai_msg)
        
        db.session.commit()
        
        return jsonify({
            'session_id': session_id,
            'conversation_id': conversation.id,
            'category': category,
            'message': questions_text,
            'total_questions': len(questions)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in start_conversation: {e}")
        return jsonify({'error': 'Failed to start conversation'}), 500


@chat_bp.route('/message', methods=['POST'])
def send_message():
    """Send a message and get AI response"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        user_message = data.get('message', '').strip()
        
        if not session_id or not user_message:
            return jsonify({'error': 'Session ID and message are required'}), 400
        
        # Get conversation
        conversation = Conversation.query.filter_by(session_id=session_id).first()
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        # Save user message
        user_msg = Message(
            conversation_id=conversation.id,
            role='user',
            content=user_message
        )
        db.session.add(user_msg)
        conversation.message_count += 1
        
        # Get conversation history
        messages = Message.query.filter_by(conversation_id=conversation.id).order_by(Message.timestamp).all()
        conversation_history = [
            {'role': msg.role, 'content': msg.content}
            for msg in messages[:-1]  # Exclude the message we just added
        ]
        
        # Check if we're in Q&A phase
        last_ai_message = next((msg for msg in reversed(messages[:-1]) if msg.role == 'assistant'), None)
        if last_ai_message and last_ai_message.metadata:
            metadata = json.loads(last_ai_message.metadata)
            questions = metadata.get('questions', [])
            current_q = metadata.get('current_question', 0)
            
            # Move to next question
            next_q = current_q + 1
            
            if next_q < len(questions):
                # Ask next question
                ai_response = f"Got it. **Question {next_q + 1} of {len(questions)}:** {questions[next_q]}"
                
                ai_msg = Message(
                    conversation_id=conversation.id,
                    role='assistant',
                    content=ai_response,
                    metadata=json.dumps({'questions': questions, 'current_question': next_q})
                )
                db.session.add(ai_msg)
                conversation.message_count += 1
                
                db.session.commit()
                
                return jsonify({
                    'message': ai_response,
                    'question_number': next_q + 1,
                    'total_questions': len(questions),
                    'phase': 'questions'
                }), 200
            else:
                # All questions answered, request evidence
                ai_response = """Thank you for providing those details. 

To give you the most effective response strategy, it would be helpful if you could upload any relevant evidence you have. This might include:

• Letters or notices you've received
• Photos or screenshots
• Contracts or agreements
• Email correspondence
• Any other relevant documentation

You can upload up to 5 files. If you don't have any evidence to upload right now, you can skip this step."""
                
                ai_msg = Message(
                    conversation_id=conversation.id,
                    role='assistant',
                    content=ai_response
                )
                db.session.add(ai_msg)
                conversation.message_count += 1
                conversation.status = 'awaiting_upload'
                
                db.session.commit()
                
                return jsonify({
                    'message': ai_response,
                    'phase': 'evidence_upload'
                }), 200
        
        # General conversation (shouldn't normally reach here)
        ai_response = generate_ai_response(conversation_history, user_message)
        
        ai_msg = Message(
            conversation_id=conversation.id,
            role='assistant',
            content=ai_response
        )
        db.session.add(ai_msg)
        conversation.message_count += 1
        
        db.session.commit()
        
        return jsonify({
            'message': ai_response,
            'phase': 'conversation'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in send_message: {e}")
        return jsonify({'error': 'Failed to send message'}), 500


@chat_bp.route('/upload', methods=['POST'])
def upload_evidence():
    """Upload evidence files"""
    try:
        session_id = request.form.get('session_id')
        
        if not session_id:
            return jsonify({'error': 'Session ID is required'}), 400
        
        # Get conversation
        conversation = Conversation.query.filter_by(session_id=session_id).first()
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        # Check for uploaded files
        files = request.files.getlist('files')
        if not files or len(files) == 0:
            return jsonify({'error': 'No files uploaded'}), 400
        
        if len(files) > 5:
            return jsonify({'error': 'Maximum 5 files allowed'}), 400
        
        uploaded_files = []
        upload_dir = os.path.join('src', 'static', 'uploads', 'evidence')
        os.makedirs(upload_dir, exist_ok=True)
        
        for file in files:
            if file.filename:
                # Generate unique filename
                file_ext = os.path.splitext(file.filename)[1]
                file_key = f"{conversation.session_id}_{uuid.uuid4().hex[:8]}{file_ext}"
                file_path = os.path.join(upload_dir, file_key)
                
                # Save file
                file.save(file_path)
                file_size = os.path.getsize(file_path)
                
                # Create database record
                evidence = EvidenceUpload(
                    conversation_id=conversation.id,
                    file_url=f"/uploads/evidence/{file_key}",
                    file_key=file_key,
                    original_filename=file.filename,
                    mime_type=file.content_type,
                    file_size=file_size
                )
                db.session.add(evidence)
                conversation.evidence_count += 1
                
                uploaded_files.append({
                    'filename': file.filename,
                    'url': f"/uploads/evidence/{file_key}"
                })
        
        conversation.status = 'analyzing'
        db.session.commit()
        
        return jsonify({
            'message': 'Files uploaded successfully',
            'files': uploaded_files,
            'count': len(uploaded_files)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in upload_evidence: {e}")
        return jsonify({'error': 'Failed to upload files'}), 500


@chat_bp.route('/analyze', methods=['POST'])
def analyze_case():
    """Generate case analysis"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        
        if not session_id:
            return jsonify({'error': 'Session ID is required'}), 400
        
        # Get conversation
        conversation = Conversation.query.filter_by(session_id=session_id).first()
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        # Get conversation history
        messages = Message.query.filter_by(conversation_id=conversation.id).order_by(Message.timestamp).all()
        conversation_history = [
            {'role': msg.role, 'content': msg.content}
            for msg in messages
        ]
        
        # Get evidence files
        evidence_files = EvidenceUpload.query.filter_by(conversation_id=conversation.id).all()
        
        # Generate analysis
        analysis = generate_case_analysis(
            conversation_history,
            conversation.category,
            [e.to_dict() for e in evidence_files]
        )
        
        # Generate hook message
        hook_message = generate_hook_message(analysis)
        
        # Save analysis as summary
        conversation.summary = analysis.get('summary', '')
        conversation.status = 'completed'
        
        # Save hook message
        ai_msg = Message(
            conversation_id=conversation.id,
            role='assistant',
            content=hook_message,
            metadata=json.dumps(analysis)
        )
        db.session.add(ai_msg)
        conversation.message_count += 1
        
        db.session.commit()
        
        return jsonify({
            'analysis': analysis,
            'message': hook_message,
            'phase': 'analysis_complete'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in analyze_case: {e}")
        return jsonify({'error': 'Failed to analyze case'}), 500


@chat_bp.route('/submit-lead', methods=['POST'])
def submit_lead():
    """Submit lead contact information"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        name = data.get('name', '').strip()
        email = data.get('email', '').strip()
        phone = data.get('phone', '').strip()
        best_time = data.get('best_time_to_call', '').strip()
        
        if not all([session_id, name, email, phone]):
            return jsonify({'error': 'All fields are required'}), 400
        
        # Get conversation
        conversation = Conversation.query.filter_by(session_id=session_id).first()
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        # Create lead
        lead = ChatLead(
            conversation_id=conversation.id,
            name=name,
            email=email,
            phone=phone,
            best_time_to_call=best_time,
            category=conversation.category,
            status='new'
        )
        db.session.add(lead)
        conversation.converted_to_lead = True
        
        # Save confirmation message
        confirmation = f"""Thank you, {name}! We've received your information.

**Next Steps:**
• We'll review your case details and evidence
• A member of our team will contact you within 24 hours
• We'll discuss your customized document package and pricing
• Best time to reach you: {best_time or 'Any time'}

We're here to help you take action. Talk to you soon!"""
        
        ai_msg = Message(
            conversation_id=conversation.id,
            role='assistant',
            content=confirmation
        )
        db.session.add(ai_msg)
        conversation.message_count += 1
        
        db.session.commit()
        
        # TODO: Send notification to owner (email or in-app)
        
        return jsonify({
            'message': confirmation,
            'lead_id': lead.id,
            'phase': 'lead_submitted'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error in submit_lead: {e}")
        return jsonify({'error': 'Failed to submit lead'}), 500


@chat_bp.route('/conversation/<session_id>', methods=['GET'])
def get_conversation(session_id):
    """Get full conversation history"""
    try:
        conversation = Conversation.query.filter_by(session_id=session_id).first()
        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404
        
        messages = Message.query.filter_by(conversation_id=conversation.id).order_by(Message.timestamp).all()
        evidence = EvidenceUpload.query.filter_by(conversation_id=conversation.id).all()
        lead = ChatLead.query.filter_by(conversation_id=conversation.id).first()
        
        return jsonify({
            'conversation': conversation.to_dict(),
            'messages': [msg.to_dict() for msg in messages],
            'evidence': [e.to_dict() for e in evidence],
            'lead': lead.to_dict() if lead else None
        }), 200
        
    except Exception as e:
        print(f"Error in get_conversation: {e}")
        return jsonify({'error': 'Failed to get conversation'}), 500

