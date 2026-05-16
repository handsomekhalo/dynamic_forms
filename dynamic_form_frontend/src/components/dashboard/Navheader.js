'use client';


import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Bell } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import { useAuth } from "../../../AuthContext";

export default function Navbar() {
  const router = useRouter();

  const { user, logout } = useAuth();

  console.log('AUTH USER:', user);


  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

    console.log("User in Navheader:", user);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header
      className="
        sticky top-0 z-30
        h-16
        bg-white/80
        backdrop-blur-md
        border-b border-slate-200
        flex items-center justify-between
        px-6
        lg:ml-64
      "
    >
      {/* Left Side */}
      <div>
        {/* <h1 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
          Z83 Compliance Platform
        </h1> */}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        
        {/* Notifications */}
        <button
          className="
            relative p-2 rounded-xl
            text-slate-500
            hover:bg-slate-100
            hover:text-slate-700
            transition-all duration-200
          "
        >
          <Bell className="w-[18px] h-[18px]" />

          <span
            className="
              absolute top-2 right-2
              w-2 h-2 rounded-full
              bg-blue-600
            "
          />
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="
                flex items-center gap-3
                pl-3 pr-1 py-1
                rounded-xl
                hover:bg-slate-100
                transition-all duration-200
              "
            >
              {/* User Info */}
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-slate-800 leading-none">
                  {user?.full_name || "User"}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  {user?.role || "Administrator"}
                </p>
              </div>

              {/* Avatar */}
              <Avatar className="w-9 h-9">
                <AvatarFallback
                  className="
                    bg-blue-600/10
                    text-blue-600
                    text-xs
                    font-semibold
                  "
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-52"
          >
            <DropdownMenuItem asChild>
              <Link href="/profile">
                Your Profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/settings">
                Settings
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-500 focus:text-red-500"
            >
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
// 'use client';

// import React from 'react';
// import Image from 'next/image';


// export default function Navbar() {
//   return (
//     <nav className="bg-gray-800">
//       <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
//         <div className="relative flex h-16 items-center justify-between">
//           <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
//             <button
//               type="button"
//               className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
//               aria-controls="mobile-menu"
//               aria-expanded="false"
//             >
//               <span className="absolute -inset-0.5"></span>
//               <span className="sr-only">Open main menu</span>
//               <svg className="block w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
//               </svg>
//               <svg className="hidden w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//           <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
//             <div className="flex shrink-0 items-center">
//               {/* <img
//                 className="h-8 w-auto"
//                 src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
//                 alt="Your Company"
//               /> */}
//               <Image src="/logo.png" alt="Logo" width={200} height={100} priority />

//             </div>
//             <div className="hidden sm:ml-6 sm:block">
//               <div className="flex space-x-4">
//                 <a href="#" className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white">Dashboard</a>
//                 <a href="#" className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Team</a>
//                 <a href="#" className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Projects</a>
//                 <a href="#" className="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Calendar</a>
//               </div>
//             </div>
//           </div>
//           <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
//             <button
//               type="button"
//               className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-gray-800"
//             >
//               <span className="sr-only">View notifications</span>
//               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022 23.84 23.84 0 005.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
//               </svg>
//             </button>

//             <div className="relative ml-3">
//               <button
//                 type="button"
//                 className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-gray-800"
//                 id="user-menu-button"
//               >
//                 <span className="sr-only">Open user menu</span>
//                 {/* <img
//                   className="h-8 w-8 rounded-full"
//                   src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
//                   alt=""
//                 /> */}
//                 <Image src="/https://images.unsplash.com/photo-1472099645785-5658abf4ff4e" alt="Logo" width={200} height={100} priority />

                
//               </button>
//               <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5">
//                 <a href="#" className="block px-4 py-2 text-sm text-gray-700">Your Profile</a>
//                 <a href="#" className="block px-4 py-2 text-sm text-gray-700">Settings</a>
//                 <a href="#" className="block px-4 py-2 text-sm text-gray-700">Sign out</a>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Menu */}
//       <div className="sm:hidden" id="mobile-menu">
//         <div className="space-y-1 px-2 pt-2 pb-3">
//           <a href="#" className="block rounded-md bg-gray-900 px-3 py-2 text-base font-medium text-white">Dashboard</a>
//           <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Team</a>
//           <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Projects</a>
//           <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Calendar</a>
//         </div>
//       </div>
//     </nav>
//   );
// }
