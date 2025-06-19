import React from "react";
import { DiscordLogoIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import Advertisement from "@/components/ads";

const Footer = () => {
  return (
    <footer className="w-full bg-base-300 shadow-xl p-5 flex flex-col items-center space-y-5">
      <Advertisement position="bottom" className="mb-4" />
      <Image src="/icon.png" alt="logo" width="100" height="100" />
      <div className="flex space-x-5 items-center">
        <a href="https://discord.gg/jEqxrAmUZ4" target="_blank">
          <DiscordLogoIcon width="25" height="25" />
        </a>
      </div>
      <p className="text-sm text-gray-300">
        4RB ANIME does not store any files on the server, we only link to the
        media which is hosted on 3rd party services.
      </p>
      <p className="text-sm text-gray-300">&copy; 4RB ANIME</p>
    </footer>
  );
};

export default Footer;
