import FormPortal_Management from "./form_portal_Management";
import Sidebar from "../System_Management_Component/dashboard/SideBarComponent/sidebar";

export default function Page() {
  return (
    <main className="min-h-screen flex  p-8 bg-gray-100">
         <Sidebar/>
      <FormPortal_Management />
    </main>
  );
}
