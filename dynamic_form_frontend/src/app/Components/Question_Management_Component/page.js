import FormManagement from "../Form_Management_Component/form_management";
import Navbar from "../System_Management_Component/dashboard/SideBarComponent/navheader";
import Sidebar from "../System_Management_Component/dashboard/SideBarComponent/sidebar";

export default function Page() {
  return (
    <main className="min-h-screen flex  p-8 bg-gray-100">
         <Sidebar/>
    </main>
  );
}
