import { HeroSection } from "@/components/home/HeroSection";
import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import { HeroSection as HeroModel, Category } from "@/models";
import { Suspense } from "react";
import { connection } from "next/server";

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    { params: { gender: "woman" } }
  ]
};

async function getHeroSections(gender: string) {
  try {
    await connection();
    await connectDB();
    const sections = await HeroModel.find({ gender, isActive: true })
      .sort({ sortOrder: 1 })
      .lean();
    return JSON.parse(JSON.stringify(sections));
  } catch {
    return [];
  }
}

async function getCategories(gender: string) {
  try {
    await connection();
    await connectDB();
    // Fetch all active categories for this gender
    const all = await Category.find({ gender, isActive: true })
      .sort({ sortOrder: 1 })
      .lean();
    return JSON.parse(JSON.stringify(all));
  } catch {
    return [];
  }
}

async function getCategoryData(slug: string) {
  try {
    await connectDB();
    const cat = await Category.findOne({ slug, isActive: true }).lean();
    if (!cat) return null;

    let relatedCategories = [];
    if (!cat.parentId) {
      relatedCategories = await Category.find({ parentId: cat._id, isActive: true })
        .sort({ sortOrder: 1 })
        .lean();
    } else {
      relatedCategories = await Category.find({ parentId: cat.parentId, isActive: true })
        .sort({ sortOrder: 1 })
        .lean();
    }

    return {
      category: JSON.parse(JSON.stringify(cat)),
      relatedCategories: JSON.parse(JSON.stringify(relatedCategories)),
    };
  } catch {
    return null;
  }
}

const GENDER_FALLBACK: Record<string, Array<Record<string, string>>> = {
  woman: [
    {
      title: "NEW IN",
      subtitle: "Discover the latest arrivals",
      leftImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=960&h=1080&fit=crop&q=80",
      rightImage: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=960&h=1080&fit=crop&q=80",
      ctaText: "VIEW NOW",
      ctaLink: "/woman/new-in",
    },
    {
      title: "BASICS",
      subtitle: "Timeless essentials for everyday",
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&h=1080&fit=crop&q=80",
      ctaText: "VIEW NOW",
      ctaLink: "/woman/basics",
    },
  ],
  man: [
    {
      title: "NEW IN",
      subtitle: "Fresh styles for him",
      leftImage: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=960&h=1080&fit=crop&q=80",
      rightImage: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=960&h=1080&fit=crop&q=80",
      ctaText: "VIEW NOW",
      ctaLink: "/man/new-in",
    },
    {
      title: "BASICS",
      subtitle: "Essential pieces for every man",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1920&h=1080&fit=crop&q=80",
      ctaText: "VIEW NOW",
      ctaLink: "/man/basics",
    },
  ],
  kids: [
    {
      title: "NEW IN",
      subtitle: "Fun styles for the little ones",
      leftImage: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=960&h=1080&fit=crop&q=80",
      rightImage: "https://images.unsplash.com/photo-1507464098880-e367bc5d2c08?w=960&h=1080&fit=crop&q=80",
      ctaText: "VIEW NOW",
      ctaLink: "/kids/new-in",
    },
    {
      title: "BASICS",
      subtitle: "Comfortable everyday wear",
      image: "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=1920&h=1080&fit=crop&q=80",
      ctaText: "VIEW NOW",
      ctaLink: "/kids/basics",
    },
  ],
};

export default async function GenderPage({ params }: { params: Promise<{ gender: string }> }) {
  return (
    <div className="pb-16 bg-white">
      <Suspense fallback={
        <div className="relative aspect-[16/9] md:aspect-[21/9] w-full bg-neutral-100 animate-pulse flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="h-6 w-32 bg-neutral-200 mx-auto rounded animate-pulse" />
            <div className="h-4 w-48 bg-neutral-200 mx-auto rounded animate-pulse" />
          </div>
        </div>
      }>
        {params.then(({ gender }) => (
          <HeroSectionWrapper gender={gender} />
        ))}
      </Suspense>

      <Suspense fallback={
        <div className="py-12 md:py-16 px-4 md:px-12">
          <div className="h-4 w-40 bg-neutral-200 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] bg-neutral-100 rounded animate-pulse w-full" />
                <div className="h-3 w-3/4 bg-neutral-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      }>
        {params.then(({ gender }) => (
          <CategoriesWrapper gender={gender} />
        ))}
      </Suspense>
    </div>
  );
}

async function HeroSectionWrapper({ gender }: { gender: string }) {
  const heroes = await getHeroSections(gender);
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
    : [];

  return (
    <>
      {displayHeroes.map((hero: Record<string, string>, i: number) => (
        <HeroSection
          key={i}
          title={hero.title}
          subtitle={hero.subtitle}
          image={hero.image}
          leftImage={hero.leftImage}
          rightImage={hero.rightImage}
          ctaText={hero.ctaText}
          ctaLink={hero.ctaLink}
        />
      ))}
    </>
  );
}

interface DisplayCategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  parentId?: string | null;
  subcategories?: Array<{ _id: string; name: string; slug: string }>;
}

async function CategoriesWrapper({ gender }: { gender: string }) {
  const allCategories = await getCategories(gender);

  // Split into parents and subs
  const parents = allCategories.filter((c: Record<string, string>) => !c.parentId);
  const subs = allCategories.filter((c: Record<string, string>) => c.parentId);

  // If no categories at all, show fallback message
  if (allCategories.length === 0) {
    return (
      <section className="py-12 md:py-16 px-4 md:px-12 bg-white">
        <h2 className="text-sm font-medium tracking-[0.1em] mb-8 uppercase">Shop by Category</h2>
        <p className="text-sm text-muted-foreground">No categories available</p>
      </section>
    );
  }

  // Group subs under their parent
  const grouped: DisplayCategory[] = parents.map((parent: Record<string, string>) => ({
    _id: parent._id,
    name: parent.name,
    slug: parent.slug,
    image: parent.image,
    parentId: parent.parentId,
    subcategories: subs.map((s: Record<string, string>) => ({
      _id: s._id,
      name: s.name,
      slug: s.slug,
      parentId: s.parentId,
    })).filter((s: { parentId?: string | null }) => s.parentId === parent._id),
  }));

  // If no parents found (all are subs somehow), show all as flat grid
  const displayItems: DisplayCategory[] = grouped.length > 0 ? grouped : allCategories.map((c: Record<string, string>) => ({
    _id: c._id,
    name: c.name,
    slug: c.slug,
    image: c.image,
    parentId: c.parentId,
  }));

  return (
    <section className="py-12 md:py-16 px-4 md:px-12 bg-white">
      <h2 className="text-sm font-medium tracking-[0.1em] mb-8 uppercase">Shop by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {displayItems.map((cat: DisplayCategory) => (
          <div key={cat._id} className="group flex flex-col">
            <Link href={`/${gender}/${cat.slug}`} className="block">
              <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-3">
                <Image
                  src={cat.image || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop&q=80"}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="25vw"
                />
              </div>
              <span className="text-xs font-medium tracking-wider uppercase block mb-1">{cat.name}</span>
            </Link>
            {/* Show subcategory names as small links under the parent */}
            {cat.subcategories && cat.subcategories.length > 0 && (
              <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                {cat.subcategories
                  .slice(0, 4)
                  .map((sub) => (
                    <Link
                      key={sub._id}
                      href={`/${gender}/${sub.slug}`}
                      className="text-[10px] text-muted-foreground hover:text-black transition-colors"
                    >
                      {sub.name}
                    </Link>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
