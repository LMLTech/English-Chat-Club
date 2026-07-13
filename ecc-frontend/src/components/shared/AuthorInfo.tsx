"use client";

import { useEffect, useState } from "react";
import { profileService } from "@/features/profile/profileService";
import { UserProfileResponse } from "@/features/profile/profileService";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface AuthorInfoProps {
  authorId: number;
  createdAt: Date;
}

export default function AuthorInfo({ authorId, createdAt }: AuthorInfoProps) {
  const [author, setAuthor] = useState<UserProfileResponse | null>(null);

  useEffect(() => {
    if (authorId) {
      profileService.getProfileById(authorId)
        .then(setAuthor)
        .catch(console.error);
    }
  }, [authorId]);

  const initial = author?.fullName ? author.fullName[0].toUpperCase() : "U";
  const displayName = author?.fullName || "Người dùng";

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8 flex-shrink-0">
        <div 
          className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/60 to-blue-500/60 flex items-center justify-center text-xs font-bold text-white overflow-hidden"
          style={author?.avatarFrame ? { border: `2px solid ${author.avatarFrame}` } : {}}
        >
          {author?.avatarUrl ? (
            <img src={author.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            initial
          )}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-foreground">{displayName}</p>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="w-2.5 h-2.5" />
          <span className="text-[10px]">
            {formatDistanceToNow(createdAt, { addSuffix: true, locale: vi })}
          </span>
        </div>
      </div>
    </div>
  );
}
