import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { Copy, Trash2, Upload, ImageIcon } from "lucide-react";
import { useContent } from "@/hooks/useContent";

export const Route = createFileRoute("/admin/media")({
  component: AdminMedia,
});

function AdminMedia() {
  const { items, loading, saveToDb, deleteItem } = useContent();
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Upload handler (extends existing logic) ────────────────────────────
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    toast.info("Uploading…");

    const ext = file.name.split(".").pop() ?? "bin";
    const filePath = `uploads/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

    // 1. Upload to Supabase Storage
    const { error: storageError } = await supabase.storage
      .from("site-assets")
      .upload(filePath, file);

    if (storageError) {
      toast.error("Upload failed: " + storageError.message);
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // 2. Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("site-assets").getPublicUrl(filePath);

    // 3. Insert into content table — returns the row for instant UI update
    const inserted = await saveToDb({
      name: file.name,
      url: publicUrl,
      filePath,
      type: file.type.startsWith("image") ? "image" : "video",
      category: "media_library",
      metadata: { size: file.size, mime: file.type },
    });

    if (inserted) {
      toast.success(`"${file.name}" uploaded and saved!`);
    } else {
      // Storage succeeded but DB failed — still show partial success
      toast.warning("File uploaded but not saved to database.");
    }

    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ── Delete handler ─────────────────────────────────────────────────────
  const handleDelete = async (item: (typeof items)[0]) => {
    if (!confirm(`Delete "${item.name}" permanently?`)) return;
    const ok = await deleteItem(item.id);
    if (ok) toast.success(`"${item.name}" deleted`);
  };

  // ── Copy URL ───────────────────────────────────────────────────────────
  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Media Library</h1>
          <p className="mt-1 text-sm text-cocoa/50">
            {items.length} file{items.length !== 1 ? "s" : ""} · synced live from database
          </p>
        </div>
        <label
          className={`cursor-pointer rounded-full bg-cocoa px-6 py-2.5 text-sm text-cream hover:bg-coffee transition flex items-center gap-2 ${
            busy ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <Upload className="h-4 w-4" />
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*"
            onChange={handleUpload}
            disabled={busy}
          />
          {busy ? "Uploading…" : "Upload Media"}
        </label>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-2xl bg-cocoa/5 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 rounded-3xl border-2 border-dashed border-cocoa/10">
          <ImageIcon className="h-12 w-12 text-cocoa/20" />
          <p className="text-cocoa/40 text-sm">No media in database yet. Upload your first file!</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-2xl glass overflow-hidden aspect-square"
            >
              {item.type === "video" ? (
                <video src={item.url} className="h-full w-full object-cover" muted playsInline />
              ) : (
                <img
                  src={item.url}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-cocoa/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                <button
                  onClick={() => copyUrl(item.url)}
                  className="flex items-center gap-2 text-xs bg-cream/20 hover:bg-cream/30 text-cream px-3 py-1.5 rounded-full backdrop-blur-md w-full justify-center transition"
                >
                  <Copy className="h-3 w-3" /> Copy URL
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="flex items-center gap-1.5 text-[10px] text-cream/60 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3 w-3" /> Delete Forever
                </button>
              </div>

              {/* Name bar */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-cocoa/80 to-transparent">
                <p className="text-[10px] text-cream truncate">{item.name}</p>
                <p className="text-[9px] text-cream/50 truncate capitalize">{item.category}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
