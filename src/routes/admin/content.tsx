import { createFileRoute } from "@tanstack/react-router";
import { useSite, resolveImage } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { useContent, type ContentItem } from "@/hooks/useContent";

// ─────────────────────────────────────────────────────────────────────────────
// ImageUpload — extended to save the uploaded file to the content table
// and return the full ContentItem to the parent for instant UI update.
// ─────────────────────────────────────────────────────────────────────────────
interface ImageUploadProps {
  /** Called with the public URL after a successful upload */
  onUpload: (url: string) => void;
  /** Optionally called with the full DB row for optimistic state updates */
  onContentItem?: (item: ContentItem) => void;
  /** The shared save function to avoid creating multiple DB connections */
  saveToDb: (params: any) => Promise<ContentItem | null>;
  category?: string;
}

function ImageUpload({
  onUpload,
  onContentItem,
  saveToDb,
  category = "general",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const ext = file.name.split(".").pop() ?? "jpg";
    const safeName = `${Date.now()}.${ext}`;
    const filePath = `uploads/${safeName}`;

    // ── Optimistic Preview ──
    const localUrl = URL.createObjectURL(file);
    onUpload(localUrl);

    // 1. Upload to Supabase Storage (existing logic preserved)
    const { error: storageError } = await supabase.storage
      .from("site-assets")
      .upload(filePath, file);

    if (storageError) {
      toast.error("Upload failed: " + storageError.message);
      setUploading(false);
      return;
    }

    // 2. Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("site-assets").getPublicUrl(filePath);

    // 3. Save to content table — returns the inserted row
    const inserted = await saveToDb({
      name: file.name,
      url: publicUrl,
      filePath,
      type: file.type.startsWith("image") ? "image" : "video",
      category,
      metadata: { size: file.size, mime: file.type },
    });

    // 4. Notify parent with URL (always) and with the full row (when available)
    URL.revokeObjectURL(localUrl);
    onUpload(publicUrl);
    if (inserted && onContentItem) {
      onContentItem(inserted);
    }

    setUploading(false);
    toast.success("Image uploaded!");
  };

  return (
    <label className="cursor-pointer shrink-0">
      <input
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      <div
        className={`grid h-12 w-12 place-items-center rounded-xl border border-dashed border-cocoa/30 hover:bg-cocoa/5 transition ${
          uploading ? "animate-pulse" : ""
        }`}
      >
        <Upload className="h-4 w-4 text-cocoa/40" />
      </div>
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Route
// ─────────────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/admin/content")({
  component: AdminContent,
});

