import { connectDB } from "../src/lib/db";
import { Category, Product, Look, HeroSection, User, NavItem } from "../src/models";
import bcryptjs from "bcryptjs";

const UNSPLASH_IDS = [
  "photo-1515886657613-9f3515b0c78f",
  "photo-1496747611176-843222e1e57c", // Replaced photo-1529139574466-a302d2d46a97
  "photo-1496747611176-843222e1e57c",
  "photo-1483985988355-763728e1935b",
  "photo-1509631179647-0177331693ae",
  "photo-1469334031218-e382a71b716b",
  "photo-1487222477894-8943e31ef7b2",
  "photo-1490481651871-ab68de25d43d",
  "photo-1490481651871-ab68de25d43d", // Replaced photo-1550614000-4b9519e02d48
  "photo-1539109136881-3be0616acf4b",
  "photo-1495385794356-15371f348c31",
  "photo-1525507119028-ed4c629a60a3",
  "photo-1485968579580-b6d095142e6e",
  "photo-1552374196-1ab2a1c593e8",
  "photo-1504194921103-f8b80cadd5e4",
  "photo-1492707892479-7bc8d5a4ee93",
  "photo-1521572163474-6864f9cf17ab",
  "photo-1558171813-4c088753af8f",
  "photo-1496747611176-843222e1e57c", // Replaced photo-1548624149-f4c80d6e30a5
  "photo-1516762689617-e1cffcef479d",
  "photo-1523359346063-d879354c0ea5",
  "photo-1558171813-4c088753af8f",
  "photo-1572804013309-59a88b7e92f1",
  "photo-1581044777550-4cfa60707c03",
  "photo-1564557287817-3785e38ec1f5",
  "photo-1490481651871-ab68de25d43d", // Replaced photo-1550614000-4b9519e02d48
  "photo-1594633312681-425c7b97ccd1",
  "photo-1576566588028-4147f3842f27",
  "photo-1595777457583-95e059d581b8",
  "photo-1560243563-062bfc001d68",
  "photo-1552374196-c4e7ffc6e126",
  "photo-1571902943202-507ec2618e8f",
  "photo-1558171813-4c088753af8f",
  "photo-1594631252845-29fc4cc8cde9",
  "photo-1506629082955-511b1aa562c8",
  "photo-1490481651871-ab68de25d43d", // Replaced photo-1550614000-4b9519e02d48
  "photo-1583743814966-8936f5b7be1a",
  "photo-1572804013309-59a88b7e92f1",
  "photo-1567401893414-76b7b1e5a7a5",
  "photo-1594633312681-425c7b97ccd1",
  "photo-1544022613-e87ca75a784a",
  "photo-1515886657613-9f3515b0c78f",
  "photo-1515886657613-9f3515b0c78f", // Replaced photo-1529139574466-a302d2d46a97
  "photo-1496747611176-843222e1e57c",
  "photo-1483985988355-763728e1935b",
  "photo-1509631179647-0177331693ae",
  "photo-1469334031218-e382a71b716b",
  "photo-1487222477894-8943e31ef7b2",
  "photo-1490481651871-ab68de25d43d",
  "photo-1490481651871-ab68de25d43d", // Replaced photo-1550614000-4b9519e02d48
  "photo-1539109136881-3be0616acf4b",
];

