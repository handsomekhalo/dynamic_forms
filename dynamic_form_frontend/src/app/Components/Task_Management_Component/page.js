
// import Navbar from "../System_Management_Component/dashboard/SideBarComponent/navheader";
// import Sidebar from "../System_Management_Component/dashboard/SideBarComponent/sidebar";
import Task_Management from "./Task_Management_Component";
export default function Page() {
  return (
    <main className="min-h-screen flex  p-8 bg-gray-100">
         {/* <Sidebar/> */}
      <Task_Management />
    </main>
  );
}

