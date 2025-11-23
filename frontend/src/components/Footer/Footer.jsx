import { HiArrowRight } from 'react-icons/hi2';

export default function Footer() {
  return (
    <footer className="w-full bg-[#f5f4f4] pt-10 pb-0 px-[72px]">
      {/* Main Content */}
      <div className="flex w-full">
        {/* Account */}
        <div className="flex-1 flex flex-col gap-5 p-5">
          <h4 className="text-base font-semibold leading-6 tracking-[0.2px] text-neutral-800">
            Acount
          </h4>
          <div className="flex flex-col gap-2.5 text-sm leading-[16.8px] tracking-[1.4px] text-neutral-500">
            <a href="#" className="hover:text-neutral-800">Log In</a>
            <a href="#" className="hover:text-neutral-800">Sign Up</a>
            <a href="#" className="hover:text-neutral-800">Redeem a Gift Card</a>
          </div>
        </div>

        {/* Company */}
        <div className="flex-1 flex flex-col gap-5 p-5">
          <h4 className="text-base font-semibold leading-6 tracking-[0.2px] text-neutral-800">
            Company
          </h4>
          <div className="flex flex-col gap-2.5 text-sm leading-[16.8px] tracking-[1.4px] text-neutral-500">
            <a href="#" className="hover:text-neutral-800">About</a>
            <a href="#" className="hover:text-neutral-800">Environmental Initiatives</a>
            <a href="#" className="hover:text-neutral-800">Factories</a>
            <a href="#" className="hover:text-neutral-800">DEI</a>
            <a href="#" className="hover:text-neutral-800">Careers</a>
            <a href="#" className="hover:text-neutral-800">International</a>
            <a href="#" className="hover:text-neutral-800">Accessibility</a>
          </div>
        </div>

        {/* Get Help */}
        <div className="flex-1 flex flex-col gap-5 p-5">
          <h4 className="text-base font-semibold leading-6 tracking-[0.2px] text-neutral-800">
            Get Help
          </h4>
          <div className="flex flex-col gap-2.5 text-sm leading-[16.8px] tracking-[1.4px] text-neutral-500">
            <a href="#" className="hover:text-neutral-800">Help Center</a>
            <a href="#" className="hover:text-neutral-800">Return Policy</a>
            <a href="#" className="hover:text-neutral-800">Shipping Info</a>
            <a href="#" className="hover:text-neutral-800">Bulk Orders</a>
          </div>
        </div>

        {/* Connect */}
        <div className="flex-1 flex flex-col gap-5 p-5">
          <h4 className="text-base font-semibold leading-6 tracking-[0.2px] text-neutral-800">
            Connect
          </h4>
          <div className="flex flex-col gap-2.5 text-sm leading-[16.8px] tracking-[1.4px] text-neutral-500">
            <a href="#" className="hover:text-neutral-800">Facebook</a>
            <a href="#" className="hover:text-neutral-800">Instagram</a>
            <a href="#" className="hover:text-neutral-800">Twitter</a>
            <a href="#" className="hover:text-neutral-800">Affiliates</a>
            <a href="#" className="hover:text-neutral-800">Out Stores</a>
          </div>
        </div>

        {/* Newsletter */}
        <div className="flex items-start p-5">
          <div className="flex">
            <input 
              type="email" 
              placeholder="Email Address" 
              className="w-[388px] px-[15px] py-[18px] bg-white border border-[#dddbdc] text-sm leading-[16.8px] tracking-[1.4px] text-neutral-500 focus:outline-none focus:border-neutral-800"
            />
            <button className="bg-neutral-800 border border-neutral-800 px-3.5 py-3.5 hover:bg-neutral-700 transition-colors">
              <HiArrowRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Links */}
      <div className="flex flex-col gap-4 items-center py-4 text-xs leading-4 tracking-[0.2px] text-center text-neutral-500">
        <div className="flex gap-6 justify-center w-full">
          <a href="#" className="hover:text-neutral-800">Privacy Policy</a>
          <a href="#" className="hover:text-neutral-800">Terms of Service</a>
          <a href="#" className="hover:text-neutral-800">Do Not Sell or Share My Personal Information</a>
          <a href="#" className="hover:text-neutral-800">CS Supply Chain Transparency</a>
          <a href="#" className="hover:text-neutral-800">Vendor Code of Conduct</a>
          <a href="#" className="hover:text-neutral-800">Sitemap Pages</a>
          <a href="#" className="hover:text-neutral-800">Sitemap Products</a>
        </div>
        <p className="w-full">© 2023 All Rights Reserved</p>
      </div>
    </footer>
  );
}
