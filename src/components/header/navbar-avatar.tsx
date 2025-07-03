"use client";

import React, { useEffect, useState } from "react";
import Avatar from "../common/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { User, LogOut } from "lucide-react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { signOut } from "@/lib/firebase/auth";
import LoginPopoverButton from "./login-popover-button";
import Link from "next/link";

export default function NavbarAvatar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<null | ReturnType<
    typeof getAuth
  >["currentUser"]>(null);

  useEffect(() => {
    const auth = getAuth();
    // Listen for auth changes:
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  // If not signed in, show your Login button:
  if (!user) {
    return <LoginPopoverButton />;
  }

  // Signed‑in state -> show avatar + logout
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Avatar
          username={user.displayName || "user"}
          url={user.photoURL || ""}
          id={user.uid}
        />
      </PopoverTrigger>

      <PopoverContent className="bg-black bg-opacity-50 backdrop-blur-sm w-[200px] mt-4 mr-4 text-sm flex flex-col space-y-2">
        <div className="mb-2">
          <p>
            Hello, <span className="text-red-500">@{user.displayName}</span>
          </p>
        </div>

        <div className="border-b border-gray-600 pb-2">
          <Link
            href={`/profile/${user.displayName}`}
            className="flex flex-row space-x-2 items-center"
            onClick={() => setOpen(false)}
          >
            <User size={20} />
            <p>Profile</p>
          </Link>
        </div>

        <div
          className="flex flex-row space-x-2 items-center cursor-pointer"
          onClick={() => {
            signOut();
            setOpen(false);
          }}
        >
          <LogOut size={20} />
          <p>Logout</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
