import { createFileRoute } from "@tanstack/react-router";
import { useSite, resolveImage } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Upload, RefreshCw, Instagram, Image as ImageIcon, Trash2 } from "lucide-react";
import { useContent, type ContentItem } from "@/hooks/useContent";
import { motion } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// ImageUpload Component
// ─────────────────────────────────────────────────────────────────────────────
interface ImageUploadProps {
  onUpload: (url: string) => void;
  onContentItem?: (item: ContentItem) => void;
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

    const localUrl = URL.createObjectURL(file);
    onUpload(localUrl);

    const { error: storageError } = await supabase.storage
      .from("site-assets")
      .upload(filePath, file);

    if (storageError) {
      toast.error("Upload failed: " + storageError.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("site-assets").getPublicUrl(filePath);

    const inserted = await saveToDb({
      name: file.name,
      url: publicUrl,
      filePath,
      type: file.type.startsWith("image") ? "image" : "video",
      category,
      metadata: { size: file.size, mime: file.type },
    });

    URL.revokeObjectURL(localUrl);
    onUpload(publicUrl);
    if (inserted && onContentItem) onContentItem(inserted);

    setUploading(false);
    toast.success("Image uploaded!");
  };

  return (
    <label className="cursor-pointer shrink-0">
      <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
      <div className={`grid h-12 w-12 place-items-center rounded-xl border border-dashed border-cocoa/30 hover:bg-cocoa/5 transition ${uploading ? "animate-pulse" : ""}`}>
        <Upload className="h-4 w-4 text-cocoa/40" />
      </div>
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Route
// ─────────────────────────────────────────────────────────────────────────────
export const Route = createFileRoute("/admin/gallery")({
  component: AdminGallery,
});

function AdminGallery() {
  const { settings, refresh } = useSite();
  const instagramContent = useContent("instagram");
  const [instagram, setInstagram] = useState(settings.instagram || { handle: "", title: "", cta: "", url: "", images: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings.instagram) setInstagram(settings.instagram);
  }, [settings]);

  const saveKey = async (key: string, value: any) => {
    const { error } = await supabase.rpc("save_site_setting", {
      p_key: key,
      p_value: value,
    });
    if (error) {
      toast.error("Save failed: " + error.message);
      return;
    }
    toast.success("Saved Successfully");
    refresh();
  };

  return (
    <div className="space-y-8 pb-20">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[10px] uppercase tracking-[0.3em] text-coffee font-bold">— Site Visuals</p>
        <div className="flex items-center justify-between mt-1">
          <h1 className="font-display text-4xl font-bold">Gallery Management</h1>
          <button
            onClick={() => {
              instagramContent.clearCache();
              instagramContent.fetchItems(false, true);
            }}
            className="text-xs px-4 py-2 rounded-full border border-cocoa/20 hover:bg-cocoa/5 text-cocoa/60 transition flex items-center gap-2"
          >
            <RefreshCw className={`h-3 w-3 ${instagramContent.loading ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your Instagram feed and movement gallery images.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-3xl glass p-6 border border-white/40 shadow-sm space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <Instagram className="h-5 w-5 text-cocoa" />
              <h2 className="font-display text-xl font-bold">Feed Info</h2>
            </div>
            
            <div>
              <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold">Handle</label>
              <input 
                value={instagram.handle} 
                onChange={(e) => setInstagram({ ...instagram, handle: e.target.value })}
                className="w-full mt-1.5 rounded-xl border border-cocoa/10 bg-white/50 px-4 py-2.5 outline-none focus:border-cocoa/30"
                placeholder="@christfitz"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold">Section Title</label>
              <input 
                value={instagram.title} 
                onChange={(e) => setInstagram({ ...instagram, title: e.target.value })}
                className="w-full mt-1.5 rounded-xl border border-cocoa/10 bg-white/50 px-4 py-2.5 outline-none focus:border-cocoa/30"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold">Button Text</label>
              <input 
                value={instagram.cta} 
                onChange={(e) => setInstagram({ ...instagram, cta: e.target.value })}
                className="w-full mt-1.5 rounded-xl border border-cocoa/10 bg-white/50 px-4 py-2.5 outline-none focus:border-cocoa/30"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-cocoa/50 font-bold">Instagram URL</label>
              <input 
                value={instagram.url} 
                onChange={(e) => setInstagram({ ...instagram, url: e.target.value })}
                className="w-full mt-1.5 rounded-xl border border-cocoa/10 bg-white/50 px-4 py-2.5 outline-none focus:border-cocoa/30"
              />
            </div>
            
            <button
              onClick={() => saveKey("instagram", instagram)}
              className="w-full mt-4 rounded-xl bg-cocoa text-cream py-3 text-sm font-bold hover:bg-coffee transition-all shadow-sm"
            >
              Save Settings
            </button>
          </div>
        </div>

        {/* Grid Management */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl glass p-6 border border-white/40 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-cocoa" />
                <h2 className="font-display text-xl font-bold">Movement Gallery</h2>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-cocoa/40 font-bold">
                8 Custom Slots
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 auto-rows-[120px] sm:auto-rows-[160px]">
              {(() => {
                // 1. Get all items and sort by position
                const allItems = [...instagramContent.items].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
                
                // 2. Identify highest position to know where to add the next one
                const maxPos = allItems.length > 0 ? Math.max(...allItems.map(i => i.position ?? 0)) : -1;

                return (
                  <>
                    {allItems.map((liveItem, i) => {
                      const displayUrl = liveItem?.url || "";
                      const isSlotLoading = instagramContent.loading && !displayUrl;
                      const pos = liveItem.position ?? i;
                      // Cyclical span logic for consistent bento feel
                      const spanClass = pos % 8 === 0 || pos % 8 === 3 ? "row-span-2 col-span-1" : "col-span-1";

                      return (
                        <motion.div
                          key={liveItem.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className={`group relative overflow-hidden rounded-2xl bg-cocoa/5 border border-cocoa/10 flex items-center justify-center ${spanClass}`}
                        >
                          {isSlotLoading ? (
                            <div className="absolute inset-0 bg-cocoa/10 animate-pulse" />
                          ) : displayUrl ? (
                            <img
                              src={resolveImage(displayUrl)}
                              alt=""
                              className="absolute inset-0 h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-cocoa/10">
                              <Upload className="h-6 w-6" />
                            </div>
                          )}

                          <div className="relative z-10 scale-90 sm:scale-100 bg-white/90 hover:bg-white backdrop-blur-md rounded-full shadow-lg transition-all duration-300 p-1 flex items-center gap-1">
                            <ImageUpload
                              category="instagram"
                              saveToDb={(params) =>
                                instagramContent.saveToDb({
                                  ...params,
                                  existingId: liveItem?.id,
                                  position: pos,
                                })
                              }
                              onUpload={async (url) => {
                                instagramContent.setItems((prev: any) => {
                                  const next = [...prev];
                                  const idx = next.findIndex((x: any) => x.id === liveItem.id);
                                  if (idx !== -1) next[idx] = { ...next[idx], url };
                                  return next;
                                });
                              }}
                              onContentItem={() => instagramContent.fetchItems(false, true)}
                            />
                            <button 
                              onClick={async () => {
                                if(!confirm("Delete this image?")) return;
                                const { error } = await supabase.from('content').delete().eq('id', liveItem.id);
                                if(error) toast.error(error.message);
                                else {
                                  toast.success("Image removed");
                                  instagramContent.fetchItems(false, true);
                                }
                              }}
                              className="h-10 w-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-full transition"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
                            <span className="text-[8px] font-bold uppercase tracking-wider bg-cocoa/80 text-cream px-1.5 py-0.5 rounded backdrop-blur-sm shadow-sm">
                              Pos {pos}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}

                    {/* Add New Image Slot */}
                    <div className="col-span-1 h-full min-h-[120px] rounded-2xl border-2 border-dashed border-cocoa/10 flex flex-col items-center justify-center p-4 hover:bg-cocoa/5 transition group">
                      <ImageUpload 
                        category="instagram"
                        saveToDb={(params) => 
                          instagramContent.saveToDb({
                            ...params,
                            position: maxPos + 1
                          })
                        }
                        onUpload={() => {}}
                        onContentItem={() => instagramContent.fetchItems(false, true)}
                      />
                      <p className="mt-2 text-[10px] uppercase tracking-widest text-cocoa/30 font-bold group-hover:text-cocoa/50">Add Image</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
