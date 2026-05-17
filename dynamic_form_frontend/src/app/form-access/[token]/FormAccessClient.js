"use client";

import { useEffect, useState } from "react";

import backendApi from "../../../../utils/backendApi";

import FormPortal_Management from "../../../components/portal/FormPortal";

import {
  ShieldCheck,
  Clock,
  AlertTriangle,
  FileText,
} from "lucide-react";

export default function FormAccessClient({
  token,
}) {
  const decodedToken =
    decodeURIComponent(token);

  const [status, setStatus] = useState(
    "validating"
  );

  const [formContext, setFormContext] =
    useState(null);

  useEffect(() => {
    const validate = async () => {
      try {
        const res = await backendApi.get(
          `/form_portal_management/validate_token/${decodedToken}/`
        );

        if (
          res.data.status === "success"
        ) {
          setFormContext(res.data);

          setStatus("valid");
        }
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          "";

        setStatus(
          msg.includes("expired")
            ? "expired"
            : "invalid"
        );
      }
    };

    if (token) {
      validate();
    }
  }, [token]);

  /* VALIDATING */

  if (status === "validating") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 h-12 w-12 animate-pulse rounded-full bg-indigo-100" />

            <h2 className="text-lg font-semibold text-slate-900">
              Verifying Secure Link
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Please wait while we verify
              your access to the form portal.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* EXPIRED */

  if (status === "expired") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl border border-yellow-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-700" />
            </div>

            <h2 className="text-xl font-semibold text-slate-900">
              Link Expired
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This secure access link has
              expired. Please contact your
              administrator to request a new
              form access link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* INVALID */

  if (status === "invalid") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-700" />
            </div>

            <h2 className="text-xl font-semibold text-slate-900">
              Invalid Link
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              This form access link is not
              valid or may have been revoked.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* VALID */

  return (
    <div className="min-h-screen bg-slate-100">
      
      {/* TOP HEADER */}

   

      {/* HERO SECTION */}

      <section className="border-b border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-8 text-white sm:px-6">
          
          <div className="flex items-start gap-4">
            
            <div className="hidden rounded-2xl bg-white/10 p-3 backdrop-blur sm:block">
              <FileText className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              
              <p className="text-sm text-slate-300">
                Welcome back
              </p>

              <h2 className="text-2xl font-semibold tracking-tight">
                {formContext.first_name}
              </h2>

              <p className="max-w-2xl text-sm leading-6 text-slate-300">
                Please complete the{" "}
                <span className="font-medium text-white">
                  {
                    formContext.form_name
                  }
                </span>{" "}
                form below. Your progress and
                uploaded documents are secured
                and encrypted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FORM CONTENT */}

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          
          <div className="border-b border-slate-100 px-6 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {
                    formContext.form_name
                  }
                </h3>

                <p className="text-sm text-slate-500">
                  Complete all required
                  sections before submission.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
                <ShieldCheck className="h-3.5 w-3.5" />
                Protected Form Access
              </div>
            </div>
          </div>

          {/* EXISTING FORM COMPONENT */}

          <div className="p-4 sm:p-6">
            <FormPortal_Management
              magicLinkFormId={
                formContext.form_id
              }
              magicLinkUserId={
                formContext.user_id
              }
              magicLinkToken={
                decodedToken
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}
// 'use client';
// import { useEffect, useState } from 'react';
// import backendApi from "../../../../utils/backendApi"
// import FormPortal_Management from "../../../components/portal/FormPortal"

// export default function FormAccessClient({ token }) {
//     // Decode URL-encoded token
//   const decodedToken = decodeURIComponent(token);
  
  
//   // use decodedToken everywhere instead of token
//   const [status, setStatus] = useState('validating');
//   const [formContext, setFormContext] = useState(null);
// console.log('Received token in FormAccessClient :', token);


//  useEffect(() => {
//   const validate = async () => {
//     try {
//       const res = await backendApi.get(
//         `/form_portal_management/validate_token/${decodedToken}/`
//       );
//       if (res.data.status === 'success') {
//         setFormContext(res.data);
//         setStatus('valid');
//       }
//     } catch (err) {
//       const msg = err.response?.data?.message || '';
//       setStatus(msg.includes('expired') ? 'expired' : 'invalid');
//     }
//   };
//   if (token) validate();
// }, [token]);

//   if (status === 'validating') {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-gray-500">Verifying your link...</p>
//       </div>
//     );
//   }

//   if (status === 'expired') {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center p-8 bg-yellow-50 rounded-xl border border-yellow-200">
//           <h2 className="text-xl font-bold text-yellow-800 mb-2">Link Expired</h2>
//           <p className="text-yellow-700">
//             This link has expired. Please contact your administrator for a new one.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (status === 'invalid') {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
//           <h2 className="text-xl font-bold text-red-800 mb-2">Invalid Link</h2>
//           <p className="text-red-700">This link is not valid.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//   <div className="min-h-screen bg-gray-50">
//     {/* Header bar */}
//     <div className="bg-indigo-700 text-white px-6 py-4">
//       <p className="text-sm">
//         Hi <strong>{formContext.first_name}</strong> — please complete 
//         the <strong>{formContext.form_name}</strong> form below.
//       </p>
//     </div>

//     {/* Render the portal, passing magic link context */}
//     <FormPortal_Management
//       magicLinkFormId={formContext.form_id}
//       magicLinkUserId={formContext.user_id}
//           magicLinkToken={decodedToken}
        

//     />
//   </div>
// );
  
// }
