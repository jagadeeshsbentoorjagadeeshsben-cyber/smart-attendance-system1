"use client";

/* eslint-disable @next/next/no-img-element */
import { useProfile } from "./profile-provider";
import { User } from "lucide-react";

export interface ProfileAvatarProps {
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProfileAvatar({
  name = "Student",
  size = "md",
  className = "",
}: ProfileAvatarProps) {
  const { profile } = useProfile();

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const photo = profile?.photo || profile?.avatarUrl;

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-border shadow-sm ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-royal/10 text-royal font-bold border-2 border-royal/20 shadow-sm ${className}`}
    >
      {initials || <User className="h-4 w-4" />}
    </div>
  );
}
