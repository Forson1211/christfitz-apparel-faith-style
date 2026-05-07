import { createFileRoute } from "@tanstack/react-router";
import { useSite, resolveImage } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Upload, RefreshCw } from "lucide-react";
import { useContent, type ContentItem } from "@/hooks/useContent";

// ─────────────────────────────────────────────────────────────────────────────
// ImageUpload — extended to save the uploaded file to the content table
// and return the full ContentItem to the parent for instant UI update.
// ─────────────────────────────────────────────────────────────────────────────
interface MediaUploadProps {
  /** Called with the public URL after a successful upload */
  onUpload: (url: string) => void;
  /** Optionally called with the full DB row for optimistic state updates */
  onContentItem?: (item: ContentItem) => void;
  /** The shared save function to avoid creating multiple DB connections */
  saveToDb: (params: any) => Promise<ContentItem | null>;
  category?: string;
}

function MediaUpload({
  onUpload,
  onContentItem,
  saveToDb,
  category = "general",
}: MediaUploadProps) {
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

    // 1. Upload to Supabase Storage
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

    // 3. Save to content table
    const fileType = file.type.startsWith("video") ? "video" : "image";
    const inserted = await saveToDb({
      name: file.name,
      url: publicUrl,
      filePath,
      type: fileType,
      category,
      metadata: { size: file.size, mime: file.type },
    });

    // 4. Notify parent
    URL.revokeObjectURL(localUrl);
    onUpload(publicUrl);
    if (inserted && onContentItem) {
      onContentItem(inserted);
    }

    setUploading(false);
    toast.success(`${fileType.charAt(0).toUpperCase() + fileType.slice(1)} uploaded!`);
  };

  return (
    <label className="cursor-pointer shrink-0">
      <input
        type="file"
        className="hidden"
        accept="image/*,video/*"
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
  const aboutContent = useContent("about");
  const heroBackground = heroContent.items.length > 0 ? heroContent.items[0].url : "";
  const isLoadingInitial = heroContent.loading && heroContent.items.length === 0;
  const [hero, setHero] = useState(settings.hero);
  const [about, setAbout] = useState(settings.about);
  const [footer, setFooter] = useState(settings.footer);
  const [brand, setBrand] = useState(settings.brand);
  const [instagram, setInstagram] = useState(settings.instagram);
  const [collections, setCollections] = useState(settings.collections || { title: "Collections built to inspire.", subtitle: "Three signature lines, each crafted with intention. Soft hands, bold spirit." });
  const [contact, setContact] = useState(settings.contact);
  const [announcement, setAnnouncement] = useState(settings.announcement);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setHero(settings.hero);
    setAbout(settings.about);
    setFooter(settings.footer);
    setBrand(settings.brand);
    setInstagram(settings.instagram);
    setCollections(settings.collections || { title: "Collections built to inspire.", subtitle: "Three signature lines, each crafted with intention. Soft hands, bold spirit." });
    setContact(settings.contact);
    setAnnouncement(settings.announcement);
  }, [settings]);

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
    setLoading(true);
    toast.info("Checking for unsynced media…");
    const mediaToSync: { name: string; url: string; category: string; position?: number }[] = [];

    if (hero.background) {
      mediaToSync.push({ name: "Hero Background", url: hero.background, category: "hero" });
    }
    if (instagram?.images) {
      instagram.images.forEach((img: any, i: number) => {
        if (img.url)
          mediaToSync.push({
            name: `Instagram Image ${i + 1}`,
            url: img.url,
            category: "instagram",
            position: i
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
        p_position: (item as any).position ?? 0
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
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Site Content</h1>
        <div className="flex items-center gap-2">
            <button
              onClick={() => {
                instagramContent.clearCache();
                instagramContent.fetchItems(false, true);
              }}
              className="text-xs px-4 py-2 rounded-full border border-cocoa/20 hover:bg-cocoa/5 text-cocoa/60 transition flex items-center gap-2"
            >
              <RefreshCw className={`h-3 w-3 ${instagramContent.loading ? "animate-spin" : ""}`} />
              Clear Cache
            </button>
            <button
              onClick={syncToContentTable}
              className="text-xs px-4 py-2 rounded-full border border-cocoa/20 hover:bg-cocoa/5 text-cocoa/60 transition flex items-center gap-2"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              Sync Media to DB
            </button>
        </div>
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

      {/* Announcement */}
      <Section title="Global Announcement" onSave={() => saveKey("announcement", announcement)}>
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-cocoa/5 border border-cocoa/10 mb-4">
          <input
            type="checkbox"
            checked={announcement?.enabled}
            onChange={(e) => setAnnouncement({ ...announcement, enabled: e.target.checked })}
            className="h-4 w-4 accent-cocoa"
          />
          <span className="text-sm font-medium text-cocoa">Enable announcement bar</span>
        </div>
        <Input
          label="Announcement Text (Show your discount code here!)"
          value={announcement?.text || ""}
          onChange={(v) => setAnnouncement({ ...announcement, text: v })}
        />
        <Input
          label="Target Link"
          value={announcement?.href || ""}
          onChange={(v) => setAnnouncement({ ...announcement, href: v })}
        />
      </Section>

      {/* Hero */}
      <Section title="Hero" onSave={() => saveKey("hero", hero)}>
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-cocoa/5 border border-cocoa/10 mb-4">
          <MediaUpload
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
              heroBackground.toLowerCase().endsWith(".mp4") ||
              heroBackground.toLowerCase().endsWith(".webm") ||
              heroBackground.toLowerCase().endsWith(".mov") ? (
                <video
                  src={heroBackground}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                />
              ) : (
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
              )
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

        <div className="mt-6 pt-6 border-t border-cocoa/10">
          <h3 className="text-sm font-bold uppercase tracking-widest text-cocoa/40 mb-4">Hero Stats</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Believers Base (Marketing Offset)"
              value={String(hero.stats?.believersBase || 0)}
              onChange={(v) => setHero({ ...hero, stats: { ...hero.stats, believersBase: parseInt(v) || 0 } })}
            />
            <Input
              label="Believers Label"
              value={hero.stats?.believersLabel || ""}
              onChange={(v) => setHero({ ...hero, stats: { ...hero.stats, believersLabel: v } })}
            />
            <Input
              label="Designs Label"
              value={hero.stats?.designsLabel || ""}
              onChange={(v) => setHero({ ...hero, stats: { ...hero.stats, designsLabel: v } })}
            />
            <Input
              label="Rating Label"
              value={hero.stats?.ratingLabel || ""}
              onChange={(v) => setHero({ ...hero, stats: { ...hero.stats, ratingLabel: v } })}
            />
          </div>
        </div>
      </Section>
    
      {/* Collections */}
      <Section title="Collections Section (Home)" onSave={() => saveKey("collections", collections)}>
        <Input
          label="Section Title"
          value={collections.title}
          onChange={(v) => setCollections({ ...collections, title: v })}
        />
        <Input
          label="Section Subtitle"
          value={collections.subtitle}
          onChange={(v) => setCollections({ ...collections, subtitle: v })}
          textarea
        />
        <p className="mt-4 text-[10px] uppercase tracking-widest text-cocoa/40 font-bold italic">
          * Go to the "Collections" tab in the sidebar to manage individual collection images and names.
        </p>
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

        <div className="mt-6 pt-6 border-t border-cocoa/10">
          <h3 className="text-sm font-bold uppercase tracking-widest text-cocoa/40 mb-4">About Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-cocoa/40 font-bold">Main Community Image</label>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-cocoa/5 border border-cocoa/10">
                <MediaUpload
                  category="about"
                  saveToDb={aboutContent.saveToDb}
                  onUpload={(url) => setAbout({ ...about, images: { ...about.images, main: url } })}
                />
                <div className="h-20 w-20 overflow-hidden rounded-xl bg-cocoa/20 border border-cocoa/10">
                  {about.images.main.toLowerCase().endsWith(".mp4") ||
                  about.images.main.toLowerCase().endsWith(".webm") ||
                  about.images.main.toLowerCase().endsWith(".mov") ? (
                    <video
                      src={about.images.main}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={resolveImage(about.images.main)}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-cocoa/40 font-bold">Secondary Product Image</label>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-cocoa/5 border border-cocoa/10">
                <MediaUpload
                  category="about"
                  saveToDb={aboutContent.saveToDb}
                  onUpload={(url) => setAbout({ ...about, images: { ...about.images, secondary: url } })}
                />
                <div className="h-20 w-20 overflow-hidden rounded-xl bg-cocoa/20 border border-cocoa/10">
                  {about.images.secondary.toLowerCase().endsWith(".mp4") ||
                  about.images.secondary.toLowerCase().endsWith(".webm") ||
                  about.images.secondary.toLowerCase().endsWith(".mov") ? (
                    <video
                      src={about.images.secondary}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={resolveImage(about.images.secondary)}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-cocoa/10">
          <h3 className="text-sm font-bold uppercase tracking-widest text-cocoa/40 mb-4">
            Features (Organic, Limited, etc.)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {about.features.map((f, i) => (
              <div key={i} className="space-y-2 p-3 rounded-2xl bg-cocoa/5">
                <Input
                  label={`Feature ${i + 1} Title`}
                  value={f.title}
                  onChange={(v) => {
                    const next = [...about.features];
                    next[i] = { ...next[i], title: v };
                    setAbout({ ...about, features: next });
                  }}
                />
                <Input
                  label={`Feature ${i + 1} Subtitle`}
                  value={f.subtitle}
                  onChange={(v) => {
                    const next = [...about.features];
                    next[i] = { ...next[i], subtitle: v };
                    setAbout({ ...about, features: next });
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-cocoa/10">
          <h3 className="text-sm font-bold uppercase tracking-widest text-cocoa/40 mb-4">
            About Stat (Est. 2024)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Label (e.g. Est. 2024)"
              value={about.stat.label}
              onChange={(v) => setAbout({ ...about, stat: { ...about.stat, label: v } })}
            />
            <Input
              label="Text"
              value={about.stat.text}
              onChange={(v) => setAbout({ ...about, stat: { ...about.stat, text: v } })}
            />
          </div>
        </div>
      </Section>

      {/* Contact */}
      <Section title="Contact Info" onSave={() => saveKey("contact", contact)}>
        <Input
          label="Email Address"
          value={contact.email}
          onChange={(v) => setContact({ ...contact, email: v })}
        />
        <Input
          label="Phone Number"
          value={contact.phone}
          onChange={(v) => setContact({ ...contact, phone: v })}
        />
        <Input
          label="Office / Studio Address"
          value={contact.address}
          onChange={(v) => setContact({ ...contact, address: v })}
        />
        <Input
          label="Contact Page Tagline"
          value={contact.tagline}
          onChange={(v) => setContact({ ...contact, tagline: v })}
          textarea
        />
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

        <div className="mt-6 pt-6 border-t border-cocoa/10">
          <h3 className="text-sm font-bold uppercase tracking-widest text-cocoa/40 mb-4">
            Social Media Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Facebook URL"
              value={footer.socials?.facebook || ""}
              onChange={(v) =>
                setFooter({ ...footer, socials: { ...footer.socials, facebook: v } })
              }
            />
            <Input
              label="Instagram URL"
              value={footer.socials?.instagram || ""}
              onChange={(v) =>
                setFooter({ ...footer, socials: { ...footer.socials, instagram: v } })
              }
            />
            <Input
              label="Twitter / X URL"
              value={footer.socials?.twitter || ""}
              onChange={(v) =>
                setFooter({ ...footer, socials: { ...footer.socials, twitter: v } })
              }
            />
            <Input
              label="YouTube URL"
              value={footer.socials?.youtube || ""}
              onChange={(v) =>
                setFooter({ ...footer, socials: { ...footer.socials, youtube: v } })
              }
            />
          </div>
        </div>
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
