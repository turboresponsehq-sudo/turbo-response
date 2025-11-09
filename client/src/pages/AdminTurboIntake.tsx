import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Sparkles, CheckCircle, Clock, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";

export default function AdminTurboIntake() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(null);
  const [blueprintData, setBlueprintData] = useState<any>(null);
  const [loadingBlueprint, setLoadingBlueprint] = useState(false);
  const [generatingBlueprint, setGeneratingBlueprint] = useState(false);

  const { data: submissions, isLoading, refetch, error } = trpc.turboIntake.getSubmissions.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === 'admin' }
  );
  const { data: submissionDetails } = trpc.turboIntake.getSubmissionDetails.useQuery(
    { id: selectedSubmission! },
    { enabled: selectedSubmission !== null }
  );



  const generateBlueprintMutation = trpc.turboIntake.generateBlueprint.useMutation({
    onSuccess: () => {
      toast.success("Strategic blueprint generated successfully!");
      refetch();
      setGeneratingBlueprint(false);
    },
    onError: (error) => {
      toast.error(`Failed to generate blueprint: ${error.message}`);
      setGeneratingBlueprint(false);
    },
  });



  const handleGenerateBlueprint = async (submissionId: number) => {
    setGeneratingBlueprint(true);
    await generateBlueprintMutation.mutateAsync({ submissionId });
  };

  const [blueprintUrl, setBlueprintUrl] = useState<string | null>(null);
  
  const { data: fetchedBlueprintData, isLoading: isFetchingBlueprint, error: blueprintError } = trpc.turboIntake.getBlueprintData.useQuery(
    { url: blueprintUrl! },
    { enabled: blueprintUrl !== null }
  );

  useEffect(() => {
    if (fetchedBlueprintData) {
      console.log('Blueprint data loaded:', fetchedBlueprintData);
      
      // Handle both JSON and Markdown formats
      if (fetchedBlueprintData.format === 'json') {
        setBlueprintData(fetchedBlueprintData.data);
        toast.success('Blueprint loaded successfully!');
      } else if (fetchedBlueprintData.format === 'markdown') {
        // For markdown, show it in a simple format
        toast.info('Legacy blueprint format detected (Markdown)');
        // Convert markdown to a simple display object
        setBlueprintData({
          legacy_format: true,
          markdown_content: fetchedBlueprintData.data
        });
      }
      
      setBlueprintUrl(null); // Reset to allow fetching again
    }
  }, [fetchedBlueprintData]);

  useEffect(() => {
    if (blueprintError) {
      console.error('Failed to fetch blueprint:', blueprintError);
      toast.error(`Failed to load blueprint data: ${blueprintError.message}`);
      setBlueprintUrl(null); // Reset on error
    }
  }, [blueprintError]);

  const fetchBlueprintData = async (url: string) => {
    setBlueprintUrl(url);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" as const },
      blueprint_generated: { label: "Blueprint Ready", variant: "default" as const },
      completed: { label: "Completed", variant: "default" as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (authLoading || (isLoading && isAuthenticated)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-2xl font-bold">Authentication Required</h2>
        <p className="text-muted-foreground">Please log in to access the Turbo Intake dashboard.</p>
        <Button asChild>
          <a href={getLoginUrl()}>Log In</a>
        </Button>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-2xl font-bold">Admin Access Required</h2>
        <p className="text-muted-foreground">You need admin privileges to access this page.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h2 className="text-2xl font-bold text-destructive">Error Loading Submissions</h2>
        <p className="text-muted-foreground">{error.message}</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Turbo Intake - Strategic Blueprint System</h1>
        <p className="text-muted-foreground">
          View business submissions and their AI-generated strategic blueprints
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {submissions?.map((submission) => (
          <Card
            key={submission.id}
            className={`cursor-pointer transition-all ${
              selectedSubmission === submission.id ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => setSelectedSubmission(submission.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{submission.businessName}</CardTitle>
                  <CardDescription className="mt-1">
                    {submission.ownerName} • {submission.industry || "No industry"}
                  </CardDescription>
                </div>
                {getStatusBadge(submission.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {submission.blueprintGenerated === 1 && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Sparkles className="w-4 h-4" />
                    <span>Blueprint Complete</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedSubmission && submissionDetails && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Submission Details</CardTitle>
            <CardDescription>ID: {submissionDetails.submissionId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Business Information */}
            <div>
              <h3 className="font-semibold mb-3">Business Information</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <span className="text-sm text-muted-foreground">Business Name:</span>
                  <p className="font-medium">{submissionDetails.businessName}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Owner:</span>
                  <p className="font-medium">{submissionDetails.ownerName}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <p className="font-medium">{submissionDetails.email}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Phone:</span>
                  <p className="font-medium">{submissionDetails.phone || "Not provided"}</p>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div>
              <h3 className="font-semibold mb-3">Business Details</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-muted-foreground">What They Sell:</span>
                  <p>{submissionDetails.whatYouSell || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Ideal Customer:</span>
                  <p>{submissionDetails.idealCustomer || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Biggest Struggle:</span>
                  <p>{submissionDetails.biggestStruggle || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">60-90 Day Goal:</span>
                  <p>{submissionDetails.goal60To90Days || "Not provided"}</p>
                </div>
              </div>
            </div>

            {/* Online Presence */}
            <div>
              <h3 className="font-semibold mb-3">Online Presence</h3>
              <div className="space-y-2">
                {submissionDetails.websiteUrl && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Website:</span>
                    <a
                      href={submissionDetails.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {submissionDetails.websiteUrl}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {submissionDetails.instagramHandle && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Instagram:</span>
                    <span>{submissionDetails.instagramHandle}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Strategic Blueprint */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Strategic Blueprint (5 Sections)
              </h3>
              {submissionDetails.blueprintGenerated === 1 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>Blueprint generated on {new Date(submissionDetails.blueprintGeneratedAt!).toLocaleString()}</span>
                    </div>
                    {submissionDetails.blueprintReportPath && !blueprintData && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchBlueprintData(submissionDetails.blueprintReportPath!)}
                        disabled={loadingBlueprint}
                      >
                        {loadingBlueprint ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4 mr-2" />
                        )}
                        Load Blueprint
                      </Button>
                    )}
                  </div>

                  {blueprintData && (
                    <div className="space-y-4 mt-4">
                      {/* Check if legacy markdown format */}
                      {blueprintData.legacy_format ? (
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">Legacy Blueprint (Markdown Format)</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(blueprintData.markdown_content, 'Blueprint')}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-sm whitespace-pre-wrap font-mono bg-muted p-4 rounded max-h-96 overflow-y-auto">
                            {blueprintData.markdown_content}
                          </div>
                        </div>
                      ) : (
                        <>
                      {/* Executive Summary */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">1. Executive Summary</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(blueprintData.executive_summary, 'Executive Summary')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{blueprintData.executive_summary}</p>
                      </div>

                      {/* Brand Positioning */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">2. Brand Positioning</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(blueprintData.brand_positioning, 'Brand Positioning')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{blueprintData.brand_positioning}</p>
                      </div>

                      {/* Funnel & Website Strategy */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">3. Funnel & Website Strategy</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(blueprintData.funnel_and_website_strategy, 'Funnel & Website Strategy')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{blueprintData.funnel_and_website_strategy}</p>
                      </div>

                      {/* Social Strategy */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">4. Social Strategy</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(blueprintData.social_strategy, 'Social Strategy')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{blueprintData.social_strategy}</p>
                      </div>

                      {/* 30-Day Plan */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">5. 30-Day Strategic Action Plan</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(blueprintData.thirty_day_plan, '30-Day Plan')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{blueprintData.thirty_day_plan}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => copyToClipboard(JSON.stringify(blueprintData, null, 2), 'Full Blueprint JSON')}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Full JSON
                        </Button>
                        <Button
                          variant="outline"
                          asChild
                        >
                          <a
                            href={submissionDetails.blueprintReportPath!}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Download JSON
                          </a>
                        </Button>
                      </div>
                      </>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                  <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Blueprint is automatically generated when form is submitted.
                  </p>
                  <Button
                    onClick={() => handleGenerateBlueprint(submissionDetails.id)}
                    disabled={generatingBlueprint}
                  >
                    {generatingBlueprint ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Blueprint...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Blueprint
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

