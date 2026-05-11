"use client";

import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import { Progress } from "@/components/ui/progress";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { CheckCircle2 } from "lucide-react";

const sections = [
  {
    id: "personal",

    name: "Personal Information",

    questions: [
      {
        label: "Full legal name",
        type: "text",
      },

      {
        label: "South African ID number",
        type: "text",
      },

      {
        label: "Contact number",
        type: "text",
      },
    ],
  },

  {
    id: "financial",

    name: "Financial Disclosure",

    questions: [
      {
        label: "Annual gross income (ZAR)",
        type: "text",
      },

      {
        label: "Source of funds",
        type: "textarea",
      },
    ],
  },

  {
    id: "compliance",

    name: "Compliance Declarations",

    questions: [
      {
        label: "Have you been declared insolvent?",
        type: "text",
      },

      {
        label:
          "Any prior regulatory action against you?",
        type: "textarea",
      },
    ],
  },
];

export default function FormAccessPage() {
  const [completed, setCompleted] = useState([]);

  const progress =
    (completed.length / sections.length) * 100;

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-3xl">

        {/* Header */}
        <div className="mb-6">
          <p className="text-sm text-slate-500">
            Welcome,
          </p>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Thabo Nkosi
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Please complete each section below.
            Your progress is saved automatically.
          </p>
        </div>

        {/* Progress */}
        <Card className="mb-6 border-slate-200 shadow-sm">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-800">
                Progress
              </span>

              <span className="text-slate-500">
                {completed.length} of{" "}
                {sections.length} sections complete
              </span>
            </div>

            <Progress value={progress} />
          </CardContent>
        </Card>

        {/* Form Sections */}
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-2 sm:p-4">

            <Accordion
              type="single"
              collapsible
              defaultValue={sections[0].id}
            >
              {sections.map((section) => {
                const isDone =
                  completed.includes(section.id);

                return (
                  <AccordionItem
                    key={section.id}
                    value={section.id}
                  >
                    <AccordionTrigger className="px-2 hover:no-underline">
                      
                      <div className="flex items-center gap-3">
                        
                        {isDone ? (
                          <CheckCircle2
                            className="
                              h-4 w-4
                              text-emerald-600
                            "
                          />
                        ) : (
                          <span
                            className="
                              h-4 w-4 rounded-full
                              border border-slate-300
                            "
                          />
                        )}

                        <span className="font-medium text-slate-800">
                          {section.name}
                        </span>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="px-2">
                      <div className="space-y-5 pt-2">

                        {section.questions.map(
                          (question, index) => (
                            <div
                              key={index}
                              className="space-y-2"
                            >
                              <Label>
                                {question.label}
                              </Label>

                              {question.type ===
                              "textarea" ? (
                                <Textarea
                                  rows={4}
                                  className="resize-none"
                                />
                              ) : (
                                <Input type="text" />
                              )}
                            </div>
                          )
                        )}

                        <Button
                          type="button"
                          onClick={() =>
                            setCompleted((prev) =>
                              prev.includes(section.id)
                                ? prev
                                : [...prev, section.id]
                            )
                          }
                        >
                          Submit Section
                        </Button>

                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Z83 Dynamic Tool · Your information is
          protected.
        </p>
      </div>
    </div>
  );
}