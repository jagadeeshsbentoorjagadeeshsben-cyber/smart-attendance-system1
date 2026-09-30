"use client";

import { useState } from "react";
import { useProfile } from "./profile-provider";
import { ProfileAvatar } from "./profile-avatar";
import { Camera, Check, Upload } from "lucide-react";

export function AvatarUploader({ name }: { name?: string }) {
  const { profile, updateAvatar } = useProfile();
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setSaving(true);
    try {
      await updateAvatar(url.trim());
      setSuccess(true);
      setUrl("");
      setIsOpen(false);
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      // error handled
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === "string") {
        setSaving(true);
        try {
          await updateAvatar(reader.result);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 2000);
        } catch {
          // error handled
        } finally {
          setSaving(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        <ProfileAvatar name={name} size="lg" />
        <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          <Camera className="h-5 w-5" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-[11px] font-medium text-royal hover:underline flex items-center gap-1"
      >
        <Upload className="h-3 w-3" />
        <span>Change photo URL</span>
      </button>

      {isOpen && (
        <form onSubmit={handleSave} className="flex gap-2 w-full max-w-xs animate-fade-in">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste image URL (https://...)"
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-royal"
          />
          <button
            type="submit"
            disabled={saving || !url.trim()}
            className="flex items-center gap-1 rounded-lg bg-royal px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-royal/90 disabled:opacity-50"
          >
            {success ? <Check className="h-3 w-3" /> : <span>Save</span>}
          </button>
        </form>
      )}
    </div>
  );
}
