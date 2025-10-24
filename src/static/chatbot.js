// Turbo AI Chatbot - AI-Powered Consumer Defense Assistant
// Enhanced with Chief Strategist Knowledge Base
class TurboAI {
    constructor() {
        this.isOpen = false;
        this.conversationHistory = [];
        this.leadCaptured = false;
        this.init();
    }

    init() {
        this.createChatWidget();
        this.bindEvents();
        this.loadKnowledgeBase();
    }

    createChatWidget() {
        // Create chat button
        const chatButton = document.createElement('div');
        chatButton.id = 'turbo-chat-button';
        chatButton.innerHTML = `
            <div class="chat-icon">💬</div>
            <span>Chat with Turbo AI</span>
        `;
        document.body.appendChild(chatButton);

        // Create chat window
        const chatWindow = document.createElement('div');
        chatWindow.id = 'turbo-chat-window';
        chatWindow.innerHTML = `
            <div class="chat-header">
                <div class="chat-title">
                    <div class="ai-avatar">🤖</div>
                    <div>
                        <h4>Turbo AI Assistant</h4>
                        <span class="status">Online • Ready to help</span>
                    </div>
                </div>
                <button class="chat-close" onclick="turboAI.toggleChat()">✕</button>
            </div>
            <div class="chat-messages" id="chat-messages">
                <div class="message ai-message">
                    <div class="message-content">
                        Hey 👋 I'm Turbo AI — your AI-powered consumer defense assistant. Tell me what kind of notice or issue you're facing, and I'll help you fight back against unfair practices.
                    </div>
                </div>
            </div>
            <div class="chat-input-area">
                <input type="text" id="chat-input" placeholder="Type your question..." />
                <button onclick="turboAI.sendMessage()" class="send-btn">Send</button>
            </div>
        `;
        document.body.appendChild(chatWindow);

        // Add styles
        this.addStyles();
    }