function unsplashUrl(id: string, w = 800, h = 1000) {
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&q=80`;
}

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
  const womanSubs = await Category.create([
    { name: "Total Look", slug: "total-look", parentId: womanClothing._id, gender: "woman", sortOrder: 1 },
    { name: "Dresses", slug: "dresses", parentId: womanClothing._id, gender: "woman", sortOrder: 2 },
    { name: "Tops | Bodysuits", slug: "tops-bodysuits", parentId: womanClothing._id, gender: "woman", sortOrder: 3 },
    { name: "T-shirts", slug: "t-shirts", parentId: womanClothing._id, gender: "woman", sortOrder: 4 },
    { name: "Shirts | Blouses", slug: "shirts-blouses", parentId: womanClothing._id, gender: "woman", sortOrder: 5 },
    { name: "Trousers", slug: "trousers", parentId: womanClothing._id, gender: "woman", sortOrder: 6 },
    { name: "Jeans", slug: "jeans", parentId: womanClothing._id, gender: "woman", sortOrder: 7 },
    { name: "Skirts", slug: "skirts", parentId: womanClothing._id, gender: "woman", sortOrder: 8 },
    { name: "Shorts", slug: "shorts", parentId: womanClothing._id, gender: "woman", sortOrder: 9 },
    { name: "Swimwear | Bikinis", slug: "swimwear-bikinis", parentId: womanClothing._id, gender: "woman", sortOrder: 10 },
    { name: "Denim", slug: "denim", parentId: womanClothing._id, gender: "woman", sortOrder: 11 },
    { name: "Jackets | Coats", slug: "jackets-coats", parentId: womanClothing._id, gender: "woman", sortOrder: 12 },
    { name: "Blazers", slug: "blazers", parentId: womanClothing._id, gender: "woman", sortOrder: 13 },
    { name: "Suits", slug: "suits", parentId: womanClothing._id, gender: "woman", sortOrder: 14 },
    { name: "Knitwear", slug: "knitwear", parentId: womanClothing._id, gender: "woman", sortOrder: 15 },
    { name: "Sweaters | Cardigans", slug: "sweaters-cardigans", parentId: womanClothing._id, gender: "woman", sortOrder: 16 },
    { name: "Sweatshirts", slug: "sweatshirts", parentId: womanClothing._id, gender: "woman", sortOrder: 17 },
    { name: "Sportswear", slug: "sportswear", parentId: womanClothing._id, gender: "woman", sortOrder: 18 },
    { name: "Tracksuits", slug: "tracksuits", parentId: womanClothing._id, gender: "woman", sortOrder: 19 },
    { name: "Leggings", slug: "leggings", parentId: womanClothing._id, gender: "woman", sortOrder: 20 },
    { name: "Licensed Merch", slug: "licensed-merch", parentId: womanClothing._id, gender: "woman", sortOrder: 21 },
    { name: "Pyjamas", slug: "pyjamas", parentId: womanClothing._id, gender: "woman", sortOrder: 22 },
    { name: "Underwear", slug: "underwear", parentId: womanClothing._id, gender: "woman", sortOrder: 23 },
  ]);

  // Woman shoes subcategories
  await Category.create([
    { name: "Sandals", slug: "sandals", parentId: womanShoes._id, gender: "woman", sortOrder: 1 },
    { name: "Heels", slug: "heels", parentId: womanShoes._id, gender: "woman", sortOrder: 2 },
    { name: "Flats", slug: "flats", parentId: womanShoes._id, gender: "woman", sortOrder: 3 },
    { name: "Sneakers", slug: "sneakers", parentId: womanShoes._id, gender: "woman", sortOrder: 4 },
    { name: "Boots", slug: "boots", parentId: womanShoes._id, gender: "woman", sortOrder: 5 },
  ]);

  // Man subcategories
  await Category.create([
    { name: "T-shirts", slug: "t-shirts-man", parentId: manClothing._id, gender: "man", sortOrder: 1 },
    { name: "Shirts", slug: "shirts-man", parentId: manClothing._id, gender: "man", sortOrder: 2 },
    { name: "Trousers", slug: "trousers-man", parentId: manClothing._id, gender: "man", sortOrder: 3 },
    { name: "Jeans", slug: "jeans-man", parentId: manClothing._id, gender: "man", sortOrder: 4 },
    { name: "Jackets", slug: "jackets-man", parentId: manClothing._id, gender: "man", sortOrder: 5 },
    { name: "Suits", slug: "suits-man", parentId: manClothing._id, gender: "man", sortOrder: 6 },
  ]);

  // Kids subcategories
  await Category.create([
    { name: "T-shirts", slug: "t-shirts-kids", parentId: kidsClothing._id, gender: "kids", sortOrder: 1 },
    { name: "Dresses", slug: "dresses-kids", parentId: kidsClothing._id, gender: "kids", sortOrder: 2 },
    { name: "Trousers", slug: "trousers-kids", parentId: kidsClothing._id, gender: "kids", sortOrder: 3 },
    { name: "Jeans", slug: "jeans-kids", parentId: kidsClothing._id, gender: "kids", sortOrder: 4 },
  ]);

  console.log("Categories seeded");

  // ===== PRODUCTS =====
  const products = [
    {
      name: "Lace Trim Top",
      slug: "lace-trim-top",
      sku: "ZFR-TOP-001",
      description: "Elegant lace trim top with delicate details. Perfect for summer days and special occasions.",
      shortDescription: "Elegant lace trim top",
      price: 79,
      categoryIds: [womanSubs[2]._id],
      images: [unsplashUrl(UNSPLASH_IDS[0]), unsplashUrl(UNSPLASH_IDS[1])],
      colors: [{ name: "White", hex: "#FFFFFF" }, { name: "Black", hex: "#000000" }],
      sizes: [{ name: "XS", inStock: true }, { name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }],
      tags: ["tops", "lace", "summer"],
      isNewArrival: true,
      gender: "woman" as const,
      stockQuantity: 50,
    },
    {
      name: "Ruffled Top",
      slug: "ruffled-top",
      sku: "ZFR-TOP-002",
      description: "Feminine ruffled top with flowy silhouette. A statement piece for any wardrobe.",
      shortDescription: "Feminine ruffled top",
      price: 79,
      categoryIds: [womanSubs[2]._id],
      images: [unsplashUrl(UNSPLASH_IDS[2]), unsplashUrl(UNSPLASH_IDS[3])],
      colors: [{ name: "Cream", hex: "#F5F5DC" }, { name: "Pink", hex: "#FFB6C1" }],
      sizes: [{ name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }],
      tags: ["tops", "ruffled", "feminine"],
      isNewArrival: true,
      gender: "woman" as const,
      stockQuantity: 40,
    },
    {
      name: "Embroidered Strapless Top",
      slug: "embroidered-strapless-top",
      sku: "ZFR-TOP-003",
      description: "Beautiful embroidered strapless top with intricate floral patterns.",
      shortDescription: "Embroidered strapless top",
      price: 89,
      categoryIds: [womanSubs[2]._id],
      images: [unsplashUrl(UNSPLASH_IDS[4]), unsplashUrl(UNSPLASH_IDS[5])],
      colors: [{ name: "White", hex: "#FFFFFF" }, { name: "Beige", hex: "#F5F5DC" }],
      sizes: [{ name: "XS", inStock: true }, { name: "S", inStock: true }, { name: "M", inStock: false }, { name: "L", inStock: true }],
      tags: ["tops", "embroidered", "strapless"],
      isNewArrival: true,
      gender: "woman" as const,
      stockQuantity: 30,
    },
    {
      name: "Basic Rib Knit Polo Shirt",
      slug: "basic-rib-knit-polo-shirt",
      sku: "ZFR-TOP-004",
      description: "Classic rib knit polo shirt in soft cotton blend. A timeless wardrobe essential.",
      shortDescription: "Basic rib knit polo shirt",
      price: 69,
      categoryIds: [womanSubs[3]._id],
      images: [unsplashUrl(UNSPLASH_IDS[6]), unsplashUrl(UNSPLASH_IDS[7])],
      colors: [{ name: "White", hex: "#FFFFFF" }, { name: "Navy", hex: "#000080" }, { name: "Beige", hex: "#F5F5DC" }],
      sizes: [{ name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      tags: ["tops", "polo", "basic"],
      isTrending: true,
      gender: "woman" as const,
      stockQuantity: 100,
    },
    {
      name: "Linen Blend Dress",
      slug: "linen-blend-dress",
      sku: "ZFR-DRS-001",
      description: "Breathable linen blend dress with relaxed fit. Perfect for warm weather.",
      shortDescription: "Linen blend dress",
      price: 129,
      categoryIds: [womanSubs[1]._id],
      images: [unsplashUrl(UNSPLASH_IDS[8]), unsplashUrl(UNSPLASH_IDS[9])],
      colors: [{ name: "Sand", hex: "#C2B280" }, { name: "White", hex: "#FFFFFF" }, { name: "Olive", hex: "#808000" }],
      sizes: [{ name: "XS", inStock: true }, { name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }],
      tags: ["dresses", "linen", "summer"],
      isNewArrival: true,
      gender: "woman" as const,
      stockQuantity: 60,
    },
    {
      name: "Floral Maxi Dress",
      slug: "floral-maxi-dress",
      sku: "ZFR-DRS-002",
      description: "Flowing floral maxi dress with v-neckline and cinched waist.",
      shortDescription: "Floral maxi dress",
      price: 149,
      compareAtPrice: 199,
      categoryIds: [womanSubs[1]._id],
      images: [unsplashUrl(UNSPLASH_IDS[10]), unsplashUrl(UNSPLASH_IDS[11])],
      colors: [{ name: "Multi", hex: "#FF69B4" }],
      sizes: [{ name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }],
      tags: ["dresses", "floral", "maxi"],
      isSale: true,
      isTrending: true,
      gender: "woman" as const,
      stockQuantity: 35,
    },
    {
      name: "Tailored Trousers",
      slug: "tailored-trousers",
      sku: "ZFR-TRS-001",
      description: "Sharp tailored trousers with straight leg cut. Perfect for office or evening.",
      shortDescription: "Tailored trousers",
      price: 99,
      categoryIds: [womanSubs[5]._id],
      images: [unsplashUrl(UNSPLASH_IDS[12]), unsplashUrl(UNSPLASH_IDS[13])],
      colors: [{ name: "Black", hex: "#000000" }, { name: "Beige", hex: "#F5F5DC" }, { name: "Navy", hex: "#000080" }],
      sizes: [{ name: "XS", inStock: true }, { name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      tags: ["trousers", "tailored", "workwear"],
      isTrending: true,
      gender: "woman" as const,
      stockQuantity: 80,
    },
    {
      name: "Wide Leg Jeans",
      slug: "wide-leg-jeans",
      sku: "ZFR-JNS-001",
      description: "High-waisted wide leg jeans with vintage wash. A modern classic.",
      shortDescription: "Wide leg jeans",
      price: 89,
      categoryIds: [womanSubs[6]._id],
      images: [unsplashUrl(UNSPLASH_IDS[14]), unsplashUrl(UNSPLASH_IDS[15])],
      colors: [{ name: "Light Blue", hex: "#ADD8E6" }, { name: "Dark Blue", hex: "#00008B" }],
      sizes: [{ name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: false }],
      tags: ["jeans", "wide-leg", "denim"],
      isNewArrival: true,
      gender: "woman" as const,
      stockQuantity: 55,
    },
    {
      name: "Pleated Midi Skirt",
      slug: "pleated-midi-skirt",
      sku: "ZFR-SKT-001",
      description: "Elegant pleated midi skirt with elastic waistband. Versatile and chic.",
      shortDescription: "Pleated midi skirt",
      price: 79,
      categoryIds: [womanSubs[7]._id],
      images: [unsplashUrl(UNSPLASH_IDS[16]), unsplashUrl(UNSPLASH_IDS[17])],
      colors: [{ name: "Black", hex: "#000000" }, { name: "Cream", hex: "#FFFDD0" }, { name: "Rust", hex: "#B7410E" }],
      sizes: [{ name: "XS", inStock: true }, { name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }],
      tags: ["skirts", "pleated", "midi"],
      isTrending: true,
      gender: "woman" as const,
      stockQuantity: 45,
    },
    {
      name: "Denim Jacket",
      slug: "denim-jacket",
      sku: "ZFR-JCK-001",
      description: "Classic oversized denim jacket with vintage wash. Layering essential.",
      shortDescription: "Oversized denim jacket",
      price: 119,
      categoryIds: [womanSubs[11]._id],
      images: [unsplashUrl(UNSPLASH_IDS[18]), unsplashUrl(UNSPLASH_IDS[19])],
      colors: [{ name: "Light Denim", hex: "#87CEEB" }, { name: "Dark Denim", hex: "#4A6741" }],
      sizes: [{ name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }],
      tags: ["jackets", "denim", "outerwear"],
      isNewArrival: true,
      gender: "woman" as const,
      stockQuantity: 40,
    },
    {
      name: "Structured Blazer",
      slug: "structured-blazer",
      sku: "ZFR-BLZ-001",
      description: "Sharp structured blazer with single button closure. Power dressing made easy.",
      shortDescription: "Structured blazer",
      price: 149,
      categoryIds: [womanSubs[12]._id],
      images: [unsplashUrl(UNSPLASH_IDS[20]), unsplashUrl(UNSPLASH_IDS[21])],
      colors: [{ name: "Black", hex: "#000000" }, { name: "Beige", hex: "#F5F5DC" }, { name: "White", hex: "#FFFFFF" }],
      sizes: [{ name: "XS", inStock: true }, { name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }],
      tags: ["blazers", "workwear", "structured"],
      isTrending: true,
      gender: "woman" as const,
      stockQuantity: 35,
    },
    {
      name: "Cotton T-shirt",
      slug: "cotton-t-shirt",
      sku: "ZFR-TSM-001",
      description: "Premium organic cotton t-shirt with relaxed fit. Everyday essential.",
      shortDescription: "Organic cotton t-shirt",
      price: 39,
      categoryIds: [womanSubs[3]._id],
      images: [unsplashUrl(UNSPLASH_IDS[22]), unsplashUrl(UNSPLASH_IDS[23])],
      colors: [{ name: "White", hex: "#FFFFFF" }, { name: "Black", hex: "#000000" }, { name: "Grey", hex: "#808080" }, { name: "Navy", hex: "#000080" }],
      sizes: [{ name: "XS", inStock: true }, { name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      tags: ["t-shirts", "basic", "cotton"],
      gender: "woman" as const,
      stockQuantity: 200,
    },
    {
      name: "Cable Knit Sweater",
      slug: "cable-knit-sweater",
      sku: "ZFR-KNT-001",
      description: "Cozy cable knit sweater with crew neckline. Perfect for chilly evenings.",
      shortDescription: "Cable knit sweater",
      price: 89,
      categoryIds: [womanSubs[15]._id],
      images: [unsplashUrl(UNSPLASH_IDS[24]), unsplashUrl(UNSPLASH_IDS[25])],
      colors: [{ name: "Cream", hex: "#FFFDD0" }, { name: "Brown", hex: "#8B4513" }, { name: "Grey", hex: "#808080" }],
      sizes: [{ name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }],
      tags: ["knitwear", "sweater", "cable-knit"],
      isTrending: true,
      gender: "woman" as const,
      stockQuantity: 50,
    },
    {
      name: "High-Waisted Shorts",
      slug: "high-waisted-shorts",
      sku: "ZFR-SHT-001",
      description: "High-waisted shorts with belt loops and rolled cuffs. Summer staple.",
      shortDescription: "High-waisted shorts",
      price: 59,
      categoryIds: [womanSubs[8]._id],
      images: [unsplashUrl(UNSPLASH_IDS[26]), unsplashUrl(UNSPLASH_IDS[27])],
      colors: [{ name: "White", hex: "#FFFFFF" }, { name: "Denim", hex: "#6B8E9F" }, { name: "Khaki", hex: "#C3B091" }],
      sizes: [{ name: "XS", inStock: true }, { name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }],
      tags: ["shorts", "high-waisted", "summer"],
      isNewArrival: true,
      gender: "woman" as const,
      stockQuantity: 70,
    },
    {
      name: "Printed Shirt",
      slug: "printed-shirt",
      sku: "ZFR-SHT-002",
      description: "Relaxed fit printed shirt with camp collar. Vacation vibes.",
      shortDescription: "Printed camp shirt",
      price: 69,
      categoryIds: [womanSubs[4]._id],
      images: [unsplashUrl(UNSPLASH_IDS[28]), unsplashUrl(UNSPLASH_IDS[29])],
      colors: [{ name: "Multi", hex: "#FF6347" }],
      sizes: [{ name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }],
      tags: ["shirts", "printed", "vacation"],
      isNewArrival: true,
      gender: "woman" as const,
      stockQuantity: 40,
    },
    // Man products
    {
      name: "Classic Fit T-shirt",
      slug: "classic-fit-t-shirt-man",
      sku: "ZFR-MTS-001",
      description: "Classic fit crew neck t-shirt in premium cotton.",
      shortDescription: "Classic fit t-shirt",
      price: 49,
      categoryIds: [manClothing._id],
      images: [unsplashUrl(UNSPLASH_IDS[30]), unsplashUrl(UNSPLASH_IDS[31])],
      colors: [{ name: "White", hex: "#FFFFFF" }, { name: "Black", hex: "#000000" }, { name: "Grey", hex: "#808080" }],
      sizes: [{ name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      tags: ["t-shirts", "basic", "cotton"],
      gender: "man" as const,
      stockQuantity: 150,
    },
    {
      name: "Slim Fit Chinos",
      slug: "slim-fit-chinos-man",
      sku: "ZFR-MTR-001",
      description: "Slim fit chinos in stretch cotton. Smart casual essential.",
      shortDescription: "Slim fit chinos",
      price: 79,
      categoryIds: [manClothing._id],
      images: [unsplashUrl(UNSPLASH_IDS[32]), unsplashUrl(UNSPLASH_IDS[33])],
      colors: [{ name: "Beige", hex: "#F5F5DC" }, { name: "Navy", hex: "#000080" }, { name: "Olive", hex: "#808000" }],
      sizes: [{ name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      tags: ["trousers", "chinos", "smart"],
      gender: "man" as const,
      stockQuantity: 80,
    },
    {
      name: "Denim Jacket Man",
      slug: "denim-jacket-man",
      sku: "ZFR-MJK-001",
      description: "Classic denim jacket with vintage wash.",
      shortDescription: "Classic denim jacket",
      price: 119,
      categoryIds: [manClothing._id],
      images: [unsplashUrl(UNSPLASH_IDS[34]), unsplashUrl(UNSPLASH_IDS[35])],
      colors: [{ name: "Blue", hex: "#4169E1" }],
      sizes: [{ name: "S", inStock: true }, { name: "M", inStock: true }, { name: "L", inStock: true }, { name: "XL", inStock: true }],
      tags: ["jackets", "denim"],
      gender: "man" as const,
      stockQuantity: 60,
    },
    // Kids products
    {
      name: "Kids Graphic T-shirt",
      slug: "kids-graphic-t-shirt",
      sku: "ZFR-KTS-001",
      description: "Fun graphic print t-shirt for kids in soft cotton.",
      shortDescription: "Graphic t-shirt for kids",
      price: 29,
      categoryIds: [kidsClothing._id],
      images: [unsplashUrl(UNSPLASH_IDS[36]), unsplashUrl(UNSPLASH_IDS[37])],
      colors: [{ name: "White", hex: "#FFFFFF" }, { name: "Blue", hex: "#4169E1" }, { name: "Pink", hex: "#FFB6C1" }],
      sizes: [{ name: "4Y", inStock: true }, { name: "6Y", inStock: true }, { name: "8Y", inStock: true }, { name: "10Y", inStock: true }],
      tags: ["t-shirts", "kids", "graphic"],
      gender: "kids" as const,
      stockQuantity: 100,
    },
    {
      name: "Kids Denim Jeans",
      slug: "kids-denim-jeans",
      sku: "ZFR-KJN-001",
      description: "Comfortable stretch denim jeans for active kids.",
      shortDescription: "Kids denim jeans",
      price: 49,
      categoryIds: [kidsClothing._id],
      images: [unsplashUrl(UNSPLASH_IDS[38]), unsplashUrl(UNSPLASH_IDS[39])],
      colors: [{ name: "Blue", hex: "#4169E1" }],
      sizes: [{ name: "4Y", inStock: true }, { name: "6Y", inStock: true }, { name: "8Y", inStock: true }, { name: "10Y", inStock: true }],
      tags: ["jeans", "kids", "denim"],
      gender: "kids" as const,
      stockQuantity: 80,
    },
  ];

  await Product.insertMany(products);
  console.log("Products seeded");

  // ===== HERO SECTIONS =====
  const heroSections = [
    {
      title: "NEW IN",
      subtitle: "Discover the latest arrivals",
      image: unsplashUrl(UNSPLASH_IDS[0], 1920, 1080),
      leftImage: unsplashUrl(UNSPLASH_IDS[0], 960, 1080),
      rightImage: unsplashUrl(UNSPLASH_IDS[5], 960, 1080),
      ctaText: "VIEW NOW",
      ctaLink: "/woman/new-in",
      sortOrder: 1,
      isActive: true,
      gender: "woman" as const,
    },
    {
      title: "BASICS",
      subtitle: "Timeless essentials for everyday",
      image: unsplashUrl(UNSPLASH_IDS[12], 1920, 1080),
      ctaText: "VIEW NOW",
      ctaLink: "/woman/basics",
      sortOrder: 2,
      isActive: true,
      gender: "woman" as const,
    },
    {
      title: "TEEN GIRL",
      subtitle: "Youthful styles for the new generation",
      image: unsplashUrl(UNSPLASH_IDS[20], 1920, 1080),
      leftImage: unsplashUrl(UNSPLASH_IDS[20], 960, 1080),
      rightImage: unsplashUrl(UNSPLASH_IDS[21], 960, 1080),
      ctaText: "VIEW NOW",
      ctaLink: "/woman/teen-girl",
      sortOrder: 3,
      isActive: true,
      gender: "woman" as const,
    },
    {
      title: "NEW IN",
      subtitle: "Fresh styles for him",
      image: unsplashUrl(UNSPLASH_IDS[30], 1920, 1080),
      leftImage: unsplashUrl(UNSPLASH_IDS[30], 960, 1080),
      rightImage: unsplashUrl(UNSPLASH_IDS[31], 960, 1080),
      ctaText: "VIEW NOW",
      ctaLink: "/man/new-in",
      sortOrder: 1,
      isActive: true,
      gender: "man" as const,
    },
    {
      title: "BASICS",
      subtitle: "Essential pieces for every man",
      image: unsplashUrl(UNSPLASH_IDS[32], 1920, 1080),
      ctaText: "VIEW NOW",
      ctaLink: "/man/basics",
      sortOrder: 2,
      isActive: true,
      gender: "man" as const,
    },
    {
      title: "NEW IN",
      subtitle: "Fun styles for the little ones",
      image: unsplashUrl(UNSPLASH_IDS[36], 1920, 1080),
      leftImage: unsplashUrl(UNSPLASH_IDS[36], 960, 1080),
      rightImage: unsplashUrl(UNSPLASH_IDS[37], 960, 1080),
      ctaText: "VIEW NOW",
      ctaLink: "/kids/new-in",
      sortOrder: 1,
      isActive: true,
      gender: "kids" as const,
    },
  ];

  await HeroSection.insertMany(heroSections);
  console.log("Hero sections seeded");

  // ===== NAV ITEMS =====
  const navItems = [
    { label: "Woman", href: "/woman", position: "header-main", sortOrder: 1, isActive: true },
    { label: "Man", href: "/man", position: "header-main", sortOrder: 2, isActive: true },
    { label: "Kids", href: "/kids", position: "header-main", sortOrder: 3, isActive: true },
  ];
  await NavItem.insertMany(navItems);
  console.log("Nav items seeded");

  // ===== LOOKS (#INZFR) =====
  const looks = [
    { image: unsplashUrl(UNSPLASH_IDS[0], 600, 800), userName: "@sarahstyle", caption: "Summer vibes in ZFR", instagramHandle: "@sarahstyle", isFeatured: true },
    { image: unsplashUrl(UNSPLASH_IDS[2], 600, 800), userName: "@fashionella", caption: "Loving this look", instagramHandle: "@fashionella", isFeatured: true },
    { image: unsplashUrl(UNSPLASH_IDS[4], 600, 800), userName: "@trendy_tina", caption: "ZFR basics done right", instagramHandle: "@trendy_tina", isFeatured: true },
    { image: unsplashUrl(UNSPLASH_IDS[6], 600, 800), userName: "@chic_mia", caption: "Weekend ready", instagramHandle: "@chic_mia", isFeatured: true },
    { image: unsplashUrl(UNSPLASH_IDS[8], 600, 800), userName: "@stylebyjane", caption: "Casual elegance", instagramHandle: "@stylebyjane", isFeatured: false },
    { image: unsplashUrl(UNSPLASH_IDS[10], 600, 800), userName: "@moda_lisa", caption: "Floral dreams", instagramHandle: "@moda_lisa", isFeatured: true },
    { image: unsplashUrl(UNSPLASH_IDS[12], 600, 800), userName: "@urban_ava", caption: "City style", instagramHandle: "@urban_ava", isFeatured: false },
    { image: unsplashUrl(UNSPLASH_IDS[14], 600, 800), userName: "@denim_daisy", caption: "Denim days", instagramHandle: "@denim_daisy", isFeatured: true },
    { image: unsplashUrl(UNSPLASH_IDS[16], 600, 800), userName: "@grace_fits", caption: "Office chic", instagramHandle: "@grace_fits", isFeatured: false },
    { image: unsplashUrl(UNSPLASH_IDS[18], 600, 800), userName: "@luxe_lily", caption: "Layering season", instagramHandle: "@luxe_lily", isFeatured: true },
    { image: unsplashUrl(UNSPLASH_IDS[20], 600, 800), userName: "@minimal_maya", caption: "Less is more", instagramHandle: "@minimal_maya", isFeatured: false },
    { image: unsplashUrl(UNSPLASH_IDS[22], 600, 800), userName: "@boho_bella", caption: "Free spirit", instagramHandle: "@boho_bella", isFeatured: true },
  ];

  await Look.insertMany(looks);
  console.log("Looks seeded");

  // ===== ADMIN USER =====
  const adminEmail = process.env.ADMIN_EMAIL || "admin@zfr.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcryptjs.hash(adminPassword, 12);
  await User.create({
    email: adminEmail,
    passwordHash,
    name: "ZFR Admin",
    role: "admin",
    wishlist: [],
    addresses: [],
  });
  console.log(`Admin user seeded with email: ${adminEmail}`);

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
