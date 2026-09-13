import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CategoryIcon } from "@/components/CategoryIcon";
import { MangaCard } from "@/components/MangaCard";
import { SourceSwitcher } from "@/components/SourceSwitcher";
import SourceVerificationModal from "@/components/SourceVerificationModal";
import { useSettings } from "@/context/SettingsContext";
import { useColors } from "@/hooks/useColors";
import { getCategory, matchesCategory, MANGA_CATEGORIES, MangaCategoryId } from "@/services/categories";
import { ALL_SOURCES, SourceError } from "@/services/sources";
import { Manga } from "@/services/sources/types";
import { useTranslation } from "react-i18next";

function routeCategory(value: string | string[] | undefined): MangaCategoryId {
  return getCategory(typeof value === "string" ? value : undefined).id;
}

export default function ExploreScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ genre?: string }>();
  const { activeSourceId, settingsReady } = useSettings();

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<MangaCategoryId>(routeCategory(params.genre));
  const [results, setResults] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [cfSource, setCfSource] = useState<{ id: string; name: string; url: string } | null>(null);
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const loadingPageRef = useRef<number | null>(null);
  const queryEffectReadyRef = useRef(false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    const nextCategory = routeCategory(params.genre);
    setActiveCategory((current) => (current === nextCategory ? current : nextCategory));
  }, [params.genre]);

  const fetchPage = useCallback(
    async (q: string, categoryId: MangaCategoryId, pageNum: number, reset: boolean) => {
      if (!settingsReady) return;
      if (!reset && loadingPageRef.current === pageNum) return;

      const source = ALL_SOURCES.find((candidate) => candidate.id === activeSourceId);
      if (!source) {
        setSourceError(t("errors.network"));
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const requestId = ++requestIdRef.current;
      if (!reset) loadingPageRef.current = pageNum;

      setLoading(true);
      if (reset) {
        setResults([]);
        setPage(0);
        setHasMore(true);
        setSourceError(null);
      }

      try {
        const trimmedQuery = q.trim();
        const data = trimmedQuery
          ? await source.search(trimmedQuery, pageNum, controller.signal)
          : await source.getTrending(pageNum, controller.signal);
        if (controller.signal.aborted || requestId !== requestIdRef.current) return;

        const filtered = data.filter((manga) => matchesCategory(manga.genres, categoryId));
        setResults((previous) => {
          const next = reset ? filtered : [...previous, ...filtered];
          return next.filter((manga, index, all) => all.findIndex((item) => item.id === manga.id) === index);
        });
        setPage(pageNum);
        setHasMore(data.length >= 20);
      } catch (err) {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return;
        setHasMore(false);
        if (err instanceof SourceError) {
          if (err.type === "cloudflare") {
            setCfSource({ id: source.id, name: source.name, url: source.baseUrl });
          } else {
            setSourceError(err.message);
          }
        } else if (err instanceof Error) {
          setSourceError(err.message);
        } else {
          setSourceError(t("errors.network"));
        }
      } finally {
        if (!reset && loadingPageRef.current === pageNum) {
          loadingPageRef.current = null;
        }
        if (requestId === requestIdRef.current) setLoading(false);
      }
    },
    [activeSourceId, settingsReady, t],
  );

  useEffect(() => {
    if (!settingsReady) return;
    void fetchPage(query, activeCategory, 0, true);
  }, [activeCategory, activeSourceId, fetchPage, settingsReady]);

  useEffect(() => {
    if (!queryEffectReadyRef.current) {
      queryEffectReadyRef.current = true;
      return;
    }
    const timeout = setTimeout(() => {
      void fetchPage(query, activeCategory, 0, true);
    }, 400);
    return () => clearTimeout(timeout);
  }, [fetchPage, query, activeCategory]);

  useEffect(() => () => {
    abortRef.current?.abort();
  }, []);

  const selectCategory = (categoryId: MangaCategoryId) => {
    setActiveCategory(categoryId);
    router.setParams({ genre: categoryId === "all" ? undefined : categoryId });
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      void fetchPage(query, activeCategory, page + 1, false);
    }
  };

  const retry = () => {
    void fetchPage(query, activeCategory, 0, true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {cfSource && (
        <SourceVerificationModal
          visible
          sourceId={cfSource.id}
          sourceName={cfSource.name}
          sourceUrl={cfSource.url}
          onVerified={() => {
            setCfSource(null);
            retry();
          }}
          onDismiss={() => setCfSource(null)}
          onChangeSource={() => setCfSource(null)}
        />
      )}

      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.card, borderColor: colors.border, borderRadius: colors.radius },
          ]}
        >
          <Ionicons name="search" size={18} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t("explore.searchPlaceholder")}
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>
        <SourceSwitcher />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.genreRow}>
        {MANGA_CATEGORIES.map((category) => {
          const active = category.id === activeCategory;
          return (
            <Pressable
              key={category.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => selectCategory(category.id)}
              style={[
                styles.genrePill,
                {
                  backgroundColor: active ? colors.primary : "rgba(255,255,255,0.05)",
                  borderColor: active ? colors.primary : "rgba(255,255,255,0.1)",
                  borderRadius: 16,
                },
              ]}
            >
              <CategoryIcon name={category.icon} active={active} />
              <Text style={[styles.genreText, { color: active ? "#fff" : colors.mutedForeground }]}>
                {t(category.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {sourceError && !loading && (
        <View style={[styles.errorBanner, { backgroundColor: colors.card, borderColor: "rgba(239,68,68,0.35)" }]}>
          <Ionicons name="warning-outline" size={16} color="#ef4444" />
          <Text style={[styles.errorText, { color: colors.foreground }]} numberOfLines={3}>
            {sourceError}
          </Text>
          <Pressable onPress={retry}>
            <Ionicons name="refresh" size={16} color={colors.primary} />
          </Pressable>
        </View>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={[
          styles.grid,
          { paddingBottom: 100 + (Platform.OS === "web" ? 34 : insets.bottom) },
        ]}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        scrollEnabled={!!results.length}
        ListEmptyComponent={
          loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : (
            <View style={styles.center}>
              <Ionicons name="search-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                {query || activeCategory !== "all" ? t("explore.noResults") : t("explore.title")}
              </Text>
              {activeCategory !== "all" && (
                <Text style={[styles.categoryHint, { color: colors.mutedForeground }]}>
                  {t(getCategory(activeCategory).labelKey)}
                </Text>
              )}
            </View>
          )
        }
        ListFooterComponent={
          loading && results.length > 0 ? (
            <View style={styles.footer}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <MangaCard
              manga={item}
              onPress={() =>
                router.push({
                  pathname: "/manga",
                  params: { mangaId: item.id, sourceId: item.sourceId },
                })
              }
              size="small"
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, gap: 4 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, height: 44 },
  genreRow: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: "row" },
  genrePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 5,
    borderWidth: 1,
  },
  genreText: { fontSize: 12, fontWeight: "500" as const },
  grid: { paddingHorizontal: 8, paddingTop: 4 },
  row: { justifyContent: "flex-start", gap: 8, marginBottom: 8, paddingHorizontal: 4 },
  cardWrapper: { flex: 1, maxWidth: "33.33%", alignItems: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 15 },
  categoryHint: { fontSize: 12 },
  footer: { padding: 20, alignItems: "center" },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 12,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorText: { flex: 1, fontSize: 12, lineHeight: 17 },
});