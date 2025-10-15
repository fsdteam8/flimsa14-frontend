import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";

const handler = NextAuth({
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
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_API}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          const response = await res.json();
          console.log("API Response:", response);

          if (!res.ok || !response?.success) {
            throw new Error(response?.message || "Login failed");
          }

          // Extract correct fields from response
          const { accessToken, refreshToken, user, role, _id } = response.data;

          return {
            id: _id,
            name: user?.name,
            email: user?.email,
            role: role || user?.role,
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
    // Handle JWT (server-side)
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: JWT; user?: any }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.imageLink = user.imageLink;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },

    // Handle Session (client-side)
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: any; token: JWT }) {
      session.user = {
        id: token.id,
        name: token.name,
        email: token.email,
        role: token.role,
        imageLink: token.imageLink,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      };
      return session;
    },
  },
});

export { handler as GET, handler as POST };
