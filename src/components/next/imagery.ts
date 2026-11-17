/**
 * Photography for the /next homepage concept, from Unsplash (free to use under
 * the Unsplash License, no credit required). Served straight from Unsplash's
 * image CDN, resized per device by the loader in ./photo.tsx, so phones never
 * download full-size originals. Swap any of these for Brand House's own shoots
 * once they exist.
 */
export type Photo = { src: string; alt: string };

const u = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop`;

export const photos = {
  // What we make (services)
  productOrange: { src: u("1627384113858-ce93ff568d1f"), alt: "Branded cosmetics bottles and boxes styled on a warm orange set" },
  filmCrew: { src: u("1605501492805-f5699f0718d5"), alt: "Camera operator filming under orange set lights" },
  studioDesk: { src: u("1637856794303-d864ce316444"), alt: "Two designers working side by side on laptops" },
  campaignCans: { src: u("1767721810784-7b01688581e5"), alt: "Two red drink cans with bold packaging on a pink backdrop" },

  // Why Brand House
  crewNairobi: { src: u("1761853142468-c6ff2267a517"), alt: "Three creatives in Nairobi setting up a camera on a tripod for a shoot" },

  // Hero reel
  skincare: { src: u("1643923323719-d066883d65ef"), alt: "Smiling woman at a table with a skincare brand's jars and bottle" },
  dropper: { src: u("1781344116880-029945a42b75"), alt: "Amber dropper bottle with a blank label on a stone plinth" },
  braids: { src: u("1721602328195-2be4556180eb"), alt: "Studio portrait of a woman with braids in a glossy jacket" },
  yellowBlazer: { src: u("1657034068237-2d9ad4ac7769"), alt: "Woman in a mustard blazer scrolling on her phone against a yellow wall" },
  leafCrown: { src: u("1593351799227-75df2026356b"), alt: "Beauty portrait of a woman wearing a crown of green leaves" },
  afro: { src: u("1713845784497-fe3d7ed176d8"), alt: "Portrait of a woman with an afro, cowrie necklace and statement earrings" },
  coffeeHandover: { src: u("1672854825732-bd5c6e73eb54"), alt: "A branded coffee pouch handed over a cafe counter" },
  mintPhone: { src: u("1619040086134-0a900298a333"), alt: "Woman with curly hair holding a mint green phone to her cheek" },
  carpenter: { src: u("1687422810663-c316494f725a"), alt: "Smiling carpenter at work in his wood workshop" },

  // More than creative
  boardroom: { src: u("1653566031535-bcf33e1c2893"), alt: "Three colleagues in a company boardroom talking through a project on their laptops" },
  shopOwner: { src: u("1687422808311-a776f467a468"), alt: "Shop owner smiling behind the counter of her general store" },
  planningWall: { src: u("1588856122867-363b0aa7f598"), alt: "Man studying a wall of yellow sticky notes on a blue board" },
  vendorPhone: { src: u("1687422808248-f807f4ea2a2e"), alt: "Smiling food vendor checking an order on his phone" },

  // Formats
  sneakers: { src: u("1785302733993-64af4bc6dc4a"), alt: "Hand holding a pair of orange sneakers against a yellow backdrop" },
  coffeeBag: { src: u("1593084264959-d8297ea0725c"), alt: "Kraft coffee bag with a clean typographic label on a shelf" },
  kente: { src: u("1709809081557-78f803ce93a0"), alt: "Model in a bright patterned dress seated among woven baskets" },
  selfie: { src: u("1621552866397-9a3d8e466496"), alt: "Laughing woman taking a selfie in front of a colourful mural" },
  editorial: { src: u("1531123897727-8f129e1688ce"), alt: "Editorial portrait of a woman in a patterned top and white collar" },
  plinth: { src: u("1778521157912-620fd0d3c6e1"), alt: "Sneakers lit on wooden plinths in a dark studio" },
} satisfies Record<string, Photo>;

/** One image per division, by service slug. */
export const servicePhotos: Record<string, Photo> = {
  branding: photos.productOrange,
  "video-production": photos.filmCrew,
  "web-development": photos.studioDesk,
  "digital-marketing": photos.campaignCans,
};

/** Facts in the intro, one photo each (cycles if there are more facts). */
export const factPhotos: Photo[] = [photos.boardroom, photos.planningWall, photos.vendorPhone, photos.shopOwner];
