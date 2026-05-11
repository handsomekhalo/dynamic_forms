"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import backendApi from "../../../utils/backendApi";

import { useAuth } from "../../../AuthContext";

import AppLayout from "../dashboard/Applayout";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Plus,
  Send,
} from "lucide-react";

import FormModal from "@/components/forms/FormModal";

export default function FormsPage() {

    console.log("Rendering FormsPage component...");
  const [forms, setForms] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  const [showFormModal, setShowFormModal] =
    useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
  });

  const {
    authToken,
    isAuthenticated,
    navigate,
    isLoading,
  } = useAuth();

  const fetchForms = async () => {
    try {
      setLoading(true);

      const res = await backendApi.get(
        "/application_management/get_all_forms/"
      );

      console.log("API response here is :", res.data);

      const formsData = Array.isArray(
        res.data
      )
        ? res.data
        : Array.isArray(res.data.forms)
        ? res.data.forms
        : [];

      setForms(formsData);

      setLoading(false);
    } catch (err) {
      console.error(err);

      setError("Failed to load forms.");

      setLoading(false);
    }
  };

  const handleFormCreate = async () => {
    try {
      await backendApi.post(
        "/application_management/create_form/",
        formData
      );

      setShowFormModal(false);

      setFormData({
        name: "",
        description: "",
        is_active: true,
      });

      fetchForms();
    } catch (err) {
      console.error(err);

      setError("Failed to create form.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (isLoading) return;

      if (!authToken || !isAuthenticated) {
        return navigate("/login");
      }

      await fetchForms();
    };

    fetchData();
  }, [
    authToken,
    isAuthenticated,
    navigate,
    isLoading,
  ]);

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Forms
          </h1>

          <p className="text-sm text-slate-500">
            Create and manage your
            compliance forms.
          </p>
        </div>

        <Button
          onClick={() =>
            setShowFormModal(true)
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Form
        </Button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="py-20 text-center">
          <p className="text-slate-500">
            Loading forms...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      ) : (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead
                  className="
                    border-b border-slate-200
                    text-left text-xs uppercase
                    tracking-wide text-slate-500
                  "
                >
                  <tr>
                    <th className="px-6 py-3">
                      Form Name
                    </th>

                    <th className="px-6 py-3">
                      Description
                    </th>

                    <th className="px-6 py-3">
                      Status
                    </th>

                    <th className="px-6 py-3 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {forms.map((form) => (
                    <tr key={form.id}>
                      <td className="px-6 py-4 font-medium">
                        {form.name}
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {
                          form.description
                        }
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`
                            inline-flex rounded-full px-2 py-1 text-xs font-medium
                            ${
                              form.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-600"
                            }
                          `}
                        >
                          {form.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {/* Manage */}
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link
                              href={`/forms/${form.id}`}
                            >
                              Manage
                            </Link>
                          </Button>

                          {/* Invite */}
                          <Button
                            size="sm"
                            asChild
                          >
                            <Link href="/invite-user">
                              <Send className="mr-1.5 h-3.5 w-3.5" />

                              Invite
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Form Modal */}
      {showFormModal && (
        <FormModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleFormCreate}
          onClose={() =>
            setShowFormModal(false)
          }
        />
      )}
    </AppLayout>
  );
}