import { HeroSection } from "@/components/home/HeroSection";
import Link from "next/link";
import Image from "next/image";
import { connectDB } from "@/lib/db";
import { HeroSection as HeroModel, Category } from "@/models";
import { Suspense } from "react";

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    { params: { gender: "woman" } }
  ]
};

async function getHeroSections(gender: string) {
  try {
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
    await connectDB();
    const categories = await Category.find({ gender, parentId: null, isActive: true })
      .sort({ sortOrder: 1 })
      .lean();
    return JSON.parse(JSON.stringify(categories));
  } catch {
    return [];
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
    : (GENDER_FALLBACK[gender] || GENDER_FALLBACK.woman);

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

async function CategoriesWrapper({ gender }: { gender: string }) {
  const categories = await getCategories(gender);
  return (
    <section className="py-12 md:py-16 px-4 md:px-12 bg-white">
      <h2 className="text-sm font-medium tracking-[0.1em] mb-8 uppercase">Shop by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.length > 0 ? (
          categories.map((cat: Record<string, string>) => (
            <Link key={cat._id} href={`/${gender}/${cat.slug}`} className="group">
              <div className="relative aspect-[3/4] overflow-hidden bg-muted mb-3">
                <Image
                  src={cat.image || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop&q=80"}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="25vw"
                />
              </div>
              <span className="text-xs font-medium tracking-wider uppercase">{cat.name}</span>
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted-foreground col-span-full">No categories available</p>
        )}
      </div>
    </section>
  );
}
