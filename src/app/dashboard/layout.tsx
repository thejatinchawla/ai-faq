import { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  let session;
  try {
    session = await getServerSession(authOptions);
  } catch (error) {
    // If database connection fails, redirect to sign in
    console.error("Failed to get session:", error);
    redirect("/api/auth/signin?callbackUrl=%2Fdashboard%2Fsupport");
  }

  if (!session) {
    redirect("/api/auth/signin?callbackUrl=%2Fdashboard%2Fsupport");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-semibold text-slate-900">
              SupportBot
            </Link>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
              Signed in as {session.user?.email ?? "user"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-md bg-slate-900 px-3 py-2 font-medium text-white shadow-sm transition hover:bg-slate-800"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}

