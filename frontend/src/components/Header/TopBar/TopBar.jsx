import { HiArrowRight } from "react-icons/hi2";
import vnimage from "../../../assets/vn.png";

export default function TopBar() {
  return (
    <div className="bg-black text-white py-2 px-4 sm:px-6 flex justify-center items-center text-xs relative">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <p className="tracking-wide text-[10px] sm:text-xs hidden sm:block">
          Get early access on launches and offers.
        </p>
        <p className="underline cursor-pointer hover:opacity-80 text-[10px] sm:text-xs">
          Sign Up For Texts
        </p>
        <HiArrowRight className="w-3 h-3" />
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 absolute right-4 sm:right-6">
        <img src={vnimage} alt="VN" className="w-4 h-3 sm:w-5 sm:h-3.5 object-cover" />
        <p className="text-[10px] sm:text-xs">Đồng</p>
      </div>
    </div>
  );
}
