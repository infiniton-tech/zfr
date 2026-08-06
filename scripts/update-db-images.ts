import { connectDB } from "../src/lib/db";
import { Category, Product, HeroSection } from "../src/models";

async function updateDatabaseImages() {
  console.log("Connecting to MongoDB database...");
  await connectDB();

  // STEP 1: Delete/clear all old images from database collections
  console.log("1. Deleting all existing image URLs from database collections...");
  
  await Category.updateMany({}, { $set: { image: "" } });
  await Product.updateMany({}, { $set: { images: [], "colors.$[].image": "" } });
  await HeroSection.updateMany({}, { $set: { image: "", leftImage: "", rightImage: "" } });
  
  console.log("All old images deleted/cleared from MongoDB database!");

  // STEP 2: Update Category images with new local image paths in /images/categories/
  console.log("2. Adding/creating new images for Categories...");

  const categoryImages: Record<string, string> = {
    "clothing": "/images/categories/clothing.jpg",
    "panjabi": "/images/categories/panjabi.jpg",
    "shirts": "/images/categories/shirts.jpg",
    "pant": "/images/categories/pants.jpg",
    "t-shirts": "/images/categories/tshirts.jpg",
    "trousers": "/images/categories/trousers.jpg",
    "jeans": "/images/categories/jeans.jpg",
    "shoes": "/images/categories/shoes.jpg",
    "accessories": "/images/categories/accessories.jpg",
    "kurta": "/images/categories/kurta.jpg"
  };

  const categories = await Category.find({});
  for (const cat of categories) {
    const slugKey = cat.slug.replace("-man", "").toLowerCase();
    const nameKey = cat.name.toLowerCase();
    const imgPath = categoryImages[slugKey] || categoryImages[nameKey] || "/images/categories/clothing.jpg";
    
    cat.image = imgPath;
    await cat.save();
    console.log(`Updated Category [${cat.name}]: image set to '${cat.image}'`);
  }

  // STEP 3: Update Product images with new local image paths in /images/products/
  console.log("3. Adding/creating new images for Products...");

  const getProductImage = (name: string, slug: string): string => {
    const lower = (name + " " + slug).toLowerCase();
    if (lower.includes("navy") && lower.includes("panjabi")) return "/images/products/navy_embroidered_panjabi.jpg";
    if (lower.includes("emerald") && lower.includes("panjabi")) return "/images/products/emerald_festive_panjabi.jpg";
    if (lower.includes("maroon") && lower.includes("panjabi")) return "/images/products/maroon_silk_panjabi.jpg";
    if (lower.includes("black") && lower.includes("panjabi")) return "/images/products/black_designer_panjabi.jpg";
    if (lower.includes("burgundy") && lower.includes("panjabi")) return "/images/products/burgundy_floral_panjabi.jpg";
    if (lower.includes("off-white") && lower.includes("panjabi")) return "/images/products/off_white_panjabi.jpg";
    if (lower.includes("white") && lower.includes("kurta")) return "/images/products/white_embroidered_panjabi.jpg";
    if (lower.includes("emerald") && lower.includes("shirt")) return "/images/products/emerald_green_linen_shirt.jpg";
    if (lower.includes("stripe") && lower.includes("shirt")) return "/images/products/navy_white_stripe_shirt.jpg";
    if (lower.includes("chocolate") || lower.includes("brown shirt")) return "/images/products/chocolate_brown_shirt.jpg";
    if (lower.includes("rusty") || lower.includes("orange shirt")) return "/images/products/rusty_orange_shirt.jpg";
    if (lower.includes("sand") || lower.includes("beige shirt")) return "/images/products/sand_beige_shirt.jpg";
    if (lower.includes("plum") || lower.includes("lilac") || lower.includes("mauve")) return "/images/products/dark_plum_shirt.jpg";
    if (lower.includes("check") || lower.includes("windowpane")) return "/images/products/black_check_shirt.jpg";
    if (lower.includes("crimson") || lower.includes("plaid") || lower.includes("flannel")) return "/images/products/crimson_red_plaid_shirt.jpg";
    if (lower.includes("charcoal") || lower.includes("grey pant")) return "/images/products/charcoal_grey_pant.jpg";
    if (lower.includes("t-shirt") && lower.includes("off white")) return "/images/products/17.jpeg";
    if (lower.includes("t-shirt") && lower.includes("black")) return "/images/products/18.jpeg";
    if (lower.includes("chino") || lower.includes("olive")) return "/images/products/19.jpeg";
    if (lower.includes("jean") || lower.includes("indigo")) return "/images/products/20.jpeg";
    if (lower.includes("loafer") || lower.includes("shoe")) return "/images/products/21.jpeg";
    if (lower.includes("belt") || lower.includes("cardholder") || lower.includes("gift set")) return "/images/products/22.jpeg";
    if (lower.includes("ivory")) return "/images/products/sand_beige_shirt.jpg";
    return "/images/products/chocolate_brown_shirt.jpg";
  };

  const products = await Product.find({});
  for (const prod of products) {
    const mainImg = getProductImage(prod.name, prod.slug);
    prod.images = [mainImg];
    
    if (prod.colors && prod.colors.length > 0) {
      prod.colors = prod.colors.map((c: { name: string; hex: string; image?: string }) => ({
        name: c.name,
        hex: c.hex,
        image: mainImg,
      }));
    }
    
    await prod.save();
    console.log(`Updated Product [${prod.name}]: images set to [${prod.images.join(", ")}]`);
  }

  // STEP 4: Update HeroSection images
  console.log("4. Adding/creating new images for Hero Sections...");
  const heroSections = await HeroSection.find({});
  for (const hero of heroSections) {
    hero.image = "/images/products/navy_embroidered_panjabi.jpg";
    hero.leftImage = "/images/products/navy_embroidered_panjabi.jpg";
    hero.rightImage = "/images/products/emerald_festive_panjabi.jpg";
    await hero.save();
    console.log(`Updated HeroSection [${hero.title}]: images updated`);
  }

  console.log("\nDatabase image deletion and re-population complete!");
  process.exit(0);
}

updateDatabaseImages().catch((err) => {
  console.error("Failed to update database images:", err);
  process.exit(1);
});
