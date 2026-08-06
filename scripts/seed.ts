import { connectDB } from "../src/lib/db";
import { Category, Product, Look, HeroSection, User, NavItem, Review, StoreSetting } from "../src/models";
import bcryptjs from "bcryptjs";

async function seed() {
  await connectDB();
  console.log("Connected to MongoDB");

  const cloudinaryUrls: Record<string, string> = {
    "navy_embroidered_panjabi": "https://res.cloudinary.com/efroakkc/image/upload/v1785776731/zfr-products/dikrostxwhlsrksdv5ly.jpg",
    "emerald_festive_panjabi": "https://res.cloudinary.com/efroakkc/image/upload/v1785776735/zfr-products/fwpbuydbqif78u49e2dr.jpg",
    "maroon_silk_panjabi": "https://res.cloudinary.com/efroakkc/image/upload/v1785776739/zfr-products/aychgo8euiprtvwmbzn4.jpg",
    "black_designer_panjabi": "https://res.cloudinary.com/efroakkc/image/upload/v1785776742/zfr-products/uvuagatn2gswhht0wtow.jpg",
    "emerald_green_linen_shirt": "https://res.cloudinary.com/efroakkc/image/upload/v1785776745/zfr-products/ke4i087myzhbe9tz5ztb.jpg",
    "navy_white_stripe_shirt": "https://res.cloudinary.com/efroakkc/image/upload/v1785776747/zfr-products/kmgshokcdafgwvqidwc4.jpg",
    "burgundy_floral_panjabi": "https://res.cloudinary.com/efroakkc/image/upload/v1785776750/zfr-products/a21zww9mav7etncddjcr.jpg",
    "white_embroidered_panjabi": "https://res.cloudinary.com/efroakkc/image/upload/v1785776754/zfr-products/wrdcuaoqczg4xqqn95vw.jpg",
    "chocolate_brown_shirt": "https://res.cloudinary.com/efroakkc/image/upload/v1785776759/zfr-products/b73btg98nngmsyqgvmmh.jpg",
    "rusty_orange_shirt": "https://res.cloudinary.com/efroakkc/image/upload/v1785776762/zfr-products/utvgjpx8odryikosagsa.jpg",
    "sand_beige_shirt": "https://res.cloudinary.com/efroakkc/image/upload/v1785776764/zfr-products/an0fhi7tvycftc8qt6el.jpg",
    "dark_plum_shirt": "https://res.cloudinary.com/efroakkc/image/upload/v1785776766/zfr-products/ygymi9es8l4og7d26eoo.jpg",
    "black_check_shirt": "https://res.cloudinary.com/efroakkc/image/upload/v1785776767/zfr-products/zrivdlpgxcexvbdchcaj.jpg",
    "crimson_red_plaid_shirt": "https://res.cloudinary.com/efroakkc/image/upload/v1785776769/zfr-products/lon68bhgmnpyyzzkucm2.jpg",
    "charcoal_grey_pant": "https://res.cloudinary.com/efroakkc/image/upload/v1785776770/zfr-products/n8gq3f86vlzeirxmwyev.jpg",
    "off_white_panjabi": "https://res.cloudinary.com/efroakkc/image/upload/v1785776772/zfr-products/ob44jln1ulrtok777won.jpg",
    "togetherness_banner": "https://res.cloudinary.com/efroakkc/image/upload/v1785776775/zfr-products/x5iiyahtguc3u01qgp3s.jpg"
  };

  const img = (key: string, fallback: string) => cloudinaryUrls[key] || fallback;

  // Clear existing data
  await Category.deleteMany({});
  await Product.deleteMany({});
  await Look.deleteMany({});
  await HeroSection.deleteMany({});
  await User.deleteMany({});
  await NavItem.deleteMany({});
  await Review.deleteMany({});
  await StoreSetting.deleteMany({});
  console.log("Cleared existing data");

  // ===== CATEGORIES (MEN ONLY) =====
  const manClothing = await Category.create({ name: "Clothing", slug: "clothing-man", gender: "man", image: "/images/categories/clothing.jpg", sortOrder: 1 });
  const manPanjabi = await Category.create({ name: "Panjabi", slug: "panjabi-man", parentId: manClothing._id, gender: "man", image: "/images/categories/panjabi.jpg", sortOrder: 1 });
  const manShirts = await Category.create({ name: "Shirts", slug: "shirts-man", parentId: manClothing._id, gender: "man", image: "/images/categories/shirts.jpg", sortOrder: 2 });
  const manPants = await Category.create({ name: "Pant", slug: "pant-man", parentId: manClothing._id, gender: "man", image: "/images/categories/pants.jpg", sortOrder: 3 });
  const manTshirts = await Category.create({ name: "T-shirts", slug: "t-shirts-man", parentId: manClothing._id, gender: "man", image: "/images/categories/tshirts.jpg", sortOrder: 4 });
  const manTrousers = await Category.create({ name: "Trousers", slug: "trousers-man", parentId: manClothing._id, gender: "man", image: "/images/categories/trousers.jpg", sortOrder: 5 });
  const manJeans = await Category.create({ name: "Jeans", slug: "jeans-man", parentId: manClothing._id, gender: "man", image: "/images/categories/jeans.jpg", sortOrder: 6 });
  const manShoes = await Category.create({ name: "Shoes", slug: "shoes-man", gender: "man", image: "/images/categories/shoes.jpg", sortOrder: 7 });
  const manAccessories = await Category.create({ name: "Accessories", slug: "accessories-man", gender: "man", image: "/images/categories/accessories.jpg", sortOrder: 8 });

  console.log("Categories seeded");

  // ===== PRODUCTS =====
  const productsData = [
    {
      name: "Chocolate Brown Double Pocket Premium Shirt",
      slug: "chocolate-brown-double-pocket-premium-shirt",
      sku: "ARJO-SH-001",
      description: "A premium chocolate brown shirt featuring double chest pockets, button-down front, and lightweight textured summer fabric.",
      price: 1790,
      gender: "man",
      categoryIds: [manClothing._id, manShirts._id],
      images: ["/images/products/chocolate_brown_shirt.jpg"],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 50,
      sizes: [{ name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      colors: [{ name: "Chocolate Brown", hex: "#3D2314", image: "/images/products/chocolate_brown_shirt.jpg" }]
    },
    {
      name: "Rusty Orange Double Pocket Premium Shirt",
      slug: "rusty-orange-double-pocket-premium-shirt",
      sku: "ARJO-SH-002",
      description: "A premium rusty orange shirt featuring double chest pockets, button-down front, and lightweight textured summer fabric.",
      price: 1790,
      gender: "man",
      categoryIds: [manClothing._id, manShirts._id],
      images: ["/images/products/rusty_orange_shirt.jpg"],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 40,
      sizes: [{ name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      colors: [{ name: "Rusty Orange", hex: "#C05A32", image: "/images/products/rusty_orange_shirt.jpg" }]
    },
    {
      name: "Sand Beige With Light Brown And White Stripes Shirt",
      slug: "sand-beige-with-light-brown-and-white-stripes-shirt",
      sku: "ARJO-SH-003",
      description: "A lightweight casual shirt in sand beige color featuring vertical light brown and white stripes.",
      price: 1590,
      gender: "man",
      categoryIds: [manClothing._id, manShirts._id],
      images: ["/images/products/sand_beige_shirt.jpg"],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 30,
      sizes: [{ name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      colors: [{ name: "Sand Beige Striped", hex: "#D4C5B9", image: "/images/products/sand_beige_shirt.jpg" }]
    },
    {
      name: "Dark Plum With White Pinstripes Shirt",
      slug: "dark-plum-with-white-pinstripes-shirt",
      sku: "ARJO-SH-004",
      description: "A sophisticated long-sleeve shirt in dark plum with subtle white vertical pinstripe details.",
      price: 1790,
      gender: "man",
      categoryIds: [manClothing._id, manShirts._id],
      images: ["/images/products/dark_plum_shirt.jpg"],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 35,
      sizes: [{ name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      colors: [{ name: "Dark Plum", hex: "#4C2B36", image: "/images/products/dark_plum_shirt.jpg" }]
    },
    {
      name: "Black With Brown And Beige Windowpane Check Pattern Shirt",
      slug: "black-with-brown-and-beige-windowpane-check-pattern-shirt",
      sku: "ARJO-SH-005",
      description: "A stylish black button-down shirt featuring a brown and beige windowpane check pattern.",
      price: 1790,
      gender: "man",
      categoryIds: [manClothing._id, manShirts._id],
      images: ["/images/products/black_check_shirt.jpg"],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 45,
      sizes: [{ name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      colors: [{ name: "Black Check", hex: "#1A1A1A", image: "/images/products/black_check_shirt.jpg" }]
    },
    {
      name: "Crimson Red with White Plaid Double Pocket Premium Shirt",
      slug: "crimson-red-with-white-plaid-double-pocket-premium-shirt",
      sku: "ARJO-SH-006",
      description: "A premium crimson red and white plaid checkered long sleeve shirt with double chest pockets.",
      price: 1790,
      gender: "man",
      categoryIds: [manClothing._id, manShirts._id],
      images: ["/images/products/crimson_red_plaid_shirt.jpg"],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 25,
      sizes: [{ name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      colors: [{ name: "Crimson Red Plaid", hex: "#8A1C24", image: "/images/products/crimson_red_plaid_shirt.jpg" }]
    },
    {
      name: "Classic Charcoal Grey Pleated Pant",
      slug: "classic-charcoal-grey-pleated-pant",
      sku: "ARJO-PT-001",
      description: "Premium pleated trouser pant in charcoal grey, ideal for smart-casual wear.",
      price: 1990,
      gender: "man",
      categoryIds: [manClothing._id, manPants._id],
      images: ["/images/products/charcoal_grey_pant.jpg"],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 40,
      sizes: [{ name: "30", inStock: true }, { name: "32", inStock: true }, { name: "34", inStock: true }, { name: "36", inStock: true }],
      colors: [{ name: "Charcoal Grey", hex: "#4A4A4A", image: "/images/products/charcoal_grey_pant.jpg" }]
    },
    {
      name: "Off-White Premium Linen Panjabi",
      slug: "off-white-premium-linen-panjabi",
      sku: "ARJO-PJ-001",
      description: "Traditional premium off-white linen Panjabi for men, featuring delicate embroidery on the collar.",
      price: 2490,
      gender: "man",
      categoryIds: [manClothing._id, manPanjabi._id],
      images: ["/images/products/off_white_panjabi.jpg"],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 30,
      sizes: [{ name: "40", inStock: true }, { name: "42", inStock: true }, { name: "44", inStock: true }],
      colors: [{ name: "Off-White", hex: "#F5F3E9", image: "/images/products/off_white_panjabi.jpg" }]
    }
  ];

  const seededProducts = await Product.insertMany(productsData);
  console.log("Products seeded");

  // ===== REVIEWS (For rating stars) =====
  // Chocolate Brown: 5 stars
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

  const reviewsData = [];
  for (const p of seededProducts) {
    reviewsData.push(
      { productId: p._id, userId: adminUser._id, userName: "Sakib A.", rating: 5, comment: "Exquisite fit and fabric quality!" },
      { productId: p._id, userId: adminUser._id, userName: "Miraz H.", rating: 5, comment: "Highly recommended." }
    );
  }

  await Review.insertMany(reviewsData);
  console.log("Reviews seeded");

  // ===== HERO SECTIONS =====
  const heroSections = [
    {
      title: "ROYAL ELEGANCE",
      subtitle: "Discover our latest high-fashion Panjabi and shirt collection crafted with distinction.",
      image: img("navy_embroidered_panjabi", "/images/togetherness_banner.jpg"),
      leftImage: img("navy_embroidered_panjabi", "/images/navy_embroidered_panjabi.jpg"),
      rightImage: img("emerald_festive_panjabi", "/images/emerald_festive_panjabi.jpg"),
      ctaText: "EXPLORE PANJABI COLLECTION",
      ctaLink: "/man/panjabi-man",
      gender: "man",
      isActive: true,
      sortOrder: 1
    }
  ];

  await HeroSection.insertMany(heroSections);
  console.log("Hero sections seeded");

  // ===== STORE SETTINGS =====
  await StoreSetting.create([
    { key: "trending_section_position", value: "below-products" },
    { key: "whatsapp_number", value: "8801616764344" },
    { key: "contact_phone", value: "+880 1616-764344" },
    { key: "contact_email", value: "zfr3611@gmail.com" },
    { key: "instagram_url", value: "https://www.instagram.com/zfr.official_?igsh=aHl3dmxrNDlhbXZv" },
    { key: "facebook_url", value: "https://www.facebook.com/share/1BDhJYeRCu/" },
  ]);
  console.log("Store settings seeded");

  // ===== NAV ITEMS =====
  const navItems = [
    { label: "Man", href: "/man", position: "header-main", sortOrder: 1, isActive: true },
    { label: "Woman", href: "/woman", position: "header-main", sortOrder: 2, isActive: true },
    { label: "Kids", href: "/kids", position: "header-main", sortOrder: 3, isActive: true },
  ];
  await NavItem.insertMany(navItems);
  console.log("Nav items seeded");

  console.log("\nSeed complete!");
  process.exit(0);
}

if (require.main === module) {
  seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
}

export { seed };
