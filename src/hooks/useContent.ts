import { supabase } from "@/integrations/supabase/client";
import { useCallback, useEffect, useState } from "react";

export interface ContentItem {
  id: string;
  name: string;
  url: string;
  type: "image" | "video";
  category: string;
  metadata: any;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * useContent Hook — Optimized for ChristFitz Storefront
 * Implements SWR (Stale-While-Revalidate) caching to handle Supabase 503 errors.
 */
export function useContent(category?: string) {
  const cacheKey = `cf_content_${category || "all"}`;

  const sortItems = (arr: ContentItem[]) => {
    return [...arr].sort((a, b) => {
      if (a.position !== b.position) return a.position - b.position;
      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();
      return dateB - dateA;
    });
  };

  // 1. Initial State from Cache (Lightning Load)
  const [items, setItems] = useState<ContentItem[]>(() => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchItems = useCallback(
    async (isInitial = false, force = false) => {
      // 1. Global Throttle Check: Skip if forced (Admin actions)
      const throttleUntil = (window as any)._supabaseThrottleUntil || 0;
      if (!force && Date.now() < throttleUntil) {
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("content")
          .select("*")
          .eq("category", category || "general")
          .eq("is_active", true)
          .order("position", { ascending: true })
          .order("updated_at", { ascending: false });

        if (error) {
          const is503 = (error as any).status === 503 || error.message.includes("503");
          if (is503) {
            console.error(`[useContent] 503 Error for ${category}. Silencing for 5s.`);
            (window as any)._supabaseThrottleUntil = Date.now() + 5000;
          }
          throw error;
        }

        const fetchedItems = (data as ContentItem[]) ?? [];
        setItems(fetchedItems);
        localStorage.setItem(cacheKey, JSON.stringify(fetchedItems));
      } catch (err) {
        console.error(`[useContent] Error fetching ${category}:`, err);
      } finally {
        setLoading(false);
      }
    },
    [category, cacheKey],
  );

  // ── Save/Update ────────────────────────────────────────────────────────
  const saveToDb = useCallback(
    async (params: {
      name: string;
      url: string;
      filePath: string;
      type: "image" | "video";
      category: string;
      metadata?: any;
      existingId?: string;
      position?: number;
    }) => {
      try {
        // 1. Hyper-Optimistic Update: Inject into local state immediately
        const tempId = params.existingId || `temp-${Date.now()}`;
        const tempItem: Partial<ContentItem> = {
          id: tempId,
          name: params.name,
          url: params.url,
          type: params.type,
          category: params.category,
          metadata: params.metadata || {},
        };

        setItems((prev: ContentItem[]) => {
          if (params.existingId) {
            // Update existing item in-place
            const next = sortItems(prev.map((x) =>
              x.id === params.existingId ? { ...x, ...tempItem } as ContentItem : x
            ));
            localStorage.setItem(cacheKey, JSON.stringify(next));
            return next;
          } else {
            const fullTempItem = {
              ...tempItem,
              position: params.position ?? 0,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as ContentItem;
            // Remove any existing temp items at the same position to prevent duplicate slots
            const filtered = prev.filter(
              (x) => !(String(x.id).startsWith("temp-") && x.position === fullTempItem.position)
            );
            const next = sortItems([...filtered, fullTempItem]);
            localStorage.setItem(cacheKey, JSON.stringify(next));
            return next;
          }
        });


        // 2. Perform DB operation
        let data, error;
        if (params.existingId) {
          const updatePayload: any = {
            name: params.name,
            url: params.url,
            file_path: params.filePath,
            type: params.type,
            metadata: params.metadata || {},
          };
          if (params.position !== undefined) {
            updatePayload.position = params.position;
          }

          const res = await supabase
            .from("content")
            .update(updatePayload)
            .eq("id", params.existingId)
            .select();
          data = res.data;
          error = res.error;
        } else {
          const res = await supabase
            .from("content")
            .insert([
              {
                name: params.name,
                url: params.url,
                file_path: params.filePath,
                type: params.type,
                category: params.category,
                metadata: params.metadata || {},
                is_active: true,
                position: params.position ?? 0,
              },
            ])
            .select();
          data = res.data;
          error = res.error;
        }

        if (error) {
          // Simple rollback if new item insertion fails
          if (!params.existingId)
            setItems((prev: ContentItem[]) => prev.filter((x: ContentItem) => x.id !== tempId));
          throw error;
        }

        const inserted = data?.[0] ?? null;
        if (inserted) {
          // Replace temp with real
          setItems((prev: ContentItem[]) =>
            prev.map((x: ContentItem) => (x.id === tempId ? (inserted as ContentItem) : x)),
          );
          (window as any)._supabaseThrottleUntil = 0;
        }

        return inserted as ContentItem | null;
      } catch (err) {
        console.error("[useContent] Save error:", err);
        return null;
      }
    },
    [cacheKey],
  );

  const deleteItem = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from("content").delete().eq("id", id);
      if (error) throw error;
      setItems((prev: ContentItem[]) => prev.filter((i: ContentItem) => i.id !== id));
      return true;
    } catch (err) {
      console.error("[useContent] Delete error:", err);
      return false;
    }
  }, []);

  const clearCache = useCallback(() => {
    localStorage.removeItem(cacheKey);
    setItems([]);
  }, [cacheKey]);

  // ── Realtime ───────────────────────────────────────────────────────────
  useEffect(() => {
    const channelName = `content_changes_${category || "all"}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "content" },
        (payload: any) => {
          const newItem = (payload.new || payload.old) as any;
          if (!category || newItem.category === category) {
            console.log(
              `[useContent] Realtime pulse for ${category || "all"} - Event: ${payload.eventType}`,
            );

            // HYPER-FAST UPDATE: Inject directly without refetching
            if (payload.eventType === "INSERT") {
              setItems((prev: ContentItem[]) => {
                // If an item with this id already exists, skip
                if (prev.some((x: ContentItem) => x.id === newItem.id)) return prev;
                // Replace any temp item at the same position (prevents duplicate slots)
                const filtered = prev.filter(
                  (x: ContentItem) =>
                    !(x.position === newItem.position && String(x.id).startsWith("temp-")),
                );
                const next = sortItems([...filtered, newItem]);
                localStorage.setItem(cacheKey, JSON.stringify(next));
                return next;
              });

            } else if (payload.eventType === "UPDATE") {
              setItems((prev: ContentItem[]) => {
                const next = prev.map((x: ContentItem) => (x.id === newItem.id ? newItem : x));
                if (!next.some((x: ContentItem) => x.id === newItem.id)) next.push(newItem);
                const sortedNext = sortItems(next);
                localStorage.setItem(cacheKey, JSON.stringify(sortedNext));
                return sortedNext;
              });
            } else if (payload.eventType === "DELETE") {
              setItems((prev: ContentItem[]) => {
                const next = prev.filter((x: ContentItem) => x.id !== newItem.id);
                localStorage.setItem(cacheKey, JSON.stringify(next));
                return next;
              });
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [category, fetchItems]);

  // ── Lifecycle ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchItems(true, true); // Force initial fetch on load
  }, [fetchItems]);

  return { items, setItems, loading, fetchItems, saveToDb, deleteItem, clearCache };
}
