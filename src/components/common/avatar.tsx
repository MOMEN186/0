"use client";

import React, { useEffect, useState } from "react";
import {
  Avatar as AvatarCN,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase/firebase"; // adjust path if needed

type Props = {
  url?: string; // filename, e.g., "avatar.jpg"
  username?: string;
  id?: string; // user ID
  className?: string;
  onClick?: () => void;
};

function Avatar({ url, username, id, className, onClick }: Props) {
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();

  useEffect(() => {
    const loadAvatar = async () => {
      if (!id || !url) return;
  
      if (url.startsWith("http")) {
        setAvatarUrl(url); // External Google avatar, no need to use Storage
        return;
      }
  
      try {
        const storage = getStorage(app);
        const avatarRef = ref(storage, `avatars/${id}/${url}`);
        const downloadUrl = await getDownloadURL(avatarRef);
        setAvatarUrl(downloadUrl);
      } catch (err) {
        console.error("Failed to load avatar:", err);
      }
    };
  
    loadAvatar();
  }, [id, url]);
  return (
    <AvatarCN className={className} onClick={onClick}>
      <AvatarImage src={avatarUrl} alt={username} />
      <AvatarFallback>
        {username?.charAt(0).toUpperCase()}
        {username?.charAt(1)?.toLowerCase()}
      </AvatarFallback>
    </AvatarCN>
  );
}

export default Avatar;
