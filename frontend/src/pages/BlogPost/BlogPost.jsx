
import BlogPostHero from './sections/BlogPostHero';
import IntroSection from './sections/IntroSection';
import BlogContent from './sections/BlogContent';
import ProductCarousel from './sections/ProductCarousel';
import RelatedArticles from './sections/RelatedArticles';

const BlogPost = () => {
  return (
    <div className="bg-white min-h-screen">

        <BlogPostHero />
        <IntroSection />
        <BlogContent />
        <ProductCarousel />
        <RelatedArticles />
    
    </div>
  );
};

export default BlogPost;
