/**
 * Web app manifest for the admin. Installing from any /admin page (Add to Home
 * Screen on iPhone, Install on Android/desktop) opens the admin, not the website.
 */
export function GET() {
  const manifest = {
    id: "/admin",
    name: "Brand House Admin",
    short_name: "BH Admin",
    description: "Manage the Brand House website: homepage, work, services, enquiries and team.",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0d0d0f",
    theme_color: "#0d0d0f",
    categories: ["business", "productivity"],
    icons: [
      { src: "/admin/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/admin/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/admin/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Enquiries", url: "/admin/enquiries", icons: [{ src: "/admin/icon-192.png", sizes: "192x192" }] },
      { name: "Add a project", url: "/admin/work/new", icons: [{ src: "/admin/icon-192.png", sizes: "192x192" }] },
      { name: "Homepage", url: "/admin/homepage", icons: [{ src: "/admin/icon-192.png", sizes: "192x192" }] },
    ],
  };
  return new Response(JSON.stringify(manifest), {
    headers: { "Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=3600" },
  });
}
