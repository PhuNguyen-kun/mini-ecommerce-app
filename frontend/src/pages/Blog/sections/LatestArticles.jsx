import BlogCard from './BlogCard';
import blog1 from '../../../assets/blog/blog-1.png';
import blog2 from '../../../assets/blog/blog-2.png';
import blog3 from '../../../assets/blog/blog-3.png';
import blog4 from '../../../assets/blog/blog-4.png';
import blog5 from '../../../assets/blog/blog-5.png';
import blog6 from '../../../assets/blog/blog-6.png';

const LatestArticles = () => {
  const articles = [
    [
      { image: blog1, title: 'How To Style Winter Whites', category: 'Style' },
      { image: blog2, title: 'We Won A Glossy Award', category: 'Transparency' },
      { image: blog3, title: 'Coordinate Your Style: Matching Outfits for Everyone', category: 'Style' },
    ],
    [
      { image: blog4, title: 'Black Friday Fund 2023', category: 'Transparency' },
      { image: blog5, title: 'What to Wear this Season: Holiday Outfits & Ideas', category: 'Style' },
      { image: blog6, title: 'Thanksgiving Outfit Ideas', category: 'Style' },
    ],
  ];

  return (
    <div className="w-full px-[60px] py-[120px]">
      <h2 className="text-[54px] leading-[72px] font-semibold text-black mb-3">
        The Latest
      </h2>
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-[120px]">
          {articles.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-6 w-full">
              {row.map((article, articleIndex) => (
                <BlogCard key={articleIndex} {...article} />
              ))}
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <button className="bg-black text-white px-[100px] py-5 rounded-lg text-sm font-semibold tracking-[0.42px] hover:opacity-90 transition-opacity">
            Load more Articles
          </button>
        </div>
      </div>
    </div>
  );
};

export default LatestArticles;
