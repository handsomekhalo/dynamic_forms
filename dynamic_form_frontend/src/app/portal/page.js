import Sidebar from '@/components/dashboard/Sidebar';

import FormPortal_Management from "@/components/portal/FormPortal";
export default function Page() {
  return (
    <main className="min-h-screen flex  p-8 bg-gray-100">
         <Sidebar/>
         <FormPortal_Management />
    </main>
  );
}