"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Mail } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "unauthorized") {
      setError(
        "You don't have permission to access the admin area. Please contact an administrator."
      );
    } else if (errorParam === "auth_failed") {
      setError("Authentication failed. Please try again.");
    }
  }, [searchParams]);

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const redirectTo = searchParams.get("redirect") || "/admin";

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    } else {
      setSuccess(true);
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We've sent a magic link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-stone-600">
              Click the link in the email to sign in. The link will expire in 1
              hour.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSuccess(false);
                setEmail("");
              }}
            >
              Use a different email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl">FarmDroid Admin</CardTitle>
          <CardDescription>
            Enter your email to receive a sign-in link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleMagicLinkLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <span className="animate-pulse">Sending link...</span>
              ) : (
                <>
                  <Mail className="w-5 h-5 mr-2" />
                  Send magic link
                </>
              )}
            </Button>

            <p className="text-xs text-center text-stone-500 mt-6">
              Only authorized administrators can access this area.
              <br />
              Contact your system administrator if you need access.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
