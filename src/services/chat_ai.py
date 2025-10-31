import os
import json
from openai import OpenAI

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Case category definitions
CASE_CATEGORIES = {
    'eviction_housing': 'Eviction & Housing',
    'debt_collection': 'Debt Collection',
    'irs_tax': 'IRS & Tax Issues',
    'wage_garnishment': 'Wage Garnishment',
    'medical_bills': 'Medical Bills',
    'benefits_denial': 'Benefits Denial',
    'auto_repossession': 'Auto Repossession',
    'consumer_rights': 'Consumer Rights'
}

# Category-specific questions
CATEGORY_QUESTIONS = {
    'debt_collection': [
        "What is the name of the debt collector or collection agency contacting you?",
        "How are they contacting you? (Phone calls, letters, texts, emails)",
        "How frequently do they contact you?",
        "Have they contacted you before 8am or after 9pm?",
        "Have they threatened arrest, jail time, or legal action they cannot take?",
        "Have they contacted your employer, family members, or friends about this debt?",
        "What is the amount they claim you owe?"
    ],
    'eviction_housing': [
        "What reason did your landlord provide for the eviction?",
        "Did you receive a written eviction notice? If so, how many days notice were you given?",
        "Are you currently behind on rent? If so, how many months?",
        "Have you reported any maintenance or habitability issues to your landlord?",
        "Has your landlord made any threats or attempted to lock you out?",
        "Do you have a written lease agreement?",
        "What state and county do you reside in?"
    ],
    'auto_repossession': [
        "Was your vehicle repossessed from your property or a public location?",
        "Did the repossession agent enter your garage, gated area, or use force?",
        "Were you current on your payments when the vehicle was repossessed?",
        "Did you receive proper notice before the repossession?",
        "Have you been notified about a deficiency balance?",
        "Were any personal belongings left in the vehicle?",
        "What is the name of the lender or financing company?"
    ],
    'irs_tax': [
        "What type of IRS notice did you receive? (CP2000, CP14, Levy Notice, etc.)",
        "What tax year(s) does this notice concern?",
        "What amount does the IRS claim you owe?",
        "Have you filed all required tax returns for the years in question?",
        "Do you have documentation that disputes the IRS's claims?",
        "Have you previously communicated with the IRS about this matter?",
        "What is the deadline mentioned in the notice?"
    ],
    'wage_garnishment': [
        "What percentage or amount of your wages is being garnished?",
        "What is the garnishment for? (Debt, child support, taxes, student loans)",
        "Did you receive a court order or notice before the garnishment began?",
        "How long has the garnishment been in effect?",
        "Is the garnishment causing you financial hardship?",
        "Have you attempted to negotiate or contest the garnishment?",
        "Who is the creditor or agency collecting through the garnishment?"
    ],
    'medical_bills': [
        "What is the total amount of the medical bill in question?",
        "Was this service supposed to be covered by insurance?",
        "Did your insurance deny the claim? If so, what reason was given?",
        "Have you received an itemized bill showing all charges?",
        "Are there charges you believe are incorrect or duplicate?",
        "Have you attempted to negotiate the bill with the provider?",
        "Has this bill been sent to collections?"
    ],
    'benefits_denial': [
        "What type of benefits were denied? (Unemployment, disability, social security, etc.)",
        "Did you receive a written denial letter explaining the reason?",
        "What reason was given for the denial?",
        "Have you filed an appeal? If so, what was the outcome?",
        "Do you have documentation supporting your eligibility?",
        "When did you receive the denial notice?",
        "What is the deadline to appeal?"
    ],
    'consumer_rights': [
        "What type of consumer issue are you experiencing?",
        "Who is the business or entity involved?",
        "What damages or losses have you suffered?",
        "Do you have contracts, receipts, or other documentation?",
        "Have you attempted to resolve this directly with the business?",
        "When did this issue begin?",
        "What outcome are you seeking?"
    ]
}


def analyze_initial_story(story: str) -> dict:
    """
    Analyzes the user's initial story and categorizes the case type.
    Returns category and initial response.
    """
    system_prompt = """You are a professional consumer advocacy assistant for Turbo Response. 
Your role is to analyze client situations and categorize them into one of these case types:
- eviction_housing: Eviction & Housing issues
- debt_collection: Debt Collection harassment
- irs_tax: IRS & Tax Issues
- wage_garnishment: Wage Garnishment
- medical_bills: Medical Bills disputes
- benefits_denial: Benefits Denial (unemployment, disability, etc.)
- auto_repossession: Auto Repossession
- consumer_rights: General Consumer Rights violations

Respond in a professional, intelligent, and hopeful tone. Be confident and knowledgeable.
Return your response as JSON with: {"category": "category_name", "response": "your response text"}"""

    user_prompt = f"""Analyze this client's situation and categorize it. Then provide a brief, professional acknowledgment.

Client's situation: {story}

Your response should:
1. Acknowledge their situation professionally
2. Indicate you understand the issue
3. Mention you'll gather details to identify their options
4. Be confident and solution-focused

Return JSON only."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
    except Exception as e:
        print(f"Error in analyze_initial_story: {e}")
        return {
            "category": "consumer_rights",
            "response": "I understand. Let me gather some details so we can identify your options and develop an effective response strategy."
        }


def generate_follow_up_questions(category: str, story: str) -> list:
    """
    Generates 5-7 targeted follow-up questions based on the case category.
    """
    if category not in CATEGORY_QUESTIONS:
        category = 'consumer_rights'
    
    questions = CATEGORY_QUESTIONS[category]
    
    # Select 5-7 most relevant questions based on the story
    system_prompt = """You are a professional consumer advocacy assistant. 
