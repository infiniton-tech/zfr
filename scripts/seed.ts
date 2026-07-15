import { connectDB } from "../src/lib/db";
import { Category, Product, Look, HeroSection, User, NavItem, Review, StoreSetting } from "../src/models";
import bcryptjs from "bcryptjs";

async function seed() {
  await connectDB();
  console.log("Connected to MongoDB");

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

  // ===== CATEGORIES =====
  const womanClothing = await Category.create({ name: "Clothing", slug: "clothing", gender: "woman", sortOrder: 1 });
  const womanShoes = await Category.create({ name: "Shoes", slug: "shoes", gender: "woman", sortOrder: 2 });
  const womanBags = await Category.create({ name: "Bags", slug: "bags", gender: "woman", sortOrder: 3 });
  const womanAccessories = await Category.create({ name: "Accessories", slug: "accessories", gender: "woman", sortOrder: 4 });

  const manClothing = await Category.create({ name: "Clothing", slug: "clothing-man", gender: "man", sortOrder: 1 });
  const manShoes = await Category.create({ name: "Shoes", slug: "shoes-man", gender: "man", sortOrder: 2 });
  const manAccessories = await Category.create({ name: "Accessories", slug: "accessories-man", gender: "man", sortOrder: 3 });

  const kidsClothing = await Category.create({ name: "Clothing", slug: "clothing-kids", gender: "kids", sortOrder: 1 });
  const kidsShoes = await Category.create({ name: "Shoes", slug: "shoes-kids", gender: "kids", sortOrder: 2 });

  // Woman clothing subcategories
  await Category.create([
    { name: "Total Look", slug: "total-look", parentId: womanClothing._id, gender: "woman", sortOrder: 1 },
    { name: "Dresses", slug: "dresses", parentId: womanClothing._id, gender: "woman", sortOrder: 2 },
    { name: "Tops | Bodysuits", slug: "tops-bodysuits", parentId: womanClothing._id, gender: "woman", sortOrder: 3 },
    { name: "T-shirts", slug: "t-shirts", parentId: womanClothing._id, gender: "woman", sortOrder: 4 },
    { name: "Shirts | Blouses", slug: "shirts-blouses", parentId: womanClothing._id, gender: "woman", sortOrder: 5 },
    { name: "Trousers", slug: "trousers", parentId: womanClothing._id, gender: "woman", sortOrder: 6 },
    { name: "Jeans", slug: "jeans", parentId: womanClothing._id, gender: "woman", sortOrder: 7 },
    { name: "Skirts", slug: "skirts", parentId: womanClothing._id, gender: "woman", sortOrder: 8 },
    { name: "Shorts", slug: "shorts", parentId: womanClothing._id, gender: "woman", sortOrder: 9 },
  ]);

  // Man subcategories
  const manShirts = await Category.create({ name: "Shirts", slug: "shirts-man", parentId: manClothing._id, gender: "man", sortOrder: 1 });
  const manPants = await Category.create({ name: "Pant", slug: "pant-man", parentId: manClothing._id, gender: "man", sortOrder: 2 });
  const manPanjabi = await Category.create({ name: "Panjabi", slug: "panjabi-man", parentId: manClothing._id, gender: "man", sortOrder: 3 });
  
  await Category.create([
    { name: "T-shirts", slug: "t-shirts-man", parentId: manClothing._id, gender: "man", sortOrder: 4 },
    { name: "Trousers", slug: "trousers-man", parentId: manClothing._id, gender: "man", sortOrder: 5 },
    { name: "Jeans", slug: "jeans-man", parentId: manClothing._id, gender: "man", sortOrder: 6 },
  ]);

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
      images: ["/images/chocolate_brown_shirt.jpg"],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 50,
      sizes: [{ name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      colors: [{ name: "Chocolate Brown", hex: "#3D2314", image: "/images/chocolate_brown_shirt.jpg" }]
    },
    {
      name: "Rusty Orange Double Pocket Premium Shirt",
      slug: "rusty-orange-double-pocket-premium-shirt",
      sku: "ARJO-SH-002",
      description: "A premium rusty orange shirt featuring double chest pockets, button-down front, and lightweight textured summer fabric.",
      price: 1790,
      gender: "man",
      categoryIds: [manClothing._id, manShirts._id],
      images: ["/images/rusty_orange_shirt.jpg"],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 40,
      sizes: [{ name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      colors: [{ name: "Rusty Orange", hex: "#C05A32", image: "/images/rusty_orange_shirt.jpg" }]
    },
    {
      name: "Sand Beige With Light Brown And White Stripes Shirt",
      slug: "sand-beige-with-light-brown-and-white-stripes-shirt",
      sku: "ARJO-SH-003",
      description: "A lightweight casual shirt in sand beige color featuring vertical light brown and white stripes.",
      price: 1590,
      gender: "man",
      categoryIds: [manClothing._id, manShirts._id],
      images: ["/images/sand_beige_shirt.jpg"],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 30,
      sizes: [{ name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      colors: [{ name: "Sand Beige Striped", hex: "#D4C5B9", image: "/images/sand_beige_shirt.jpg" }]
    },
    {
      name: "Dark Plum With White Pinstripes Shirt",
      slug: "dark-plum-with-white-pinstripes-shirt",
      sku: "ARJO-SH-004",
      description: "A sophisticated long-sleeve shirt in dark plum with subtle white vertical pinstripe details.",
      price: 1790,
      gender: "man",
      categoryIds: [manClothing._id, manShirts._id],
      images: ["/images/dark_plum_shirt.jpg"],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 35,
      sizes: [{ name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      colors: [{ name: "Dark Plum", hex: "#4C2B36", image: "/images/dark_plum_shirt.jpg" }]
    },
    {
      name: "Black With Brown And Beige Windowpane Check Pattern Shirt",
      slug: "black-with-brown-and-beige-windowpane-check-pattern-shirt",
      sku: "ARJO-SH-005",
      description: "A stylish black button-down shirt featuring a brown and beige windowpane check pattern.",
      price: 1790,
      gender: "man",
      categoryIds: [manClothing._id, manShirts._id],
      images: ["/images/black_check_shirt.jpg"],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 45,
      sizes: [{ name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      colors: [{ name: "Black Check", hex: "#1A1A1A", image: "/images/black_check_shirt.jpg" }]
    },
    {
      name: "Crimson Red with White Plaid Double Pocket Premium Shirt",
      slug: "crimson-red-with-white-plaid-double-pocket-premium-shirt",
      sku: "ARJO-SH-006",
      description: "A premium crimson red and white plaid checkered long sleeve shirt with double chest pockets.",
      price: 1790,
      gender: "man",
      categoryIds: [manClothing._id, manShirts._id],
      images: ["/images/crimson_red_plaid_shirt.jpg"],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 25,
      sizes: [{ name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      colors: [{ name: "Crimson Red Plaid", hex: "#8A1C24", image: "/images/crimson_red_plaid_shirt.jpg" }]
    },
    {
      name: "Classic Charcoal Grey Pleated Pant",
      slug: "classic-charcoal-grey-pleated-pant",
      sku: "ARJO-PT-001",
      description: "Premium pleated trouser pant in charcoal grey, ideal for smart-casual wear.",
      price: 1990,
      gender: "man",
      categoryIds: [manClothing._id, manPants._id],
      images: ["/images/charcoal_grey_pant.jpg"],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 40,
      sizes: [{ name: "30", inStock: true }, { name: "32", inStock: true }, { name: "34", inStock: true }, { name: "36", inStock: true }],
      colors: [{ name: "Charcoal Grey", hex: "#4A4A4A", image: "/images/charcoal_grey_pant.jpg" }]
    },
    {
      name: "Off-White Premium Linen Panjabi",
      slug: "off-white-premium-linen-panjabi",
      sku: "ARJO-PJ-001",
      description: "Traditional premium off-white linen Panjabi for men, featuring delicate embroidery on the collar.",
      price: 2490,
      gender: "man",
      categoryIds: [manClothing._id, manPanjabi._id],
      images: ["/images/off_white_panjabi.jpg"],
      isNewArrival: true,
      isTrending: true,
      stockQuantity: 30,
      sizes: [{ name: "40", inStock: true }, { name: "42", inStock: true }, { name: "44", inStock: true }],
      colors: [{ name: "Off-White", hex: "#F5F3E9", image: "/images/off_white_panjabi.jpg" }]
    }
  ];

  const seededProducts = await Product.insertMany(productsData);
  console.log("Products seeded");

  // ===== REVIEWS (For rating stars) =====
  // Chocolate Brown: 5 stars
  const prodChocolate = seededProducts.find(p => p.slug === "chocolate-brown-double-pocket-premium-shirt");
  // Rusty Orange: 5 stars
  const prodOrange = seededProducts.find(p => p.slug === "rusty-orange-double-pocket-premium-shirt");
  // Dark Plum: 5 stars
  const prodPlum = seededProducts.find(p => p.slug === "dark-plum-with-white-pinstripes-shirt");
  // Black Check: 1 star
  const prodBlackCheck = seededProducts.find(p => p.slug === "black-with-brown-and-beige-windowpane-check-pattern-shirt");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@zfr.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcryptjs.hash(adminPassword, 12);
  
  const adminUser = await User.create({
    email: adminEmail,
    passwordHash,
    name: "ARJO Admin",
    role: "admin",
    wishlist: [],
    addresses: [],
  });

  const reviewsData = [];
  if (prodChocolate) {
    reviewsData.push(
      { productId: prodChocolate._id, userId: adminUser._id, userName: "Sakib A.", rating: 5, comment: "Excellent fit and texture." },
      { productId: prodChocolate._id, userId: adminUser._id, userName: "Miraz H.", rating: 5, comment: "Very premium." }
    );
  }
  if (prodOrange) {
    reviewsData.push(
      { productId: prodOrange._id, userId: adminUser._id, userName: "Tanvir S.", rating: 5, comment: "Stunning color, highly recommended." }
    );
  }
  if (prodPlum) {
    reviewsData.push(
      { productId: prodPlum._id, userId: adminUser._id, userName: "Rifat K.", rating: 5, comment: "Love the subtle pinstripes." }
    );
  }
  if (prodBlackCheck) {
    reviewsData.push(
      { productId: prodBlackCheck._id, userId: adminUser._id, userName: "Naimur R.", rating: 1, comment: "Fit was too loose for me." }
    );
  }

  await Review.insertMany(reviewsData);
  console.log("Reviews seeded");

  // ===== HERO SECTIONS =====
  const heroSections = [
    {
      title: "TOGETHERNESS",
      subtitle: "They don't count years. They count memories...",
      image: "/images/togetherness_banner.jpg",
      leftImage: "/images/togetherness_banner.jpg",
      rightImage: "/images/togetherness_banner.jpg",
      ctaText: "SHOP THE LOOK",
      ctaLink: "/man/shirts-man",
      gender: "man",
      isActive: true,
      sortOrder: 1
    }
  ];

  await HeroSection.insertMany(heroSections);
  console.log("Hero sections seeded");

  // ===== STORE SETTINGS =====
  await StoreSetting.create({ key: "trending_section_position", value: "below-products" });
  console.log("Store settings seeded");

  // ===== NAV ITEMS =====
  const navItems = [
    { label: "Woman", href: "/woman", position: "header-main", sortOrder: 1, isActive: true },
    { label: "Man", href: "/man", position: "header-main", sortOrder: 2, isActive: true },
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
