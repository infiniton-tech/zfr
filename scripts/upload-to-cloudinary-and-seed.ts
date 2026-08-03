import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

// Load environment variables from .env.local if not present
const envLocalPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
  const envConfig = fs.readFileSync(envLocalPath, "utf-8");
  envConfig.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const equalsIdx = trimmed.indexOf("=");
      if (equalsIdx !== -1) {
        const key = trimmed.substring(0, equalsIdx).trim();
        const value = trimmed.substring(equalsIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI is not set!");
  process.exit(1);
}

const brainDir = "/home/lamizubi/.gemini/antigravity-cli/brain/8485d52b-fa5d-45cc-9120-5f6a768d436e";
const publicImagesDir = path.join(process.cwd(), "public", "images");

// Generated Men's fashion product images
const generatedImageFiles = [
  { name: "navy_embroidered_panjabi", filename: "navy_embroidered_panjabi_1785776307085.jpg" },
  { name: "emerald_festive_panjabi", filename: "emerald_festive_panjabi_1785776325724.jpg" },
  { name: "maroon_silk_panjabi", filename: "maroon_silk_panjabi_1785776344773.jpg" },
  { name: "black_designer_panjabi", filename: "black_designer_panjabi_1785776363494.jpg" },
  { name: "emerald_green_linen_shirt", filename: "emerald_green_linen_shirt_1785776382834.jpg" },
  { name: "navy_white_stripe_shirt", filename: "navy_white_stripe_shirt_1785776403851.jpg" },
  { name: "burgundy_floral_panjabi", filename: "burgundy_floral_panjabi_1785776425988.jpg" },
  { name: "white_embroidered_panjabi", filename: "white_embroidered_panjabi_1785776447709.jpg" },
];

async function uploadFileToCloudinary(filePath: string, folder = "zfr-products"): Promise<string> {
  console.log(`Uploading ${filePath} to Cloudinary...`);
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    overwrite: true,
    resource_type: "image",
  });
  console.log(`Uploaded! URL: ${result.secure_url}`);
  return result.secure_url;
}

