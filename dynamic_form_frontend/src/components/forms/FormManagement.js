"use client";
import { useRouter } from 'next/navigation'; 
import { useEffect, useState } from "react";

import Link from "next/link";

import { useParams } from "next/navigation";

import backendApi from "../../../utils/backendApi";


import AppLayout from '../../components/dashboard/Applayout'

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import {
  ChevronLeft,
  Plus,
  Send,
  Pencil,
  GripVertical,
} from "lucide-react";

import AssignCategoryModal from "@/components/forms/AssignCategoriesModal";

import AssignQuestionToCategoryModal from "@/components/questions/AssignQuestionsModal";

import UpdateFormModal from "@/components/forms/UpdateFormModal";

export default function FormDetailPage() {

  const params = useParams();
  const router = useRouter();


  const formId = params?.id;

  const [form, setForm] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(null);

  const [
    showAssignModal,
    setShowAssignModal,
  ] = useState(false);

  const [
    showQuestionModal,
    setShowQuestionModal,
  ] = useState(false);

  const [
    showUpdateModal,
    setShowUpdateModal,
  ] = useState(false);

  const fetchForm = async () => {

    try {

      setLoading(true);

      const res =
        await backendApi.get(
          `/application_management/get_form_details/${formId}/`
        );

      setForm(res.data.form);

      console.log(
        "FORM RESPONSE:",
        JSON.stringify(
          res.data.form,
          null,
          2
        )
      );

    } catch (err) {

      console.error(
        "Failed to fetch form:",
        err
      );

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    if (formId) {
      fetchForm();
    }

  }, [formId]);

  if (loading) {

    return (
      <AppLayout>
        <div className="py-20 text-center">
          Loading form...
        </div>
      </AppLayout>
    );
  }

  const totalQuestions =
    form?.categories?.reduce(
      (total, category) =>
        total +
        (
          category.questions
            ?.length || 0
        ),
      0
    ) || 0;

  return (
    <AppLayout>

      {/* Back */}
      <Link
        href="/forms"
        className="
          mb-4 inline-flex items-center
          text-sm text-slate-500
          hover:text-slate-900
        "
      >
        <ChevronLeft className="mr-1 h-4 w-4" />

        Back to forms
      </Link>

      {/* Header */}
      <div
        className="
          mb-6 flex flex-wrap
          items-center justify-between
          gap-4
        "
      >

        <div>

          <h1
            className="
              text-2xl
              font-semibold
              tracking-tight
            "
          >
            {form?.name}
          </h1>

          <p className="text-sm text-slate-500">

            {form?.categories?.length || 0}
            {" "}categories ·{" "}

            {totalQuestions}
            {" "}questions

          </p>

          <p className="mt-1 text-sm text-slate-500">

            {form?.description}

          </p>

        </div>

        <div className="flex gap-2">

          <Button
            variant="outline"
            onClick={() =>
              setShowUpdateModal(true)
            }
          >
            <Pencil className="mr-2 h-4 w-4" />

            Edit Form
          </Button>

            <Button
    variant="outline"
    onClick={() => router.push(`/forms/${formId}/builder`)}
  >
    Open Builder
  </Button>

          <Button asChild>

            <Link href="/invite-user">

              <Send className="mr-2 h-4 w-4" />

              Send Invite

            </Link>

          </Button> 

        </div>

      </div>

      {/* Tabs */}
      <Tabs defaultValue="categories">

        <TabsList>

          <TabsTrigger value="categories">
            Categories
          </TabsTrigger>

          <TabsTrigger value="questions">
            Questions
          </TabsTrigger>

          <TabsTrigger value="submissions">
            Submissions
          </TabsTrigger>

        </TabsList>

        {/* Categories */}
        <TabsContent
          value="categories"
          className="mt-4"
        >

          <Card>

            <CardContent className="p-0">

              <div
                className="
                  flex items-center
                  justify-between
                  border-b border-slate-200
                  px-6 py-4
                "
              >

                <p className="text-sm text-slate-500">

                  {form?.categories?.length || 0}
                  {" "}categories · click to expand

                </p>

                <Button
                  size="sm"
                  onClick={() =>
                    setShowAssignModal(true)
                  }
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />

                  Assign Category
                </Button>

              </div>

              {!form?.categories?.length ? (

                <div className="px-6 py-8">

                  <p className="text-sm text-slate-500">
                    No categories assigned yet.
                  </p>

                </div>

              ) : (

                <div className="px-6">

                  <Accordion
                    type="multiple"
                    className="w-full"
                  >

                    {form.categories.map(
                      (category) => (

                        <AccordionItem
                          key={category.id}
                          value={String(category.id)}
                        >

                          <AccordionTrigger>

                            <div className="text-left">

                              <p className="font-medium">

                                {category.name}

                              </p>

                              <p
                                className="
                                  text-xs
                                  text-slate-500
                                "
                              >

                                {
                                  category.questions
                                    ?.length || 0
                                }
                                {" "}questions ·{" "}

                                {
                                  category.description
                                }

                              </p>

                            </div>

                          </AccordionTrigger>

                          <AccordionContent>

                            {!category.questions
                              ?.length ? (

                              <p
                                className="
                                  pb-3
                                  text-sm
                                  text-slate-400
                                "
                              >
                                No questions assigned.
                              </p>

                            ) : (

                              <ul className="space-y-2 pb-3">

                                {category.questions.map(
                                  (
                                    question,
                                    index
                                  ) => (

                                    <li
                                      key={question.id}
                                      className="
                                        flex items-center
                                        justify-between
                                        rounded-md
                                        border border-slate-200
                                        bg-slate-50
                                        px-3 py-2
                                      "
                                    >

                                      <div
                                        className="
                                          flex items-center
                                          gap-3
                                        "
                                      >

                                        <GripVertical
                                          className="
                                            h-4 w-4
                                            text-slate-400
                                          "
                                        />

                                        <span
                                          className="
                                            text-xs
                                            text-slate-500
                                          "
                                        >
                                          {index + 1}.
                                        </span>

                                        <span
                                          className="
                                            text-sm
                                            font-medium
                                          "
                                        >
                                          {question.text}
                                        </span>

                                        <span
                                          className="
                                            text-xs
                                            text-slate-500
                                          "
                                        >

                                          ·{" "}

                                          {
                                            question.input_type
                                          }

                                        </span>

                                        {question.is_required && (

                                          <span
                                            className="
                                              rounded
                                              bg-red-50
                                              px-1.5 py-0.5
                                              text-[10px]
                                              font-medium
                                              text-red-700
                                            "
                                          >
                                            Required
                                          </span>

                                        )}

                                      </div>

                                    </li>

                                  )
                                )}

                              </ul>

                            )}

                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {

                                setSelectedCategory(
                                  category.id
                                );

                                setShowQuestionModal(
                                  true
                                );

                              }}
                            >

                              {/* <Plus className="mr-1.5 h-3.5 w-3.5" /> */}
                                 <Plus className="mr-1.5 h-3.5 w-3.5" />

                              Assign Question

                            </Button>

                          </AccordionContent>

                        </AccordionItem>

                      )
                    )}

                  </Accordion>

                </div>

              )}

            </CardContent>

          </Card>

        </TabsContent>

        {/* Questions */}
        <TabsContent
          value="questions"
          className="mt-4"
        >

          <div className="space-y-4">

            {form?.categories?.map(
              (category) => (

                <Card key={category.id}>

                  <CardContent className="p-0">

                    <div
                      className="
                        border-b border-slate-200
                        px-6 py-3
                      "
                    >

                      <div
                        className="
                          flex items-center
                          justify-between
                        "
                      >

                        <p
                          className="
                            text-xs uppercase
                            tracking-wide
                            text-slate-500
                          "
                        >
                          {category.name}
                        </p>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {

                            setSelectedCategory(
                              category.id
                            );

                            setShowQuestionModal(
                              true
                            );

                          }}
                        >

                          <Plus className="mr-1 h-3 w-3" />

                          Add Question

                        </Button>

                      </div>

                    </div>

                    {!category.questions
                      ?.length ? (

                      <div className="px-6 py-4">

                        <p className="text-sm text-slate-400">
                          No questions assigned.
                        </p>

                      </div>

                    ) : (

                      <ul
                        className="
                          divide-y
                          divide-slate-200
                        "
                      >

                        {category.questions.map(
                          (question) => (

                            <li
                              key={question.id}
                              className="px-6 py-4"
                            >

                              <div className="space-y-2">

                                <div
                                  className="
                                    flex items-center
                                    gap-2
                                  "
                                >

                                  <p className="font-medium">

                                    {question.text}

                                  </p>

                                  {question.is_required && (

                                    <span
                                      className="
                                        rounded
                                        bg-red-50
                                        px-1.5 py-0.5
                                        text-[10px]
                                        font-medium
                                        text-red-700
                                      "
                                    >
                                      Required
                                    </span>

                                  )}

                                </div>

                                <p
                                  className="
                                    text-xs
                                    text-slate-500
                                  "
                                >

                                  Type:
                                  {" "}

                                  {
                                    question.input_type
                                  }

                                </p>

                                <div className="max-w-md pt-1">

                                  <Label
                                    className="
                                      text-xs
                                      text-slate-500
                                    "
                                  >
                                    Preview
                                  </Label>

                                  <Input
                                    disabled
                                    placeholder={`Applicant answers ${question.input_type?.toLowerCase()} here...`}
                                  />

                                </div>

                              </div>

                            </li>

                          )
                        )}

                      </ul>

                    )}

                  </CardContent>

                </Card>

              )
            )}

          </div>

        </TabsContent>

        {/* Submissions */}
        <TabsContent
          value="submissions"
          className="mt-4"
        >

          <Card>

            <CardContent className="p-6">

              <p className="text-slate-500">
                Submissions will appear here.
              </p>

            </CardContent>

          </Card>

        </TabsContent>

      </Tabs>

      {/* Assign Category */}
      {showAssignModal && (

        <AssignCategoryModal
          open={showAssignModal}
          formId={formId}
          onClose={(refreshNeeded) => {

            setShowAssignModal(false);

            if (refreshNeeded) {
              fetchForm();
            }

          }}
        />

      )}

      {/* Assign Questions */}
      {showQuestionModal && (

        <AssignQuestionToCategoryModal
          open={showQuestionModal}
          formId={formId}
          categoryId={selectedCategory}
          onClose={(refreshNeeded) => {

            setShowQuestionModal(false);

            setSelectedCategory(null);

            if (refreshNeeded) {
              fetchForm();
            }

          }}
        />

      )}

      {/* Update Form */}
      {showUpdateModal && (

        <UpdateFormModal
          formData={form}
          setFormData={setForm}
          onUpdate={async () => {

            await fetchForm();

            setShowUpdateModal(false);

          }}
          onClose={() =>
            setShowUpdateModal(false)
          }
        />

      )}

      <Button onClick={() => router.push(`/forms/${form.id}/builder`)}>
  Open Builder
