import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Loader2, TrendingUp, Users, Target, Activity } from "lucide-react";

/**
 * Analytics Dashboard - Phase 3: Intelligence Upgrade
 * Shows business metrics, conversion rates, and lead distribution
 */
export default function Analytics() {
  const { data: analytics, isLoading, refetch } = trpc.admin.getAnalytics.useQuery();

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 60000);
    return () => clearInterval(interval);
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Track your lead generation performance and conversion metrics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalLeads}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All time lead submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.conversionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.convertedLeads} converted leads
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.recentActivity.last7Days}</div>
              <p className="text-xs text-muted-foreground mt-1">
                New leads this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contacted</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.recentActivity.contacted}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Leads contacted this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Leads by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Leads by Status</CardTitle>
            <CardDescription>Distribution of leads across different stages</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(analytics.byStatus).map(([status, count]) => {
              const percentage = analytics.totalLeads > 0 ? (count / analytics.totalLeads) * 100 : 0;
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {status.replace("_", " ")}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Leads by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Leads by Category</CardTitle>
            <CardDescription>Case types and their distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(analytics.byCategory).map(([category, count]) => {
              const percentage = analytics.totalLeads > 0 ? (count / analytics.totalLeads) * 100 : 0;
              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {category.replace("_", " ")}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity (Last 7 Days)</CardTitle>
            <CardDescription>Summary of lead activity this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total New Leads</p>
                <p className="text-2xl font-bold">{analytics.recentActivity.last7Days}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">New (Uncontacted)</p>
                <p className="text-2xl font-bold">{analytics.recentActivity.newLeads}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Contacted</p>
                <p className="text-2xl font-bold">{analytics.recentActivity.contacted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Auto-refresh notice */}
        <p className="text-xs text-center text-muted-foreground">
          Dashboard auto-refreshes every 60 seconds
        </p>
      </div>
    </div>
  );
}

