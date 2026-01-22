import { createClient } from "@/lib/supabase/auth-server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, GitBranch, Clock } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Get statistics
  const { count: totalConfigs } = await supabase
    .from("configurations")
    .select("*", { count: "exact", head: true });

  const { count: recentConfigs } = await supabase
    .from("configurations")
    .select("*", { count: "exact", head: true })
    .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const { count: totalMappings } = await supabase
    .from("hubspot_field_mappings")
    .select("*", { count: "exact", head: true });

  const { count: activeMappings } = await supabase
    .from("hubspot_field_mappings")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  // Get recent configurations
  const { data: recentSubmissions } = await supabase
    .from("configurations")
    .select("reference, company, email, created_at, status")
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-stone-600 mt-1">
          Overview of your FarmDroid configurator
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-stone-600">
              Total Configurations
            </CardTitle>
            <FileText className="h-4 w-4 text-stone-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalConfigs || 0}</div>
            <p className="text-xs text-stone-500 mt-1">All time submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-stone-600">
              This Week
            </CardTitle>
            <Clock className="h-4 w-4 text-stone-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{recentConfigs || 0}</div>
            <p className="text-xs text-stone-500 mt-1">New configurations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-stone-600">
              Field Mappings
            </CardTitle>
            <GitBranch className="h-4 w-4 text-stone-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalMappings || 0}</div>
            <p className="text-xs text-stone-500 mt-1">
              {activeMappings || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-stone-600">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/admin/mappings"
              className="block text-sm text-green-600 hover:text-green-700 hover:underline"
            >
              Configure HubSpot mappings
            </Link>
            <Link
              href="/admin/users"
              className="block text-sm text-green-600 hover:text-green-700 hover:underline"
            >
              Manage admin users
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Submissions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Configurations</CardTitle>
          <CardDescription>
            Latest configuration submissions from the configurator
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentSubmissions && recentSubmissions.length > 0 ? (
            <div className="space-y-4">
              {recentSubmissions.map((config) => (
                <div
                  key={config.reference}
                  className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-stone-900">
                      {config.company}
                    </p>
                    <p className="text-sm text-stone-500">{config.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-stone-600">
                      {config.reference}
                    </p>
                    <p className="text-xs text-stone-400">
                      {new Date(config.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-stone-500 text-center py-8">
              No configurations yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
