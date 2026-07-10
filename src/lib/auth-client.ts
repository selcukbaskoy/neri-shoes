// src/lib/auth-client.ts
// Supabase Auth client-side helper'ları.
// Server-side RLS bypass için supabaseAdmin kullanılmaz — bu client-side auth.
// supabase.ts'den değil supabase-browser.ts'den client alınır (SUPABASE_SERVICE_ROLE_KEY
// istemci bundle'ına sızmasını ve module-level throw'u önler).

import { getSupabaseBrowserClient } from "./supabase-browser";

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
  const supabase = getSupabaseBrowserClient();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
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
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function resetPassword(email: string) {
  const supabase = getSupabaseBrowserClient();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/tr/hesap/sifre-yenile`,
  });
  return { data, error };
}

export async function getSession() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

export async function getUser() {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}

export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  const supabase = getSupabaseBrowserClient();
  const { data } = supabase.auth.onAuthStateChange(callback);
  return data.subscription;
}

export async function updateUserPassword(newPassword: string) {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  return { data, error };
}
