const BlogHero = () => {
  return (
    <div className="w-full px-4 sm:px-6 md:px-10 lg:px-[60px] py-8 sm:py-12 md:py-16">
      <div className="w-full h-3.5 bg-black mb-2" />
      <div className="w-full">
        <h1 className="text-[160px] leading-[176px] font-semibold text-black">
          everworld
        </h1>
        <div className="text-2xl leading-[33.24px] text-black">
          <p className="mb-0">We're on a mission to clean up a dirty industry.</p>
          <p>These are the people, stories, and ideas that will help us get there.</p>
        </div>
      </div>
    </div>
  );
};

export default BlogHero;
