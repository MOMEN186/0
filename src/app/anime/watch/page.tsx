"use client";
import React from "react";
import VideoPlayerSection from "./video-player-section";
import Advertisement from "@/components/common/advertisement";

const page = () => {
  return (
    <>
      <Advertisement adSlot="top_banner" adFormat="banner728x90" className="mt-5" />
      <VideoPlayerSection />
      <Advertisement adSlot="bottom_banner" adFormat="banner468x60" className="mb-5" />
    </>
  );
};

export default page;

