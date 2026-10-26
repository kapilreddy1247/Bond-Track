import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

export type SupportedLang = "en" | "hi" | "te";
export const LANGUAGE_STORAGE_KEY = "bond_track_app_language";

/**
 * Retrieves the current authenticated user's email from the active session cache.
 */
export async function getCurrentUserEmail(): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session?.user?.email ?? null;
}

/**
 * Renames a device using the Supabase RPC function.
 */
export async function renameKit(kitId: string, newName: string): Promise<void> {
  const { error } = await supabase.rpc("rename_kit", {
    kit_id_input: kitId,
    new_name: newName.trim(),
  });
  if (error) throw error;
}

/**
 * Unpairs a device using the Supabase RPC function.
 */
export async function unpairKit(kitId: string): Promise<void> {
  const { error } = await supabase.rpc("unpair_kit", { 
    kit_id_input: kitId 
  });
  if (error) throw error;
}

/**
 * Updates the password for the currently signed-in user.
 */
export async function changePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ 
    password: newPassword 
  });
  if (error) throw error;
}

/**
 * Fetches the user's stored language preference, defaulting to English.
 */
export async function getStoredLanguage(): Promise<SupportedLang> {
  const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved === "en" || saved === "hi" || saved === "te") {
    return saved;
  }
  return "en";
}

/**
 * Persists the user's language preference to local storage.
 */
export async function setStoredLanguage(lang: SupportedLang): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}