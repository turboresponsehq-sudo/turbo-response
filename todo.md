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

## Current Session Tasks
- [x] Add Venmo (@Moneybossesapparel) to payment options (already exists)
- [x] Display payment info on website and admin dashboard (Venmo: @Moneybossesapparel, PayPal: Money Bosses Association, Cash App: $turboresponsehq)
- [x] Add admin dashboard login/password protection (implementing simple username/password authentication)
- [ ] Create service agreement/terms of service page with "No Refunds" policy
- [ ] Create client contract that must be signed before work begins
- [ ] Add contract acceptance checkbox to intake form
- [ ] Store contract acceptance with case data
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

