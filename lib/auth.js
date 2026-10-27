import { supabase } from './supabase';

let pending = null;

export async function ensureSession() {
  const { data } = await supabase.auth.getSession();
  if (data?.session) return data.session;
  if (!pending) {
    pending = supabase.auth.signInAnonymously().then(({ data, error }) => {
      pending = null;
      if (error) throw error;
      return data.session;
    }).catch((e) => { pending = null; throw e; });
  }
  return pending;
}

export async function getAccessToken() {
  const session = await ensureSession();
  return session?.access_token;
}

export async function deleteMyData() {
  await ensureSession();
  const { error } = await supabase.from('workouts').delete().not('id', 'is', null);
  if (error) throw error;
  await supabase.auth.signOut();
}