import Sidebar from "../System_Management_Component/dashboard/SideBarComponent/sidebar";
import ManageQuestions from "./question_management";

export default function Page() {
  return (
    <main className="min-h-screen flex  p-8 bg-gray-100">
         <Sidebar/>
         <ManageQuestions/>
    </main>
  );
}