async function run() {
  console.log("Starting Men-Only Cloudinary upload and MongoDB seed script...");

  if (!fs.existsSync(publicImagesDir)) {
    fs.mkdirSync(publicImagesDir, { recursive: true });
  }

  const cloudinaryUrls: Record<string, string> = {};

  // Upload Men's generated images
  for (const item of generatedImageFiles) {
    const srcPath = path.join(brainDir, item.filename);
    const destPath = path.join(publicImagesDir, `${item.name}.jpg`);

    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      const url = await uploadFileToCloudinary(destPath, "zfr-products");
      cloudinaryUrls[item.name] = url;
    } else if (fs.existsSync(destPath)) {
      const url = await uploadFileToCloudinary(destPath, "zfr-products");
      cloudinaryUrls[item.name] = url;
    }
  }

  // Upload existing Men's public images
  const existingImages = [
    "chocolate_brown_shirt.jpg",
    "rusty_orange_shirt.jpg",
    "sand_beige_shirt.jpg",
    "dark_plum_shirt.jpg",
    "black_check_shirt.jpg",
    "crimson_red_plaid_shirt.jpg",
    "charcoal_grey_pant.jpg",
    "off_white_panjabi.jpg",
    "togetherness_banner.jpg",
    "1.jpeg",
    "2.jpeg",
    "3.jpeg",
    "4.jpeg"
  ];

  for (const imgName of existingImages) {
    const imgPath = path.join(publicImagesDir, imgName);
    if (fs.existsSync(imgPath)) {
      const key = imgName.replace(/\.[^/.]+$/, "");
      const url = await uploadFileToCloudinary(imgPath, "zfr-products");
      cloudinaryUrls[key] = url;
    }
  }

  // Connect to DB
  console.log("\nConnecting to MongoDB...");
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected to MongoDB!");

  // Import models
  const { Category, Product, HeroSection, User, NavItem, Review, StoreSetting, TrendingItem } = await import("../src/models");
  const bcryptjs = (await import("bcryptjs")).default;

  // Clear ALL existing collections to completely purge non-men data
  await Category.deleteMany({});
  await Product.deleteMany({});
  await HeroSection.deleteMany({});
  await User.deleteMany({});
  await NavItem.deleteMany({});
  await Review.deleteMany({});
  await StoreSetting.deleteMany({});
  await TrendingItem.deleteMany({});
  console.log("Cleared all existing DB data for clean Men-Only store setup");

  // ===== CATEGORIES (MEN ONLY - 8 MAIN SUBCATEGORIES) =====
  const manClothing = await Category.create({ name: "Clothing", slug: "clothing-man", gender: "man", sortOrder: 1 });
  const manPanjabi = await Category.create({ name: "Panjabi", slug: "panjabi-man", parentId: manClothing._id, gender: "man", sortOrder: 1 });
  const manShirts = await Category.create({ name: "Shirts", slug: "shirts-man", parentId: manClothing._id, gender: "man", sortOrder: 2 });
  const manPants = await Category.create({ name: "Pant", slug: "pant-man", parentId: manClothing._id, gender: "man", sortOrder: 3 });
  const manTshirts = await Category.create({ name: "T-shirts", slug: "t-shirts-man", parentId: manClothing._id, gender: "man", sortOrder: 4 });
  const manTrousers = await Category.create({ name: "Trousers", slug: "trousers-man", parentId: manClothing._id, gender: "man", sortOrder: 5 });
  const manJeans = await Category.create({ name: "Jeans", slug: "jeans-man", parentId: manClothing._id, gender: "man", sortOrder: 6 });
  const manShoes = await Category.create({ name: "Shoes", slug: "shoes-man", parentId: manClothing._id, gender: "man", sortOrder: 7 });
  const manAccessories = await Category.create({ name: "Accessories", slug: "accessories-man", parentId: manClothing._id, gender: "man", sortOrder: 8 });

  console.log("Men Categories Seeded");

  const img = (key: string, fallback: string) => cloudinaryUrls[key] || fallback;

  // ===== MEN PRODUCTS DATA (FOR ALL 8 CATEGORIES) =====
  const productsData = [
    // --- 1. PANJABIS ---
    {
      name: "Royal Navy Embroidered Silk Panjabi",
      slug: "royal-navy-embroidered-silk-panjabi",
      sku: "ZFR-PJ-001",
      description: "Exquisite royal navy blue Panjabi tailored from premium silk-cotton blend. Features intricate silver geometric embroidery along the mandarin collar and front placket.",
      shortDescription: "Royal navy silk Panjabi with silver neck embroidery",
      price: 3490,
      compareAtPrice: 3990,
      gender: "man",
      categoryIds: [manClothing._id, manPanjabi._id],
      images: [img("navy_embroidered_panjabi", "/images/navy_embroidered_panjabi.jpg")],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 45,
      sizes: [{ name: "38", inStock: true }, { name: "40", inStock: true }, { name: "42", inStock: true }, { name: "44", inStock: true }],
      colors: [{ name: "Royal Navy", hex: "#1A2B4C", image: img("navy_embroidered_panjabi", "/images/navy_embroidered_panjabi.jpg") }],
      materials: ["Silk-Cotton Blend"],
      careInstructions: "Dry clean only",
      tags: ["panjabi", "embroidered", "festive", "ethnic", "navy"]
    },
    {
      name: "Emerald Green Gold Embroidered Festive Panjabi",
      slug: "emerald-green-gold-embroidered-festive-panjabi",
      sku: "ZFR-PJ-002",
      description: "Luxurious festive Panjabi crafted in vibrant emerald green with ornate gold thread embroidery on the collar, placket, and sleeve cuffs.",
      shortDescription: "Emerald green festive Panjabi with gold Zari embroidery",
      price: 3890,
      compareAtPrice: 4490,
      gender: "man",
      categoryIds: [manClothing._id, manPanjabi._id],
      images: [img("emerald_festive_panjabi", "/images/emerald_festive_panjabi.jpg")],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 40,
      sizes: [{ name: "38", inStock: true }, { name: "40", inStock: true }, { name: "42", inStock: true }, { name: "44", inStock: true }],
      colors: [{ name: "Emerald Green", hex: "#006847", image: img("emerald_festive_panjabi", "/images/emerald_festive_panjabi.jpg") }],
      materials: ["Cotton-Silk Blend"],
      careInstructions: "Dry clean only",
      tags: ["panjabi", "festive", "gold embroidery", "emerald", "ethnic"]
    },
    {
      name: "Deep Maroon Burgundy Raw Silk Panjabi",
      slug: "deep-maroon-burgundy-raw-silk-panjabi",
      sku: "ZFR-PJ-003",
      description: "Classic deep maroon red raw silk Panjabi with a rich textured weave, antique brass buttons, and a clean minimalist mandarin collar.",
      shortDescription: "Deep maroon raw silk Panjabi with brass buttons",
      price: 3290,
      gender: "man",
      categoryIds: [manClothing._id, manPanjabi._id],
      images: [img("maroon_silk_panjabi", "/images/maroon_silk_panjabi.jpg")],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 35,
      sizes: [{ name: "40", inStock: true }, { name: "42", inStock: true }, { name: "44", inStock: true }],
      colors: [{ name: "Deep Maroon", hex: "#5B1424", image: img("maroon_silk_panjabi", "/images/maroon_silk_panjabi.jpg") }],
      materials: ["Raw Silk"],
      careInstructions: "Dry clean recommended",
      tags: ["panjabi", "silk", "maroon", "minimalist"]
    },
    {
      name: "Jet Black Tone-on-Tone Designer Panjabi",
      slug: "jet-black-tone-on-tone-designer-panjabi",
      sku: "ZFR-PJ-004",
      description: "Sophisticated jet black designer Panjabi featuring detailed black thread embroidery on the collar and cuffs for a subtle modern look.",
      shortDescription: "Jet black Panjabi with tonal embroidery",
      price: 3190,
      gender: "man",
      categoryIds: [manClothing._id, manPanjabi._id],
      images: [img("black_designer_panjabi", "/images/black_designer_panjabi.jpg")],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 50,
      sizes: [{ name: "38", inStock: true }, { name: "40", inStock: true }, { name: "42", inStock: true }, { name: "44", inStock: true }],
      colors: [{ name: "Jet Black", hex: "#111111", image: img("black_designer_panjabi", "/images/black_designer_panjabi.jpg") }],
      materials: ["100% Premium Fine Cotton"],
      careInstructions: "Hand wash or gentle machine wash",
      tags: ["panjabi", "black", "designer", "modern"]
    },
    {
      name: "Burgundy Jacquard Floral Weave Panjabi",
      slug: "burgundy-jacquard-floral-weave-panjabi",
      sku: "ZFR-PJ-005",
      description: "Elegant burgundy maroon Panjabi with a subtle Jacquard floral texture, neck embroidery, and custom dark horn buttons.",
      shortDescription: "Burgundy Jacquard floral Panjabi",
      price: 3590,
      gender: "man",
      categoryIds: [manClothing._id, manPanjabi._id],
      images: [img("burgundy_floral_panjabi", "/images/burgundy_floral_panjabi.jpg")],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 30,
      sizes: [{ name: "38", inStock: true }, { name: "40", inStock: true }, { name: "42", inStock: true }],
      colors: [{ name: "Burgundy Jacquard", hex: "#6E1D2D", image: img("burgundy_floral_panjabi", "/images/burgundy_floral_panjabi.jpg") }]
    },
    {
      name: "Off-White Pristine Linen Embroidered Panjabi",
      slug: "off-white-pristine-linen-embroidered-panjabi",
      sku: "ZFR-PJ-006",
      description: "Pristine off-white breathable linen-cotton Panjabi with delicate tone-on-tone white embroidery on the placket and collar.",
      shortDescription: "Pristine off-white linen Panjabi",
      price: 2890,
      compareAtPrice: 3200,
      gender: "man",
      categoryIds: [manClothing._id, manPanjabi._id],
      images: [img("white_embroidered_panjabi", "/images/white_embroidered_panjabi.jpg")],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 40,
      sizes: [{ name: "38", inStock: true }, { name: "40", inStock: true }, { name: "42", inStock: true }, { name: "44", inStock: true }],
      colors: [{ name: "Off White", hex: "#F8F6F0", image: img("white_embroidered_panjabi", "/images/white_embroidered_panjabi.jpg") }]
    },

    // --- 2. SHIRTS ---
    {
      name: "Premium Emerald Green Linen Casual Shirt",
      slug: "premium-emerald-green-linen-casual-shirt",
      sku: "ZFR-SH-001",
      description: "Tailored from 100% natural breathable European linen, this emerald green button-down shirt offers relaxed luxury for any warm-weather occasion.",
      shortDescription: "100% European linen emerald green shirt",
      price: 1990,
      compareAtPrice: 2290,
      gender: "man",
      categoryIds: [manClothing._id, manShirts._id],
      images: [img("emerald_green_linen_shirt", "/images/emerald_green_linen_shirt.jpg")],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 45,
      sizes: [{ name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      colors: [{ name: "Emerald Green", hex: "#006847", image: img("emerald_green_linen_shirt", "/images/emerald_green_linen_shirt.jpg") }]
    },
    {
      name: "Classic Navy & White Vertical Striped Shirt",
      slug: "classic-navy-white-vertical-striped-shirt",
      sku: "ZFR-SH-002",
      description: "A timeless long-sleeve cotton shirt featuring navy blue and white vertical stripes, spread collar, and mother-of-pearl buttons.",
      shortDescription: "Navy and white vertical striped cotton shirt",
      price: 1890,
      gender: "man",
      categoryIds: [manClothing._id, manShirts._id],
      images: [img("navy_white_stripe_shirt", "/images/navy_white_stripe_shirt.jpg")],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 50,
      sizes: [{ name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      colors: [{ name: "Navy/White Stripe", hex: "#1D2F4E", image: img("navy_white_stripe_shirt", "/images/navy_white_stripe_shirt.jpg") }]
    },
    {
      name: "Chocolate Brown Double Pocket Premium Shirt",
      slug: "chocolate-brown-double-pocket-premium-shirt",
      sku: "ZFR-SH-003",
      description: "A premium chocolate brown shirt featuring double chest pockets, button-down front, and lightweight textured summer fabric.",
      shortDescription: "Chocolate brown double pocket shirt",
      price: 1790,
      gender: "man",
      categoryIds: [manClothing._id, manShirts._id],
      images: [img("chocolate_brown_shirt", "/images/chocolate_brown_shirt.jpg")],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 50,
      sizes: [{ name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      colors: [{ name: "Chocolate Brown", hex: "#3D2314", image: img("chocolate_brown_shirt", "/images/chocolate_brown_shirt.jpg") }]
    },
    {
      name: "Rusty Orange Double Pocket Premium Shirt",
      slug: "rusty-orange-double-pocket-premium-shirt",
      sku: "ZFR-SH-004",
      description: "A premium rusty orange shirt featuring double chest pockets, button-down front, and lightweight textured summer fabric.",
      shortDescription: "Rusty orange double pocket shirt",
      price: 1790,
      gender: "man",
      categoryIds: [manClothing._id, manShirts._id],
      images: [img("rusty_orange_shirt", "/images/rusty_orange_shirt.jpg")],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 40,
      sizes: [{ name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      colors: [{ name: "Rusty Orange", hex: "#C05A32", image: img("rusty_orange_shirt", "/images/rusty_orange_shirt.jpg") }]
    },

    // --- 3. PANTS ---
    {
      name: "Classic Charcoal Grey Pleated Trouser Pant",
      slug: "classic-charcoal-grey-pleated-pant",
      sku: "ZFR-PT-001",
      description: "Premium pleated trouser pant in charcoal grey, ideal for smart-casual and formal wear.",
      shortDescription: "Classic charcoal grey pleated trouser",
      price: 1990,
      gender: "man",
      categoryIds: [manClothing._id, manPants._id],
      images: [img("charcoal_grey_pant", "/images/charcoal_grey_pant.jpg")],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 40,
      sizes: [{ name: "30", inStock: true }, { name: "32", inStock: true }, { name: "34", inStock: true }, { name: "36", inStock: true }],
      colors: [{ name: "Charcoal Grey", hex: "#4A4A4A", image: img("charcoal_grey_pant", "/images/charcoal_grey_pant.jpg") }]
    },

    // --- 4. T-SHIRTS ---
    {
      name: "Heavyweight Minimalist Cotton T-Shirt - Off White",
      slug: "heavyweight-minimalist-cotton-t-shirt-off-white",
      sku: "ZFR-TS-001",
      description: "Ultra-soft 240 GSM organic combed cotton relaxed fit crewneck T-shirt in pristine off-white.",
      shortDescription: "240 GSM heavy organic cotton crewneck tee",
      price: 990,
      gender: "man",
      categoryIds: [manClothing._id, manTshirts._id],
      images: [img("sand_beige_shirt", "/images/sand_beige_shirt.jpg")],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 60,
      sizes: [{ name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      colors: [{ name: "Off White", hex: "#FAF8F5", image: img("sand_beige_shirt", "/images/sand_beige_shirt.jpg") }]
    },
    {
      name: "Oversized Vintage Washed Black T-Shirt",
      slug: "oversized-vintage-washed-black-t-shirt",
      sku: "ZFR-TS-002",
      description: "Streetwear aesthetic oversized vintage washed black heavy cotton T-shirt.",
      shortDescription: "Oversized vintage washed black crewneck tee",
      price: 1190,
      gender: "man",
      categoryIds: [manClothing._id, manTshirts._id],
      images: [img("black_check_shirt", "/images/black_check_shirt.jpg")],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 50,
      sizes: [{ name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      colors: [{ name: "Washed Black", hex: "#222222", image: img("black_check_shirt", "/images/black_check_shirt.jpg") }]
    },

    // --- 5. TROUSERS ---
    {
      name: "Tailored Slim-Fit Stretch Chino Trouser - Olive",
      slug: "tailored-slim-fit-stretch-chino-trouser-olive",
      sku: "ZFR-TR-001",
      description: "Versatile stretch cotton twill chino trousers tailored for work and weekends.",
      shortDescription: "Tailored olive stretch cotton chino trousers",
      price: 2190,
      gender: "man",
      categoryIds: [manClothing._id, manTrousers._id],
      images: [img("charcoal_grey_pant", "/images/charcoal_grey_pant.jpg")],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 35,
      sizes: [{ name: "30", inStock: true }, { name: "32", inStock: true }, { name: "34", inStock: true }, { name: "36", inStock: true }],
      colors: [{ name: "Olive Green", hex: "#4B5320", image: img("charcoal_grey_pant", "/images/charcoal_grey_pant.jpg") }]
    },

    // --- 6. JEANS ---
    {
      name: "Classic Deep Indigo Slim-Fit Denim Jeans",
      slug: "classic-deep-indigo-slim-fit-denim-jeans",
      sku: "ZFR-JN-001",
      description: "Premium Japanese selvedge-inspired deep indigo stretch denim jeans with copper rivets.",
      shortDescription: "Deep indigo stretch denim slim jeans",
      price: 2490,
      gender: "man",
      categoryIds: [manClothing._id, manJeans._id],
      images: [img("navy_white_stripe_shirt", "/images/navy_white_stripe_shirt.jpg")],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 45,
      sizes: [{ name: "30", inStock: true }, { name: "32", inStock: true }, { name: "34", inStock: true }, { name: "36", inStock: true }],
      colors: [{ name: "Deep Indigo", hex: "#1A2B4C", image: img("navy_white_stripe_shirt", "/images/navy_white_stripe_shirt.jpg") }]
    },

    // --- 7. SHOES ---
    {
      name: "Handcrafted Dark Brown Leather Penny Loafers",
      slug: "handcrafted-dark-brown-leather-penny-loafers",
      sku: "ZFR-SHO-001",
      description: "Sophisticated full-grain calfskin leather penny loafers with cushioned footbed.",
      shortDescription: "Full-grain brown leather handcrafted loafers",
      price: 3990,
      gender: "man",
      categoryIds: [manClothing._id, manShoes._id],
      images: [img("chocolate_brown_shirt", "/images/chocolate_brown_shirt.jpg")],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 25,
      sizes: [{ name: "40", inStock: true }, { name: "41", inStock: true }, { name: "42", inStock: true }, { name: "43", inStock: true }],
      colors: [{ name: "Dark Brown", hex: "#3A2118", image: img("chocolate_brown_shirt", "/images/chocolate_brown_shirt.jpg") }]
    },

    // --- 8. ACCESSORIES ---
    {
      name: "Full-Grain Italian Leather Belt & Cardholder Gift Set",
      slug: "full-grain-italian-leather-belt-cardholder-set",
      sku: "ZFR-ACC-001",
      description: "Luxury dark brown leather belt with brushed gunmetal buckle and matching RFID cardholder.",
      shortDescription: "Italian leather belt and RFID cardholder set",
      price: 1890,
      gender: "man",
      categoryIds: [manClothing._id, manAccessories._id],
      images: [img("black_designer_panjabi", "/images/black_designer_panjabi.jpg")],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 30,
      sizes: [{ name: "One Size", inStock: true }],
      colors: [{ name: "Black/Gunmetal", hex: "#111111", image: img("black_designer_panjabi", "/images/black_designer_panjabi.jpg") }]
    }
  ];

  const seededProducts = await Product.insertMany(productsData);
  console.log(`Inserted ${seededProducts.length} Men Products across ALL 8 Categories!`);

  // ===== REVIEWS =====
  const adminEmail = process.env.ADMIN_EMAIL || "admin@zfr.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcryptjs.hash(adminPassword, 12);
  
  const adminUser = await User.create({
    email: adminEmail,
    passwordHash,
    name: "ZFR Admin",
    role: "admin",
    wishlist: [],
    addresses: [],
  });

  const reviewsList = [];
  for (const p of seededProducts) {
    reviewsList.push(
      { productId: p._id, userId: adminUser._id, userName: "Sakib A.", rating: 5, comment: "Exquisite fit and fabric quality!" },
      { productId: p._id, userId: adminUser._id, userName: "Miraz H.", rating: 5, comment: "Highly recommended." }
    );
  }
  await Review.insertMany(reviewsList);

  // ===== HERO SECTIONS (MEN ONLY) =====
  const heroSections = [
    {
      title: "ROYAL ELEGANCE",
      subtitle: "Discover our latest high-fashion Panjabi and shirt collection crafted with distinction.",
      image: img("navy_embroidered_panjabi", "/images/navy_embroidered_panjabi.jpg"),
      leftImage: img("navy_embroidered_panjabi", "/images/navy_embroidered_panjabi.jpg"),
      rightImage: img("emerald_festive_panjabi", "/images/emerald_festive_panjabi.jpg"),
      ctaText: "EXPLORE PANJABI COLLECTION",
      ctaLink: "/man/panjabi-man",
      gender: "man",
      isActive: true,
      sortOrder: 1
    },
    {
      title: "SUMMER LINEN & SHIRTS",
      subtitle: "Elevate your daily wardrobe with 100% European linen and tailored shirts.",
      image: img("emerald_green_linen_shirt", "/images/emerald_green_linen_shirt.jpg"),
      leftImage: img("emerald_green_linen_shirt", "/images/emerald_green_linen_shirt.jpg"),
      rightImage: img("navy_white_stripe_shirt", "/images/navy_white_stripe_shirt.jpg"),
      ctaText: "SHOP SHIRTS",
      ctaLink: "/man/shirts-man",
      gender: "man",
      isActive: true,
      sortOrder: 2
    }
  ];
  await HeroSection.insertMany(heroSections);

  // ===== TRENDING ITEMS (ALL 8 MEN CATEGORIES) =====
  const trendingItems = [
    {
      name: "PANJABI",
      image: img("navy_embroidered_panjabi", "/images/navy_embroidered_panjabi.jpg"),
      ctaLink: "/man/panjabi-man",
      gender: "man",
      isActive: true,
      sortOrder: 1
    },
    {
      name: "SHIRTS",
      image: img("emerald_green_linen_shirt", "/images/emerald_green_linen_shirt.jpg"),
      ctaLink: "/man/shirts-man",
      gender: "man",
      isActive: true,
      sortOrder: 2
    },
    {
      name: "PANTS",
      image: img("charcoal_grey_pant", "/images/charcoal_grey_pant.jpg"),
      ctaLink: "/man/pant-man",
      gender: "man",
      isActive: true,
      sortOrder: 3
    },
    {
      name: "T-SHIRTS",
      image: img("sand_beige_shirt", "/images/sand_beige_shirt.jpg"),
      ctaLink: "/man/t-shirts-man",
      gender: "man",
      isActive: true,
      sortOrder: 4
    },
    {
      name: "TROUSERS",
      image: img("charcoal_grey_pant", "/images/charcoal_grey_pant.jpg"),
      ctaLink: "/man/trousers-man",
      gender: "man",
      isActive: true,
      sortOrder: 5
    },
    {
      name: "JEANS",
      image: img("navy_white_stripe_shirt", "/images/navy_white_stripe_shirt.jpg"),
      ctaLink: "/man/jeans-man",
      gender: "man",
      isActive: true,
      sortOrder: 6
    },
    {
      name: "SHOES",
      image: img("chocolate_brown_shirt", "/images/chocolate_brown_shirt.jpg"),
      ctaLink: "/man/shoes-man",
      gender: "man",
      isActive: true,
      sortOrder: 7
    },
    {
      name: "ACCESSORIES",
      image: img("black_designer_panjabi", "/images/black_designer_panjabi.jpg"),
      ctaLink: "/man/accessories-man",
      gender: "man",
      isActive: true,
      sortOrder: 8
    }
  ];
  await TrendingItem.insertMany(trendingItems);

  // ===== STORE SETTINGS =====
  await StoreSetting.create([
    { key: "trending_section_position", value: "below-products" },
    { key: "whatsapp_number", value: "8801616764344" },
    { key: "contact_phone", value: "+880 1616-764344" },
    { key: "contact_email", value: "zfr3611@gmail.com" },
    { key: "instagram_url", value: "https://www.instagram.com/zfr.official_?igsh=aHl3dmxrNDlhbXZv" },
    { key: "facebook_url", value: "https://www.facebook.com/share/1BDhJYeRCu/" },
  ]);

  // ===== NAV ITEMS (MEN ONLY) =====
  const navItems = [
    { label: "Panjabi", href: "/man/panjabi-man", position: "header-main", sortOrder: 1, isActive: true },
    { label: "Shirts", href: "/man/shirts-man", position: "header-main", sortOrder: 2, isActive: true },
    { label: "Pants", href: "/man/pant-man", position: "header-main", sortOrder: 3, isActive: true },
  ];
  await NavItem.insertMany(navItems);

  console.log("\nMEN-ONLY STORE SEED COMPLETE WITH ALL 8 CATEGORIES!");
  process.exit(0);
}

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
