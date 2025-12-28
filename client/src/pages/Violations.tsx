import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, FileText, Phone, Home, Banknote, Shield } from "lucide-react";

export default function Violations() {
  const violations = [
    {
      id: 1,
      title: "Debt Collectors Attempting to Collect Debts You Don't Owe",
      sector: "Debt Collection",
      icon: Phone,
      law: "Fair Debt Collection Practices Act (FDCPA)",
      realLife: "You receive calls demanding payment on a debt you paid off years ago, or a debt that belongs to someone else entirely.",
      problem: "Damages your credit score, causes emotional stress, and can lead to wage garnishment or bank account levies.",
      firstSteps: [
        "Request debt validation in writing within 30 days",
        "Check your credit report at AnnualCreditReport.com",
        "Document all communications",
        "Send a cease and desist letter if debt is not yours",
        "File a complaint with the CFPB"
      ]
    },
    {
      id: 2,
      title: "Insufficient or Vague Debt Validation Notices",
      sector: "Debt Collection",
      icon: FileText,
      law: "Fair Debt Collection Practices Act (FDCPA)",
      realLife: "A debt collector sends a notice so vague you can't determine what you owe, without including the original creditor's name or your dispute rights.",
      problem: "Without clear information, you can't properly dispute the debt or make informed decisions. You may pay debts that aren't yours.",
      firstSteps: [
        "Send written debt verification request",
        "Do not pay until you receive complete information",
        "Dispute the debt in writing if information is vague",
        "File a complaint with the CFPB if validation isn't provided within 30 days"
      ]
    },
    {
      id: 3,
      title: "Credit Bureaus Reporting Inaccurate or Outdated Information",
      sector: "Credit Reporting",
      icon: AlertCircle,
      law: "Fair Credit Reporting Act (FCRA)",
      realLife: "Your credit report shows a paid-off debt as active, late payments you paid on time, or information mixed with someone else's file.",
      problem: "Inaccurate information can cost thousands in higher interest rates, denied credit, and rejected housing or job opportunities.",
      firstSteps: [
        "Get your free credit report from AnnualCreditReport.com",
        "Identify and document specific errors",
        "Dispute errors in writing with credit bureau and creditor",
        "Follow up to ensure investigation within 30-45 days",
        "File CFPB complaint if not corrected"
      ]
    },
    {
      id: 4,
      title: "Debt Collectors Using Harassment, Threats, or Abusive Language",
      sector: "Debt Collection",
      icon: AlertCircle,
      law: "Fair Debt Collection Practices Act (FDCPA)",
      realLife: "Collectors call repeatedly, use profanity, threaten arrest, contact your employer, or call at 6 AM and 10 PM despite your requests to stop.",
      problem: "Harassment causes anxiety, depression, and sleep loss. Threats are often empty but create fear. Many pay debts they don't owe just to stop the abuse.",
      firstSteps: [
        "Document every call with date, time, and details",
        "Send cease and desist letter via certified mail",
        "Do not engage after sending the letter",
        "File complaint with CFPB and state attorney general",
        "Consider consulting an attorney about lawsuit"
      ]
    },
    {
      id: 5,
      title: "Landlords Entering Rental Property Without Notice",
      sector: "Housing",
      icon: Home,
      law: "Fair Housing Act, State Landlord-Tenant Laws",
      realLife: "Your landlord shows up unannounced to 'check on things' or lets themselves in to show the unit to prospective tenants without advance notice.",
      problem: "Violates your right to privacy and quiet enjoyment. Can be used as retaliation. Creates safety concerns about unauthorized access.",
      firstSteps: [
        "Know your state's notice requirement (typically 24-48 hours)",
        "Keep records of unauthorized entries",
        "Send written reminder of notice requirement",
        "Document all communications in writing",
        "File complaint with local housing authority"
      ]
    },
    {
      id: 6,
      title: "Mishandling Security Deposits",
      sector: "Housing",
      icon: Banknote,
      law: "State Landlord-Tenant Laws, Fair Housing Act",
      realLife: "Landlord keeps your entire deposit claiming normal wear and tear is damage, or keeps part without itemized deductions.",
      problem: "Security deposits are significant money for renters. Illegal withholding prevents you from affording your next apartment and enables landlord profit.",
      firstSteps: [
        "Document apartment condition before move-in and move-out with photos",
        "Know the difference between damage and normal wear and tear",
        "Request itemized list of deductions",
        "Send written demand for return within state timeframe (30-45 days)",
        "File complaint with housing authority or small claims court"
      ]
    },
    {
      id: 7,
      title: "Landlords Retaliating Against Tenants for Complaints",
      sector: "Housing",
      icon: AlertCircle,
      law: "Fair Housing Act, State Landlord-Tenant Laws",
      realLife: "You file a housing complaint about mold, then landlord raises rent 20%, threatens eviction, or refuses repairs. Retaliation is illegal in all 50 states.",
      problem: "Punishes tenants for exercising legal rights. Creates fear that prevents reporting problems, leading to unsafe conditions.",
      firstSteps: [
        "Document timeline of complaint and retaliation",
        "Keep all communications in writing",
        "Know your state's retaliation timeline (usually 30-90 days)",
        "File complaint with housing authority immediately",
        "Consult tenant rights organization or attorney"
      ]
    },
    {
      id: 8,
      title: "Credit Bureaus and Background Agencies Reporting Inaccurate Criminal Records",
      sector: "Background Reporting",
      icon: FileText,
      law: "Fair Credit Reporting Act (FCRA)",
      realLife: "Job application denied because background check shows a conviction that isn't yours, or a conviction that was expunged years ago.",
      problem: "Inaccurate criminal records permanently damage career and housing prospects. Even after correction, you may have lost opportunities.",
      firstSteps: [
        "Request your file from background check company",
        "Identify errors carefully with exact details",
        "Send written dispute to background company and information source",
        "Follow up to ensure investigation within 30 days",
        "File CFPB complaint if not corrected"
      ]
    },
    {
      id: 9,
      title: "Banks Charging Illegal Overdraft and NSF Fees",
      sector: "Banking",
      icon: Banknote,
      law: "Dodd-Frank Act, Regulation E, Unfair and Deceptive Practices Laws",
      realLife: "You have $50, make a $60 debit purchase, and bank charges $35 overdraft fee. Another small purchase triggers another $35 fee.",
      problem: "Overdraft fees trap low-income consumers in debt cycles. A single mistake results in hundreds in fees, especially harming paycheck-to-paycheck workers.",
      firstSteps: [
        "Know your rights: banks can't charge overdraft fees without opt-in",
        "Review statements for overdraft fees and document them",
        "Request refund of recent fees (many refund 1-2 as courtesy)",
        "Opt out of overdraft protection",
        "File CFPB complaint if bank refuses or continues illegally"
      ]
    },
    {
      id: 10,
      title: "Insurance Companies Delaying or Denying Valid Claims",
      sector: "Insurance",
      icon: Shield,
      law: "State Unfair Claims Settlement Practices Acts (UCSPA)",
      realLife: "After a fire, insurance delays claim for months requesting same info repeatedly, or denies claim on technicality despite clear coverage.",
      problem: "Delays and denials leave you unable to repair home or replace property. Financial hardship can be devastating after disaster.",
      firstSteps: [
        "Review policy carefully to understand coverage",
        "Document everything: policy, communications, proof of loss",
        "Send written requests for claim updates",
        "File complaint with state insurance commissioner if delayed beyond 30 days",
        "Consult insurance attorney if wrongfully denied"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-background border-b border-border">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              The 10 Most Common Consumer Rights Violations
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Understanding your rights and what to do if you're facing unfair practices from debt collectors, credit bureaus, landlords, banks, or insurance companies.
            </p>
            <p className="text-sm text-muted-foreground italic">
              Educational resource. Not legal advice. Consult an attorney for your specific situation.
            </p>
          </div>
        </div>
      </div>

      {/* Violations Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {violations.map((violation) => {
            const IconComponent = violation.icon;
            return (
              <Card key={violation.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <IconComponent className="w-6 h-6 text-primary flex-shrink-0" />
                    <Badge variant="outline">{violation.sector}</Badge>
                  </div>
                  <CardTitle className="text-lg">{violation.title}</CardTitle>
                  <CardDescription className="text-xs font-mono text-primary">
                    {violation.law}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-2">What This Looks Like</h4>
                    <p className="text-sm text-muted-foreground">{violation.realLife}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Why This Matters
                    </h4>
                    <p className="text-sm text-muted-foreground">{violation.problem}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      What to Do First
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {violation.firstSteps.map((step, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-primary font-semibold flex-shrink-0">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Resources Section */}
        <div className="bg-muted/50 rounded-lg border border-border p-8 md:p-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Resources for Help</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Federal Agencies</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong>Consumer Financial Protection Bureau (CFPB)</strong>
                  <br />
                  consumerfinance.gov | 855-411-2372
                </li>
                <li>
                  <strong>Federal Trade Commission (FTC)</strong>
                  <br />
                  ftc.gov | 1-877-FTC-HELP
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Local Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong>Legal Aid</strong>
                  <br />
                  lawhelp.org
                </li>
                <li>
                  <strong>State Attorney General</strong>
                  <br />
                  naag.org
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Key Takeaways */}
        <div className="mt-12 bg-primary/5 rounded-lg border border-primary/20 p-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Key Takeaways</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span><strong>Document everything:</strong> Keep detailed records of all communications, dates, and amounts.</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span><strong>Communicate in writing:</strong> Use email or certified mail to create a record of your communications.</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span><strong>Know your rights:</strong> Familiarize yourself with the laws that protect you. The CFPB website has free resources.</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span><strong>File complaints:</strong> Use the CFPB complaint system to report violations. Your complaint helps regulators take action.</span>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span><strong>Seek help:</strong> Contact legal aid organizations or consumer advocacy groups. Many offer free consultations.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
