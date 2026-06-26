import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTH] authorize called with:", JSON.stringify(credentials));

        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH] Missing email or password");
          return null;
        }

        try {
          await connectDB();
          const user = await User.findOne({ email: credentials.email }).lean();
          console.log("[AUTH] User found:", user ? "yes" : "no", "email:", credentials.email);

          if (!user) {
            console.log("[AUTH] User not found");
            return null;
          }

          console.log("[AUTH] Comparing password...");
          const isValid = await bcryptjs.compare(
            credentials.password as string,
            user.passwordHash
          );
          console.log("[AUTH] Password valid:", isValid);

          if (!isValid) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (err) {
          console.error("[AUTH] Error in authorize:", err);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
