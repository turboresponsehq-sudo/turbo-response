import { Link } from "wouter";
import "./Disclaimer.css";

export default function Disclaimer() {
  return (
    <div className="disclaimer-page">
      <div className="disclaimer-container">
        <h1>⚠️ Legal Disclaimer</h1>

        <div className="disclaimer-box">
          <p><strong>Turbo Response is NOT a law firm.</strong> We are a consumer advocacy technology platform that provides AI-powered software to help you create your own advocacy documents and response letters. We do NOT provide legal advice, and no attorney-client relationship is formed by using our services. We provide document preparation and consumer advocacy support services ONLY.</p>
        </div>

        <p>The information and documents provided through the Turbo Response platform are for informational and self-advocacy purposes only and are NOT a substitute for legal advice from a qualified attorney licensed to practice in your jurisdiction. We do NOT practice law.</p>

        <p>Your use of our platform is subject to our <Link href="/terms-of-service">Terms of Service</Link>. By using Turbo Response, you acknowledge and agree that:</p>
        <ul>
          <li>The information on this site is NOT legal advice.</li>
          <li>We do NOT practice law and do NOT provide legal representation.</li>
          <li>We do NOT guarantee any specific outcome for your situation. Results vary based on the facts of each situation.</li>
          <li>You are responsible for the accuracy of the information you provide and for correctly using the documents we generate.</li>
          <li>You are representing yourself in your matter - we do NOT represent you.</li>
        </ul>

        <p><strong>IMPORTANT:</strong> We strongly recommend that you consult with a licensed attorney for legal advice on your specific situation. Turbo Response is a document preparation tool to assist you with self-advocacy, NOT a replacement for professional legal counsel or legal representation.</p>

        <p>For any questions, please refer to our <Link href="/terms-of-service">Terms of Service</Link> or contact us at <a href="mailto:TurboResponseHQ@gmail.com">TurboResponseHQ@gmail.com</a>.</p>

        <div className="back-link">
          <Link href="/">← Back to Homepage</Link>
        </div>
      </div>
    </div>
  );
}
