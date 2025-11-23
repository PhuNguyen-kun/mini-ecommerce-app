import { Link } from 'react-router-dom';

const BlogCard = ({ image, title, category }) => (
  <Link to="/blog-post" className="flex-1 flex flex-col gap-5 cursor-pointer group">
    <div className="w-full h-[413px] overflow-hidden">
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
      />
    </div>
    <div className="flex flex-col gap-3">
      <p className="text-[32px] leading-10 text-black group-hover:underline">{title}</p>
      <div className="inline-flex items-center justify-center px-5 py-1 border border-[#dddbdc] rounded-[30px] w-fit">
        <p className="text-xs font-semibold text-black">{category}</p>
      </div>
    </div>
  </Link>
);

export default BlogCard;