</Button>

    </AppLayout>
  );
}


// "use client";

// import { useEffect, useState } from "react";

// import { useParams } from "next/navigation";

// import Link from "next/link";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";

// import backendApi from "../../../utils/backendApi";
// import AppLayout from '../../components/dashboard/Applayout'
// import { Button } from "@/components/ui/button";

// import {
//   Card,
//   CardContent,
// } from "@/components/ui/card";

// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "@/components/ui/tabs";

// import {
//   ChevronLeft,
//   Plus,
//   Send,
// } from "lucide-react";

// import AssignCategoryModal from "@/components/forms/AssignCategoriesModal";

// import AssignQuestionToCategoryModal from "@/components/questions/AssignQuestionsModal";

// import UpdateFormModal from "@/components/forms/UpdateFormModal";



// // "use client";
// // import React, { useState, useEffect } from "react";
// // import backendApi from "../../../utils/backendApi";
// // import { useAuth } from "../../../AuthContext";
// // import Swal from 'sweetalert2';
// // import CreateButton from "./CreateButton";
// // import FormModal from "./FormModal";
// // import CategoryModal from "./CategoryModal";
// // import FormTabs from "./FormTabsModal";
// // import { EnhancedFormList } from "./FormTabsModal";
// // import AssignCategoryModal from "./AssignCategoriesModal";
// // import AssignQuestionToCategoryModal from "../questions/AssignQuestionsModal";
// // import UpdateFormModal from "./UpdateFormModal";
// // import AppLayout from "../dashboard/Applayout";



