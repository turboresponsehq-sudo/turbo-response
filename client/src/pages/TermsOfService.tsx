import { Link } from "wouter";
import "./TermsOfService.css";

export default function TermsOfService() {
  return (
    <div className="terms-page">
      <div className="terms-container">
        <h1>📄 Terms of Service</h1>
        <p><strong>Last Updated:</strong> October 23, 2025</p>

        <h2>1. Agreement to Terms</h2>
        <p>By using our Platform, you agree to be bound by these Terms of Service. If you do not agree to these Terms, do not use the Platform.</p>

        <h2>2. Our Services</h2>
        <p>Turbo Response provides AI-generated consumer advocacy documents and action plans based on information you provide. Our services are designed to empower consumers to advocate for themselves. We are NOT a law firm and do NOT provide legal advice. We provide document preparation and advocacy support services only.</p>

        <h2>3. No Attorney-Client Privilege</h2>
        <p>No attorney-client relationship is formed by using our Platform. The information you provide is not protected by attorney-client privilege. We are a consumer advocacy technology platform, NOT a law firm. We do NOT practice law.</p>

        <h2>4. User Responsibilities</h2>
        <ul>
          <li>You must be at least 18 years old to use the Platform.</li>
          <li>You are responsible for the accuracy of the information you provide.</li>
          <li>You agree not to use the Platform for any illegal or unauthorized purpose.</li>
        </ul>

        <h2>5. Payments and Refunds</h2>
        <p>We offer various pricing tiers for our services. Payments are processed securely. Due to the digital nature of our products, we do not offer refunds once an action plan has been generated and delivered. If you are unsatisfied, please contact us to see how we can help.</p>

        <h2>6. Intellectual Property</h2>
        <p>The Platform and its original content, features, and functionality are and will remain the exclusive property of Turbo Response and its licensors.</p>

        <h2>7. Disclaimer of Warranties</h2>
        <p>The Platform is provided on an "as is" and "as available" basis. We make no warranties, express or implied, regarding the accuracy, reliability, or completeness of the content on the Platform or the outcome of your legal issue.</p>

        <h2>8. Limitation of Liability</h2>
        <p>In no event shall Turbo Response, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Platform.</p>

        <h2>9. Governing Law</h2>
        <p>These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which our company is registered, without regard to its conflict of law provisions.</p>

        <h2>10. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at <a href="mailto:TurboResponseHQ@gmail.com">TurboResponseHQ@gmail.com</a>.</p>

        <div className="back-link">
          <Link href="/">← Back to Homepage</Link>
        </div>
      </div>
    </div>
  );
}
