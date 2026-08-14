"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { CreatePostModal } from "./CreatePostModal";
import { createClient } from "@/utils/supabase/client";

export function SidebarShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase
        .from("users")
        .select("full_name, role")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setUserName(data.full_name ?? user.user_metadata?.full_name ?? user.email ?? "");
            setRole(data.role === "staff" ? "Maestra" : "Familia");
          } else {
            setUserName(user.user_metadata?.full_name ?? user.email ?? "");
            setRole(user.user_metadata?.role === "staff" ? "Maestra" : "Familia");
          }
        });
    });
  }, []);

  const initials = userName
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <button
        onClick={() => setSidebarOpen((v) => !v)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-surface shadow-lg sidebar:hidden"
        aria-label="Abrir menú"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewPost={() => setModalOpen(true)}
        userName={userName}
        role={role}
        initials={initials}
      />
      <CreatePostModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
