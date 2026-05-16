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
      flex w-full items-center gap-3
      rounded-md px-3 py-2
      text-sm
      text-slate-400
      hover:bg-white/5
      hover:text-white
    "
  >
    <LogOut className="h-4 w-4" />
    Logout
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
