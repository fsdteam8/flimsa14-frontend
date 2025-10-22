import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      imageLink?: string;
      accessToken: string;
      refreshToken: string;
      isPaid: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    isPaid: boolean;
    imageLink?: string;
    accessToken: string;
    refreshToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    role: string;
    isPaid: boolean;
    imageLink?: string;
    accessToken: string;
    refreshToken: string;
  }
}
