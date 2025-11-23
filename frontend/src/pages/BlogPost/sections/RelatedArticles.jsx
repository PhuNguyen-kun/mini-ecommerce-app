import { Link } from 'react-router-dom';
import article1 from '../../../assets/blogpost/related-1.png';
import article2 from '../../../assets/blogpost/related-2.png';
import article3 from '../../../assets/blogpost/related-3.png';

const RelatedArticles = () => {
  const articles = [
    {
      id: 1,
      image: article1,
      title: 'How To Style Winter Whites',
      category: 'Style'
    },
    {
      id: 2,
      image: article2,
      title: 'We Won A Glossy Award',
      category: 'Transparency'
    },
    {
      id: 3,
      image: article3,
      title: 'Coordinate Your Style: Matching Outfits for Everyone',
      category: 'Style'
    }
  ];

  return (
    <div className="flex gap-6 px-0">
      {articles.map((article) => (
        <Link 
          key={article.id} 
          to="/blog-post" 
          className="flex-1 group cursor-pointer"
        >
          <div className="h-[413px] bg-gray-100 mb-5 overflow-hidden">
            <img 
              src={article.image} 
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <h3 className="text-[32px] leading-10 text-black mb-3 group-hover:underline">
            {article.title}
          </h3>
          <div className="border border-[#dddbdc] rounded-[30px] px-5 py-1 inline-block">
            <p className="text-xs font-semibold text-black">{article.category}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RelatedArticles;
