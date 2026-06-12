// auth.js — Supabase Auth sign-in/out + session, mapped to the app's user model.
import { supabase, isSupabaseConfigured } from './supabase.js';

// Convert a `profiles` row + auth email into the shape the app expects:
//   { id, name, email, role, admin, access }  where access is '*' or an array of fleet ids.
export function mapProfileToUser(profile, email) {
  return {
    id: profile.id,
    name: profile.name,
    email,
    role: profile.role,
    admin: !!profile.is_admin,
    access: profile.all_fleets ? '*' : (profile.fleet_ids || []),
  };
}

export async function signIn(email, password) {
  if (!isSupabaseConfigured) {
    return { error: 'Backend not connected yet. Add the Supabase keys in Vercel and redeploy.' };
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) return { error: error.message };
  const { data: profile, error: pErr } = await supabase
    .from('profiles').select('*').eq('id', data.user.id).single();
  if (pErr || !profile) {
    return { error: 'Signed in, but no profile is set up for this account. Ask an admin.' };
  }
  return { user: mapProfileToUser(profile, data.user.email) };
}

// On app load, restore an existing session (so users stay logged in across refreshes).
export async function restoreSession() {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;
  const { user: authUser } = data.session;
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', authUser.id).single();
  if (!profile) return null;
  return mapProfileToUser(profile, authUser.email);
}

export async function signOut() {
  if (isSupabaseConfigured) { try { await supabase.auth.signOut(); } catch {} }
}
