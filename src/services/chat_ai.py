import os
import json
from openai import OpenAI

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))


def analyze_story_and_document(story: str, document_analysis: dict = None, category: str = None) -> str:
    """
    Analyzes the user's story and document, provides professional summary and general dispute strategies.
    NO back-and-forth Q&A. Just informative analysis and next steps.
    """
    
    system_prompt = """You are an expert consumer defense strategist at Turbo Response.

Your task: Provide a professional, informative analysis of the client's situation.

STRUCTURE:
1. Brief acknowledgment of their situation (1-2 sentences)
2. If document provided: Explain what the document is and key details
3. General dispute strategies based on relevant consumer protection laws (FDCPA, FCRA, TCPA, Fair Housing, etc.)
4. End with: "A Turbo Response specialist will call you within 24-48 hours to discuss your case in detail and create a customized action plan."

TONE:
- Professional and knowledgeable
- Confident but compliance-safe ("may constitute", "potential violation")
- Reference specific laws when relevant
- NO questions - just informative analysis
- NO "consult a lawyer" - position Turbo Response as the solution

KEEP IT CONCISE: 3-4 paragraphs maximum."""

    # Build user prompt
    user_prompt = f"Client's situation: {story}\n\n"
    
    if category:
        user_prompt += f"Case category: {category}\n\n"
    
    if document_analysis:
        user_prompt += f"Document analysis:\n{json.dumps(document_analysis, indent=2)}\n\n"
    
    user_prompt += "Provide a professional analysis with general dispute strategies, then close with the 24-48 hour call message."

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=800
        )
        
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error in analyze_story_and_document: {e}")
        return f"""Thank you for sharing your situation. Based on what you've described, there are several consumer protection laws that may apply to your case.

A Turbo Response specialist will call you within 24-48 hours to discuss your case in detail and create a customized action plan. We'll review all the specifics and determine the best strategy for your situation.

In the meantime, keep all documentation related to your case in a safe place."""


def analyze_initial_story(story: str) -> dict:
    """
    Simple categorization for routing purposes.
    """
    system_prompt = """Categorize this consumer issue into one of these categories:
- debt_collection
- eviction_housing  
- irs_tax
- wage_garnishment
- medical_bills
- benefits_denial
- auto_repossession
- consumer_rights

Return JSON: {"category": "category_name"}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": story}
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return {"category": result.get("category", "consumer_rights")}
    except Exception as e:
        print(f"Error in analyze_initial_story: {e}")
        return {"category": "consumer_rights"}


# Deprecated functions - kept for compatibility
def generate_follow_up_questions(category: str, story: str) -> list:
    return []

def generate_ai_response(conversation_history: list, user_message: str) -> str:
    return "Thank you. A specialist will contact you within 24-48 hours."

def generate_case_analysis(conversation_history: list, category: str, evidence_files: list = None) -> dict:
    return {
        "summary": "Case received and under review.",
        "potential_violations": [],
        "our_strategy": [],
        "legal_basis": [],
        "recommended_actions": ["Specialist will call within 24-48 hours"]
    }

def generate_hook_message(analysis: dict) -> str:
    return "Thank you for your submission. A specialist will contact you soon."

