import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.statement,
    start_url: "/",
    display: "browser",
    background_color: "#111111",
    theme_color: "#111111",
    icons: [
      { src: "/brand/brand-house-icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/brand-house-icon-dark.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
