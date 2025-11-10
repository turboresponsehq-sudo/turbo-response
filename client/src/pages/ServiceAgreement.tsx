import { Link } from "wouter";
import "./ServiceAgreement.css";

export default function ServiceAgreement() {
  return (
    <div className="agreement-page">
      <div className="agreement-container">
        <h1>📋 Service Agreement</h1>
        <p className="effective-date">Effective Date: January 1, 2025 | Last Updated: October 26, 2025</p>

        <div className="highlight">
          <strong>IMPORTANT:</strong> By submitting a case to Turbo Response HQ and making payment, you acknowledge that you have read, understood, and agree to be bound by this Service Agreement. This is a legally binding contract.
        </div>

        <h2>1. Services Provided</h2>
        <p>Turbo Response HQ ("Company," "we," "us") provides AI-powered consumer defense services, including but not limited to:</p>
        <ul>
          <li>Analysis of legal correspondence (debt collection letters, IRS notices, eviction notices, etc.)</li>
          <li>Preparation of response letters and legal documents</li>
          <li>Strategic guidance for consumer defense cases</li>
          <li>Document review and consultation services</li>
        </ul>

        <h2>2. No Attorney-Client Relationship</h2>
        <div className="highlight">
          <strong>CRITICAL NOTICE:</strong> Turbo Response HQ is NOT a law firm. We do NOT provide legal advice or legal representation. No attorney-client relationship is created by using our services. Our services are for informational, document preparation, and consumer advocacy support purposes ONLY. We do NOT practice law.
        </div>
        <p>You acknowledge that:</p>
        <ul>
          <li>We are NOT licensed attorneys and do NOT practice law</li>
          <li>Our services do NOT constitute legal advice or legal representation</li>
          <li>You MUST consult with a licensed attorney for legal advice specific to your situation</li>
          <li>We do NOT and CANNOT represent you in court, legal proceedings, or any legal matter</li>
          <li>We provide document preparation and self-advocacy support services ONLY</li>
        </ul>

        <h2>3. Payment Terms & No Refund Policy</h2>
        <div className="highlight">
          <strong>ALL SALES ARE FINAL. NO REFUNDS UNDER ANY CIRCUMSTANCES.</strong>
        </div>
        <p>By making payment, you agree to the following:</p>
        <ul>
          <li><strong>No Refunds:</strong> All payments are non-refundable once services are initiated or documents are delivered</li>
          <li><strong>Payment Due:</strong> Full payment is required before work begins</li>
          <li><strong>Accepted Methods:</strong> Cash App, Venmo, PayPal (as specified on our website)</li>
          <li><strong>Price Changes:</strong> Prices may be adjusted after case review; final pricing will be communicated before work begins</li>
          <li><strong>Rush Fees:</strong> Expedited service requests incur additional fees</li>
          <li><strong>No Chargebacks:</strong> Initiating a chargeback or payment dispute constitutes breach of this agreement</li>
        </ul>

        <h2>4. No Guarantees or Warranties</h2>
        <div className="highlight">
          <strong>WE MAKE NO GUARANTEES ABOUT THE OUTCOME OF YOUR CASE.</strong>
        </div>
        <p>You expressly acknowledge and agree that:</p>
        <ul>
          <li>We do NOT guarantee any specific outcome, result, or resolution</li>
          <li>We do NOT guarantee that debt will be removed, reduced, or forgiven</li>
          <li>We do NOT guarantee that legal action against you will be dismissed or prevented</li>
          <li>Results vary based on individual circumstances beyond our control</li>
          <li>Third parties (creditors, courts, government agencies) make final decisions</li>
          <li>Our services are provided "AS IS" without warranty of any kind</li>
        </ul>

        <h2>5. Limitation of Liability</h2>
        <p><strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong></p>
        <ul>
          <li>Our total liability shall not exceed the amount you paid for services</li>
          <li>We are NOT liable for any indirect, incidental, consequential, or punitive damages</li>
          <li>We are NOT liable for outcomes determined by third parties (creditors, courts, agencies)</li>
          <li>We are NOT responsible for delays caused by third parties or circumstances beyond our control</li>
          <li>You use our services at your own risk</li>
        </ul>

        <h2>6. Client Responsibilities</h2>
        <p>You agree to:</p>
        <ul>
          <li>Provide accurate, complete, and truthful information</li>
          <li>Respond promptly to requests for additional information or documentation</li>
          <li>Review all documents we prepare before submitting them</li>
          <li>Make final decisions about how to proceed with your case</li>
          <li>Comply with all applicable laws and regulations</li>
          <li>Not use our services for fraudulent or illegal purposes</li>
        </ul>

        <h2>7. Turnaround Time</h2>
        <p>Standard turnaround time is <strong>up to 7 business days</strong> from payment receipt and complete information submission. Rush services may be available for additional fees. Turnaround times are estimates and not guarantees.</p>

        <h2>8. Intellectual Property</h2>
        <p>All documents, templates, strategies, and materials we create remain our intellectual property. You receive a limited license to use documents we prepare for your specific case only. You may not:</p>
        <ul>
          <li>Resell, redistribute, or share our documents with others</li>
          <li>Use our templates for other cases without purchasing additional services</li>
          <li>Reverse engineer or copy our proprietary methods</li>
        </ul>

        <h2>9. Confidentiality</h2>
        <p>We will maintain the confidentiality of your case information and will not share it with third parties except:</p>
        <ul>
          <li>As required by law</li>
          <li>With your explicit consent</li>
          <li>To process payments or deliver services</li>
        </ul>

        <h2>10. Dispute Resolution & Arbitration</h2>
        <div className="highlight">
          <strong>BINDING ARBITRATION CLAUSE - PLEASE READ CAREFULLY</strong>
        </div>
        <p>You agree that any dispute arising from this agreement shall be resolved through binding arbitration, NOT in court. Specifically:</p>
        <ul>
          <li><strong>Arbitration Required:</strong> All disputes must be resolved through individual arbitration</li>
          <li><strong>No Class Actions:</strong> You waive the right to participate in class action lawsuits</li>
          <li><strong>No Jury Trial:</strong> You waive the right to a jury trial</li>
          <li><strong>Arbitration Rules:</strong> Governed by the American Arbitration Association (AAA) rules</li>
          <li><strong>Location:</strong> Arbitration shall take place in our jurisdiction</li>
          <li><strong>Costs:</strong> Each party bears their own arbitration costs and attorney fees</li>
        </ul>

        <h2>11. Governing Law</h2>
        <p>This Agreement shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles.</p>

        <h2>12. Severability</h2>
        <p>If any provision of this Agreement is found to be unenforceable, the remaining provisions shall remain in full force and effect.</p>

        <h2>13. Entire Agreement</h2>
        <p>This Service Agreement constitutes the entire agreement between you and Turbo Response HQ and supersedes all prior agreements, understandings, or representations.</p>

        <h2>14. Modifications</h2>
        <p>We reserve the right to modify this Agreement at any time. Continued use of our services after modifications constitutes acceptance of the updated terms.</p>

        <h2>15. Contact Information</h2>
        <p>For questions about this Service Agreement, contact us at:</p>
        <p><strong>Turbo Response HQ</strong><br />
        Email: TurboResponseHQ@gmail.com<br />
        Website: https://turboresponsehq.ai</p>

        <div className="highlight">
          <strong>BY SUBMITTING A CASE AND MAKING PAYMENT, YOU ACKNOWLEDGE THAT YOU HAVE READ THIS ENTIRE AGREEMENT, UNDERSTAND IT, AND AGREE TO BE BOUND BY ITS TERMS.</strong>
        </div>

        <div className="back-link">
          <Link href="/">← Back to Homepage</Link>
        </div>
      </div>
    </div>
  );
}
