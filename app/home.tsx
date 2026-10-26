// Home / Dashboard screen — redesigned for clarity: a big plain-language
// "last seen" status card up front, icon-labeled action buttons, the map
// as supporting context, and technical details tucked into a collapsible
// section rather than shown upfront.

import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import {
  fetchMyKits,
  fetchLocationHistory,
  subscribeToKitUpdates,
  subscribeToLocationHistory,
  subscribeToMyKits,
  type Kit,
  type LocationPoint,
} from "../lib/kits";
import { supabase } from "../lib/supabase";
import { requestLocationPermission, watchMyLocation, distanceKm, type Coords } from "../lib/location";
import { openDirectionsTo } from "../lib/directions";
import { getLocationStatus, formatTimeAgo, STATUS_META } from "../lib/status";
import LeafletMap from "../components/LeafletMap";
import { StatusDot, ActionButton } from "../components/DashboardUI";
import { useAppLanguage } from "../lib/LanguageContext";

export default function HomeScreen() {
  const { t } = useAppLanguage();

  const [kits, setKits] = useState<Kit[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<LocationPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);
  const [myLocation, setMyLocation] = useState<Coords | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const loadKits = useCallback(async () => {
    setErrorMessage(null);
    try {
      // Guard: Ensure session is initialized before executing queries
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        return;
      }

      const data = await fetchMyKits();
      setKits(data);
      setSelectedId((current) =>
        current && data.some((k) => k.id === current) ? current : data[0]?.id ?? null
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Couldn't load your devices.");
    }
  }, []);

  const refreshCurrentTrail = useCallback(async (kitId: string) => {
    try {
      const points = await fetchLocationHistory(kitId);
      setHistory(points);
    } catch {
      // Silently ignore background trail poll errors
    }
  }, []);

  // 1. Initial Load & Session Recovery: Prevents premature empty screen
  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      if (data?.session?.user) {
        loadKits().finally(() => {
          if (isMounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [loadKits]);

  // 2. Auto-fetch on Screen Focus (re-syncs whenever returning to Home tab)
  useFocusEffect(
    useCallback(() => {
      loadKits();
    }, [loadKits])
  );

  // 3. Periodic Auto-Refresh: Polls every 60 seconds for fresh locations and new devices
  useEffect(() => {
    const INTERVAL_MS = 60 * 1000;

    const timer = setInterval(() => {
      loadKits();
      if (selectedId) {
        refreshCurrentTrail(selectedId);
      }
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, [loadKits, refreshCurrentTrail, selectedId]);

  // 4. Session & Realtime Listener: Syncs login/logout transitions and remote device pairings
  useEffect(() => {
    let unsubscribeKits: (() => void) | undefined;

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          loadKits();
          unsubscribeKits?.();
          unsubscribeKits = subscribeToMyKits(session.user.id, () => {
            loadKits();
          });
        } else {
          setKits([]);
          setSelectedId(null);
          unsubscribeKits?.();
        }
      }
    );

    // Initial check if session is already active
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        unsubscribeKits = subscribeToMyKits(data.session.user.id, () => {
          loadKits();
        });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
      unsubscribeKits?.();
    };
  }, [loadKits]);

  // 5. Telemetry and Trail Subscription for currently selected Kit
  useEffect(() => {
    if (!selectedId) {
      setHistory([]);
      return;
    }
    let cancelled = false;

    setHistory([]);

    fetchLocationHistory(selectedId)
      .then((points) => {
        if (!cancelled) setHistory(points);
      })
      .catch(() => {});

    const unsubscribeKit = subscribeToKitUpdates(selectedId, (updatedKit) => {
      setKits((current) => current.map((k) => (k.id === updatedKit.id ? { ...k, ...updatedKit } : k)));
    });
    const unsubscribeHistory = subscribeToLocationHistory(selectedId, (point) => {
      setHistory((current) => [...current, point]);
    });

    return () => {
      cancelled = true;
      unsubscribeKit();
      unsubscribeHistory();
    };
  }, [selectedId]);

  // 6. User GPS Location tracking
  useEffect(() => {
    if (!tracking) {
      setMyLocation(null);
      return;
    }
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      setErrorMessage(null);
      try {
        const granted = await requestLocationPermission();
        if (!granted) {
          setErrorMessage("Turn on location permission to see your own position.");
          setTracking(false);
          Alert.alert(
            "Location Required",
            "Enable location permission in device settings to show your position and line to device.",
            [
              { text: t.cancel, style: "cancel" },
              { text: "Open Settings", onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }
        const unsub = await watchMyLocation((coords) => {
          if (!cancelled) setMyLocation(coords);
        });
        if (cancelled) unsub();
        else unsubscribe = unsub;
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(err instanceof Error ? err.message : "Couldn't retrieve location.");
          setTracking(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [tracking, t.cancel]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadKits();
    if (selectedId) {
      await refreshCurrentTrail(selectedId);
    }
    setRefreshing(false);
  }

  function handleSelectKit(kitId: string) {
    if (kitId === selectedId) return;
    setHistory([]);
    setSelectedId(kitId);
  }

  const selectedKit = kits.find((k) => k.id === selectedId) ?? null;

  if (loading) {
    return (
      <View className="flex-1 bg-[#102422] items-center justify-center">
        <ActivityIndicator color="#E8A33D" size="large" />
      </View>
    );
  }

  if (kits.length === 0) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-6">
        <Ionicons name="shield-checkmark-outline" size={48} color="#2E6F6E" style={{ marginBottom: 12 }} />
        <Text className="font-display text-xl text-ink mb-2 text-center">{t.home.noDevicesTitle}</Text>
        <Text className="font-body text-muted text-center mb-6">
          {t.home.noDevicesSub}
        </Text>
        <Pressable
          onPress={() => router.push("/pair-device")}
          className="bg-accent rounded-xl px-6 py-3 active:opacity-80"
        >
          <Text className="font-body-medium text-ink">{t.home.pairDevice}</Text>
        </Pressable>
      </View>
    );
  }

  const status = selectedKit ? getLocationStatus(selectedKit.latest_location_at) : "unknown";
  const statusMeta = STATUS_META[status];
  const hasLocation = selectedKit?.latest_lat != null && selectedKit?.latest_lng != null;

  return (
    <View className="flex-1 bg-[#F9FBFB]">
      {/* 1. Full-Screen Map Canvas */}
      <View className="absolute inset-0">
        {hasLocation ? (
          <LeafletMap
            latitude={selectedKit.latest_lat!}
            longitude={selectedKit.latest_lng!}
            label={selectedKit.kit_name || selectedKit.device_id}
            path={history.map((p) => ({ latitude: p.latitude, longitude: p.longitude }))}
            userLocation={myLocation ?? undefined}
          />
        ) : (
          <View className="flex-1 bg-[#EBEFEF] items-center justify-center px-6">
            <Ionicons name="cloud-offline-outline" size={48} color="#9AA6A7" style={{ marginBottom: 8 }} />
            <Text className="font-body text-muted text-center text-sm">
              {t.home.noLocation}
            </Text>
          </View>
        )}
      </View>

      {/* 2. Top Floating Navigation & Kit Switcher */}
      <View
        className="absolute top-12 left-4 right-4 flex-row items-center justify-between"
        pointerEvents="box-none"
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          className="flex-grow-0"
        >
          {kits.map((kit) => (
            <Pressable
              key={kit.id}
              onPress={() => handleSelectKit(kit.id)}
              className={`flex-row items-center px-4 py-2.5 rounded-full border shadow-sm ${
                kit.id === selectedId
                  ? "bg-[#16262B] border-[#16262B]"
                  : "bg-white/95 border-[#E2E8F0]"
              }`}
            >
              <Text
                className={`text-xs font-body-medium font-semibold ${
                  kit.id === selectedId ? "text-white" : "text-ink"
                }`}
              >
                {kit.kit_name || kit.device_id}
              </Text>
            </Pressable>
          ))}

          {/* Quick Add Device Pill directly in the list */}
          <Pressable
            onPress={() => router.push("/pair-device")}
            className="flex-row items-center gap-1.5 px-3.5 py-2.5 rounded-full border border-dashed border-[#2E6F6E] bg-white/95 shadow-sm active:opacity-75"
          >
            <Ionicons name="add" size={16} color="#2E6F6E" />
            <Text className="text-xs font-body-medium font-semibold text-[#2E6F6E]">
              {t.home.addDevice}
            </Text>
          </Pressable>
        </ScrollView>

        <View className="flex-row items-center gap-2 ml-2">
          {/* Add Device Header Button */}
          <Pressable
            onPress={() => router.push("/pair-device")}
            hitSlop={8}
            className="w-10 h-10 rounded-full bg-[#E8A33D] shadow-sm items-center justify-center active:opacity-80"
          >
            <Ionicons name="add" size={20} color="#16262B" />
          </Pressable>

          {/* Manual sync/refresh button with spinner */}
          <Pressable
            onPress={handleRefresh}
            disabled={refreshing}
            className="w-10 h-10 rounded-full bg-white/95 border border-[#E2E8F0] shadow-sm items-center justify-center active:opacity-75"
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#2E6F6E" />
            ) : (
              <Ionicons name="sync-outline" size={18} color="#16262B" />
            )}
          </Pressable>

          {/* Settings button */}
          <Pressable
            onPress={() => router.push("/settings")}
            className="w-10 h-10 rounded-full bg-white/95 border border-[#E2E8F0] shadow-sm items-center justify-center"
          >
            <Ionicons name="settings-outline" size={18} color="#16262B" />
          </Pressable>
        </View>
      </View>

      {/* 3. Bottom Context Sheet with Live Telemetry */}
      <View
        className="absolute bottom-6 left-4 right-4 bg-white/95 border border-[#E2E8F0] rounded-[28px] p-5 shadow-lg"
      >
        <View className="w-8 h-1 bg-[#CBD5E1] rounded-full self-center mb-3" />

        {errorMessage && (
          <Text className="font-body text-[#EF4444] mb-2 text-xs text-center font-medium">
            {errorMessage}
          </Text>
        )}

        {selectedKit && (
          <>
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2.5">
                <StatusDot color={statusMeta.dot} />
                <View>
                  <Text className="font-display text-ink font-bold text-base leading-tight">
                    {statusMeta.label}
                  </Text>
                  <Text className="font-body text-muted text-[11px]">
                    {t.home.lastSeen} {formatTimeAgo(selectedKit.latest_location_at)}
                  </Text>
                </View>
              </View>

              {myLocation && hasLocation && (
                <View className="bg-[#EBEFEF] px-3 py-1 rounded-full">
                  <Text className="font-body-medium text-ink text-xs font-semibold">
                    {distanceKm(myLocation, {
                      latitude: selectedKit.latest_lat!,
                      longitude: selectedKit.latest_lng!,
                    }).toFixed(1)}{" "}
                    km
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons Row */}
            <View className="flex-row gap-3 pt-1 mb-2">
              <ActionButton
                icon={tracking ? "stop-circle-outline" : "locate-outline"}
                label={tracking ? t.home.stopTracking : t.home.trackLive}
                onPress={() => {
                  setErrorMessage(null);
                  setTracking((v) => !v);
                }}
                variant={tracking ? "danger" : "brand"}
              />
              {hasLocation && (
                <ActionButton
                  icon="navigate-outline"
                  label={t.home.getDirections}
                  onPress={() =>
                    openDirectionsTo(
                      selectedKit.latest_lat!,
                      selectedKit.latest_lng!,
                      selectedKit.kit_name || selectedKit.device_id
                    )
                  }
                  variant="accent"
                />
              )}
            </View>

            {/* Collapsible Details */}
            <Pressable
              onPress={() => setDetailsOpen((v) => !v)}
              className="flex-row items-center justify-between pt-2 border-t border-[#F1F5F9]"
            >
              <Text className="font-body-medium text-muted text-[11px]">{t.home.details}</Text>
              <Ionicons name={detailsOpen ? "chevron-up" : "chevron-down"} size={14} color="#5B6E70" />
            </Pressable>

            {detailsOpen && (
              <View className="pt-2 flex-row justify-between">
                <Text className="font-body text-muted text-[10px]">
                  {t.home.accuracy}: {selectedKit.latest_accuracy != null ? `${Math.round(selectedKit.latest_accuracy)} m` : "Unknown"}
                </Text>
                <Text className="font-body text-muted text-[10px]">
                  {t.home.source}: {selectedKit.latest_location_source ?? "unknown"}
                </Text>
                <Text className="font-body text-muted text-[10px]">
                  {t.home.deviceId}: {selectedKit.device_id}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
}