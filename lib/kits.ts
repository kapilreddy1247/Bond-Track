// Data-fetching and real-time subscription helpers for the Parent App.
//
// These wrap Supabase client calls so screens don't have to know table
// names, column names, or RLS details. If the schema changes (e.g. we add
// battery level or status enums), change it here and TypeScript will point
// out every place that needs updating.

import { supabase } from "./supabase";

export type Kit = {
  id: string;
  device_id: string;
  kit_name: string | null;
  latest_lat: number | null;
  latest_lng: number | null;
  latest_accuracy: number | null;
  latest_location_source: string | null;
  latest_location_at: string | null;
};

export type LocationPoint = {
  id: string;
  kit_id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  recorded_at: string;
};

// Returns all kits owned by the currently-authenticated user.
// Uses getSession() to avoid dropping during concurrent refreshes or token cycles.
export async function fetchMyKits(): Promise<Kit[]> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData?.session?.user) {
    return [];
  }

  const userId = sessionData.session.user.id;

  const { data, error } = await supabase
    .from("kit_owners")
    .select("kit:kits(id, device_id, kit_name, latest_lat, latest_lng, latest_accuracy, latest_location_source, latest_location_at)")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return (data || [])
    .map((row: any) => row.kit)
    .filter(Boolean) as Kit[];
}

// Returns the location trail for a specific kit over the past `hours` hours
// (defaults to 24), oldest point first so drawing a polyline is trivial.
export async function fetchLocationHistory(
  kitId: string,
  hours: number = 24
): Promise<LocationPoint[]> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("location_history")
    .select("id, kit_id, latitude, longitude, accuracy, recorded_at:created_at")
    .eq("kit_id", kitId)
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }
  return (data ?? []) as LocationPoint[];
}

// Subscribes to real-time changes on the `kits` row for `kitId`.
// Fires `onUpdate` whenever a new location, battery level, or name is written.
// Returns an unsubscribe function the caller should invoke on unmount.
export function subscribeToKitUpdates(
  kitId: string,
  onUpdate: (kit: Kit) => void
): () => void {
  const channel = supabase
    .channel(`kit-updates-${kitId}-${Date.now()}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "kits",
        filter: `id=eq.${kitId}`,
      },
      (payload) => {
        onUpdate(payload.new as Kit);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Subscribes to real-time inserts on `location_history` for `kitId`.
// Fires `onInsert` whenever a new location breadcrumb is appended.
// Returns an unsubscribe function the caller should invoke on unmount.
export function subscribeToLocationHistory(
  kitId: string,
  onInsert: (point: LocationPoint) => void
): () => void {
  const channel = supabase
    .channel(`kit-location-history-${kitId}-${Date.now()}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "location_history",
        filter: `kit_id=eq.${kitId}`,
      },
      (payload) => {
        const raw = payload.new as any;
        onInsert({
          id: raw.id,
          kit_id: raw.kit_id,
          latitude: raw.latitude,
          longitude: raw.longitude,
          accuracy: raw.accuracy,
          recorded_at: raw.created_at ?? raw.recorded_at,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Subscribes to real-time additions or removals in `kit_owners` for the current user.
// Triggers whenever a device is paired/unpaired on another client (e.g. tablet vs phone).
export function subscribeToMyKits(
  userId: string,
  onChange: () => void
): () => void {
  const channel = supabase
    .channel(`user-kits-${userId}-${Date.now()}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "kit_owners",
        filter: `user_id=eq.${userId}`,
      },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}