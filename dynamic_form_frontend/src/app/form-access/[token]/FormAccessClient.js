'use client';
import { useEffect, useState } from 'react';
import backendApi from "../../../../utils/backendApi"
import FormPortal_Management from "../../Components/Form_Portal_Management_Component/form_portal_Management";

export default function FormAccessClient({ token }) {
  const [status, setStatus] = useState('validating');
  const [formContext, setFormContext] = useState(null);

  useEffect(() => {
    const validate = async () => {
      try {
        const res = await backendApi.get(
          `/form_portal_management/validate_token/${token}/`
        );
        if (res.data.status === 'success') {
          setFormContext(res.data);
          setStatus('valid');
        }
      } catch (err) {
        const msg = err.response?.data?.message || '';
        setStatus(msg.includes('expired') ? 'expired' : 'invalid');
      }
    };
    if (token) validate();
  }, [token]);

  if (status === 'validating') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Verifying your link...</p>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-yellow-50 rounded-xl border border-yellow-200">
          <h2 className="text-xl font-bold text-yellow-800 mb-2">Link Expired</h2>
          <p className="text-yellow-700">
            This link has expired. Please contact your administrator for a new one.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
          <h2 className="text-xl font-bold text-red-800 mb-2">Invalid Link</h2>
          <p className="text-red-700">This link is not valid.</p>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gray-50">
    {/* Header bar */}
    <div className="bg-indigo-700 text-white px-6 py-4">
      <p className="text-sm">
        Hi <strong>{formContext.first_name}</strong> — please complete 
        the <strong>{formContext.form_name}</strong> form below.
      </p>
    </div>

    {/* Render the portal, passing magic link context */}
    <FormPortal_Management
      magicLinkFormId={formContext.form_id}
      magicLinkUserId={formContext.user_id}
    />
  </div>
);
  
}