// // export default function FormManagement() {
// //   const [forms, setForms] = useState([]);
// //   const [formData, setFormData] = useState({
// //     name: "",
// //     description: "",
// //     is_active: true,
// //   });
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);
// //   const [showFormModal, setShowFormModal] = useState(false);
// //   const [showCategoryModal, setShowCategoryModal] = useState(false);
// //   const [assignFormId, setAssignFormId] = useState(null);
// //   const [showQuestionModal, setShowQuestionModal] = useState(false);
// //   const [newCategoryName, setNewCategoryName] = useState("");
// //   const [newDescriptionName, setNewDescriptionName] = useState("");
// //   const [refreshTrigger, setRefreshTrigger] = useState(0);
// //   const [activeTab, setActiveTab] = useState("all");
// //   const [showAssignModal, setShowAssignModal] = useState(false);
// //   const [selectedFormId, setSelectedFormId] = useState(null);
// //     const [showUpdateFormModal, setShowUpdateFormModal] = useState(false);
    


// //   const { authToken, isAuthenticated, navigate, isLoading } = useAuth();

// //   const fetchForms = async () => {
// //     try {
// //       setLoading(true);
// //       const res = await backendApi.get(
// //         "/application_management/get_all_forms/"
// //       );
// //       const formsData = Array.isArray(res.data)
// //         ? res.data
// //         : Array.isArray(res.data.forms)
// //         ? res.data.forms
// //         : [];
// //       setForms(formsData);
// //       setLoading(false);
// //     } catch (err) {
// //       console.error("Error fetching forms:", err);
// //       setError("Failed to load forms.");
// //       setLoading(false);
// //     }
// //   };

