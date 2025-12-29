import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";

preventInvalidEnv();

function preventInvalidEnv() {
  const required = ["GITHUB_ID", "GITHUB_SECRET", "NEXTAUTH_SECRET", "NEXTAUTH_URL"] as const;
  for (const k of required) {
    if (!process.env[k]) throw new Error(`Missing env var: ${k}`);
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  // with adapter, database sessions are fine; you can also omit this
  session: { strategy: "database" },

  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // keep true until it works on Vercel
};
