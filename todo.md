# Project TODO

## Current Testing
- [ ] Complete intake form submission test with document upload
- [ ] Verify document appears in admin dashboard
- [ ] Test document download from admin dashboard

## Bugs to Fix
- [x] reCAPTCHA configuration error preventing form submissions (fixed - made optional)
- [x] Admin dashboard not displaying submitted cases (fixed - added API endpoints and fixed field mappings)
- [x] Switch from /tmp/ to /data persistent disk storage (fixed - using Render persistent disk)
- [x] JavaScript syntax error in admin dashboard line 593 (fixed - added missing backtick)
- [x] BUG: Admin dashboard missing "View Details" button to see full case information (client name, email, category, description, contract signature, etc.) - FIXED with beautiful modal popup

## Current Session Tasks
- [x] Add Venmo (@Moneybossesapparel) to payment options (already exists)
- [x] Display payment info on website and admin dashboard (Venmo: @Moneybossesapparel, PayPal: Money Bosses Association, Cash App: $turboresponsehq)
- [x] Add admin dashboard login/password protection (implementing simple username/password authentication)
- [x] Create service agreement/terms of service page with "No Refunds" policy
- [x] Create client contract that must be signed before work begins
- [x] Add contract acceptance checkbox to intake form
- [x] Store contract acceptance with case data
- [ ] Set up custom domain (optional)

## Features to Add (Next Session)
- [ ] Two-portal system: Public intake form (no uploads) + Secure document portal (paid customers only)
- [ ] Generate unique upload links for paid customers
- [ ] Payment processing integration (PayPal + Cash App invoicing workflow)
- [ ] Admin dashboard: ability to create/manage customer upload access
- [ ] Email integration: send upload links to customers after payment

## Completed
- [x] Shorten chatbot pricing responses
- [x] Update turnaround time from 24-48 hours to 7 days
- [x] Add rush fee and final pricing disclaimers
- [x] Add customer testimonials section to homepage
- [x] File upload functionality works (tested successfully)


- [x] Add PayPal Pay in 4 (Buy Now, Pay Later) information to website


- [x] Create unique payment link generation system in admin dashboard
- [x] Build custom payment page showing case details and signed contract
- [x] Add PayPal payment button integration to payment page
- [x] Auto-approve cases when payment is received
- [x] Track payment link status (sent, pending, paid) in admin dashboard


- [x] BUG: Admin dashboard showing "N/A" for client names and case details - FIXED with correct data mapping (client_data vs contact_info)
- [x] CHANGE: Remove Case ID column, replace with Client Name column - DONE
- [x] CHANGE: Simplify Payment Status to show only "Paid", "Not Paid", or "Partial Payment" - DONE
- [x] CHANGE: Add Email column to admin dashboard table - DONE
- [x] CHANGE: Reorganize table columns: Name, Email, Category, Description, Payment Status, Case Status, Created, Actions - DONE
- [x] FEATURE: Add Delete button to permanently remove cases from admin dashboard - DONE (with double confirmation)
- [x] FEATURE: Add Archive button to hide completed/old cases from main view - DONE
- [ ] FEATURE: Add filter toggle to show/hide archived cases (not implemented yet - cases auto-filter by status)



## Current Bugs to Fix
- [x] BUG: "✅ Paid" button not working when clicked - FIXED (added missing /api/admin/mark-paid endpoint)
- [x] BUG: "💳 Link" button (Generate Payment Link) not working after entering price and clicking OK - FIXED (corrected file path from {case_id}.json to {case_id}_submission.json)

## New Feature Request
- [x] FEATURE: AI Case Analysis System with ChatGPT integration - COMPLETED
  - [x] Scan client documents and case information
  - [x] Generate complexity grade (Simple, Moderate, Complex, Very Complex)
  - [x] Create automated game plan with action steps
  - [x] Provide pricing recommendations based on complexity
  - [x] Estimate timeline and success probability
  - [x] Identify key challenges and required evidence
  - [x] Cite relevant laws and regulations
  - [x] Beautiful color-coded UI with complexity badges



## Current Implementation
- [x] FEATURE: Add automatic PayPal payment button integration - COMPLETED
  - [x] Store PayPal Client ID and Secret as environment variables
  - [x] Add PayPal SDK to payment page
  - [x] Create automatic PayPal button that processes payments
  - [x] Auto-update case to "Paid" when PayPal payment completes
  - [x] Keep Cash App & Venmo as manual payment options
  - [x] Add API endpoint to handle PayPal payment confirmations



## Current Bug
- [ ] BUG: AI Analysis showing error "Client.__init__() got an unexpected keyword argument 'proxies'" - OpenAI library version compatibility issue

