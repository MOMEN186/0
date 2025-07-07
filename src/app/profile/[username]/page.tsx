"use client";

import React, { useEffect, useState } from "react";
import Container from "@/components/container";
import Avatar from "@/components/common/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CoverImage from "@/assets/cover.png";
import AnimeLists from "./components/anime-lists";
import AnimeHeatmap from "./components/anime-heatmap";
import AnilistImport from "./components/anilist-import";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { uploadAvatar } from "@/lib/firebase/fileUpload";

function ProfilePage() {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<ReturnType<typeof getAuth>["currentUser"] | null>(null);
  const [loading, setLoading] = useState(true); // ✅ add loading state
  useEffect(() => { console.log(user) }, [user]);
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false); // ✅ update loading after auth check
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!loading && user === null) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading) return <>Loading...</>; // ✅ show loading while waiting for auth

  if (!user) return null; // if still null after loading, return null (redirecting)

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadAvatar(file);
  };

  return (
    <>
      <div className="w-full h-48 md:h-64 lg:h-72 relative">
        <Image
          src={CoverImage.src}
          alt={"cover"}
          fill
          className="object-cover"
          priority
          placeholder="blur"
          blurDataURL={CoverImage.blurDataURL}
        />
      </div>
      <Container className="min-h-[70vh] mt-10 flex flex-col md:flex-row justify-around gap-8 md:gap-4">
        <div className="flex flex-col items-center gap-5 w-full md:w-1/3">
          <Avatar
            className="w-[150px] h-[150px] cursor-pointer"
            username={user.displayName || "user"}
            url={user.photoURL || ""}
            id={user.uid}
            onClick={() => fileInputRef.current?.click()}
          />
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
          <h2 className="text-xl">@{user.displayName}</h2>
        </div>
        <div className="w-full md:w-2/3">
          <div className="w-full">
            <div className="float-right flex gap-2 items-center mb-2">
              <p className="text-sm text-gray-500">Import:</p>
              <AnilistImport />
            </div>
            <Tabs defaultValue="watching" className="w-full">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-5">
                <TabsTrigger value="watching">Watching</TabsTrigger>
                <TabsTrigger value="plan-to-watch">Plan To Watch</TabsTrigger>
                <TabsTrigger value="on-hold">On Hold</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="dropped">Dropped</TabsTrigger>
              </TabsList>

              <TabsContent value="watching" className="mt-4">
                <AnimeLists status="watching" />
              </TabsContent>
              <TabsContent value="plan-to-watch" className="mt-4">
                <AnimeLists status="plan to watch" />
              </TabsContent>
              <TabsContent value="on-hold" className="mt-4">
                <AnimeLists status="on hold" />
              </TabsContent>
              <TabsContent value="completed" className="mt-4">
                <AnimeLists status="completed" />
              </TabsContent>
              <TabsContent value="dropped" className="mt-4">
                <AnimeLists status="dropped" />
              </TabsContent>
            </Tabs>
          </div>
          <div className="my-20">
            <AnimeHeatmap />
          </div>
        </div>
      </Container>
    </>
  );
}

export default ProfilePage;
