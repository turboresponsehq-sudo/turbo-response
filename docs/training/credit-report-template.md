# Credit Report Training Template - Equifax Format

## Document Type: Credit Report
**Bureau:** Equifax  
**Purpose:** Train AI to read and extract data from Equifax credit reports

---

## Report Structure

### Header Section
```
EQUIFAX Logo
Credit Report
Date: [REPORT_DATE]
Confirmation #: [CONFIRMATION_NUMBER]
Prepared for: [CONSUMER_NAME]
```

### Summary Section
- **Report Date:** Date the report was generated
- **Average Account Age:** Average age of all credit accounts
- **Length of Credit History:** Total time consumer has had credit
- **Oldest Account:** Name and date of oldest credit account
- **Most Recent Account:** Name and date of newest credit account

### Personal Information Section
Contains consumer identification data:
- **Full Name:** First, Middle, Last
- **Current Address:** Street, City, State, ZIP
- **Former Addresses:** Previous residential addresses
- **Social Security Number:** Displayed as XXX-XX-XXXX (partially masked)
- **Date of Birth:** MM/DD/YYYY format
- **Phone Numbers:** Current and former numbers
- **Employment Information:** Current and former employers
- **Consumer File Notices:** Fraud alerts, security freezes, opt-outs

### Credit Accounts Section
Each account contains:

**Account Header:**
- Creditor Name (e.g., "NAVY FEDERAL CREDIT UNION")
- Account Status (Open, Closed, Charge Off, etc.)

**Account Details:**
- **Address:** Creditor's mailing address
- **Account Number:** Partially masked (e.g., *3570)
- **Owner:** Individual Account, Joint Account, Authorized User
- **Loan/Account Type:** Credit Card, Mortgage, Auto Loan, Student Loan, etc.
- **Status:** Current, Closed, Charge Off, Collection, etc.

**Dates:**
- **Date Opened:** When account was opened
- **Date of Last Activity:** Most recent transaction or payment
- **Date of 1st Delinquency:** First missed payment (if applicable)
- **Date Major Delinquency 1st Reported:** When serious delinquency was reported
- **Date Closed:** When account was closed (if applicable)

**Financial Information:**
- **Credit Limit:** Maximum credit available
- **High Credit:** Highest balance ever carried
- **Balance:** Current amount owed
- **Amount Past Due:** Overdue amount
- **Charge Off Amount:** Amount written off as bad debt
- **Scheduled Payment Amount:** Regular payment amount
- **Actual Payment Amount:** Last payment made

**Payment History (24-Month Grid):**
```
Year    Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct  Nov  Dec
2025    CO   CO   CO   CO   CO   CO   CO   CO   CO   CO   CO   CO
2024    ✓    ✓    ✓    30   60   90   CO   CO   CO   CO   CO   CO
2023    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ✓    ✓
```

**Payment History Legend:**
- ✓ = Paid on Time
- 30 = 30 Days Past Due
- 60 = 60 Days Past Due
- 90 = 90 Days Past Due
- 120 = 120 Days Past Due
- 150 = 150 Days Past Due
- CO = Charge Off
- V = Voluntary Surrender
- F = Foreclosure
- R = Repossession
- B = Included in Bankruptcy
- TN = Too New to Rate
- C = Collection Account
- ■ = No Data Available

**Narrative Codes:**
Three-digit codes explaining account status:
- **002:** Credit Card
- **065:** Account Closed By Credit Grantor
- **067:** Charged Off Account
- **132:** Fixed Rate
- **167:** Consumer Disputes After Resolution
- **174:** Amount in High Credit is Original Charge-Off Amount
- **233:** Amount in High Credit Column is Credit Limit

---

## Example Account (Anonymized)

```
NAVY FEDERAL CREDIT UNION - Closed

PO Box 3700, Merrifield, VA 22119-3700 | (888) 842-6328
Account Number: *3570 | Owner: Individual Account
Loan/Account Type: Credit Card | Status: Charge Off

Date Opened: 12/13/2020          Date of 1st Delinquency: 12/28/2022
Date of Last Activity: 11/30/2022 Date Major Delinquency 1st Reported: 06/01/2023
Date Reported: 11/30/2025         Balance: $2,651
Credit Limit: $2,500              High Credit: $2,651
Charge Off Amount: $2,651
Terms Frequency: Monthly          Months Reviewed: 58
Activity Designator: Closed       Narrative Code(s): 167, 067, 065, 002

Payment History:
[24-month grid showing payment status]

Narrative Code Descriptions:
002 - Credit Card
065 - Account Closed By Credit Grantor
067 - Charged Off Account
132 - Fixed Rate
167 - Consumer Disputes After Resolution
```

---

## AI Extraction Tasks

When processing Equifax credit reports, AI should extract:

1. **Consumer Identity** (for case matching, not storage)
   - Name, DOB, Last 4 of SSN

2. **Account Summary**
   - Total number of accounts
   - Number of open vs closed accounts
   - Number of negative accounts (charge-offs, collections, late payments)

3. **For Each Account:**
   - Creditor name
   - Account type
   - Account status
   - Balance and credit limit
   - Payment history (identify late payments, charge-offs)
   - Narrative codes (identify disputable issues)

4. **Disputable Items:**
   - Accounts with inconsistent payment history
   - Accounts with missing required information
   - Accounts with unverifiable data
   - Accounts past statute of limitations
   - Duplicate accounts

5. **Dispute Strategies:**
   - Identify specific defects in each account
   - Generate appropriate dispute language
   - Determine required documentation

---

## Training Notes

- Credit reports contain sensitive PII - always anonymize before training
- Payment history patterns indicate creditworthiness
- Narrative codes provide context for account status
- Charge-offs and collections are prime dispute targets
- FCRA requires bureaus to verify disputed information
- Unverifiable or inaccurate items must be deleted