// //   const handleFormCreate = async () => {
// //     try {
// //       await backendApi.post("/application_management/create_form/", formData);
// //       setShowFormModal(false);
// //       setFormData({ name: "", description: "", is_active: true });
// //       fetchForms();
// //     } catch (err) {
// //       setError("Failed to create form.");
// //       console.error("Create form error:", err);
// //     }
// //   };



// // const handleFormUpdate = async () => {
// //   try {
// //     await backendApi.post("/application_management/update_form_details/", {
// //       formId: formData.id,
// //       name: formData.name,
// //       description: formData.description,
// //       is_active: formData.is_active,
// //     });

// //     setShowUpdateFormModal(false);
// //         fetchForms();


// //     Swal.fire({
// //       icon: 'success',
// //       title: 'Success!',
// //       text: 'Form updated successfully.',
// //       confirmButtonText: "OK"
// //     }).then(() => {
// //       location.reload(); // or fetchForms() if you prefer not to reload the whole page
// //     });

// //   } catch (err) {
// //     setError("Failed to update form.");
// //     console.error("Update form error:", err);

// //     Swal.fire({
// //       icon: 'error',
// //       title: 'Update Failed',
// //       text: 'Something went wrong while updating the form.',
// //       confirmButtonText: "OK"
// //     });
// //   }
// // };


// //   const handleAssignClick = (formId) => {
// //     setSelectedFormId(formId);
// //     setShowAssignModal(true);
// //   };

  

// //   const handleUpdateClick = (form) => {
// //   setFormData(form); // preload form data
// //   // setShowUpdateFormModal(true);
// //   setShowUpdateFormModal(true)
  
// // }

// //   const handleAssignQuestionsClick = (formId) => {
// //     setAssignFormId(formId);
// //     setShowQuestionModal(true);
// //   };

// //   const handleAssignModalClose = (refreshNeeded = false) => {
// //     setShowAssignModal(false);
// //     if (refreshNeeded) {
// //       fetchForms();
// //       setRefreshTrigger((prev) => prev + 1);
// //     }
// //   };

