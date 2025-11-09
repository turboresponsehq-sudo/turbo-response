import { Button } from "@/components/ui/button";
import { APP_TITLE } from "@/const";
import { Link } from "wouter";
import { MessageSquare, Shield, FileText, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <div className="container max-w-6xl py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {APP_TITLE}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            AI-Powered Consumer Defense Platform
          </p>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Fighting debt collectors, evictions, credit errors, and more. Get professional response
            documents customized to your situation in 24 hours.
          </p>

          <Link href="/chat">
            <Button size="lg" className="text-lg px-8 py-6 h-auto">
              <MessageSquare className="mr-2 h-5 w-5" />
              Start Your Free Case Analysis
            </Button>
          </Link>

          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Takes 5-10 minutes
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border">
            <MessageSquare className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="font-semibold mb-2">Conversational AI</h3>
            <p className="text-sm text-muted-foreground">
              Tell your story naturally. Our AI asks smart follow-up questions to understand your
              situation.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border">
            <Shield className="h-10 w-10 text-purple-600 mb-4" />
            <h3 className="font-semibold mb-2">Expert Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Get instant analysis of potential issues and your options based on consumer protection
              laws.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border">
            <FileText className="h-10 w-10 text-green-600 mb-4" />
            <h3 className="font-semibold mb-2">Custom Documents</h3>
            <p className="text-sm text-muted-foreground">
              Professional response letters, cease & desist, validation requests - all customized to
              your case.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border">
            <Zap className="h-10 w-10 text-orange-600 mb-4" />
            <h3 className="font-semibold mb-2">Fast Turnaround</h3>
            <p className="text-sm text-muted-foreground">
              Get your document package within 24-48 hours. Ready to sign and send immediately.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 shadow-sm border mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Tell Your Story</h3>
              <p className="text-sm text-muted-foreground">
                Chat with our AI and answer a few questions about your situation. Upload any evidence
                you have.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Get Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes your case and identifies potential issues, inconsistencies, and your
                options.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Receive Documents</h3>
              <p className="text-sm text-muted-foreground">
                Get your custom document package within 24 hours. Sign, send, and protect your rights.
              </p>
            </div>
          </div>
        </div>

        {/* We Help With */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">We Help With</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              "Debt Collection Harassment",
              "Eviction Defense",
              "Credit Report Errors",
              "Unemployment Benefits",
              "Wage Garnishment",
              "Bank Account Issues",
              "Discrimination Cases",
              "Consumer Rights Violations",
            ].map(item => (
              <div
                key={item}
                className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-lg text-sm font-medium"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Fight Back?</h2>
          <p className="text-lg mb-8 opacity-90">
            Don't let debt collectors, landlords, or creditors push you around. Get the documents you
            need to respond with confidence.
          </p>

          <Link href="/chat">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 h-auto">
              <MessageSquare className="mr-2 h-5 w-5" />
              Start Free Case Analysis Now
            </Button>
          </Link>

          <p className="text-sm mt-4 opacity-75">
            ⚠️ We are NOT lawyers. We provide document preparation services only. For legal advice,
            consult a licensed attorney.
          </p>
        </div>
      </div>
    </div>
  );
}

