const BlogCard = ({ image, title, category }) => (
  <div className="flex-1 flex flex-col gap-5">
    <div className="w-full h-[413px]">
      <img src={image} alt={title} className="w-full h-full object-cover" />
    </div>
    <div className="flex flex-col gap-3">
      <p className="text-[32px] leading-10 text-black">{title}</p>
      <div className="inline-flex items-center justify-center px-5 py-1 border border-[#dddbdc] rounded-[30px] w-fit">
        <p className="text-xs font-semibold text-black">{category}</p>
      </div>
    </div>
  </div>
);

export default BlogCard;
