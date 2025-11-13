import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function ConsumerConfirmation() {
  const [, setLocation] = useLocation();
  const [caseId, setCaseId] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  useEffect(() => {
    // Parse URL params
    const params = new URLSearchParams(window.location.search);
    const id = params.get("caseId") || "";
    const cat = params.get("category") || "";
    
    setCaseId(id);
    setCategory(cat);

    // If no caseId, redirect to home
    if (!id) {
      setLocation("/");
    }
  }, [setLocation]);

  const getCategoryName = (cat: string) => {
    const categories: Record<string, string> = {
      eviction: "Eviction & Housing",
      debt: "Debt Collection",
      irs: "IRS & Tax Issues",
      wage: "Wage Garnishment",
      medical: "Medical Bills",
      benefits: "Benefits Denial",
      auto: "Auto Repossession",
      consumer: "Consumer Rights",
    };
    return categories[cat] || cat;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 md:p-12">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
          Your Intake Has Been Received
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-300 text-center mb-8">
          Thank you for submitting your case. We will contact you within 48–72 hours to discuss next steps.
        </p>

        {/* Case Details Card */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Case Details</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Case ID:</span>
              <span className="text-white font-mono font-semibold">{caseId}</span>
            </div>
            
            {category && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Category:</span>
                <span className="text-white font-semibold">{getCategoryName(category)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Status:</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                Pending Review
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20 mb-8">
          <h3 className="text-lg font-semibold text-blue-300 mb-3">What Happens Next?</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">1.</span>
              <span>Our team will review your case details within 48–72 hours</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">2.</span>
              <span>We'll contact you via email or phone to schedule a consultation</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">3.</span>
              <span>We'll contact you via email or phone to discuss next steps</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">4.</span>
              <span>If you choose to proceed, we'll begin working on your case immediately</span>
            </li>
          </ul>
        </div>

        {/* Important Note */}
        <div className="bg-purple-500/10 rounded-xl p-6 border border-purple-500/20 mb-8">
          <h3 className="text-lg font-semibold text-purple-300 mb-2">Important Note</h3>
          <p className="text-gray-300 text-sm">
            No payment is required at this time. Pricing will be discussed during your consultation call based on your specific case needs.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setLocation("/")}
            className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/20 transition-all duration-200"
          >
            Return to Home
          </button>
          <button
            onClick={() => setLocation("/intake")}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-200"
          >
            Submit Another Case
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Questions? Contact us at{" "}
            <a
              href="mailto:support@turboresponsehq.ai"
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              support@turboresponsehq.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
