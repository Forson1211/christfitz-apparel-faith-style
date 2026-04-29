import { createFileRoute } from "@tanstack/react-router";
import { useSite } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/content")({
  component: AdminContent,
});

function AdminContent() {
  const { settings, refresh } = useSite();
  const [hero, setHero] = useState(settings.hero);
  const [about, setAbout] = useState(settings.about);
  const [footer, setFooter] = useState(settings.footer);
  const [brand, setBrand] = useState(settings.brand);

  useEffect(() => { setHero(settings.hero); setAbout(settings.about); setFooter(settings.footer); setBrand(settings.brand); }, [settings]);

  const saveKey = async (key: string, value: any) => {
    const { error } = await supabase.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) return toast.error(error.message);
    toast.success("Saved");
    refresh();
  };

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl">Site Content</h1>

      <Section title="Brand" onSave={() => saveKey("brand", brand)}>
        <Input label="Brand name" value={brand.name} onChange={(v) => setBrand({ ...brand, name: v })} />
        <Input label="Tagline" value={brand.tagline} onChange={(v) => setBrand({ ...brand, tagline: v })} />
      </Section>

      <Section title="Hero" onSave={() => saveKey("hero", hero)}>
        <Input label="Eyebrow" value={hero.eyebrow} onChange={(v) => setHero({ ...hero, eyebrow: v })} />
        <Input label="Title" value={hero.title} onChange={(v) => setHero({ ...hero, title: v })} />
        <Input label="Title accent" value={hero.titleAccent} onChange={(v) => setHero({ ...hero, titleAccent: v })} />
        <Input label="Subtitle" value={hero.subtitle} onChange={(v) => setHero({ ...hero, subtitle: v })} textarea />
        <Input label="Primary CTA" value={hero.primaryCta} onChange={(v) => setHero({ ...hero, primaryCta: v })} />
        <Input label="Secondary CTA" value={hero.secondaryCta} onChange={(v) => setHero({ ...hero, secondaryCta: v })} />
      </Section>

      <Section title="About" onSave={() => saveKey("about", about)}>
        <Input label="Eyebrow" value={about.eyebrow} onChange={(v) => setAbout({ ...about, eyebrow: v })} />
        <Input label="Title" value={about.title} onChange={(v) => setAbout({ ...about, title: v })} />
        <Input label="Body" value={about.body} onChange={(v) => setAbout({ ...about, body: v })} textarea />
      </Section>

      <Section title="Footer" onSave={() => saveKey("footer", footer)}>
        <Input label="Text" value={footer.text} onChange={(v) => setFooter({ ...footer, text: v })} textarea />
        <Input label="Copyright" value={footer.copyright} onChange={(v) => setFooter({ ...footer, copyright: v })} />
      </Section>
    </div>
  );
}

function Section({ title, onSave, children }: any) {
  return (
    <div className="rounded-3xl glass p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">{title}</h2>
        <button onClick={onSave} className="rounded-full bg-cocoa px-5 py-2 text-sm text-cream hover:bg-coffee">Save</button>
      </div>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  const cls = "w-full rounded-2xl border border-cocoa/15 bg-cream/60 px-4 py-2.5 outline-none focus:border-coffee";
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-cocoa/60">{label}</label>
      <div className="mt-1.5">
        {textarea
          ? <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className={cls} />
          : <input value={value} onChange={(e) => onChange(e.target.value)} className={cls} />}
      </div>
    </div>
  );
}
