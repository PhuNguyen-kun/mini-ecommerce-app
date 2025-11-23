import heroImage from '../../../assets/blogpost/hero.png';

const BlogPostHero = () => {
  return (
    <div className="relative w-full h-[691px] flex items-end px-[53px] py-[70px] overflow-hidden">
      <img 
        src={heroImage} 
        alt="Winter Whites" 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="relative z-10 max-w-[940px]">
        <div className="border border-white rounded-[30px] px-5 py-2 inline-block mb-3">
          <p className="text-white text-xs tracking-wide">Style</p>
        </div>
        <h1 className="text-white text-[64px] leading-[72px] font-semibold mb-4">
          Style<br/>
          How To Style Winter<br/>
          Whites
        </h1>
        <p className="text-white text-2xl leading-[33px]">
          Redefine your winter wardrobe with the timeless elegance of winter whites with this style guide.
        </p>
      </div>
    </div>
  );
};

export default BlogPostHero;
