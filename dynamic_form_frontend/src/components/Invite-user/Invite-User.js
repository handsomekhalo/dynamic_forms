"use client";

import AppLayout from "@/components/AppLayout";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Send } from "lucide-react";

export default function InvitePage() {
  const handleSubmit = (e) => {
    e.preventDefault();

    // submit logic here
  };

  return (
    <AppLayout>

      {/* Header */}
      <div className="mb-8">

        <h1 className="text-2xl font-semibold tracking-tight">
          Send Invites
        </h1>

        <p className="text-sm text-slate-500">
          Send applicants a secure magic link
          to complete a form.
        </p>

      </div>

      {/* Invite Card */}
      <Card className="max-w-2xl border-slate-200 shadow-sm">

        <CardHeader>
          <CardTitle className="text-base">
            New Invitation
          </CardTitle>
        </CardHeader>

        <CardContent>

          <form
            className="space-y-5"
            onSubmit={handleSubmit}
          >

            {/* Form Select */}
            <div className="space-y-2">

              <Label>
                Select form
              </Label>

              <Select defaultValue="fsp-onboarding">

                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="fsp-onboarding">
                    FSP Onboarding
                  </SelectItem>

                  <SelectItem value="npo-disclosure">
                    NPO Disclosure
                  </SelectItem>

                  <SelectItem value="hr-compliance">
                    HR Compliance Pack
                  </SelectItem>

                </SelectContent>

              </Select>
            </div>

            {/* Emails */}
            <div className="space-y-2">

              <Label htmlFor="emails">
                Email addresses
              </Label>

              <Textarea
                id="emails"
                rows={6}
                placeholder={`applicant1@example.co.za
applicant2@example.co.za
applicant3@example.co.za`}
                className="resize-none"
              />

              <p className="text-xs text-slate-500">
                One email per line or separate
                multiple emails using commas.
              </p>

            </div>

            {/* Submit */}
            <Button type="submit">

              <Send className="mr-2 h-4 w-4" />

              Send Magic Link Invites

            </Button>

          </form>

        </CardContent>
      </Card>
    </AppLayout>
  );
}