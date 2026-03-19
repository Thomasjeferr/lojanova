"use client";

import { UserSidebar } from "./user-sidebar";
import { UserHeader } from "./user-header";
import { cn } from "@/lib/utils";
import type { SiteBrandingPublic } from "@/lib/site-branding";

type AccountShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  userName: string;
  userEmail: string;
  branding: SiteBrandingPublic;
};

export function AccountShell({
  children,
  title,
  subtitle,
  userName,
  userEmail,
  branding,
}: AccountShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <UserSidebar branding={branding} />
      <div className="transition-[padding] duration-200 lg:pl-64">
        <UserHeader
          title={title}
          subtitle={subtitle}
          userName={userName}
          userEmail={userEmail}
        />
        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
