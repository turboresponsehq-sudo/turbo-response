import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Sparkles, Target, TrendingUp, Zap, ArrowRight, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-cyan-500/20 bg-slate-900/50 backdrop-blur-sm">
        <div className="container max-w-7xl py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">TURBO RESPONSE</span>
          </div>
          <Link href="/turbo-intake">
            <Button variant="outline" className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container max-w-7xl py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-400 font-medium">Powered by Advanced AI Technology</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
            Transform Your Business<br />with AI-Powered Strategy
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Get a comprehensive business audit and strategic blueprint in 24-48 hours. 
            Our AI analyzes your brand, funnel, and social presence to deliver actionable growth strategies.
          </p>

          <Link href="/turbo-intake">
            <Button size="lg" className="text-lg px-8 py-6 h-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg shadow-cyan-500/50">
              <Sparkles className="mr-2 h-5 w-5" />
              Start Your Free Business Audit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          <p className="text-sm text-slate-400 mt-4">
            No credit card required • Results in 24-48 hours
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          <div className="bg-slate-800/50 border border-cyan-500/20 p-8 rounded-2xl backdrop-blur-sm hover:border-cyan-500/40 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <Target className="h-7 w-7 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">AI-Powered Analysis</h3>
            <p className="text-slate-300 leading-relaxed">
              Our advanced AI analyzes your website, social media, and brand positioning to identify growth opportunities and gaps in your strategy.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-cyan-500/20 p-8 rounded-2xl backdrop-blur-sm hover:border-cyan-500/40 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="h-7 w-7 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Strategic Blueprint</h3>
            <p className="text-slate-300 leading-relaxed">
              Receive a comprehensive 5-section strategic plan covering brand positioning, funnel architecture, social strategy, and 30-day action plan.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-cyan-500/20 p-8 rounded-2xl backdrop-blur-sm hover:border-cyan-500/40 transition-all">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="h-7 w-7 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Rapid Results</h3>
            <p className="text-slate-300 leading-relaxed">
              Get your complete business audit and strategic blueprint delivered within 24-48 hours. Ready to implement immediately.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-500/20 rounded-3xl p-12 mb-20 backdrop-blur-sm">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/50">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Submit Your Info</h3>
              <p className="text-slate-300 leading-relaxed">
                Fill out our Turbo Intake form with your business details, goals, and online presence. Takes just 5-10 minutes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/50">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Analysis</h3>
              <p className="text-slate-300 leading-relaxed">
                Our AI analyzes your brand, website, social media, and competitive positioning to identify opportunities.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/50">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Get Your Blueprint</h3>
              <p className="text-slate-300 leading-relaxed">
                Receive your comprehensive strategic blueprint with actionable recommendations and a 30-day execution plan.
              </p>
            </div>
          </div>
        </div>

        {/* What You Get */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">What's Included</h2>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              "Executive Summary with key insights",
              "Brand Positioning & Competitive Analysis",
              "Funnel & Website Strategy Recommendations",
              "Social Media Content & Growth Strategy",
              "30-Day Strategic Action Plan",
              "Implementation Roadmap & Milestones"
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 bg-slate-800/30 border border-cyan-500/10 p-4 rounded-xl">
                <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-200 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-3xl p-12 text-center shadow-2xl shadow-cyan-500/30">
          <h2 className="text-4xl font-bold mb-4 text-white">Ready to Scale Your Business?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Get the clarity and strategy you need to break through growth plateaus. 
            Our AI-powered audit reveals exactly what's holding you back—and how to fix it.
          </p>

          <Link href="/turbo-intake">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 h-auto bg-white text-slate-900 hover:bg-slate-100 shadow-xl">
              <Sparkles className="mr-2 h-5 w-5" />
              Start Your Free Audit Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          <p className="text-sm mt-6 text-white/75">
            Join hundreds of businesses that have transformed their growth strategy with Turbo Response
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 bg-slate-900/50 backdrop-blur-sm py-8 mt-20">
        <div className="container max-w-7xl text-center text-slate-400 text-sm">
          <p>© 2025 Turbo Response HQ. All rights reserved.</p>
          <p className="mt-2">AI-Powered Business Strategy & Growth Consulting</p>
        </div>
      </footer>
    </div>
  );
}
