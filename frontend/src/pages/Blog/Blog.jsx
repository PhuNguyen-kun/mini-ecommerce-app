import BlogHero from './sections/BlogHero';
import LatestArticles from './sections/LatestArticles';
import BannerSection from './sections/BannerSection';
import OurProgress from './sections/OurProgress';
import SocialSection from './sections/SocialSection';

const Blog = () => {
  return (
    <div className="bg-white w-full">
      <BlogHero />
      <LatestArticles />
      <BannerSection />
      <OurProgress />
      <SocialSection />
    </div>
  );
};

export default Blog;
