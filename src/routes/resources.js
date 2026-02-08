const express = require('express');
const router = express.Router();

// Resources landing page - case type selector
router.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Find Resources & Grants - Turbo Response</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .container {
          max-width: 800px;
          width: 100%;
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 60px 40px;
          text-align: center;
        }
        
        h1 {
          font-size: 2.5rem;
          color: #2d3748;
          margin-bottom: 16px;
          font-weight: 700;
        }
        
        .subtitle {
          font-size: 1.125rem;
          color: #718096;
          margin-bottom: 48px;
          line-height: 1.6;
        }
        
        .case-types {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
          margin-bottom: 40px;
        }
        
        .case-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 32px 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          color: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        
        .case-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
        }
        
        .case-icon {
          font-size: 3rem;
          margin-bottom: 8px;
        }
        
        .case-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .case-description {
          font-size: 0.875rem;
          opacity: 0.9;
          line-height: 1.5;
        }
        
        .info-box {
          background: #f7fafc;
          border-left: 4px solid #667eea;
          padding: 20px;
          border-radius: 8px;
          text-align: left;
          margin-top: 32px;
        }
        
        .info-box h3 {
          color: #2d3748;
          font-size: 1.125rem;
          margin-bottom: 12px;
        }
        
        .info-box p {
          color: #4a5568;
          line-height: 1.6;
          font-size: 0.9375rem;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 40px 24px;
          }
          
          h1 {
            font-size: 2rem;
          }
          
          .case-types {
            grid-template-columns: 1fr;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎯 Find Resources & Grants</h1>
        <p class="subtitle">
          Select your situation below, and we'll help you find relevant grants, programs, and resources you may qualify for.
        </p>
        
        <div class="case-types">
          <a href="/resources/consumer" class="case-card">
            <div class="case-icon">⚖️</div>
            <div class="case-title">Consumer Rights</div>
            <div class="case-description">
              Debt collection violations, credit report errors, identity theft
            </div>
          </a>
          
          <a href="/resources/housing" class="case-card">
            <div class="case-icon">🏠</div>
            <div class="case-title">Housing Issues</div>
            <div class="case-description">
              Illegal evictions, landlord disputes, housing assistance
            </div>
          </a>
          
          <a href="/resources/tax" class="case-card">
            <div class="case-icon">💰</div>
            <div class="case-title">Tax Debt</div>
            <div class="case-description">
              IRS issues, tax relief programs, payment plans
            </div>
          </a>
        </div>
        
        <div class="info-box">
          <h3>How It Works</h3>
          <p>
            <strong>1.</strong> Select your situation above<br>
            <strong>2.</strong> Tell us about your specific circumstances<br>
            <strong>3.</strong> Our AI analyzes your profile<br>
            <strong>4.</strong> Receive a personalized list of grants and resources you may qualify for
          </p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Consumer Rights intake page
router.get('/consumer', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Consumer Rights Resources - Turbo Response</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 40px 20px;
        }
        .container {
          max-width: 700px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          padding: 48px 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        h1 { color: #2d3748; margin-bottom: 12px; font-size: 2rem; }
        .subtitle { color: #718096; margin-bottom: 32px; font-size: 1.125rem; }
        .coming-soon {
          background: #f7fafc;
          border: 2px dashed #cbd5e0;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          margin: 32px 0;
        }
        .coming-soon h2 {
          color: #4a5568;
          font-size: 1.5rem;
          margin-bottom: 16px;
        }
        .coming-soon p {
          color: #718096;
          line-height: 1.6;
        }
        .back-btn {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .back-btn:hover {
          background: #5a67d8;
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>⚖️ Consumer Rights Resources</h1>
        <p class="subtitle">Find grants and assistance programs for debt collection violations, credit report errors, and consumer protection.</p>
        
        <div class="coming-soon">
          <h2>📋 Intake Form Coming Next</h2>
          <p>
            This page will include a simple form to collect your information:<br><br>
            • Your contact details<br>
            • Type of consumer rights issue<br>
            • Income and demographic information<br>
            • Brief description of your situation<br><br>
            Our AI will then match you with relevant grants and resources.
          </p>
        </div>
        
        <a href="/resources" class="back-btn">← Back to Resources</a>
      </div>
    </body>
    </html>
  `);
});

// Housing intake page
router.get('/housing', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Housing Resources - Turbo Response</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 40px 20px;
        }
        .container {
          max-width: 700px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          padding: 48px 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        h1 { color: #2d3748; margin-bottom: 12px; font-size: 2rem; }
        .subtitle { color: #718096; margin-bottom: 32px; font-size: 1.125rem; }
        .coming-soon {
          background: #f7fafc;
          border: 2px dashed #cbd5e0;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          margin: 32px 0;
        }
        .coming-soon h2 {
          color: #4a5568;
          font-size: 1.5rem;
          margin-bottom: 16px;
        }
        .coming-soon p {
          color: #718096;
          line-height: 1.6;
        }
        .back-btn {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .back-btn:hover {
          background: #5a67d8;
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🏠 Housing Resources</h1>
        <p class="subtitle">Find grants and assistance programs for eviction prevention, rental assistance, and housing disputes.</p>
        
        <div class="coming-soon">
          <h2>📋 Intake Form Coming Next</h2>
          <p>
            This page will include a simple form to collect your information:<br><br>
            • Your contact details<br>
            • Type of housing issue<br>
            • Income and household size<br>
            • Location and rental details<br>
            • Brief description of your situation<br><br>
            Our AI will then match you with relevant grants and resources.
          </p>
        </div>
        
        <a href="/resources" class="back-btn">← Back to Resources</a>
      </div>
    </body>
    </html>
  `);
});

// Tax Debt intake page
router.get('/tax', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tax Debt Resources - Turbo Response</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 40px 20px;
        }
        .container {
          max-width: 700px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          padding: 48px 40px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        h1 { color: #2d3748; margin-bottom: 12px; font-size: 2rem; }
        .subtitle { color: #718096; margin-bottom: 32px; font-size: 1.125rem; }
        .coming-soon {
          background: #f7fafc;
          border: 2px dashed #cbd5e0;
          border-radius: 12px;
          padding: 40px;
          text-align: center;
          margin: 32px 0;
        }
        .coming-soon h2 {
          color: #4a5568;
          font-size: 1.5rem;
          margin-bottom: 16px;
        }
        .coming-soon p {
          color: #718096;
          line-height: 1.6;
        }
        .back-btn {
          display: inline-block;
          background: #667eea;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .back-btn:hover {
          background: #5a67d8;
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>💰 Tax Debt Resources</h1>
        <p class="subtitle">Find grants and assistance programs for IRS tax debt, payment plans, and tax relief.</p>
        
        <div class="coming-soon">
          <h2>📋 Intake Form Coming Next</h2>
          <p>
            This page will include a simple form to collect your information:<br><br>
            • Your contact details<br>
            • Type of tax issue<br>
            • Amount owed and tax years<br>
            • Income and financial hardship details<br>
            • Brief description of your situation<br><br>
            Our AI will then match you with relevant grants and resources.
          </p>
        </div>
        
        <a href="/resources" class="back-btn">← Back to Resources</a>
      </div>
    </body>
    </html>
  `);
});

module.exports = router;
