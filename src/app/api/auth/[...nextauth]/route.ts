import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "email" },
        password: { label: "Password", type: "password", placeholder: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const response = await res.json();
          console.log("API Response:", response);

          if (!res.ok || !response?.success) {
            throw new Error(response?.message || "Login failed");
          }

          // ✅ Adjust this based on your actual API response shape
          const { accessToken, refreshToken, user } = response.data;

          if (!accessToken || !user) {
            throw new Error("Invalid login response");
          }

          return {
            id: user?._id,
            name: user?.name,
            email: user?.email,
            role: user?.role,
            imageLink: user?.avatar?.url || "",
            accessToken,
            refreshToken,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Authentication failed. Please try again.";
          throw new Error(errorMessage);
        }
      },
    }),
  ],

  callbacks: {
    // 🔹 Save custom fields in JWT
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        Object.assign(token, {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          imageLink: user.imageLink,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
        });
      }
      return token;
    },

    // 🔹 Make custom fields available in session
    async session({ session, token }: { session: Session; token: JWT }) {
      session.user = {
        id: token.id as string,
        name: token.name,
        email: token.email,
        role: token.role as string,
        imageLink: token.imageLink as string,
        accessToken: token.accessToken as string,
        refreshToken: token.refreshToken as string,
      };
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
