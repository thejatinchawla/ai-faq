import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isAuthed = Boolean(session);
  const userLabel = session?.user?.email ?? session?.user?.name ?? "Account";

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="text-lg font-semibold text-slate-900">SupportBot</div>
        <div className="flex items-center gap-3">
          {isAuthed ? (
            <>
              <span className="text-sm text-slate-600">{userLabel}</span>
              <form action="/api/auth/signout" method="post">
                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/api/auth/signin?callbackUrl=%2Fdashboard%2Fsupport"
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:border-slate-300"
            >
              Sign in
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-16 pt-8 md:flex-row md:items-center">
        <div className="flex-1 space-y-6">
          <p className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            AI FAQ & Support Chatbot
          </p>
          <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">
            Give customers fast answers, hand off to humans when it matters.
          </h1>
          <p className="text-lg text-slate-600">
            SupportBot answers product FAQs from your approved knowledge base, streams replies in
            real time, and routes tough questions to your team.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {isAuthed ? (
              <Link
                href="/dashboard/support"
                className="rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
              >
                Go to dashboard
              </Link>
            ) : (
              <Link
                href="/api/auth/signin?callbackUrl=%2Fdashboard%2Fsupport"
                className="rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
              >
                Sign in to dashboard
              </Link>
            )}
            <span className="text-sm text-slate-500">No credit card required.</span>
          </div>
        </div>

        <div className="flex-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">How it works</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                1
              </span>
              <div>
                <p className="font-semibold text-slate-800">Connect auth</p>
                <p>Use GitHub login and keep chat history per user.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                2
              </span>
              <div>
                <p className="font-semibold text-slate-800">Answer from FAQs only</p>
                <p>Static knowledge base avoids hallucinations; unclear questions hand off.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                3
              </span>
              <div>
                <p className="font-semibold text-slate-800">Stream responses</p>
                <p>OpenAI streaming chat completions with thumbs-up / down feedback.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
