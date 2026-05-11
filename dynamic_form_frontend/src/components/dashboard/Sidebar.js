"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";


import {
  LayoutDashboard,
  Users,
  FileText,
  HelpCircle,
  Globe,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  SendHorizonal,
  Inbox,
  Send


} from "lucide-react";


const NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "Client Portal",
    icon: Globe,
    path: "/portal",
  },
  {
    label: "Manage Users",
    icon: Users,
    path: "/users",
  },
  {
    label: "Form Management",
    icon: FileText,
    path: "/forms",
  },
  {
    label: "Question Management",
    icon: HelpCircle,
    path: "/questions",
  },

  {
  path: "/invite-user",
  label: "Send Invites",
  icon: Send,
},
  //   {
  //   label: "Send Invites",
  //   // icon: MessageSquare,
  //   path: "/invite",
  // },
];

export default function Sidebar() {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");

    window.location.href =
      "/Components/System_Management_Component/login";
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow"
      >
        <Menu className="w-5 h-5 text-slate-700" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-screen bg-[#0B1120]
          text-white z-50 flex flex-col
          transition-all duration-300
          ${collapsed ? "w-[72px]" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold">Z</span>
            </div>

            {!collapsed && (
              <span className="font-semibold text-sm truncate">
                Z83 Dynamic Tool
              </span>
            )}
          </div>

          {/* Mobile Close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center gap-3
                  px-3 py-2.5 rounded-xl
                  text-sm font-medium
                  transition-all duration-200
                  group
                  ${
                    isActive
                      ? "bg-blue-600/15 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <item.icon
                  className={`
                    w-[18px] h-[18px] shrink-0
                    ${
                      isActive
                        ? "text-blue-500"
                        : "text-slate-500 group-hover:text-slate-300"
                    }
                  `}
                />

                {!collapsed && (
                  <span className="truncate">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-white/10 space-y-1">
          {/* Logout */}
          <button
            onClick={handleLogout}
            className="
              flex items-center gap-3
              w-full px-3 py-2.5 rounded-xl
              text-sm font-medium
              text-slate-400
              hover:bg-white/5
              hover:text-white
              transition-all duration-200
            "
          >
            <LogOut className="w-[18px] h-[18px]" />

            {!collapsed && <span>Logout</span>}
          </button>

          {/* Collapse */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="
              flex items-center justify-center
              w-full py-2 rounded-xl
              text-slate-500
              hover:bg-white/5
              hover:text-slate-300
              transition-all duration-200
            "
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}


// 'use client';
// import { useState } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';

// const Sidebar = () => {
//   const pathname = usePathname();
//   const [isOpen, setIsOpen] = useState(false);

//   const navItems = [
//     {
//       title: 'Dashboard',
//       links: [{ href: '/dashboard', icon: 'bx bx-home', label: 'Dashboard' }],
//     },
//         {
//       title: 'Client Portal',
//       links: [{ href: '/portal',
//          icon: 'bx bx-home', label: 'Client Portal' }],
//     },
//     {
//       title: 'Manage Users',
//       links: [
//      { href: '/users',
//        icon: 'bx bx-user-circle', label: 'Profile' },      

//       ],
      
//     },
//     {
//       title: 'Form Management',
//       links: [
//         // {  href: '/Components/Form_Management_Component/',
//         {  href: '/forms',

//            icon: 'bx bx-user-circle', label: 'Manage Forms ' }// Link to /form management
         
//       ],
//     },
//     {
//       title: 'Question Management',
//       links: [
//         // {  href: '/Components/Question_Management_Component/',
//         {  href: '/questions',
//            icon: 'bx bx-user-circle', label: 'Manage Questions' },// Link to /form management
         
//       ],
//     },
//        ,

    
//     {
//       title: 'Accounts',
//       links: [
//         { href: '/profile', icon: 'bx bx-user-circle', label: 'Profile' },
//         { href: '/', icon: 'bx bx-log-out', label: 'Logout' },
//       ],
//     },
    
//   ];

//   return (
//     <>
//       {/* Mobile Toggle Button */}
//       <button
//         className="md:hidden p-4 text-gray-600 z-50 relative"
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         <i className="bx bx-menu text-3xl"></i>
//       </button>

//       {/* Sidebar */}
//       <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:relative md:block`}>
//         <div className="p-6 space-y-6">
//           {navItems.map((section, index) => (
//             <div key={index} className="nav-button">
//               <span className="font-bold text-primary block mb-2">{section.title}</span>
//               <ul className="space-y-2">
//                 {section.links.map((link, idx) => (
//                   <li key={idx}>
//                     <Link
//                       href={link.href}
//                       className={`flex items-center gap-3 px-3 py-2 rounded text-sm hover:bg-gray-100 transition ${pathname === link.href ? 'bg-gray-100 font-semibold' : ''}`}
//                     >
//                       <i className={`${link.icon} text-xl`} aria-hidden="true"></i>
//                       <span>{link.label}</span>
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>
//       </div>
//     </>
//   );
// };

// export default Sidebar;
