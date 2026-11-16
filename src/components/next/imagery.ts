/**
 * Photography for the /next homepage concept, from Unsplash (free to use under
 * the Unsplash License). Served from Unsplash's CDN as their guidelines ask,
 * and credited in the page footer note. Swap any of these for Brand House's
 * own shoots in the admin once they exist.
 */
export type Photo = { src: string; alt: string; credit: string; profile: string; width: number; height: number };

const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80`;

export const photos = {
  skincare: {
    src: u("1643923323719-d066883d65ef"),
    alt: "Smiling woman at a table with a skincare brand's jars and bottle, shot in a bright studio",
    credit: "Kaeme",
    profile: "https://unsplash.com/@hellokaeme",
    width: 6240,
    height: 4160,
  },
  productOrange: {
    src: u("1627384113858-ce93ff568d1f"),
    alt: "Branded cosmetics bottles and boxes styled on a warm orange set",
    credit: "pmv chamara",
    profile: "https://unsplash.com/@pmvch",
    width: 5460,
    height: 3642,
  },
  filmCrew: {
    src: u("1605501492805-f5699f0718d5"),
    alt: "Camera operator filming under orange set lights",
    credit: "Osarugue Igbinoba",
    profile: "https://unsplash.com/@osarugue",
    width: 6000,
    height: 4000,
  },
  crewNairobi: {
    src: u("1761853142468-c6ff2267a517"),
    alt: "Three creatives in Nairobi setting up a camera on a tripod for a shoot",
    credit: "Dwayne joe",
    profile: "https://unsplash.com/@spliff_dj_joe",
    width: 3936,
    height: 2624,
  },
  studioDesk: {
    src: u("1637856794303-d864ce316444"),
    alt: "Two designers working side by side on laptops",
    credit: "Francis Odeyemi",
    profile: "https://unsplash.com/@cutinamoment",
    width: 4032,
    height: 3024,
  },
  campaignCans: {
    src: u("1767721810784-7b01688581e5"),
    alt: "Two red drink cans with bold packaging on a pink backdrop",
    credit: "Cali",
    profile: "https://unsplash.com/@cryingmilkshake",
    width: 6000,
    height: 4500,
  },
  dropper: {
    src: u("1781344116880-029945a42b75"),
    alt: "Amber dropper bottle with a blank label on a stone plinth",
    credit: "Avtar Singh",
    profile: "https://unsplash.com/@avtar9w",
    width: 3000,
    height: 2000,
  },
  portrait: {
    src: u("1721602328195-2be4556180eb"),
    alt: "Studio portrait of a woman with braids in a glossy jacket",
    credit: "Stephen Tettey Atsu",
    profile: "https://unsplash.com/@atsu_tettey",
    width: 4877,
    height: 3902,
  },
} satisfies Record<string, Photo>;

/** One image per division, by service slug. */
export const servicePhotos: Record<string, Photo> = {
  branding: photos.productOrange,
  "video-production": photos.filmCrew,
  "web-development": photos.studioDesk,
  "digital-marketing": photos.campaignCans,
};
