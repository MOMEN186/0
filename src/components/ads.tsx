"use client";

import { useEffect } from "react";

type AdvertisementProps = {
  position?: string; // Can be used for analytics or custom behavior
  className?: string;
};

const Advertisement = ({ position, className }: AdvertisementProps) => {
  useEffect(() => {
    // Prevent duplicate script injections
    if (document.getElementById("cls-ads")) return;

    const script = document.createElement("script");
    script.id = "cls-ads";
    script.src = "https://fpyf8.com/88/tag.min.js";
    script.async = true;
    script.setAttribute("data-zone", "152715");

    document.body.appendChild(script);
  }, []);

  return (
    <div
      className={`w-full min-h-[90px] relative overflow-hidden ${className || ""}`}
      data-ad-position={position || ""}
    >
      <div id="container-152715" />
    </div>
  );
};

export default Advertisement;
