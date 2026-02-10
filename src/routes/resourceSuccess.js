const express = require('express');
const router = express.Router();

/**
 * Branded success page for resource request submissions
 * Matches official brand colors from BRAND_STYLE_GUIDE.md
 */
router.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Request Submitted - Turbo Response</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          /* Official brand gradient from BRAND_STYLE_GUIDE.md */
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .success-container {
          max-width: 600px;
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 60px 40px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        
        .checkmark {
          width: 80px;
          height: 80px;
          margin: 0 auto 30px;
          background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.5);
          animation: scaleIn 0.5s ease-out;
        }
        
        .checkmark svg {
          width: 40px;
          height: 40px;
          stroke: white;
          stroke-width: 3;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
          animation: checkDraw 0.5s ease-out 0.2s forwards;
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
        }
        
        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes checkDraw {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        h1 {
          /* Official text color from BRAND_STYLE_GUIDE.md */
          color: #f8fafc;
          font-size: 2.5rem;
          margin-bottom: 20px;
          font-weight: 700;
          animation: fadeInUp 0.6s ease-out 0.3s both;
        }
        
        .message {
          /* Official secondary text color from BRAND_STYLE_GUIDE.md */
          color: #cbd5e1;
          font-size: 1.15rem;
          line-height: 1.8;
          margin-bottom: 30px;
          animation: fadeInUp 0.6s ease-out 0.4s both;
        }
        
        .next-steps {
          background: rgba(6, 182, 212, 0.1);
          border: 1px solid rgba(6, 182, 212, 0.3);
          border-radius: 12px;
          padding: 25px;
          margin: 30px 0;
          text-align: left;
          animation: fadeInUp 0.6s ease-out 0.5s both;
        }
        
        .next-steps h2 {
          color: #06b6d4;
          font-size: 1.2rem;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .next-steps ul {
          list-style: none;
          padding: 0;
        }
        
        .next-steps li {
          color: #cbd5e1;
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 12px;
          padding-left: 30px;
          position: relative;
        }
        
        .next-steps li:before {
          content: "✓";
          position: absolute;
          left: 0;
          color: #06b6d4;
          font-weight: bold;
          font-size: 1.2rem;
        }
        
        .home-button {
          display: inline-block;
          /* Official accent cyan from BRAND_STYLE_GUIDE.md */
          background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
          color: white;
          padding: 16px 40px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s ease;
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
          animation: fadeInUp 0.6s ease-out 0.6s both;
        }
        
        .home-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.5);
        }
        
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .reference-number {
          color: #64748b;
          font-size: 0.9rem;
          margin-top: 30px;
          animation: fadeInUp 0.6s ease-out 0.7s both;
        }
      </style>
    </head>
    <body>
      <div class="success-container">
        <div class="checkmark">
          <svg viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        
        <h1>Request Received!</h1>
        
        <p class="message">
          Thank you for submitting your grant and resource request. Our team is reviewing your information and will contact you shortly with matching opportunities.
        </p>
        
        <div class="next-steps">
          <h2>
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            What Happens Next
          </h2>
          <ul>
            <li>We'll analyze your needs and match them with available grants and resources</li>
            <li>Our AI system searches daily for new opportunities that fit your profile</li>
            <li>You'll receive an email with personalized recommendations within 24-48 hours</li>
            <li>Our team will reach out if we need any additional information</li>
          </ul>
        </div>
        
        <a href="/" class="home-button">Return to Homepage</a>
        
        <p class="reference-number">
          Submission Time: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} EST
        </p>
      </div>
    </body>
    </html>
  `);
});

module.exports = router;
