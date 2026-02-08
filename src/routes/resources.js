const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const sgMail = require('@sendgrid/mail');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Resources intake form page
router.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Find Grants & Resources - Turbo Response</title>
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
          padding: 40px 20px;
        }
        
        .container {
          max-width: 700px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          padding: 50px 40px;
        }
        
        h1 {
          font-size: 2rem;
          color: #2d3748;
          margin-bottom: 0.5rem;
          text-align: center;
        }
        
        .subtitle {
          color: #718096;
          margin-bottom: 2rem;
          font-size: 1.1rem;
          text-align: center;
          line-height: 1.6;
        }
        
        .form-group {
          margin-bottom: 1.5rem;
        }
        
        label {
          display: block;
          color: #2d3748;
          font-weight: 600;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }
        
        .helper-text {
          font-size: 0.85rem;
          color: #718096;
          font-style: italic;
          margin-top: 0.25rem;
        }
        
        input[type="text"],
        input[type="email"],
        input[type="tel"],
        select,
        textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          font-family: inherit;
          transition: border-color 0.3s;
        }
        
        input:focus,
        select:focus,
        textarea:focus {
          outline: none;
          border-color: #667eea;
        }
        
        textarea {
          min-height: 120px;
          resize: vertical;
        }
        
        .checkbox-group {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        
        .checkbox-item {
          display: flex;
          align-items: flex-start;
        }
        
        .checkbox-item input[type="checkbox"] {
          width: auto;
          margin-right: 0.5rem;
          margin-top: 0.25rem;
        }
        
        .checkbox-item label {
          font-weight: 400;
          margin-bottom: 0;
          cursor: pointer;
        }
        
        .consent-box {
          background: #f7fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1.5rem;
        }
        
        .consent-box input[type="checkbox"] {
          width: auto;
          margin-right: 0.5rem;
        }
        
        .consent-box label {
          font-weight: 400;
          display: inline;
          cursor: pointer;
        }
        
        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          margin-top: 1.5rem;
        }
        
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
        
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .examples {
          background: #f7fafc;
          border-left: 4px solid #667eea;
          padding: 1rem;
          margin-top: 0.5rem;
          border-radius: 4px;
          font-size: 0.9rem;
        }
        
        .examples strong {
          color: #2d3748;
          display: block;
          margin-bottom: 0.5rem;
        }
        
        .examples ul {
          margin-left: 1.5rem;
          color: #4a5568;
          line-height: 1.8;
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 30px 20px;
          }
          
          h1 {
            font-size: 1.5rem;
          }
          
          .subtitle {
            font-size: 1rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎯 Find Grants & Resources You Qualify For</h1>
        <p class="subtitle">
          From home repairs to business funding, food assistance to energy rebates - we'll match you with programs you may be eligible for.
        </p>
        
        <form id="resourceForm" action="/resources/submit" method="POST">
          <!-- Basic Info -->
          <div class="form-group">
            <label for="name">Full Name *</label>
            <input type="text" id="name" name="name" required>
          </div>
          
          <div class="form-group">
            <label for="email">Email Address *</label>
            <input type="email" id="email" name="email" required>
          </div>
          
          <div class="form-group">
            <label for="phone">Phone Number *</label>
            <input type="tel" id="phone" name="phone" required>
          </div>
          
          <div class="form-group">
            <label for="location">Where are you located? *</label>
            <input type="text" id="location" name="location" placeholder="e.g., Atlanta, GA" required>
          </div>
          
          <!-- Resource Types -->
          <div class="form-group">
            <label>What type of resources are you looking for? (Select all that apply) *</label>
            <div class="checkbox-group">
              <div class="checkbox-item">
                <input type="checkbox" id="home_repairs" name="resources[]" value="home_repairs">
                <label for="home_repairs">Home repairs & improvements (plumbing, roofing, weatherization)</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="housing" name="resources[]" value="housing">
                <label for="housing">Housing assistance (rent, mortgage, down payment)</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="food" name="resources[]" value="food">
                <label for="food">Food & nutrition programs</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="energy" name="resources[]" value="energy">
                <label for="energy">Energy & utility assistance (bill help, solar rebates)</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="healthcare" name="resources[]" value="healthcare">
                <label for="healthcare">Healthcare & medical assistance</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="education" name="resources[]" value="education">
                <label for="education">Education & training (scholarships, job training)</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="business" name="resources[]" value="business">
                <label for="business">Business funding & grants (for business owners)</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="childcare" name="resources[]" value="childcare">
                <label for="childcare">Childcare & family support</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="veterans" name="resources[]" value="veterans">
                <label for="veterans">Veterans benefits</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="senior" name="resources[]" value="senior">
                <label for="senior">Senior/disability assistance</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="other" name="resources[]" value="other">
                <label for="other">Other</label>
              </div>
            </div>
          </div>
          
          <!-- Income Level -->
          <div class="form-group">
            <label for="income">What is your current income level? *</label>
            <select id="income" name="income" required>
              <option value="">-- Select --</option>
              <option value="under_25k">Under $25,000/year</option>
              <option value="25k_50k">$25,000 - $50,000/year</option>
              <option value="50k_75k">$50,000 - $75,000/year</option>
              <option value="over_75k">Over $75,000/year</option>
              <option value="prefer_not_say">Prefer not to say</option>
            </select>
            <div class="helper-text">Many programs have income requirements</div>
          </div>
          
          <!-- Household Size -->
          <div class="form-group">
            <label for="household">How many people are in your household? *</label>
            <select id="household" name="household" required>
              <option value="">-- Select --</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7+">7+</option>
            </select>
            <div class="helper-text">Household size affects eligibility for many programs</div>
          </div>
          
          <!-- Description -->
          <div class="form-group">
            <label for="description">Tell us about what you're looking for: *</label>
            <textarea id="description" name="description" required></textarea>
            <div class="examples">
              <strong>Example answers:</strong>
              <ul>
                <li>"I'm a homeowner and need help fixing my roof. I heard there are programs for low-income homeowners."</li>
                <li>"I'm starting a small business and looking for grants or funding opportunities."</li>
                <li>"I'm a senior citizen on a fixed income and need help with my electric bill."</li>
                <li>"I'm a veteran looking for education benefits to go back to school."</li>
                <li>"My family needs help with childcare costs so I can work full-time."</li>
              </ul>
            </div>
          </div>
          
          <!-- Demographics -->
          <div class="form-group">
            <label>Are you a: (Select all that apply)</label>
            <div class="checkbox-group">
              <div class="checkbox-item">
                <input type="checkbox" id="homeowner" name="demographics[]" value="homeowner">
                <label for="homeowner">Homeowner</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="renter" name="demographics[]" value="renter">
                <label for="renter">Renter</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="business_owner" name="demographics[]" value="business_owner">
                <label for="business_owner">Business owner</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="veteran" name="demographics[]" value="veteran">
                <label for="veteran">Veteran</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="senior_demo" name="demographics[]" value="senior">
                <label for="senior_demo">Senior (65+)</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="disability" name="demographics[]" value="disability">
                <label for="disability">Person with disability</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="parent" name="demographics[]" value="parent">
                <label for="parent">Parent/guardian</label>
              </div>
              <div class="checkbox-item">
                <input type="checkbox" id="student" name="demographics[]" value="student">
                <label for="student">Student</label>
              </div>
            </div>
            <div class="helper-text">These categories unlock specific grant programs</div>
          </div>
          
          <!-- Consent -->
          <div class="consent-box">
            <input type="checkbox" id="consent" name="consent" required>
            <label for="consent">I agree to be contacted by Turbo Response about available resources and grant opportunities *</label>
          </div>
          
          <button type="submit" class="submit-btn">Find My Resources</button>
        </form>
      </div>
      
      <script>
        document.getElementById('resourceForm').addEventListener('submit', function(e) {
          const checkboxes = document.querySelectorAll('input[name="resources[]"]:checked');
          if (checkboxes.length === 0) {
            e.preventDefault();
            alert('Please select at least one type of resource you are looking for.');
            return false;
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Handle form submission
router.post('/submit', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      location,
      'resources[]': resources,
      income,
      household,
      description,
      'demographics[]': demographics
    } = req.body;

    // Ensure arrays
    const resourcesArray = Array.isArray(resources) ? resources : (resources ? [resources] : []);
    const demographicsArray = Array.isArray(demographics) ? demographics : (demographics ? [demographics] : []);

    // Store in database
    const { data, error } = await supabase
      .from('resource_requests')
      .insert([
        {
          name,
          email,
          phone,
          location,
          resources: resourcesArray,
          income_level: income,
          household_size: household,
          description,
          demographics: demographicsArray,
          status: 'pending'
        }
      ])
      .select();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // Send email notification to admin
    const resourcesList = resourcesArray.map(r => `✓ ${r.replace(/_/g, ' ')}`).join('\n');
    const demographicsList = demographicsArray.length > 0 
      ? demographicsArray.map(d => `✓ ${d.replace(/_/g, ' ')}`).join('\n')
      : 'None specified';

    const emailContent = {
      to: process.env.ADMIN_EMAIL || 'turboresponsehq@gmail.com',
      from: process.env.SENDGRID_FROM_EMAIL || 'turboresponsehq@gmail.com',
      subject: `🎯 New Resource Request - ${location}`,
      text: `
New Resource Request Submitted

Name: ${name}
Email: ${email}
Phone: ${phone}
Location: ${location}

Resources Needed:
${resourcesList}

Income Level: ${income.replace(/_/g, ' ')}
Household Size: ${household} people

Demographics:
${demographicsList}

What they're looking for:
"${description}"

---

View in admin dashboard: ${process.env.FRONTEND_URL || 'https://turboresponsehq.ai'}/admin
      `,
      html: `
        <h2>🎯 New Resource Request</h2>
        
        <h3>Contact Information</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Location:</strong> ${location}</p>
        
        <h3>Resources Needed</h3>
        <p>${resourcesList.replace(/\n/g, '<br>')}</p>
        
        <h3>Profile</h3>
        <p><strong>Income Level:</strong> ${income.replace(/_/g, ' ')}</p>
        <p><strong>Household Size:</strong> ${household} people</p>
        
        <h3>Demographics</h3>
        <p>${demographicsList.replace(/\n/g, '<br>')}</p>
        
        <h3>What They're Looking For</h3>
        <p style="background: #f7fafc; padding: 15px; border-left: 4px solid #667eea; font-style: italic;">
          "${description}"
        </p>
        
        <p style="margin-top: 30px;">
          <a href="${process.env.FRONTEND_URL || 'https://turboresponsehq.ai'}/admin" 
             style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View in Admin Dashboard
          </a>
        </p>
      `
    };

    await sgMail.send(emailContent);

    // Show success page
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You - Turbo Response</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            background: white;
            border-radius: 20px;
            padding: 50px 40px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }
          .success-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }
          h1 {
            color: #2d3748;
            margin-bottom: 1rem;
            font-size: 2rem;
          }
          p {
            color: #4a5568;
            line-height: 1.8;
            font-size: 1.1rem;
            margin-bottom: 2rem;
          }
          .home-btn {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: transform 0.2s;
          }
          .home-btn:hover {
            transform: translateY(-2px);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <h1>Thank You! We're Reviewing Your Situation</h1>
          <p>
            We've received your information and our team is reviewing what resources and grants you may qualify for. 
            We'll reach out within 24-48 hours with next steps.
          </p>
          <p>
            In the meantime, if you have any urgent questions, feel free to call us.
          </p>
          <a href="/" class="home-btn">Return to Homepage</a>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Error processing resource request:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Error - Turbo Response</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            background: white;
            border-radius: 20px;
            padding: 50px 40px;
            text-align: center;
          }
          h1 { color: #e53e3e; margin-bottom: 1rem; }
          p { color: #4a5568; line-height: 1.6; margin-bottom: 2rem; }
          a {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Oops! Something went wrong</h1>
          <p>We're sorry, but there was an error processing your request. Please try again or contact us directly.</p>
          <a href="/resources">Try Again</a>
        </div>
      </body>
      </html>
    `);
  }
});

module.exports = router;
