import os
import base64
from openai import OpenAI

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def analyze_document(file_path_or_url, category=None):
    """
    Analyze an uploaded document using OpenAI vision API.
    
    Args:
        file_path_or_url: Path to local file or URL to image/PDF
        category: Optional case category to provide context
        
    Returns:
        dict with analysis results
    """
    try:
        # Prepare the image for OpenAI
        if file_path_or_url.startswith('http'):
            image_input = file_path_or_url
        else:
            # Read and encode local file
            with open(file_path_or_url, 'rb') as f:
                image_data = base64.b64encode(f.read()).decode('utf-8')
                # Determine mime type
                ext = file_path_or_url.lower().split('.')[-1]
                mime_types = {
                    'jpg': 'image/jpeg',
                    'jpeg': 'image/jpeg',
                    'png': 'image/png',
                    'pdf': 'application/pdf'
                }
                mime_type = mime_types.get(ext, 'image/jpeg')
                image_input = f"data:{mime_type};base64,{image_data}"
        
        # Create analysis prompt
        category_context = f" The user indicated this is related to: {category}." if category else ""
        
        prompt = f"""Analyze this document carefully.{category_context}

Please provide:

1. **Document Type**: What kind of document is this? (e.g., Eviction Notice, Debt Collection Letter, Benefits Denial, Court Summons, etc.)

2. **Urgency Level**: Rate as HIGH, MEDIUM, or LOW based on deadlines and consequences

3. **Key Information**: Extract important details such as:
   - Dates and deadlines
   - Amounts owed or claimed
   - Parties involved (sender, recipient, agencies)
   - Case numbers or reference numbers
   - Specific violations or issues mentioned

4. **Potential Issues**: Identify any problems, violations, or red flags you notice

5. **Recommended Questions**: What 5-7 specific questions should we ask this person to better understand their situation and create an action plan?

Format your response as JSON with these exact keys:
{{
    "document_type": "string",
    "urgency_level": "HIGH|MEDIUM|LOW",
    "key_information": {{
        "dates": ["list of important dates"],
        "amounts": ["list of monetary amounts"],
        "parties": ["list of involved parties"],
        "reference_numbers": ["list of case/reference numbers"],
        "other": ["other important details"]
    }},
    "potential_issues": ["list of issues or violations"],
    "summary": "2-3 sentence summary of what this document is about",
    "recommended_questions": ["list of 5-7 specific questions to ask"]
}}

If you cannot read the document clearly, return an error in this format:
{{
    "error": "description of the problem"
}}"""

        # Call OpenAI vision API
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": image_input}
                        }
                    ]
                }
            ],
            max_tokens=2000,
            temperature=0.3
        )
        
        # Parse response
        import json
        result_text = response.choices[0].message.content.strip()
        
        # Extract JSON from markdown code blocks if present
        if '```json' in result_text:
            result_text = result_text.split('```json')[1].split('```')[0].strip()
        elif '```' in result_text:
            result_text = result_text.split('```')[1].split('```')[0].strip()
            
        analysis = json.loads(result_text)
        
        return {
            'success': True,
            'analysis': analysis
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def generate_urgency_message(analysis):
    """
    Generate a user-friendly urgency message based on document analysis.
    """
    urgency = analysis.get('urgency_level', 'MEDIUM')
    doc_type = analysis.get('document_type', 'document')
    
    urgency_messages = {
        'HIGH': f"⚠️ **URGENT**: I've reviewed your {doc_type}. This requires immediate attention.",
        'MEDIUM': f"📋 I've analyzed your {doc_type}. Let's address this promptly.",
        'LOW': f"✓ I've reviewed your {doc_type}. We have time to handle this properly."
    }
    
    return urgency_messages.get(urgency, urgency_messages['MEDIUM'])


def format_analysis_for_user(analysis):
    """
    Format the document analysis into a user-friendly message.
    """
    if not analysis or 'error' in analysis:
        return "I had trouble reading that document. Could you try uploading a clearer image or tell me about your situation instead?"
    
    doc_type = analysis.get('document_type', 'document')
    summary = analysis.get('summary', '')
    key_info = analysis.get('key_information', {})
    issues = analysis.get('potential_issues', [])
    
    message = f"{generate_urgency_message(analysis)}\n\n"
    message += f"**Document Type:** {doc_type}\n\n"
    message += f"**Summary:** {summary}\n\n"
    
    # Add key information
    if key_info.get('dates'):
        message += f"**Important Dates:** {', '.join(key_info['dates'])}\n\n"
    
    if key_info.get('amounts'):
        message += f"**Amounts:** {', '.join(key_info['amounts'])}\n\n"
    
    # Add potential issues
    if issues:
        message += "**Potential Issues I Identified:**\n"
        for issue in issues[:3]:  # Limit to top 3
            message += f"• {issue}\n"
        message += "\n"
    
    message += "This situation requires a strategic response. Let me ask you some questions so I can create the best action plan for you."
    
    return message

