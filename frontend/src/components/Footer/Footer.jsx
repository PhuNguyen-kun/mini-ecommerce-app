import { HiArrowRight } from 'react-icons/hi2';

export default function Footer() {
  return (
    <footer className="w-full bg-[#f5f4f4] pt-6 sm:pt-8 md:pt-10 pb-0 px-4 sm:px-6 md:px-10 lg:px-[72px]">
      {/* Main Content */}
      <div className="flex flex-col md:flex-row w-full">
        {/* Account */}
        <div className="flex-1 flex flex-col gap-3 sm:gap-4 md:gap-5 p-3 sm:p-4 md:p-5">
          <h4 className="text-sm sm:text-base font-semibold leading-5 sm:leading-6 tracking-[0.2px] text-neutral-800">
            Tài khoản
          </h4>
          <div className="flex flex-col gap-2 sm:gap-2.5 text-xs sm:text-sm leading-[16.8px] tracking-[1.4px] text-neutral-500">
            <a href="#" className="hover:text-neutral-800">Đăng nhập</a>
            <a href="#" className="hover:text-neutral-800">Đăng ký</a>
            <a href="#" className="hover:text-neutral-800">Đổi thẻ quà tặng</a>
          </div>
        </div>

        {/* Company */}
        <div className="flex-1 flex flex-col gap-3 sm:gap-4 md:gap-5 p-3 sm:p-4 md:p-5">
          <h4 className="text-sm sm:text-base font-semibold leading-5 sm:leading-6 tracking-[0.2px] text-neutral-800">
            Công ty
          </h4>
          <div className="flex flex-col gap-2 sm:gap-2.5 text-xs sm:text-sm leading-[16.8px] tracking-[1.4px] text-neutral-500">
            <a href="#" className="hover:text-neutral-800">Giới thiệu</a>
            <a href="#" className="hover:text-neutral-800">Sáng kiến môi trường</a>
            <a href="#" className="hover:text-neutral-800">Nhà máy</a>
            <a href="#" className="hover:text-neutral-800">Đa dạng & Hòa nhập</a>
            <a href="#" className="hover:text-neutral-800">Tuyển dụng</a>
            <a href="#" className="hover:text-neutral-800">Quốc tế</a>
            <a href="#" className="hover:text-neutral-800">Hỗ trợ truy cập</a>
          </div>
        </div>

        {/* Get Help */}
        <div className="flex-1 flex flex-col gap-3 sm:gap-4 md:gap-5 p-3 sm:p-4 md:p-5">
          <h4 className="text-sm sm:text-base font-semibold leading-5 sm:leading-6 tracking-[0.2px] text-neutral-800">
            Trợ giúp
          </h4>
          <div className="flex flex-col gap-2 sm:gap-2.5 text-xs sm:text-sm leading-[16.8px] tracking-[1.4px] text-neutral-500">
            <a href="#" className="hover:text-neutral-800">Trung tâm hỗ trợ</a>
            <a href="#" className="hover:text-neutral-800">Chính sách đổi trả</a>
            <a href="#" className="hover:text-neutral-800">Thông tin vận chuyển</a>
            <a href="#" className="hover:text-neutral-800">Đơn hàng số lượng lớn</a>
          </div>
        </div>

        {/* Connect */}
        <div className="flex-1 flex flex-col gap-3 sm:gap-4 md:gap-5 p-3 sm:p-4 md:p-5">
          <h4 className="text-sm sm:text-base font-semibold leading-5 sm:leading-6 tracking-[0.2px] text-neutral-800">
            Kết nối
          </h4>
          <div className="flex flex-col gap-2 sm:gap-2.5 text-xs sm:text-sm leading-[16.8px] tracking-[1.4px] text-neutral-500">
            <a href="#" className="hover:text-neutral-800">Facebook</a>
            <a href="#" className="hover:text-neutral-800">Instagram</a>
            <a href="#" className="hover:text-neutral-800">Twitter</a>
            <a href="#" className="hover:text-neutral-800">Đối tác liên kết</a>
            <a href="#" className="hover:text-neutral-800">Cửa hàng</a>
          </div>
        </div>

        {/* Newsletter */}
        <div className="flex items-start p-3 sm:p-4 md:p-5 w-full md:w-auto">
          <div className="flex w-full">
            <input
              type="email"
              placeholder="Địa chỉ Email"
              className="flex-1 md:w-[300px] lg:w-[388px] px-3 sm:px-[15px] py-3 sm:py-[18px] bg-white border border-[#dddbdc] text-xs sm:text-sm leading-[16.8px] tracking-[1.4px] text-neutral-500 focus:outline-none focus:border-neutral-800"
            />
            <button className="bg-neutral-800 border border-neutral-800 px-2.5 sm:px-3.5 py-2.5 sm:py-3.5 hover:bg-neutral-700 transition-colors">
              <HiArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Links */}
      <div className="flex flex-col gap-3 sm:gap-4 items-center py-3 sm:py-4 text-[10px] sm:text-xs leading-4 tracking-[0.2px] text-center text-neutral-500">
        <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 justify-center w-full px-2">
          <a href="#" className="hover:text-neutral-800">Chính sách bảo mật</a>
          <a href="#" className="hover:text-neutral-800">Điều khoản dịch vụ</a>
          <a href="#" className="hover:text-neutral-800">Không bán thông tin cá nhân</a>
          <a href="#" className="hover:text-neutral-800">Minh bạch chuỗi cung ứng</a>
          <a href="#" className="hover:text-neutral-800">Quy tắc ứng xử nhà cung cấp</a>
          <a href="#" className="hover:text-neutral-800">Sơ đồ trang</a>
          <a href="#" className="hover:text-neutral-800">Sơ đồ sản phẩm</a>
        </div>
        <p className="w-full">© 2025 Bảo lưu mọi quyền</p>
      </div>
    </footer>
  );
}
