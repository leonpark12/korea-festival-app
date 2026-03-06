import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: "%s | Tour Korea",
    default: "Tour Korea",
  },
  description:
    "Explore Korea's best attractions, restaurants, accommodations, and more on an interactive map",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
