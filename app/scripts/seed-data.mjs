// Catalog from the client's WhatsApp screenshots. Prices are SAMPLE placeholders.
// Details/features are DRAFTS written only from each product's name + description; the owner should review them in /admin.
// Sizes of the same item are variants of ONE product. A variant id = the old per-size product slug
// (so old carts/orders/images keep resolving); single-size products use their own slug as product id and variant id.
const slugify = (s) => s.toLowerCase().replace(/["”]/g, "in").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const CAT = "Adjustable Dog & Cat Collar";

// v(oldName, label, price): one size. Image is /products/<slug>.jpg
const v = (old, label, price, packSize = "") => ({ id: slugify(old), label, price, mrp: null, packSize, image: `/products/${slugify(old)}.jpg` });

// single(categoryId, name, description, price, details, features)
const single = (categoryId, name, description, price, details, features) => {
  const variant = v(name, "", price);
  return { id: variant.id, categoryId, name, description, details, features, variants: [variant] };
};
// group(id, categoryId, name, description, details, features, variants)
const group = (id, categoryId, name, description, details, features, variants) => ({ id, categoryId, name, description, details, features, variants });

const rawProducts = [
  single("cat-puppies", "10 MM Cat Collar Nunbell", "10 MM Nunbell Cat Collar with Bell, Adjustable", 45,
    "A 10 mm adjustable cat collar fitted with a bell, so you can hear where your cat is.", ["10 mm width", "Bell attached", "Adjustable fit"]),
  group("cushion-harness", "cat-puppies", "Cushion Harness", "Adjustable Soft Cushion Comfort Padded Vest Harness",
    "An adjustable vest-style harness with soft cushion padding for comfortable walks. Available in 10 mm and 15 mm widths.",
    ["Soft cushion padding", "Adjustable vest style", "Comfort fit"],
    [v("10 MM Cushion Harness", "10 MM", 85), v("15 MM Cushion Harness", "15 MM", 95)]),
  single("cat-puppies", "Cat Plain Harness", "Full Body Cat Harness with Leash Set for Walking", 110,
    "A full-body cat harness supplied with a leash, made for walking your cat.", ["Full body harness", "Leash included", "For walking"]),
  single("cat-puppies", "Cat Reflective Harness", "Full Body Cat Reflective Harness with Leash Set for Walking", 130,
    "A full-body cat harness with reflective detailing, supplied with a leash for walking.", ["Reflective", "Full body harness", "Leash included"]),
  single("cat-puppies", "10 MM Radium Collar", "Radium Glow in the Dark Soft Silicone Cat Collar", 55,
    "A soft silicone cat collar, 10 mm wide, with a radium glow-in-the-dark finish.", ["Glow in the dark", "Soft silicone", "10 mm width"]),
  single("cat-puppies", "10 MM TPU PVC Collar", "Cat, Kitten, Ferret and Rabbit extra small silicone pet collar", 50,
    "An extra small silicone pet collar for cats, kittens, ferrets and rabbits.", ["Extra small size", "Silicone", "10 mm width"]),
  single("cat-puppies", "10MM Reflective Collar", `${CAT} 10mm, Durable & Comfortable`, 60,
    "A durable and comfortable adjustable 10 mm collar with reflective detailing, for dogs and cats.", ["Reflective", "10 mm width", "Adjustable"]),
  single("cat-puppies", "10MM Reflective Set", `${CAT} and Leash 10mm, Durable`, 120,
    "A durable adjustable 10 mm collar and leash set for dogs and cats.", ["Collar and leash", "10 mm width", "Adjustable"]),
  single("cat-puppies", "10MM Reflective Harness Set", "Reflective harness set, 10 mm", 140,
    "A reflective 10 mm harness set.", ["Reflective", "10 mm width", "Harness set"]),

  group("cotton-collar", "dog-collar", "Cotton Collar", "Cotton Strong Collar - 100% Cotton - Soft in Neck",
    "A strong 100% cotton dog collar that is soft on the neck. Choose from four widths.",
    ["100% cotton", "Soft in neck", "Strong build"],
    [v(`Cotton Collar 3/4"`, `3/4"`, 95), v(`Cotton Collar 1"`, `1"`, 110), v(`Cotton Collar 1.25"`, `1.25"`, 125), v(`Cotton Collar 1.5"`, `1.5"`, 140)]),
  group("nylon-collar", "dog-collar", "Nylon Collar", "Adjustable Nylon Dog Collar with Heavy Duty D-Ring",
    "An adjustable nylon dog collar with a heavy duty D-ring. Choose from five widths.",
    ["Adjustable", "Nylon", "Heavy duty D-ring"],
    [v(`Nylon Collar 1/2"`, `1/2"`, 65), v(`Nylon Collar 3/4"`, `3/4"`, 80), v(`Nylon Collar 1"`, `1"`, 95), v(`Nylon Collar 1.25"`, `1.25"`, 110), v(`Nylon Collar 1.5"`, `1.5"`, 125)]),
  single("dog-collar", `Ny Collar IMP 3/4"`, "Adjustable Nylon IMP Dog Collar with Heavy Duty D-Ring", 90,
    "An adjustable 3/4 inch nylon IMP dog collar with a heavy duty D-ring.", ["Adjustable", "Nylon", "Heavy duty D-ring"]),
  single("dog-collar", "Tactical Collar-Large", "Metal Dog Collar for Training and Walks | Nylon Collar", 340,
    "A large tactical nylon dog collar with metal hardware, for training and walks.", ["Metal hardware", "Nylon", "Large size"]),

  group("nylon-body-belt", "dog-harness", "Nylon Body Belt", "Adjustable Dog Harness, No-Pull Heavy Duty Nylon",
    "An adjustable, no-pull dog harness in heavy duty nylon. Choose from three widths.",
    ["Adjustable", "No-pull design", "Heavy duty nylon"],
    [v(`Nylon Body belt 1/2"`, `1/2"`, 120), v(`Ny Body Belt 3/4"`, `3/4"`, 150), v(`Ny Body Belt 1"`, `1"`, 180)]),

  group("cotton-leash", "chain-rope-leash", "Cotton Leash", "Cotton Strong Leash Double with Strong Brass Hook",
    "A strong double cotton leash with a strong brass hook. Choose from three widths.",
    ["Strong cotton", "Double leash", "Brass hook"],
    [v(`Cotton Leash 3/4"`, `3/4"`, 130), v(`Cotton Leash 1"`, `1"`, 150), v(`Cotton Leash 1.25"`, `1.25"`, 170)]),
  single("chain-rope-leash", "Rope 6 MM Brass Hook", "Rope 5 Feet Dog Training Running Walking Leash", 120,
    "A 5 feet, 6 mm rope leash with a brass hook for dog training, running and walking.", ["5 feet length", "6 mm rope", "Brass hook"]),

  single("grooming", "Double Sided Comb", "Double Side Steel Needles Comb for Dogs and Cats", 140,
    "A double-sided grooming comb with steel needles, for dogs and cats.", ["Double sided", "Steel needles", "For dogs and cats"]),
  single("grooming", "Single Sided Comb", "Single-Row Stainless Steel Pet Grooming Comb", 110,
    "A single-row stainless steel grooming comb for pets.", ["Single row", "Stainless steel", "Pet grooming"]),
  single("grooming", "Flea Comb Large", "Flea Lice Comb, Stainless Steel Dog Cat Grooming Comb", 90,
    "A large stainless steel flea and lice comb for dogs and cats.", ["Stainless steel", "Flea and lice comb", "For dogs and cats"]),
  single("grooming", "Paw Cleaner-Large", "2-in-1 Portable Dog Paw Cleaner and Washer Cup", 290,
    "A large, portable 2-in-1 paw cleaner and washer cup for dogs.", ["2-in-1", "Portable", "Large size"]),

  single("treats", "Chicken 2 Kg", "Rawhide Munchey Chew Sticks Variety Pack – Chicken", 780,
    "A 2 kg variety pack of rawhide munchey chew sticks, chicken flavour.", ["2 kg pack", "Rawhide chew sticks", "Chicken flavour"]),
  single("treats", "Spiral 200 Gram Mutton", "Dog Spiral Munchey Rawhide Chew Stick | Mutton Flavour", 210,
    "A 200 g pack of spiral munchey rawhide chew sticks, mutton flavour.", ["200 g pack", "Spiral rawhide chew", "Mutton flavour"]),
  group("natural-rawhide-chews", "treats", "Natural Rawhide Chew Sticks", "Rawhide Munchey Chew Sticks Variety Pack – Natural",
    "Natural rawhide munchey chew sticks in a variety pack. Choose a 200 g or 800 g pack.",
    ["Rawhide chew sticks", "Natural", "Variety pack"],
    [v("Natural 200 Gram", "200 g", 160, "200 g"), v("Natural 800 Gram", "800 g", 520, "800 g")]),
  single("treats", `Bone 10" - 2 in 1`, "Rawhide Pressed Chew Bone for Dogs - Crunchy Calcium", 150,
    "A 10 inch, 2-in-1 pressed rawhide chew bone for dogs, with a crunchy calcium bite.", ["10 inch bone", "2 in 1", "Crunchy calcium"]),

  single("accessories", "Steel Bowl 0 no.", "Stainless Steel Pet Feeding Bowls for Dogs and Cats", 220,
    "A stainless steel feeding bowl for dogs and cats, size no. 0.", ["Stainless steel", "Size no. 0", "For dogs and cats"]),
  single("accessories", "E-collar no. 1", "Elizabethan collar for dogs, size no. 1", 130,
    "An Elizabethan (recovery) collar for dogs, size no. 1.", ["Elizabethan collar", "Size no. 1", "For dogs"]),
].map((x) => ({ ...x, images: x.variants.map((y) => y.image) }));

const rawCategories = [
  { id: "cat-puppies", slug: "cat-puppies", name: "Cat & Puppies" },
  { id: "dog-collar", slug: "dog-collar", name: "Dog Collar" },
  { id: "dog-harness", slug: "dog-harness", name: "Dog Harness" },
  { id: "chain-rope-leash", slug: "chain-rope-leash", name: "Chain, Rope & Leash" },
  { id: "grooming", slug: "grooming", name: "Grooming Products" },
  { id: "treats", slug: "treats", name: "Treats & Chews" },
  { id: "accessories", slug: "accessories", name: "Bowls & Accessories" },
];

// Old per-size product docs that were merged into groups above (removed by the seed).
const mergedOldIds = rawProducts.filter((x) => x.variants.length > 1).flatMap((x) => x.variants.map((y) => y.id));

export { rawProducts, rawCategories, mergedOldIds };
