// src/lib/auth-client.ts
// Supabase Auth client-side helper'ları.
// Server-side RLS bypass için supabaseAdmin kullanılmaz — bu client-side auth.

import { supabase } from "./supabase";

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  surname: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export async function signUp({ email, password, name, surname }: SignUpData) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        surname,
        full_name: `${name} ${surname}`,
      },
    },
  });
  return { data, error };
}

export async function signIn({ email, password }: SignInData) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/tr/hesap/sifre-yenile`,
  });
  return { data, error };
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}

export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return data.subscription;
}

export async function updateUserPassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  return { data, error };
}
