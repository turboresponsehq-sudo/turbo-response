// Turbo AI Chatbot - AI-Powered Consumer Defense Assistant
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
                        Hey 👋 I'm Turbo AI — your assistant. Tell me what kind of notice you received and I'll point you in the right direction.
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
            faqs: {
                "Do I have a case?": "If you've received a notice for eviction, debt collection, IRS issues, repossession, or benefits denial, you likely have grounds for a legal response. I can help you determine the best approach based on your specific situation.",
                
                "Is this service free?": "Turbo Response offers professional legal game plans starting at $35 for a single case, $99 for a 3-case bundle, or starting at $149 for complex cases. This is much more affordable than hiring a lawyer who typically charges $250-$500 per letter.",
                
                "How long does it take?": "Most game plans are generated within 24-48 hours. Our AI analyzes your case instantly, and our expert team reviews everything to ensure maximum effectiveness before delivery.",
                
                "What types of cases do you handle?": "We handle 10 major categories: Evictions & Housing, Debt Collection, IRS & Tax Issues, Wage Garnishment, Medical Bills, Government Benefits, Car Repossession, Consumer Complaints, Family Rights, and Small Business disputes.",
                
                "Is this legal?": "Yes! We create formal legal response letters based on actual consumer protection laws like the FDCPA, FCRA, and state-specific regulations. Every game plan cites the exact laws that protect your rights.",
                
                "What if my case is complex?": "Every case is personally reviewed by our consumer rights specialists. Complex cases receive multi-step game plans with pricing based on complexity, ensuring you get the comprehensive strategy you need."
            },
            
            categories: {
                "eviction": "Housing & Eviction Defense - We help with security deposit disputes, illegal eviction notices, habitability issues, and landlord violations.",
                "debt": "Debt Collection Defense - Challenge invalid debts, request validation, stop harassment, and protect your credit score.",
                "irs": "IRS & Tax Defense - Respond to tax notices, penalty abatement requests, payment plan negotiations, and audit responses.",
                "repossession": "Vehicle Repossession Defense - Challenge illegal repo, demand proper notices, and protect your transportation.",
                "wages": "Wage Garnishment Defense - Stop wage garnishments, challenge calculations, and protect your income.",
                "medical": "Medical Bill Disputes - Challenge incorrect charges, negotiate payment plans, and dispute insurance denials.",
                "benefits": "Government Benefits Appeals - Appeal denied benefits, challenge reductions, and restore your assistance.",
                "consumer": "Consumer Protection - Fight scams, warranty issues, and unfair business practices.",
                "family": "Family Rights Defense - Child support modifications, custody issues, and family court matters.",
                "business": "Small Business Defense - Contract disputes, vendor issues, and business protection matters."
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
        
        // Check for FAQ matches
        for (const [question, answer] of Object.entries(this.knowledgeBase.faqs)) {
            if (this.matchesQuery(lowerMessage, question)) {
                return { text: answer };
            }
        }
        
        // Check for category matches
        for (const [category, description] of Object.entries(this.knowledgeBase.categories)) {
            if (lowerMessage.includes(category) || this.matchesCategoryKeywords(lowerMessage, category)) {
                return {
                    text: `Great! I can help with ${description}`,
                    quickActions: [
                        { text: "Start My Case", action: "start_case" },
                        { text: "Learn More", action: "learn_more" },
                        { text: "Speak to Agent", action: "escalate" }
                    ]
                };
            }
        }
        
        // Default response with lead capture
        if (!this.leadCaptured) {
            return {
                text: "I'd love to help you with your situation! To give you the best guidance, could you tell me: What type of notice or issue are you dealing with? (eviction, debt collection, IRS, etc.)",
                quickActions: [
                    { text: "Eviction Notice", action: "category_eviction" },
                    { text: "Debt Collection", action: "category_debt" },
                    { text: "IRS/Tax Issue", action: "category_irs" },
                    { text: "Other Issue", action: "capture_lead" }
                ]
            };
        }
        
        return {
            text: "Based on what you've shared, I recommend starting with our intake form where you can upload your documents and get a personalized game plan. Would you like me to direct you there?",
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
            eviction: ['evict', 'landlord', 'rent', 'lease', 'housing', 'apartment'],
            debt: ['debt', 'collector', 'collection', 'credit', 'bill', 'owe'],
            irs: ['irs', 'tax', 'taxes', 'audit', 'refund', 'penalty'],
            repossession: ['repo', 'car', 'vehicle', 'tow', 'repossess'],
            wages: ['wage', 'garnish', 'paycheck', 'salary', 'income'],
            medical: ['medical', 'hospital', 'doctor', 'insurance', 'health'],
            benefits: ['benefits', 'food stamps', 'welfare', 'disability', 'social security'],
            consumer: ['scam', 'fraud', 'warranty', 'refund', 'business'],
            family: ['child support', 'custody', 'divorce', 'family court'],
            business: ['business', 'contract', 'vendor', 'commercial']
        };
        
        const keywords = categoryKeywords[category] || [];
        return keywords.some(keyword => message.includes(keyword));
    }

    handleQuickAction(action) {
        switch (action) {
            case 'start_case':
                window.location.href = '/intake';
                break;
            case 'category_eviction':
                this.addMessage("Perfect! I can help with eviction and housing issues.", 'ai');
                setTimeout(() => {
                    this.addMessage("Upload your eviction notice or lease documents, and we'll create a defense strategy that cites your tenant rights and local housing laws.", 'ai');
                    this.addQuickActions([
                        { text: "Upload Documents", action: "start_case" },
                        { text: "Learn About Rights", action: "learn_more" }
                    ]);
                }, 1000);
                break;
            case 'category_debt':
                this.addMessage("I can definitely help with debt collection issues!", 'ai');
                setTimeout(() => {
                    this.addMessage("We'll create a response that demands validation, challenges incorrect amounts, and cites the Fair Debt Collection Practices Act to protect your rights.", 'ai');
                    this.addQuickActions([
                        { text: "Upload Notice", action: "start_case" },
                        { text: "Know Your Rights", action: "learn_more" }
                    ]);
                }, 1000);
                break;
            case 'category_irs':
                this.addMessage("IRS issues can be stressful, but you have rights!", 'ai');
                setTimeout(() => {
                    this.addMessage("We'll help you respond with the proper tax code citations, request penalty abatement if applicable, and ensure you're protected under taxpayer rights.", 'ai');
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

