import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tour Korea",
    short_name: "Tour Korea",
    description:
      "Explore Korea's best attractions, restaurants, accommodations, and more on an interactive map",
    start_url: "/ko",
    display: "standalone",
    theme_color: "#003049",
    background_color: "#ffffff",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