    addStyles() {
        const styles = `
            #turbo-chat-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #06b6d4, #3b82f6);
                color: white;
                padding: 15px 20px;
                border-radius: 50px;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(6, 182, 212, 0.4);
                display: flex;
                align-items: center;
                gap: 10px;
                font-weight: 600;
                z-index: 1000;
                transition: all 0.3s ease;
                animation: pulse 2s infinite;
            }

            #turbo-chat-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 25px rgba(6, 182, 212, 0.6);
            }

            @keyframes pulse {
                0%, 100% { box-shadow: 0 4px 20px rgba(6, 182, 212, 0.4); }
                50% { box-shadow: 0 4px 25px rgba(6, 182, 212, 0.7); }
            }

            #turbo-chat-window {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 350px;
                height: 500px;
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
                border: 1px solid rgba(6, 182, 212, 0.3);
                border-radius: 15px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                display: none;
                flex-direction: column;
                z-index: 1001;
                overflow: hidden;
            }

            #turbo-chat-window.open {
                display: flex;
                animation: slideUp 0.3s ease;
            }

            @keyframes slideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }

            .chat-header {
                background: linear-gradient(135deg, #06b6d4, #3b82f6);
                padding: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .chat-title {
                display: flex;
                align-items: center;
                gap: 10px;
                color: white;
            }

            .ai-avatar {
                font-size: 24px;
            }

            .chat-title h4 {
                margin: 0;
                font-size: 16px;
            }

            .status {
                font-size: 12px;
                opacity: 0.8;
            }

            .chat-close {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .chat-close:hover {
                background: rgba(255, 255, 255, 0.1);
            }

            .chat-messages {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                background: rgba(15, 23, 42, 0.9);
            }

            .message {
                margin-bottom: 15px;
                display: flex;
                flex-direction: column;
            }

            .ai-message .message-content {
                background: linear-gradient(135deg, #06b6d4, #3b82f6);
                color: white;
                padding: 12px 15px;
                border-radius: 15px 15px 15px 5px;
                max-width: 80%;
                align-self: flex-start;
                line-height: 1.4;
            }

            .user-message .message-content {
                background: rgba(100, 116, 139, 0.3);
                color: #f8fafc;
                padding: 12px 15px;
                border-radius: 15px 15px 5px 15px;
                max-width: 80%;
                align-self: flex-end;
            }

            .chat-input-area {
                padding: 15px;
                background: rgba(30, 41, 59, 0.8);
                display: flex;
                gap: 10px;
                border-top: 1px solid rgba(6, 182, 212, 0.2);
            }

            #chat-input {
                flex: 1;
                background: rgba(15, 23, 42, 0.8);
                border: 1px solid rgba(6, 182, 212, 0.3);
                border-radius: 25px;
                padding: 10px 15px;
                color: #f8fafc;
                outline: none;
            }

            #chat-input:focus {
                border-color: #06b6d4;
                box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
            }

            .send-btn {
                background: linear-gradient(135deg, #06b6d4, #3b82f6);
                color: white;
                border: none;
                border-radius: 25px;
                padding: 10px 20px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
            }

            .send-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);
            }

            .quick-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 10px;
            }

            .quick-action-btn {
                background: rgba(6, 182, 212, 0.2);
                color: #06b6d4;
                border: 1px solid rgba(6, 182, 212, 0.3);
                border-radius: 15px;
                padding: 5px 12px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .quick-action-btn:hover {
                background: rgba(6, 182, 212, 0.3);
                color: white;
            }

            @media (max-width: 768px) {
                #turbo-chat-window {
                    width: 90vw;
                    height: 70vh;
                    bottom: 10px;
                    right: 5vw;
                }
                
                #turbo-chat-button {
                    bottom: 15px;
                    right: 15px;
                    padding: 12px 16px;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    loadKnowledgeBase() {
        this.knowledgeBase = {
            // Company Overview & Mission
            companyInfo: {
                mission: "Turbo Response exists to help everyday consumers fight back against unfair financial, legal, and collection practices. Our mission is simple: make professional consumer defense fast, affordable, and accessible to everyone through the power of AI and automation.",
                problemSolved: "Millions of Americans face wrongful debt collections, IRS threats, garnishments, repossessions, and denials — but can't afford a lawyer or don't understand their rights. Turbo Response fills that gap by using AI-powered legal intelligence to create precise, compliant responses and deliver case strategies within 24–48 hours.",
                differences: "We combine AI-powered defense with real human oversight, offer flat-rate pricing with no retainers or hidden fees, deliver case responses in hours instead of weeks, and are built for individuals — not corporations.",
                vision: "To become the leading AI-driven consumer protection platform in America — helping millions defend their rights, rebuild their credit, and stand up against predatory financial systems."
            },

            // Pricing Tiers
            pricing: {
                "Case Starter Plan": {
                    price: "$149",
                    bestFor: "Individuals facing a single issue or notice",
                    includes: [
                        "1 case review with AI-assisted analysis",
                        "Professionally written response letter",
                        "One follow-up or revision",
                        "24–48-hour turnaround"
                    ],
                    why: "Affordable starting point for small or first-time disputes"
                },
                "Standard Defense Plan": {
                    price: "$349",
                    bestFor: "People dealing with multiple notices or complex disputes",
                    popular: true,
                    includes: [
                        "Full AI + expert-reviewed case defense",
                        "30-day support window for resubmissions or follow-ups",
                        "Personalized dispute letters and appeal templates",
                        "Real-time progress tracking"
                    ],
                    why: "Offers more coverage and ongoing support for recurring disputes"
                },
                "Comprehensive Case Management": {
                    price: "Starting at $699",
                    bestFor: "High-stakes or ongoing cases (IRS, wage garnishment, repossessions, etc.)",
                    includes: [
                        "End-to-end case oversight",
                        "Multiple dispute stages and escalation letters",
                        "AI + human monitoring for success tracking",
                        "Priority support and dedicated review"
                    ],
                    why: "Designed for serious, complex, or high-value cases requiring deep analysis"
                }
            },

            // Case Categories
            categories: {
                "debt collection": {
                    name: "Debt Collection",
                    issues: "Harassment, invalid debts, unfair reporting",
                    outcome: "Cease and desist + debt validation",
                    description: "We help you challenge invalid debts, request validation, stop harassment, and protect your credit score."
                },
                "credit bureau": {
                    name: "Credit Bureau Errors",
                    issues: "Inaccurate credit reports, duplicate accounts",
                    outcome: "Correction or deletion of inaccurate items",
                    description: "We dispute inaccurate data with bureaus and creditors; final removal depends on agency verification."
                },
                "irs": {
                    name: "IRS & Tax Issues",
                    issues: "CP2000 notices, levy threats, audits, back taxes",
                    outcome: "Dispute or resolution plan submission",
                    description: "We help you respond to tax notices, penalty abatement requests, payment plan negotiations, and audit responses."
                },
                "wage garnishment": {
                    name: "Wage Garnishment",
                    issues: "Employer withholding, judgment errors",
                    outcome: "Reduction or release of garnishment",
                    description: "We help stop wage garnishments, challenge calculations, and protect your income."
                },
                "eviction": {
                    name: "Eviction & Housing",
                    issues: "Illegal evictions, notice disputes, habitability issues",
                    outcome: "Temporary relief or legal correspondence",
                    description: "We help with security deposit disputes, illegal eviction notices, habitability issues, and landlord violations."
                },
                "repossession": {
                    name: "Auto Repossession",
                    issues: "Improper notice or recovery",
                    outcome: "Documentation for reclaim or settlement",
                    description: "We challenge illegal repo, demand proper notices, and protect your transportation."
                },
                "medical bills": {
                    name: "Medical Bills",
                    issues: "Overcharges, denied claims",
                    outcome: "Adjusted billing or dispute submission",
                    description: "We challenge incorrect charges, negotiate payment plans, and dispute insurance denials."
                },
                "benefits": {
                    name: "Benefit Denials",
                    issues: "Government or employer benefits denied",
                    outcome: "Reinstatement or appeal documentation",
                    description: "We appeal denied benefits, challenge reductions, and restore your assistance."
                },
                "consumer fraud": {
                    name: "Consumer Fraud",
                    issues: "Identity theft, scams, unauthorized charges",
                    outcome: "Reporting and reversal letters",
                    description: "We help fight scams, warranty issues, and unfair business practices."
                },
                "bank disputes": {
                    name: "Bank & Loan Disputes",
                    issues: "Unauthorized charges, closure disputes",
                    outcome: "Account review or claim reversal",
                    description: "We help with unauthorized charges, account closure disputes, and loan issues."
                }
            },

            // Customer Journey
            process: {
                step1: "Visit the Website - You land on our homepage and learn about Turbo Response's services and mission.",
                step2: "Chat with Turbo AI - Our chatbot greets you, answers basic questions, and directs you to the intake form.",
                step3: "Case Submission - You fill in personal info, describe your issue, and upload any documents or notices.",
                step4: "AI Case Analysis (24–48 Hours) - Turbo AI scans, categorizes, and drafts a defense plan. Human experts review and finalize it.",
                step5: "Case Response Delivery - You receive your personalized case plan and letter via secure email.",
                step6: "Support & Follow-Up - Depending on your plan tier, you receive updates, revisions, or additional support.",
                step7: "Resolution - You use Turbo Response's materials to file disputes, respond to agencies, or defend against collections.",
                tracking: "You receive a Case ID via email. Updates and notifications are sent automatically through the dashboard or email."
            },

            // AI Methodology
            aiMethodology: {
                how: "Our AI uses Natural Language Processing (NLP) to read notices, identify key legal terms, dates, and threats, and match issue types to specific statutes (e.g., FDCPA, FCRA).",
                patterns: "We identify illegal wording by debt collectors, missed due process in repossession or eviction, and violations of credit reporting time limits.",
                generation: "AI prepares personalized legal language that is reviewed by human experts before delivery, tested for tone, compliance, and clarity.",
                effectiveness: "Our approach is fast, consistent, and statute-based. We remove emotion and focus on law and facts, producing strong, compliant responses."
            },

            // Support
            support: {
                contact: "Email: TurboResponseHQ@gmail.com | Chat: Turbo AI Assistant (24/7) | Phone: Available by request (business hours only)",
                hours: "Monday–Friday: 9 AM to 7 PM EST | Weekend: Email + Chat support only",
                response: "Typically within 4–6 hours on weekdays. Urgent case escalations handled first.",
                includes: "Case status inquiries, revisions or clarifications, and upgrade assistance to higher plans"
            },

            // Competitive Advantages
            advantages: {
                speed: "AI delivers results in 24–48 hours vs. weeks with traditional law firms",
                affordability: "Flat pricing ($149-$699) vs. $200–$400/hr attorney fees with retainers",
                precision: "AI trained on real consumer protection laws with human expert verification",
                empowerment: "Customers learn their rights along the way",
                outcomes: "Clients stop collection calls within days, credit reports corrected within 30–45 days, garnishments reduced or reversed"
            },

            // FAQs - Comprehensive
            faqs: {
                "How fast will I get my response?": "Typically within 24–48 hours after submitting your documents.",
                
                "Are you a law firm?": "No. We are a consumer rights defense platform powered by AI and human expertise. We provide educational and informational case defense support, not legal representation.",
                
                "What's your pricing?": "We offer three plans: Case Starter Plan ($149), Standard Defense Plan ($349 - most popular), and Comprehensive Case Management (starting at $699). Each includes different levels of support and follow-ups.",
                
                "Can you remove negative items from my credit report?": "We dispute inaccurate data with bureaus and creditors; final removal depends on agency verification.",
                
                "What if I have multiple cases?": "Choose the Standard ($349) or Comprehensive ($699) plan for multi-issue coverage and ongoing support.",
                
                "Do you guarantee results?": "We guarantee compliance, speed, and expert quality — not external agency decisions. Results depend on third-party agencies, not solely our actions.",
                
                "How do I upload documents?": "Via the intake form. Supported formats: PDF, DOC, JPG, PNG.",
                
                "Can I upgrade plans later?": "Yes. You can upgrade at any time by contacting support.",
                
                "Is my data safe?": "Yes. Turbo Response uses bank-level SSL encryption and never shares data with third parties.",
                
                "Can I get a refund?": "Refunds are available if no work has started. Once the AI begins analysis, refunds aren't possible.",
                
                "How do I know my case is being worked on?": "You'll receive a confirmation email and updates through your assigned Case ID.",
                
                "Can I talk to a person?": "Yes. You can request human review or callback for complex situations.",
                
                "What if my case is rejected?": "We'll explain why and suggest next steps or credit your payment toward another case.",
                
                "Do you handle IRS letters?": "Yes — including audits, levy threats, and back-tax disputes.",
                
                "Can you contact creditors directly?": "Yes, with your written authorization.",
                
                "Do you offer phone consultations?": "Yes, for Comprehensive plan clients or by request."
            }
        };
    }

    bindEvents() {
        document.getElementById('turbo-chat-button').addEventListener('click', () => this.toggleChat());
        
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const chatWindow = document.getElementById('turbo-chat-window');
        const chatButton = document.getElementById('turbo-chat-button');
        
        if (this.isOpen) {
            chatWindow.classList.add('open');
            chatButton.style.display = 'none';
        } else {
            chatWindow.classList.remove('open');
            chatButton.style.display = 'flex';
        }
    }

    sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addMessage(message, 'user');
        input.value = '';
        
        // Simulate AI thinking
        setTimeout(() => {
            const response = this.generateResponse(message);
            this.addMessage(response.text, 'ai');
            
            if (response.quickActions) {
                this.addQuickActions(response.quickActions);
            }
        }, 1000);
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerHTML = `<div class="message-content">${content}</div>`;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    addQuickActions(actions) {
        const messagesContainer = document.getElementById('chat-messages');
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'quick-actions';
        
        actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = 'quick-action-btn';
            btn.textContent = action.text;
            btn.onclick = () => this.handleQuickAction(action.action);
            actionsDiv.appendChild(btn);
        });
        
        messagesContainer.appendChild(actionsDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    generateResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check for FAQ matches first (highest priority)
        for (const [question, answer] of Object.entries(this.knowledgeBase.faqs)) {
            if (this.matchesQuery(lowerMessage, question)) {
                return { text: answer };
            }
        }
        
        // Check for pricing questions
        if (this.matchesQuery(lowerMessage, "price pricing cost plans tiers")) {
            return {
                text: "We offer three flexible plans:\n\n💰 Case Starter Plan: $149 - Perfect for single issues\n\n💰 Standard Defense Plan: $349 (Most Popular!) - Great for multiple cases with 30-day support\n\n💰 Comprehensive Case Management: Starting at $699 - For complex, high-stakes cases\n\nEach plan includes AI analysis + expert review. Would you like details on any plan?",
                quickActions: [
                    { text: "Tell me more about $349 plan", action: "pricing_standard" },
                    { text: "Start My Case", action: "start_case" }
                ]
            };
        }
        
        // Check for company info questions
        if (this.matchesQuery(lowerMessage, "about mission company who are you")) {
            return {
                text: this.knowledgeBase.companyInfo.mission + "\n\n" + this.knowledgeBase.companyInfo.differences,
                quickActions: [
                    { text: "See Our Advantages", action: "advantages" },
                    { text: "Start My Case", action: "start_case" }
                ]
            };
        }
        
        // Check for process/timeline questions
        if (this.matchesQuery(lowerMessage, "process how does it work timeline steps")) {
            return {
                text: "Here's how Turbo Response works:\n\n1️⃣ Submit your case via our intake form\n2️⃣ Our AI analyzes your situation (24-48 hours)\n3️⃣ Human experts review and finalize your strategy\n4️⃣ You receive your personalized case plan & response letters\n5️⃣ You use these to defend yourself or file disputes\n\nYou get a Case ID to track progress every step of the way!",
                quickActions: [
                    { text: "Start My Case", action: "start_case" },
                    { text: "Learn More", action: "learn_more" }
                ]
            };
        }
        
        // Check for category matches
        for (const [categoryKey, categoryData] of Object.entries(this.knowledgeBase.categories)) {
            if (lowerMessage.includes(categoryKey) || this.matchesCategoryKeywords(lowerMessage, categoryKey)) {
                return {
                    text: `Great! I can help with ${categoryData.name}. ${categoryData.description}`,
                    quickActions: [
                        { text: "Start My Case", action: "start_case" },
                        { text: "Learn More", action: "learn_more" },
                        { text: "Speak to Agent", action: "escalate" }
                    ]
                };
            }
        }
        
        // Check for support/contact questions
        if (this.matchesQuery(lowerMessage, "contact support help email phone")) {
            return {
                text: `📧 Email: TurboResponseHQ@gmail.com\n💬 Chat: Available 24/7\n📞 Phone: Available by request (business hours)\n\nResponse time: Usually 4-6 hours on weekdays. Urgent cases handled first!`,
                quickActions: [
                    { text: "Start My Case", action: "start_case" },
                    { text: "Speak to Agent", action: "escalate" }
                ]
            };
        }
        
        // Check for guarantee/results questions
        if (this.matchesQuery(lowerMessage, "guarantee results success outcome promise")) {
            return {
                text: "We guarantee professional quality, compliance, and speed — not external agency outcomes. Results depend on third-party agencies (creditors, IRS, courts), not solely our actions. However, our clients typically see: collection calls stop within days, credit reports corrected within 30-45 days, and garnishments reduced or reversed.",
                quickActions: [
                    { text: "Start My Case", action: "start_case" }
                ]
            };
        }
        
        // Default response with lead capture
        if (!this.leadCaptured) {
            return {
                text: "I'd love to help you! To give you the best guidance, could you tell me: What type of notice or issue are you dealing with? (eviction, debt collection, IRS, wage garnishment, medical bills, etc.)",
                quickActions: [
                    { text: "Debt Collection", action: "category_debt" },
                    { text: "IRS/Tax Issue", action: "category_irs" },
                    { text: "Eviction", action: "category_eviction" },
                    { text: "Other Issue", action: "capture_lead" }
                ]
            };
        }
        
        return {
            text: "Based on what you've shared, I recommend starting with our intake form where you can upload your documents and get a personalized case plan. Would you like me to direct you there?",
            quickActions: [
                { text: "Start My Case", action: "start_case" },
                { text: "Speak to Agent", action: "escalate" }
            ]
        };
    }

    matchesQuery(message, question) {
        const keywords = question.toLowerCase().split(' ');
        return keywords.some(keyword => message.includes(keyword));
    }

    matchesCategoryKeywords(message, category) {
        const categoryKeywords = {
            "debt collection": ['debt', 'collector', 'collection', 'credit', 'bill', 'owe', 'collection agency'],
            "credit bureau": ['credit', 'report', 'bureau', 'equifax', 'experian', 'transunion'],
            "irs": ['irs', 'tax', 'taxes', 'audit', 'refund', 'penalty', 'cp2000', 'levy'],
            "wage garnishment": ['wage', 'garnish', 'paycheck', 'salary', 'income', 'withhold'],
            "eviction": ['evict', 'landlord', 'rent', 'lease', 'housing', 'apartment', 'notice'],
            "repossession": ['repo', 'car', 'vehicle', 'tow', 'repossess', 'auto'],
            "medical bills": ['medical', 'hospital', 'doctor', 'insurance', 'health', 'bill'],
            "benefits": ['benefits', 'food stamps', 'welfare', 'disability', 'social security', 'unemployment'],
            "consumer fraud": ['scam', 'fraud', 'warranty', 'refund', 'unauthorized', 'identity theft'],
            "bank disputes": ['bank', 'account', 'loan', 'charge', 'unauthorized']
        };
        
        const keywords = categoryKeywords[category] || [];
        return keywords.some(keyword => message.includes(keyword));
    }

    handleQuickAction(action) {
        switch (action) {
            case 'start_case':
                window.location.href = '/intake';
                break;
            case 'pricing_standard':
                this.addMessage("Our Standard Defense Plan ($349) is our most popular option! It includes:\n\n✅ Full AI + expert-reviewed case defense\n✅ 30-day support window for follow-ups\n✅ Personalized dispute letters & templates\n✅ Real-time progress tracking\n\nPerfect for people dealing with multiple notices or complex disputes.", 'ai');
                setTimeout(() => {
                    this.addQuickActions([
                        { text: "Start My Case", action: "start_case" },
                        { text: "See All Plans", action: "pricing_all" }
                    ]);
                }, 1000);
                break;
            case 'advantages':
                this.addMessage("Here's why customers choose Turbo Response:\n\n⚡ Speed: AI delivers results in 24-48 hours (vs. weeks with lawyers)\n💰 Affordability: Flat pricing with no retainers (vs. $200-400/hr)\n🎯 Precision: AI trained on consumer protection laws + human verification\n📚 Empowerment: Learn your rights along the way\n✅ Results: Clients stop collection calls within days, credit corrected in 30-45 days", 'ai');
                setTimeout(() => {
                    this.addQuickActions([
                        { text: "Start My Case", action: "start_case" }
                    ]);
                }, 1000);
                break;
            case 'category_eviction':
                this.addMessage("Perfect! I can help with eviction and housing issues.", 'ai');
                setTimeout(() => {
                    this.addMessage("We handle security deposit disputes, illegal eviction notices, habitability issues, and landlord violations. Upload your eviction notice or lease documents, and we'll create a defense strategy that cites your tenant rights and local housing laws.", 'ai');
                    this.addQuickActions([
                        { text: "Upload Documents", action: "start_case" },
                        { text: "Learn About Rights", action: "learn_more" }
                    ]);
                }, 1000);
                break;
            case 'category_debt':
                this.addMessage("I can definitely help with debt collection issues!", 'ai');
                setTimeout(() => {
                    this.addMessage("We'll create a response that demands validation, challenges incorrect amounts, and cites the Fair Debt Collection Practices Act (FDCPA) to protect your rights. Stop harassment and defend your credit.", 'ai');
                    this.addQuickActions([
                        { text: "Upload Notice", action: "start_case" },
                        { text: "Know Your Rights", action: "learn_more" }
                    ]);
                }, 1000);
                break;
            case 'category_irs':
                this.addMessage("IRS issues can be stressful, but you have rights!", 'ai');
                setTimeout(() => {
                    this.addMessage("We'll help you respond with the proper tax code citations, request penalty abatement if applicable, and ensure you're protected under taxpayer rights. We handle CP2000 notices, levy threats, audits, and back-tax disputes.", 'ai');
                    this.addQuickActions([
                        { text: "Upload IRS Notice", action: "start_case" },
                        { text: "Taxpayer Rights", action: "learn_more" }
                    ]);
                }, 1000);
                break;
            case 'capture_lead':
                this.captureLead();
                break;
            case 'escalate':
                this.addMessage("I'll connect you with our team! Please provide your name and email, and someone will follow up within 24 hours.", 'ai');
                this.captureLead();
                break;
            case 'learn_more':
                this.addMessage("You can learn more about your rights and our process on our main page. Each case is unique, so I recommend starting with our intake form for personalized guidance.", 'ai');
                this.addQuickActions([
                    { text: "Start My Case", action: "start_case" },
                    { text: "Speak to Agent", action: "escalate" }
                ]);
                break;
        }
    }

    captureLead() {
        if (this.leadCaptured) return;
        
        this.addMessage("To help you better, could you share your name and email? This helps us provide personalized guidance and follow up if needed.", 'ai');
        
        const messagesContainer = document.getElementById('chat-messages');
        const leadForm = document.createElement('div');
        leadForm.innerHTML = `
            <div style="background: rgba(30, 41, 59, 0.8); padding: 15px; border-radius: 10px; margin: 10px 0;">
                <input type="text" id="lead-name" placeholder="Your Name" style="width: 100%; margin-bottom: 10px; padding: 8px; border-radius: 5px; border: 1px solid rgba(6, 182, 212, 0.3); background: rgba(15, 23, 42, 0.8); color: #f8fafc;">
                <input type="email" id="lead-email" placeholder="Your Email" style="width: 100%; margin-bottom: 10px; padding: 8px; border-radius: 5px; border: 1px solid rgba(6, 182, 212, 0.3); background: rgba(15, 23, 42, 0.8); color: #f8fafc;">
                <textarea id="lead-question" placeholder="Briefly describe your situation..." style="width: 100%; margin-bottom: 10px; padding: 8px; border-radius: 5px; border: 1px solid rgba(6, 182, 212, 0.3); background: rgba(15, 23, 42, 0.8); color: #f8fafc; resize: vertical; height: 60px;"></textarea>
                <button onclick="turboAI.submitLead()" style="background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; border: none; border-radius: 5px; padding: 10px 20px; cursor: pointer; width: 100%;">Submit</button>
            </div>
        `;
        messagesContainer.appendChild(leadForm);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    submitLead() {
        const name = document.getElementById('lead-name').value;
        const email = document.getElementById('lead-email').value;
        const question = document.getElementById('lead-question').value;
        
        if (!name || !email) {
            alert('Please provide your name and email.');
            return;
        }
        
        // Store lead data
        this.leadData = { name, email, question, timestamp: new Date().toISOString() };
        this.leadCaptured = true;
        
        // Send to automation system
        this.sendLeadToAutomation(this.leadData);
        
        this.addMessage(`Thanks ${name}! I've got your information. Based on your situation, I recommend starting with our intake form where you can upload any documents and get a personalized game plan.`, 'ai');
        
        this.addQuickActions([
            { text: "Start My Case", action: "start_case" },
            { text: "Continue Chat", action: "continue" }
        ]);
    }

    sendLeadToAutomation(leadData) {
        // Send lead data to backend for automation processing
        fetch('/api/chatbot-lead', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(leadData)
        }).catch(error => {
            console.log('Lead capture logged locally:', leadData);
        });
    }
}

// Initialize Turbo AI when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.turboAI = new TurboAI();
});

