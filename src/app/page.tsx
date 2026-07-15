import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WelcomeSplash } from "@/components/home/WelcomeSplash";
import { HomeClient } from "@/components/home/HomeClient";
import { connectDB } from "@/lib/db";
import { HeroSection as HeroModel } from "@/models";
import { cacheLife } from "next/cache";

async function getHeroSections() {
  "use cache";
  cacheLife("seconds");
  try {
    await connectDB();
    const sections = await HeroModel.find({ isActive: true })
      .sort({ sortOrder: 1 })
      .lean();
    return JSON.parse(JSON.stringify(sections));
  } catch (error) {
    console.error("Failed to get hero sections:", error);
    return [];
  }
}

const FALLBACK_HEROES = [
  {
    title: "TOGETHERNESS",
    subtitle: "They don't count years. They count memories...",
    image: "/images/togetherness_banner.jpg",
    leftImage: "/images/togetherness_banner.jpg",
    rightImage: "/images/togetherness_banner.jpg",
    ctaText: "SHOP THE LOOK",
    ctaLink: "/man/shirts-man",
  }
];

async function getTrendingCategories() {
  "use cache";
  cacheLife("seconds");
  try {
    await connectDB();
    const TrendingModel = await import("@/models").then((m) => m.TrendingItem);
    const ProductModel = await import("@/models").then((m) => m.Product);

    const items = await TrendingModel.find({ isActive: true })
      .sort({ sortOrder: 1 })
      .lean();

    if (items && items.length > 0) {
      return items.map((item: any) => ({
        name: item.name.toUpperCase(),
        slug: item.ctaLink.replace(/^\//, ""),
        image: item.image,
      }));
    }

    const products = await ProductModel.find({ isTrending: true })
      .limit(4)
      .lean();

    if (products && products.length > 0) {
      return products.map((p: any) => ({
        name: p.name.toUpperCase(),
        slug: `product/${p.slug}`,
        image: p.images[0],
      }));
    }

    return [
      {
        name: "SHIRTS",
        slug: "man/shirts-man",
        image: "/images/chocolate_brown_shirt.jpg",
      },
      {
        name: "PANT",
        slug: "man/pant-man",
        image: "/images/charcoal_grey_pant.jpg",
      },
      {
        name: "PANJABI",
        slug: "man/panjabi-man",
        image: "/images/off_white_panjabi.jpg",
      },
      {
        name: "NEW IN",
        slug: "man/new-in",
        image: "/images/rusty_orange_shirt.jpg",
      }
    ];
  } catch (error) {
    console.error("Failed to get trending categories:", error);
    return [];
  }
}

async function getTrendingSectionPosition() {
  "use cache";
  cacheLife("seconds");
  try {
    await connectDB();
    const SettingModel = await import("@/models").then((m) => m.StoreSetting);
    const setting = await SettingModel.findOne({ key: "trending_section_position" }).lean();
    return setting?.value || "below-products";
  } catch (error) {
    console.error("Failed to get trending section position:", error);
    return "below-products";
  }
}

async function getProductsWithRatings() {
  "use cache";
  cacheLife("seconds");
  try {
    await connectDB();
    const ProductModel = await import("@/models").then((m) => m.Product);
    const ReviewModel = await import("@/models").then((m) => m.Review);
    const CategoryModel = await import("@/models").then((m) => m.Category);

    // Fetch all products, reviews, and categories
    const products = await ProductModel.find({}).lean();
    const reviews = await ReviewModel.find({}).lean();
    const categories = await CategoryModel.find({}).lean();

    const categoryMap = new Map(categories.map((c: any) => [String(c._id), c]));

    const reviewsMap = new Map<string, number[]>();
    reviews.forEach((r: any) => {
      const pId = String(r.productId);
      if (!reviewsMap.has(pId)) {
        reviewsMap.set(pId, []);
      }
      reviewsMap.get(pId)!.push(r.rating);
    });

    const mapped = products.map((p: any) => {
      const pId = String(p._id);
      const ratings = reviewsMap.get(pId) || [];
      const avgRating = ratings.length > 0
        ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10
        : 0;

      const prodCategories = (p.categoryIds || []).map((catId: any) => {
        const cat = categoryMap.get(String(catId));
        return cat ? { name: cat.name, slug: cat.slug, gender: cat.gender } : null;
      }).filter(Boolean);

      return {
        _id: pId,
        name: p.name,
        slug: p.slug,
        sku: p.sku || "",
        price: p.price,
        images: p.images || [],
        rating: avgRating,
        reviewsCount: ratings.length,
        categories: prodCategories,
      };
    });

    return JSON.parse(JSON.stringify(mapped));
  } catch (error) {
    console.error("Failed to get products with ratings:", error);
    return [];
  }
}

export default async function HomePage() {
  const [heroes, trending, position, products] = await Promise.all([
    getHeroSections(),
    getTrendingCategories(),
    getTrendingSectionPosition(),
    getProductsWithRatings()
  ]);

  const displayHeroes = heroes.length > 0
    ? heroes.map((h: Record<string, string>) => ({
        title: h.title,
        subtitle: h.subtitle,
        image: h.image,
        leftImage: h.leftImage || h.image,
        rightImage: h.rightImage,
        ctaText: h.ctaText,
        ctaLink: h.ctaLink,
      }))
      : FALLBACK_HEROES;

  // Gather all critical images to preload during splash screen
  const imagesToPreload: string[] = [];
  displayHeroes.forEach((hero: any) => {
    if (hero.leftImage) imagesToPreload.push(hero.leftImage);
    if (hero.rightImage) imagesToPreload.push(hero.rightImage);
    if (hero.image) imagesToPreload.push(hero.image);
  });
  trending.forEach((cat: any) => {
    if (cat.image) imagesToPreload.push(cat.image);
  });
  products.slice(0, 6).forEach((prod: any) => {
    if (prod.images?.[0]) imagesToPreload.push(prod.images[0]);
  });

  return (
    <>
      <WelcomeSplash preloadImages={imagesToPreload} />
      <Header />
      <main>
        <HomeClient 
          heroes={displayHeroes} 
          trending={trending} 
          position={position} 
          products={products} 
        />
      </main>
      <Footer />
    </>
  );
}
