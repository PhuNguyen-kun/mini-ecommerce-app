import { HiArrowRight } from 'react-icons/hi2';
import vnimage from '../../../assets/vn.png';



export default function TopBar() {
  return (
    <div className="bg-black text-white py-2 px-6 flex justify-center items-center text-xs relative">
      <div className="flex items-center gap-2">
        <p className="tracking-wide">
          Get early access on launches and offers.
        </p>
        <p className="underline cursor-pointer hover:opacity-80">
          Sign Up For Texts
        </p>
        <HiArrowRight className="w-3 h-3" />
      </div>
      <div className="flex items-center gap-2 absolute right-6">
        <img 
          src={vnimage} 
          alt="VN" 
          className="w-5 h-3.5 object-cover"
        />
        <p>Đồng</p>
      </div>
    </div>
  );
}
