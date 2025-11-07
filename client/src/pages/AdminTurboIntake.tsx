import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Sparkles, CheckCircle, Clock, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function AdminTurboIntake() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(null);
  const [generatingAudit, setGeneratingAudit] = useState(false);
  const [generatingBlueprint, setGeneratingBlueprint] = useState(false);

  const { data: submissions, isLoading, refetch, error } = trpc.turboIntake.getSubmissions.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === 'admin' }
  );
  const { data: submissionDetails } = trpc.turboIntake.getSubmissionDetails.useQuery(
    { id: selectedSubmission! },
    { enabled: selectedSubmission !== null }
  );

  const generateAuditMutation = trpc.turboIntake.generateAudit.useMutation({
    onSuccess: () => {
      toast.success("Layer 1 audit generated successfully!");
      refetch();
      setGeneratingAudit(false);
    },
    onError: (error) => {
      toast.error(`Failed to generate audit: ${error.message}`);
      setGeneratingAudit(false);
    },
  });

  const generateBlueprintMutation = trpc.turboIntake.generateBlueprint.useMutation({
    onSuccess: () => {
      toast.success("Layer 2 strategic blueprint generated successfully!");
      refetch();
      setGeneratingBlueprint(false);
    },
    onError: (error) => {
      toast.error(`Failed to generate blueprint: ${error.message}`);
      setGeneratingBlueprint(false);
    },
  });

  const handleGenerateAudit = async (submissionId: number) => {
    setGeneratingAudit(true);
    await generateAuditMutation.mutateAsync({ submissionId });
  };

  const handleGenerateBlueprint = async (submissionId: number) => {
    setGeneratingBlueprint(true);
    await generateBlueprintMutation.mutateAsync({ submissionId });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "secondary" as const },
      audit_generated: { label: "Audit Ready", variant: "default" as const },
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
        <h1 className="text-3xl font-bold mb-2">Turbo Intake - 2-Layer Audit System</h1>
        <p className="text-muted-foreground">
          Manage business audit submissions and generate strategic blueprints
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

                {submission.auditGenerated === 1 && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Layer 1 Audit Complete</span>
                  </div>
                )}

                {submission.blueprintGenerated === 1 && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Sparkles className="w-4 h-4" />
                    <span>Layer 2 Blueprint Complete</span>
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

            {/* Layer 1: Audit Generation */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Layer 1: Manus Audit
              </h3>
              {submissionDetails.auditGenerated === 1 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>Audit generated on {new Date(submissionDetails.auditGeneratedAt!).toLocaleString()}</span>
                  </div>
                  {submissionDetails.auditReportPath && (
                    <Button variant="outline" asChild>
                      <a
                        href={submissionDetails.auditReportPath}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Audit Report
                      </a>
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  onClick={() => handleGenerateAudit(submissionDetails.id)}
                  disabled={generatingAudit}
                >
                  {generatingAudit ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Audit...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Layer 1 Audit
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Layer 2: Blueprint Generation */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Layer 2: Strategic Blueprint (OpenAI)
              </h3>
              {submissionDetails.blueprintGenerated === 1 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-blue-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>Blueprint generated on {new Date(submissionDetails.blueprintGeneratedAt!).toLocaleString()}</span>
                  </div>
                  {submissionDetails.blueprintReportPath && (
                    <Button variant="outline" asChild>
                      <a
                        href={submissionDetails.blueprintReportPath}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        View Strategic Blueprint
                      </a>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {submissionDetails.auditGenerated === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Please generate Layer 1 audit first before creating the strategic blueprint.
                    </p>
                  )}
                  <Button
                    onClick={() => handleGenerateBlueprint(submissionDetails.id)}
                    disabled={generatingBlueprint || submissionDetails.auditGenerated === 0}
                  >
                    {generatingBlueprint ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Blueprint...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Layer 2 Blueprint
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

