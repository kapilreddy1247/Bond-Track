// Shared GitHub sign-in helper — browser-based OAuth via Supabase.
// Structurally identical to lib/googleAuth.ts, kept separate per request.

import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "./supabase";

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGitHub() {
  const redirectTo = Linking.createURL("auth/callback");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error || !data?.url) {
    throw error ?? new Error("No auth URL returned from Supabase.");
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== "success" || !("url" in result)) {
    throw new Error("GitHub sign-in was cancelled.");
  }

  const url = new URL(result.url);
  const params = new URLSearchParams(
    url.hash ? url.hash.substring(1) : url.search.substring(1)
  );

  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");

  if (!access_token || !refresh_token) {
    throw new Error("No session returned from GitHub sign-in.");
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (sessionError) {
    throw sessionError;
  }
}