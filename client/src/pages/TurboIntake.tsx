import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function TurboIntake() {
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState("");

  const [formData, setFormData] = useState({
    businessName: "",
    ownerName: "",
    industry: "",
    email: "",
    phone: "",
    whatYouSell: "",
    idealCustomer: "",
    biggestStruggle: "",
    goal60To90Days: "",
    longTermVision: "",
    websiteUrl: "",
    instagramHandle: "",
    facebookUrl: "",
    tiktokHandle: "",
    otherSocialMedia: "",
  });

  const submitIntakeMutation = trpc.turboIntake.submitIntake.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
      setSubmissionId(data.submissionId);
      toast.success("Submission received! We'll analyze your business and get back to you soon.");
    },
    onError: (error) => {
      toast.error(`Failed to submit: ${error.message}`);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.businessName || !formData.ownerName || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }

    await submitIntakeMutation.mutateAsync(formData);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-3xl">Submission Received!</CardTitle>
            <CardDescription className="text-lg mt-2">
              Thank you for submitting your business information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Your Submission ID:</p>
              <p className="font-mono font-bold text-lg">{submissionId}</p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                What Happens Next?
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Our AI analyzes your website and social media presence</li>
                <li>We generate a comprehensive business audit report</li>
                <li>We create a strategic blueprint with actionable recommendations</li>
                <li>You receive both reports via email within 24-48 hours</li>
              </ol>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground text-center">
                Questions? Contact us at{" "}
                <a href="mailto:wearemoneybosses@gmail.com" className="text-primary hover:underline">
                  wearemoneybosses@gmail.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3">Turbo Intake - Business Audit</h1>
          <p className="text-lg text-muted-foreground">
            Get a comprehensive AI-powered analysis of your business and a strategic roadmap for growth
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tell Us About Your Business</CardTitle>
            <CardDescription>
              Fill out this form to receive a detailed audit and strategic blueprint
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Business Information</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">
                      Business Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="e.g., Turbo Resort"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownerName">
                      Owner Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="ownerName"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      placeholder="e.g., John Smith"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry / Niche</Label>
                  <Input
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="e.g., AI Systems, E-commerce, Consulting"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Contact Information</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              {/* Business Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Business Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="whatYouSell">What do you sell?</Label>
                  <Textarea
                    id="whatYouSell"
                    name="whatYouSell"
                    value={formData.whatYouSell}
                    onChange={handleChange}
                    placeholder="Describe your products or services..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idealCustomer">Who is your ideal customer?</Label>
                  <Textarea
                    id="idealCustomer"
                    name="idealCustomer"
                    value={formData.idealCustomer}
                    onChange={handleChange}
                    placeholder="Describe your target audience..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="biggestStruggle">What's your biggest struggle right now?</Label>
                  <Textarea
                    id="biggestStruggle"
                    name="biggestStruggle"
                    value={formData.biggestStruggle}
                    onChange={handleChange}
                    placeholder="e.g., Not getting enough leads, low conversion rate..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal60To90Days">What's your goal in the next 60-90 days?</Label>
                  <Textarea
                    id="goal60To90Days"
                    name="goal60To90Days"
                    value={formData.goal60To90Days}
                    onChange={handleChange}
                    placeholder="e.g., Capture more leads, increase revenue by 30%..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longTermVision">What's your long-term vision?</Label>
                  <Textarea
                    id="longTermVision"
                    name="longTermVision"
                    value={formData.longTermVision}
                    onChange={handleChange}
                    placeholder="e.g., Build a 7-figure business, become industry leader..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Online Presence */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Online Presence</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    name="websiteUrl"
                    type="url"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="instagramHandle">Instagram Handle</Label>
                    <Input
                      id="instagramHandle"
                      name="instagramHandle"
                      value={formData.instagramHandle}
                      onChange={handleChange}
                      placeholder="@yourbusiness"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tiktokHandle">TikTok Handle</Label>
                    <Input
                      id="tiktokHandle"
                      name="tiktokHandle"
                      value={formData.tiktokHandle}
                      onChange={handleChange}
                      placeholder="@yourbusiness"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebookUrl">Facebook Page URL</Label>
                  <Input
                    id="facebookUrl"
                    name="facebookUrl"
                    type="url"
                    value={formData.facebookUrl}
                    onChange={handleChange}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otherSocialMedia">Other Social Media</Label>
                  <Textarea
                    id="otherSocialMedia"
                    name="otherSocialMedia"
                    value={formData.otherSocialMedia}
                    onChange={handleChange}
                    placeholder="LinkedIn, YouTube, Twitter, etc."
                    rows={2}
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={submitIntakeMutation.isPending}
              >
                {submitIntakeMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Submit for Free Audit
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By submitting this form, you'll receive a comprehensive business audit and strategic blueprint within 24-48 hours.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