Select the 5-7 most relevant questions from the provided list based on the client's situation.
Return them as a JSON array of strings, ordered by importance."""

    user_prompt = f"""Client's situation: {story}

Available questions:
{json.dumps(questions, indent=2)}

Select the 5-7 most relevant questions for this specific situation.
Return as JSON: {{"questions": ["question1", "question2", ...]}}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result.get('questions', questions[:6])
    except Exception as e:
        print(f"Error in generate_follow_up_questions: {e}")
        return questions[:6]


def generate_ai_response(conversation_history: list, user_message: str) -> str:
    """
    Generates an AI response based on conversation history.
    Uses professional, intelligent, hopeful tone.
    """
    system_prompt = """You are a professional consumer advocacy assistant for Turbo Response.

TONE GUIDELINES:
- Professional and knowledgeable
- Confident and solution-focused
- Reference specific laws when relevant (FDCPA, FCRA, TCPA, etc.)
- Use "may", "could", "potential" (never "definitely" or "will")
- Focus on document preparation services, not legal advice
- Be clear and direct, no excessive emotion

COMPLIANCE:
- Never give legal advice
- Never predict outcomes
- Say "may violate" not "is illegal"
- Include disclaimers when discussing laws
- Focus on YOUR document preparation services

STYLE:
- Acknowledge answers briefly ("Got it.", "I understand.", "That's important.")
- Ask one question at a time
- Reference relevant laws when appropriate
- Maintain confidence: "We can help you" not "We might be able to"

"""

    try:
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(conversation_history)
        messages.append({"role": "user", "content": user_message})
        
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7
        )
        
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error in generate_ai_response: {e}")
        return "I understand. Let me continue gathering information to help you effectively."


def generate_case_analysis(conversation_history: list, category: str, evidence_files: list = None) -> dict:
    """
    Generates a comprehensive case analysis based on the full conversation.
    Returns summary, potential issues, and next steps.
    """
    system_prompt = """You are a professional consumer advocacy specialist analyzing a client's situation.

Generate a comprehensive analysis including:
1. Case Summary: Clear overview of the situation
2. Potential Issues: Specific violations or problems (use "may", "could", "potential")
3. Relevant Laws: Consumer protection laws that may apply
4. Recommended Actions: What documents we can prepare to help them

TONE: Professional, intelligent, solution-focused
COMPLIANCE: Never give legal advice, focus on document preparation services

Return as JSON:
{
    "summary": "Clear case overview",
    "potential_issues": ["Issue 1", "Issue 2", ...],
    "relevant_laws": ["Law/Regulation 1", "Law/Regulation 2", ...],
    "recommended_actions": ["Action 1", "Action 2", ...],
    "next_steps": "What we can do to help"
}"""

    # Build conversation context
    conversation_text = "\n".join([
        f"{msg['role']}: {msg['content']}" 
        for msg in conversation_history
    ])
    
    evidence_text = ""
    if evidence_files:
        evidence_text = f"\n\nEvidence provided: {len(evidence_files)} file(s) uploaded"
    
    user_prompt = f"""Analyze this {CASE_CATEGORIES.get(category, 'consumer')} case:

{conversation_text}{evidence_text}

Provide a comprehensive analysis focusing on what Turbo Response can do to help with document preparation."""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
    except Exception as e:
        print(f"Error in generate_case_analysis: {e}")
        return {
            "summary": "Based on the information provided, we can help you prepare professional response documents.",
            "potential_issues": ["Potential consumer rights violations"],
            "relevant_laws": ["Consumer protection statutes may apply"],
            "recommended_actions": ["Professional response letter", "Documentation package"],
            "next_steps": "We can prepare customized documents to help you address this situation effectively."
        }


def generate_hook_message(analysis: dict) -> str:
    """
    Generates a compelling "hook" message to encourage lead conversion.
    Professional tone that creates urgency and hope.
    """
    summary = analysis.get('summary', '')
    issues = analysis.get('potential_issues', [])
    next_steps = analysis.get('next_steps', '')
    
    hook = f"""Based on your situation, here's what we've identified:

**Your Situation:**
{summary}

**Potential Issues We've Identified:**
"""
    
    for i, issue in enumerate(issues[:3], 1):
        hook += f"\n{i}. {issue}"
    
    hook += f"""

**What We Can Do:**
{next_steps}

**Ready to take action?** We can prepare professional response documents customized to your specific situation. Our AI-powered system combined with consumer advocacy expertise ensures you get the most effective documents possible.

Would you like us to help you with this? If so, I'll need your contact information so we can get started."""
    
    return hook