function AdminContent() {
  const { settings, refresh } = useSite();
  const heroContent = useContent("hero");
  const instagramContent = useContent("instagram");
  const heroBackground = heroContent.items.length > 0 ? heroContent.items[0].url : "";
  const isLoadingInitial = heroContent.loading && heroContent.items.length === 0;
  const [hero, setHero] = useState(settings.hero);
  const [about, setAbout] = useState(settings.about);
  const [footer, setFooter] = useState(settings.footer);
  const [brand, setBrand] = useState(settings.brand);
  const [instagram, setInstagram] = useState(settings.instagram);

  useEffect(() => {
    setHero(settings.hero);
    setAbout(settings.about);
    setFooter(settings.footer);
    setBrand(settings.brand);
    setInstagram(settings.instagram);
  }, [settings]);

  useEffect(() => {
    // Automatically sync legacy settings images to content table if empty
    const autoSync = async () => {
      if (
        !instagramContent.loading &&
        instagramContent.items.length === 0 &&
        settings.instagram?.images?.length > 0
      ) {
        console.log("[AdminContent] Auto-syncing legacy instagram images...");
        for (const img of settings.instagram.images) {
          if (img.url) {
            await instagramContent.saveToDb({
              name: "Legacy Sync",
              url: img.url,
              filePath: "legacy",
              type: "image",
              category: "instagram",
            });
          }
        }
      }
    };
    autoSync();
  }, [instagramContent.loading, instagramContent.items.length, settings.instagram]);

  // ── Save site setting ────────────────────────────────────────────────────
  const saveKey = async (key: string, value: any) => {
    const { error } = await supabase.rpc("save_site_setting", {
      p_key: key,
      p_value: value,
    });

    if (error) {
      console.error(`Error saving ${key}:`, error);
      toast.error("Save failed: " + error.message);
      return;
    }

    toast.success("Saved Successfully");
    refresh();
  };

  // ── Sync helper (manual, for legacy items not yet in content table) ──────
  const syncToContentTable = async () => {
    toast.info("Checking for unsynced media…");
    const mediaToSync: { name: string; url: string; category: string }[] = [];

    if (hero.background) {
      mediaToSync.push({ name: "Hero Background", url: hero.background, category: "hero" });
    }
    if (instagram?.images) {
      instagram.images.forEach((img, i) => {
        if (img.url)
          mediaToSync.push({
            name: `Instagram Image ${i + 1}`,
            url: img.url,
            category: "instagram",
          });
      });
    }
    if (settings.logo?.url) {
      mediaToSync.push({ name: "Logo", url: settings.logo.url, category: "brand" });
    }
    if (settings.favicon?.url) {
      mediaToSync.push({ name: "Favicon", url: settings.favicon.url, category: "brand" });
    }

    let syncedCount = 0;
    let errors = 0;

    for (const item of mediaToSync) {
      const { error: insertError } = await supabase.rpc("save_content_item", {
        p_name: item.name,
        p_url: item.url,
        p_file_path: null,
        p_type: "image",
        p_category: item.category,
        p_metadata: { synced_at: new Date().toISOString() },
      });

      if (!insertError) {
        syncedCount++;
      } else if (!insertError.message.includes("duplicate")) {
        errors++;
        console.error("Sync error for", item.name, ":", insertError);
      }
    }

    if (syncedCount > 0) {
      toast.success(`Synced ${syncedCount} image(s) to the content table!`);
    } else if (errors === 0) {
      toast.info("All images are already in the database.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Site Content</h1>
        <button
          onClick={syncToContentTable}
          className="text-xs px-4 py-2 rounded-full border border-cocoa/20 hover:bg-cocoa/5 text-cocoa/60 transition"
        >
          Sync Media to DB
        </button>
      </div>

      {/* Brand */}
      <Section title="Brand" onSave={() => saveKey("brand", brand)}>
        <Input
          label="Brand name"
          value={brand.name}
          onChange={(v) => setBrand({ ...brand, name: v })}
        />
        <Input
          label="Tagline"
          value={brand.tagline}
          onChange={(v) => setBrand({ ...brand, tagline: v })}
        />
      </Section>

      {/* Hero */}
      <Section title="Hero" onSave={() => saveKey("hero", hero)}>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-cocoa/5 border border-cocoa/10 mb-4">
          <ImageUpload
            category="hero"
            saveToDb={heroContent.saveToDb}
            onUpload={(url) => setHero({ ...hero, background: url })}
            onContentItem={(item) =>
              heroContent.setItems((prev: any) => [item, ...prev].slice(0, 1))
            }
          />
          <div className="h-16 w-16 overflow-hidden rounded-xl bg-cocoa/20 border border-cocoa/10">
            {isLoadingInitial ? (
              <div className="h-full w-full bg-cocoa/10 animate-pulse" />
            ) : heroBackground ? (
              <img
                key={heroBackground}
                src={resolveImage(heroBackground)}
                alt="Hero Preview"
                className="h-full w-full object-cover"
                onError={(e) => {
                  console.error("Hero image failed to load:", e.currentTarget.src);
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-[10px] text-cocoa/40 text-center leading-tight">
                No DB Image
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <label className="text-[10px] uppercase tracking-widest text-cocoa/40 font-bold">
              Hero Background (Live from DB)
            </label>
            <p className="text-[10px] text-cocoa/40 truncate">
              {heroContent.items.length > 0 ? heroContent.items[0].url : "Empty in Database"}
            </p>
          </div>
        </div>
        <Input
          label="Eyebrow"
          value={hero.eyebrow}
          onChange={(v) => setHero({ ...hero, eyebrow: v })}
        />
        <Input label="Title" value={hero.title} onChange={(v) => setHero({ ...hero, title: v })} />
        <Input
          label="Title accent"
          value={hero.titleAccent}
          onChange={(v) => setHero({ ...hero, titleAccent: v })}
        />
        <Input
          label="Subtitle"
          value={hero.subtitle}
          onChange={(v) => setHero({ ...hero, subtitle: v })}
          textarea
        />
        <Input
          label="Primary CTA"
          value={hero.primaryCta}
          onChange={(v) => setHero({ ...hero, primaryCta: v })}
        />
        <Input
          label="Secondary CTA"
          value={hero.secondaryCta}
          onChange={(v) => setHero({ ...hero, secondaryCta: v })}
        />
      </Section>

      {/* About */}
      <Section title="About" onSave={() => saveKey("about", about)}>
        <Input
          label="Eyebrow"
          value={about.eyebrow}
          onChange={(v) => setAbout({ ...about, eyebrow: v })}
        />
        <Input
          label="Title"
          value={about.title}
          onChange={(v) => setAbout({ ...about, title: v })}
        />
        <Input
          label="Body"
          value={about.body}
          onChange={(v) => setAbout({ ...about, body: v })}
          textarea
        />
      </Section>

      {/* Instagram */}
      <Section title="Instagram" onSave={() => saveKey("instagram", instagram)}>
        <Input
          label="Handle (e.g. @christfitz)"
          value={instagram.handle}
          onChange={(v) => setInstagram({ ...instagram, handle: v })}
        />
        <Input
          label="Title"
          value={instagram.title}
          onChange={(v) => setInstagram({ ...instagram, title: v })}
        />
        <Input
          label="Button Label"
          value={instagram.cta}
          onChange={(v) => setInstagram({ ...instagram, cta: v })}
        />
        <Input
          label="Instagram URL"
          value={instagram.url}
          onChange={(v) => setInstagram({ ...instagram, url: v })}
        />

        <div className="pt-4 border-t border-cocoa/5">
          <label className="text-xs uppercase tracking-widest text-cocoa/60 font-bold">
            Gallery Images (Live from DB)
          </label>
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 auto-rows-[120px] sm:auto-rows-[160px]">
            {(() => {
              // Strict mapping: Slots 1-8 correspond to positions 0-7
              const adminSlots = new Array(8).fill(null);

              // We only care about items that actually have a valid slot position
              instagramContent.items.forEach((item: any) => {
                if (!item || item.position === null || item.position < 0 || item.position >= 8) return;
                
                // If multiple items have the same position, the newest one (first in sorted array) wins
                if (!adminSlots[item.position]) {
                  adminSlots[item.position] = item;
                }
              });

              return adminSlots.map((liveItem, i) => {
                const displayUrl = liveItem?.url || "";
                const isSlotLoading = instagramContent.loading && !displayUrl;
                const spanClass = i === 0 || i === 3 ? "row-span-2 col-span-1" : "col-span-1";

                return (
                  <div
                    key={i}
                    className={`group relative overflow-hidden rounded-2xl bg-cocoa/5 border border-cocoa/10 flex items-center justify-center ${spanClass}`}
                  >
                    {isSlotLoading ? (
                      <div className="absolute inset-0 bg-cocoa/10 animate-pulse" />
                    ) : displayUrl ? (
                      <img
                        src={resolveImage(displayUrl)}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-cocoa/10">
                        <Upload className="h-8 w-8" />
                      </div>
                    )}

                    {/* Upload Button overlayed on top of the image */}
                    <div className="relative z-10 scale-90 sm:scale-100 bg-cream/80 hover:bg-cream backdrop-blur-md rounded-full shadow-lg transition-all duration-300">
                      <ImageUpload
                        category="instagram"
                        saveToDb={(params) =>
                          instagramContent.saveToDb({
                            ...params,
                            existingId: liveItem?.id,
                            position: i,
                          })
                        }
                        onUpload={async (url) => {
                          // 1. Legacy update (optional but kept for fallback compatibility)
                          const newImages = [...(instagram.images || [])];
                          newImages[i] = { ...newImages[i], url };
                          setInstagram({ ...instagram, images: newImages });

                          // 2. Zero-latency optimistic preview injected directly into the live grid state!
                          instagramContent.setItems((prev: any) => {
                            const next = [...prev];
                            const existingIdx = next.findIndex((x: any) => x.position === i);
                            if (existingIdx !== -1) {
                              next[existingIdx] = { ...next[existingIdx], url };
                            } else {
                              next.push({
                                id: `temp-${Date.now()}`,
                                position: i,
                                url,
                                category: "instagram",
                                is_active: true,
                              });
                            }
                            return next;
                          });
                        }}
                        onContentItem={(item) => {
                          instagramContent.fetchItems(false, true);
                        }}
                      />
                    </div>

                    {/* Visual Identifier */}
                    <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-cream/90 text-cocoa px-2 py-1 rounded border border-cocoa/5 backdrop-blur-sm shadow-sm">
                        Slot {i + 1}
                      </span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </Section>

      {/* Footer */}
      <Section title="Footer" onSave={() => saveKey("footer", footer)}>
        <Input
          label="Text"
          value={footer.text}
          onChange={(v) => setFooter({ ...footer, text: v })}
          textarea
        />
        <Input
          label="Copyright"
          value={footer.copyright}
          onChange={(v) => setFooter({ ...footer, copyright: v })}
        />
      </Section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared UI primitives (unchanged)
// ─────────────────────────────────────────────────────────────────────────────
function Section({ title, onSave, children }: any) {
  return (
    <div className="rounded-3xl glass p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">{title}</h2>
        <button
          onClick={onSave}
          className="rounded-full bg-cocoa px-5 py-2 text-sm text-cream hover:bg-coffee"
        >
          Save
        </button>
      </div>
      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  const cls =
    "w-full rounded-2xl border border-cocoa/15 bg-cream/60 px-4 py-2.5 outline-none focus:border-coffee";
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-cocoa/60">{label}</label>
      <div className="mt-1.5">
        {textarea ? (
          <textarea
            rows={3}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cls}
          />
        ) : (
          <input value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
        )}
      </div>
    </div>
  );
}