// //   const handleQuestionModalClose = (refreshNeeded = false) => {
// //     setShowQuestionModal(false);
// //     setAssignFormId(null);
// //     if (refreshNeeded) {
// //       fetchForms();
// //     }
// //   };

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       if (isLoading) return;
// //       if (!authToken || !isAuthenticated) return navigate("/login");
// //       setLoading(true);
// //       await fetchForms();
// //     };
// //     fetchData();
// //   }, [authToken, isAuthenticated, navigate, isLoading]);

// //   return (
// //     // <div className="p-6 bg-white shadow-md rounded-2xl max-w-4xl mx-auto">
// //       <AppLayout>

// //     <div className="max-w-7xl mx-auto space-y-8">

// //       <h1 className="text-2xl font-bold mb-4">Form Management</h1>
// //       <p className="text-gray-600 mb-6">
// //         Create and manage forms and categories. Assign categories to forms and
// //         questions to categories.
// //       </p>

// //       {loading && !forms.length ? (
// //         <div className="text-center py-12">
// //           <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600 mb-2"></div>
// //           <p>Loading forms...</p>
// //         </div>
// //       ) : error ? (
// //         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
// //           {error}
// //         </div>
// //       ) : (
// //         <>
// //           <CreateButton
// //             onCreateFormClick={() => {
// //               setShowFormModal(true);
// //               setShowCategoryModal(false);
// //             }}
// //             onCreateCategoryClick={() => {
// //               setShowCategoryModal(true);
// //               setShowFormModal(false);
// //             }}
// //           />
// //           {showFormModal && (
// //             <FormModal
// //               formData={formData}
// //               setFormData={setFormData}
// //               onSubmit={handleFormCreate}
// //               onClose={() => setShowFormModal(false)}
// //             />
// //           )}
// //           {showCategoryModal && (
// //             <CategoryModal
// //               newCategoryName={newCategoryName}
// //               setNewCategoryName={setNewCategoryName}
// //               newDescriptionName={newDescriptionName}
// //               setNewDescriptionName={setNewDescriptionName}
// //               onSubmit={async () => {
// //                 try {
// //                   await backendApi.post(
// //                     "/application_management/create_category/",
// //                     {
// //                       name: newCategoryName,
// //                       description: newDescriptionName,
// //                     }
// //                   );
// //                   setNewCategoryName("");
// //                   setNewDescriptionName("");
// //                   setShowCategoryModal(false);
// //                   setRefreshTrigger((prev) => prev + 1);
// //                   fetchForms();
// //                 } catch (err) {
// //                   console.error(err.response?.data || err.message);
// //                   alert(
// //                     err.response?.data?.error || "Failed to create category."
// //                   );
// //                 }
// //               }}
// //               onClose={() => setShowCategoryModal(false)}
// //             />
// //           )}

// //           <FormTabs activeTab={activeTab} onTabChange={setActiveTab} />
// //           <EnhancedFormList
// //             forms={forms}
// //             activeTab={activeTab}
// //             onAssignClick={handleAssignClick}
// //             key={`form-list-${refreshTrigger}`}
// //             onAssignQuestionsClick={handleAssignQuestionsClick}
// //              onUpdateClick={handleUpdateClick} // <-- pass the handler

// //           />

          
// //         </>
// //       )}

// //       {showAssignModal && (
// //         <AssignCategoryModal
// //           open={showAssignModal}
// //           formId={selectedFormId}
// //           onClose={handleAssignModalClose}
// //         />
// //       )}

// //       {showQuestionModal && assignFormId && (
// //         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
// //           <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
// //             <AssignQuestionToCategoryModal
// //               open={showQuestionModal}
// //               formId={assignFormId}
// //               onClose={handleQuestionModalClose}
// //             />
// //           </div>
// //         </div>
// //       )}




// // {showUpdateFormModal && (
// //   <UpdateFormModal
// //     formData={formData}
// //     setFormData={setFormData}
// //     onUpdate={handleFormUpdate}
// //     onClose={() => setShowUpdateFormModal(false)}

// //   />
// // )}

// //     </div>
// //     </AppLayout>
// //   )
// // }

