"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from '../../../AuthContext';
import { useRouter } from 'next/navigation';

import { useState } from "react";

import {
  LayoutDashboard,
  FileText,
  Inbox,
  Users,
  Send,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },

  {
    href: "/portal",
    label: "Client Portal",
    icon: Inbox,
  },

  {
    href: "/users",
    label: "Manage Users",
    icon: Users,
  },

  {
    href: "/forms",
    label: "Form Management",
    icon: FileText,
  },

  {
    href: "/questions",
    label: "Question Management",
    icon: FileText,
  },

    {
    href: "/submissions",
    label: "Submissions",
    icon: Inbox,
  },


  {
    href: "/invite-user",
    label: "Send Invites",
    icon: Send,
  },
];

export default function AppLayout({ children }) {
  const [open, setOpen] = useState(false);

  const pathname = usePathname();
    const { user, logout } = useAuth();
  const router = useRouter();

    const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="flex min-h-screen w-full bg-background">

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          w-64 flex-col
          bg-[#0B1120]
          text-white
          transition-transform
          md:static md:flex md:translate-x-0
          ${
            open
              ? "flex translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
          <span className="text-lg font-semibold tracking-tight">
            Z83 Dynamic
          </span>

          <button
            className="md:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-3
                  rounded-md px-3 py-2
                  text-sm transition-colors
                  ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <Icon className="h-4 w-4" />

                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-3">
          <Link
            href="/login"
            className="
              flex items-center gap-3
              rounded-md px-3 py-2
              text-sm
              text-slate-400
              hover:bg-white/5
              hover:text-white
            "
          >
            <LogOut className="h-4 w-4" />

            Logout
          </Link>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main Layout */}
      <div className="flex min-h-screen flex-1 flex-col">

        {/* Top Navbar */}
        <header
          className="
            flex h-16 items-center justify-between
            border-b border-slate-200
            bg-white
            px-4 md:px-6
          "
        >
          {/* Mobile Menu */}
          <button
            className="md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          {/* User Section */}
          {/* User Section */}
<div className="flex items-center gap-3">
  <span className="hidden text-sm font-medium text-slate-800 sm:inline">
    {user?.full_name || 'User'}
  </span>

  <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-medium text-white">
    {user?.role || 'Admin'}
  </span>
</div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}