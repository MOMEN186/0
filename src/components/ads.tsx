"use client";

import { useEffect } from "react";

const Advertisement = ({ position, className }: { position?: string; className?: string }) => {
  useEffect(() => {
    if (document.getElementById("cls-ads")) return;

    const js = document.createElement("script");
    js.id = "cls-ads";
    js.src = "https://fpyf8.com/88/tag.min.js";
    js.setAttribute("data-zone", "152715");

    const fjs = document.getElementsByTagName("script")[0];
    fjs.parentNode?.insertBefore(js, fjs);
  }, []);

  return (
    <div className={`w-full min-h-[90px] relative overflow-hidden ${className || ""}`}>
      <div id="container-152715"></div>
    </div>
  );
};

export default Advertisement;
