import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { TrendingGrid } from "@/components/home/TrendingGrid";
import { CommunitySection } from "@/components/home/CommunitySection";
import { connectDB } from "@/lib/db";
import { HeroSection as HeroModel } from "@/models";

async function getHeroSections() {
  "use cache";
  try {
    await connectDB();
    const sections = await HeroModel.find({ gender: "woman", isActive: true })
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
    leftImage: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=960&h=1080&fit=crop&q=80",
    rightImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=960&h=1080&fit=crop&q=80",
    ctaText: "VIEW NOW",
    ctaLink: "/woman/basics",
  },
  {
    title: "TEEN GIRL",
    subtitle: "Youthful styles for the new generation",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1920&h=1080&fit=crop&q=80",
    ctaText: "VIEW NOW",
    ctaLink: "/woman/teen-girl",
  },
];

export default async function HomePage() {
  const heroes = await getHeroSections();

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

  return (
    <>
      <Header />
      <main>
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
        <TrendingGrid />
        <CommunitySection />
      </main>
      <Footer />
    </>
  );
}
