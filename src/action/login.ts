"use server";
import { CredentialsSignin } from "next-auth";
import { signIn } from "@/auth";
import { loginSchema } from "@/schema";
import zod from "zod";
import { LOGIN_SUCCESS } from "@/success";

export const login = async (data: zod.infer<typeof loginSchema>) => {
  const { phone, password } = data;
  try {
    await signIn("credentials", { phone, password, redirect: false });

    return { success: LOGIN_SUCCESS };
  } catch (error: any) {
    if (error?.message?.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Login action error:", error);
    const errorMessage = error?.cause?.err?.message || error?.message || "Invalid credentials";
    return { error: errorMessage };
  }
};
