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
    system_prompt = """You are an expert consumer defense strategist. Analyze the client's situation and:
1. Categorize it into one of these types: debt_collection, eviction_housing, irs_tax, wage_garnishment, medical_bills, benefits_denial, auto_repossession, consumer_rights
2. Provide a brief, professional acknowledgment

Return as JSON: {"category": "category_name", "response": "brief professional response"}"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Client's situation: {story}"}
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
    Professional, confident, solution-focused tone.
    """
    system_prompt = """You are an expert consumer defense strategist at Turbo Response. You analyze situations and create strategic action plans based on consumer protection laws.

YOUR ROLE:
- Identify potential violations of FDCPA, FCRA, TCPA, Fair Housing Act, and state consumer laws
- Design strategic response plans that WE will execute for the client
- Present what WE can do, not what THEY should do
- Professional, confident, intelligent tone

CRITICAL FRAMING:
❌ NEVER SAY: "You should gather evidence" / "You need to review" / "Consult a lawyer" / "Attend traffic school"
✅ ALWAYS SAY: "We can prepare a formal dispute" / "Our strategy would involve" / "We'll draft documentation citing [statute]"

TONE:
- Authoritative and confident (like a seasoned strategist)
- Reference specific laws and statutes when relevant
- Use compliance-safe language: "may constitute a violation", "potential grounds under [law]"
- NEVER mention lawyers, attorneys, or legal counsel
- Frame everything as OUR action plan, not their to-do list

RESPONSE STRUCTURE:
- Acknowledge their answer briefly (1 sentence max)
- Ask ONE targeted follow-up question
- When presenting strategy: "Based on [law/statute], we can prepare [specific document/action]"
- End with confidence about what WE will do

GOOD EXAMPLE:
"I see. Under the FDCPA, collectors may not contact you at work if they know your employer prohibits it. We can prepare a cease-and-desist letter citing this violation and demand they stop. How many times have they called your workplace?"

BAD EXAMPLE:
"Got it. You should familiarize yourself with the FDCPA laws. Consider consulting an attorney who specializes in debt collection."

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
        return "I understand. Let me continue gathering information to develop your strategic response plan."


def generate_case_analysis(conversation_history: list, category: str, evidence_files: list = None) -> dict:
    """
    Generates a comprehensive case analysis based on the full conversation.
    Returns summary, potential issues, and recommended actions WE will take.
    """
    system_prompt = """You are an expert consumer defense strategist analyzing a client's situation.

Generate a comprehensive strategic action plan including:
1. Case Summary: Clear overview of the situation
2. Potential Violations: Specific violations of consumer protection laws (use "may have violated", "potential violation")
3. Our Strategy: What WE will do - specific documents WE will prepare, actions WE will take
4. Legal Basis: Cite specific statutes and laws that support our strategy

CRITICAL:
- Frame everything as what WE will do for them
- NEVER say "you should" or "consult a lawyer"
- Reference specific laws (FDCPA Section 806, FCRA Section 611, etc.)
- Use compliance-safe language ("may constitute", "potential grounds")
- Present OUR action plan, not their to-do list

Return as JSON:
{
    "summary": "2-3 sentence case overview",
    "potential_violations": ["violation 1 with law cited", "violation 2 with law cited"],
    "our_strategy": ["Action 1 we'll take", "Action 2 we'll take", "Action 3 we'll take"],
    "legal_basis": ["Statute 1", "Statute 2"],
    "recommended_actions": ["Final action plan item 1", "Final action plan item 2"]
}"""

    conversation_text = "\n".join([f"{msg['role']}: {msg['content']}" for msg in conversation_history])

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Category: {category}\n\nConversation:\n{conversation_text}"}
            ],
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
    except Exception as e:
        print(f"Error in generate_case_analysis: {e}")
        return {
            "summary": "Based on your situation, we've identified several strategic opportunities.",
            "potential_violations": ["Potential consumer protection violations identified"],
            "our_strategy": ["We'll prepare comprehensive documentation", "We'll draft formal dispute letters"],
            "legal_basis": ["Consumer protection statutes"],
            "recommended_actions": ["Strategic response plan", "Document preparation"]
        }


def generate_hook_message(analysis: dict) -> str:
    """
    Generates an engaging hook message based on case analysis.
    """
    violations = analysis.get('potential_violations', [])
    if violations:
        return f"I've identified {len(violations)} potential violations in your case. Let me ask you a few targeted questions so we can build the strongest possible response strategy."
    return "I see several strategic opportunities here. Let me gather a few more details so we can create an effective action plan for you."

