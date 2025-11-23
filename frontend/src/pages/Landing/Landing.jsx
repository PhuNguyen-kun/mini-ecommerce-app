import HeroSection from './sections/HeroSection';
import CategorySection from './sections/CategorySection';
import ImageGrid from './sections/ImageGrid';
import FeaturedBanner from './sections/FeaturedBanner';
import ProductCarousel from './sections/ProductCarousel';
import Testimonials from './sections/Testimonials';
import ContentCards from './sections/ContentCards';
import InstagramGallery from './sections/InstagramGallery';
import Features from './sections/Features';

export default function Landing() {
  return (
    <>
      <HeroSection />
      <CategorySection />
      <ImageGrid />
      <FeaturedBanner />
      <ProductCarousel />
      <Testimonials />
      <ContentCards />
      <InstagramGallery />
      <Features />
    </>
  );
}
