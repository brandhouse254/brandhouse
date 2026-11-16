import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Brand House Admin" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  // The admin is its own installable app: it opens on /admin, not the website.
  manifest: "/admin/manifest.webmanifest",
  applicationName: "Brand House Admin",
  appleWebApp: { capable: true, title: "BH Admin", statusBarStyle: "black-translucent" },
  icons: {
    icon: [{ url: "/admin/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/admin/apple-touch-icon.png", sizes: "180x180" }],
  },
  formatDetection: { telephone: false, email: false, address: false },
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0f",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-theme min-h-svh antialiased">{children}</div>;
}
