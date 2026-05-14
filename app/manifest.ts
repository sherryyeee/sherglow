import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SherGlow",
    short_name: "SherGlow",
    description: "Your daily AI companion — news, insights, and growth",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF8F6",
    theme_color: "#F28BA8",
    orientation: "portrait",
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
