import { FaTwitter, FaFacebookF, FaLinkedinIn } from 'react-icons/fa';

const IntroSection = () => {
  return (
    <div className="px-[60px] py-[115px]">
      <div className="w-full h-[14px] bg-black mb-10" />
      <div className="flex gap-[148px]">
        <div className="flex gap-1.5 items-start shrink-0">
          <button className="w-7 h-7 flex items-center justify-center hover:opacity-70 transition-opacity">
            <FaTwitter size={20} />
          </button>
          <button className="w-7 h-7 flex items-center justify-center hover:opacity-70 transition-opacity">
            <FaFacebookF size={20} />
          </button>
          <button className="w-7 h-7 flex items-center justify-center hover:opacity-70 transition-opacity">
            <FaLinkedinIn size={20} />
          </button>
        </div>
        <p className="flex-1 text-black text-[40px] leading-[48px] font-semibold">
          In a season dominated by dark hues, redefine your winter wardrobe with the timeless elegance of winter whites. Whether top-to-toe white outfits, tonal mixing-and-matching, or a key white piece (or two), give your style a breath of fresh air with this list of winter white closet essentials.
        </p>
      </div>
    </div>
  );
};

export default IntroSection;
