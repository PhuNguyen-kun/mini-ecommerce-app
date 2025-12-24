Đây là các thay đổi và lý do chính:

Biến thể sản phẩm (Product Variants): Đây là thay đổi lớn nhất.

products (sản phẩm gốc): Chỉ lưu thông tin chung (tên, mô tả). Không còn price và stock.

product_variants (biến thể): Đây mới là thứ thực sự bán. Nó sẽ lưu sku, price, và inventory_on_hand (tồn kho). Ví dụ: "Áo thun - Xanh - Size L".

product_options & product_option_values: Dùng để định nghĩa các thuộc tính (Option: "Màu sắc", Value: "Xanh").

product_variant_options (bảng nối): Nối một biến thể với các giá trị thuộc tính của nó.

Tồn kho (Inventory): Thay vì một cột stock, chúng ta dùng một bảng inventory_movements (sổ cái kho) để ghi lại mọi thay đổi (nhập, bán, trả hàng). Cột inventory_on_hand trong product_variants sẽ là tổng của bảng này (cache).

Linh hoạt (Flexibility): Thay thế các cột ENUM (như order.status) bằng các bảng tra cứu (lookup tables) như order_statuses. Điều này giúp bạn thêm/bớt trạng thái mà không cần ALTER TABLE.

Khuyến mãi (Promotions): Thêm các bảng promotions và order_promotions để quản lý mã giảm giá.

-- Sử dụng InnoDB để hỗ trợ FK + Transaction
SET default_storage_engine = InnoDB;
SET NAMES utf8mb4;

-- 1. BẢNG USERS (Cập nhật: thêm deleted_at)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_users_role (role),
    INDEX idx_users_deleted_at (deleted_at)
) COMMENT 'Thông tin tài khoản người dùng và admin';

--------------------------------------------------------

-- 2A. BẢNG PROVINCES
CREATE TABLE provinces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
) COMMENT 'Danh sách Tỉnh/Thành phố';

-- 2B. BẢNG DISTRICTS
CREATE TABLE districts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    province_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT fk_districts_province
        FOREIGN KEY (province_id) REFERENCES provinces(id)
        ON DELETE CASCADE,
    INDEX idx_districts_province (province_id)
) COMMENT 'Danh sách Quận/Huyện';

-- 2C. BẢNG WARDS
CREATE TABLE wards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    district_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT fk_wards_district
        FOREIGN KEY (district_id) REFERENCES districts(id)
        ON DELETE CASCADE,
    INDEX idx_wards_district (district_id)
) COMMENT 'Danh sách Phường/Xã';

--------------------------------------------------------

-- 2D. BẢNG USER_ADDRESSES (Cập nhật: dùng ID địa chỉ, thêm deleted_at)
CREATE TABLE user_addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    receiver_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    ward_id INT NOT NULL,
    district_id INT NOT NULL,
    province_id INT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_user_addresses_user 
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_user_addresses_province
        FOREIGN KEY (province_id) REFERENCES provinces(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_user_addresses_district
        FOREIGN KEY (district_id) REFERENCES districts(id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_user_addresses_ward
        FOREIGN KEY (ward_id) REFERENCES wards(id)
        ON DELETE RESTRICT,
    INDEX idx_user_addresses_user (user_id),
    INDEX idx_user_addresses_deleted_at (deleted_at)
) COMMENT 'Địa chỉ giao hàng của user (dùng ID chuẩn hóa)';

--------------------------------------------------------

-- 3. BẢNG CATEGORIES (Cập nhật: thêm deleted_at)
CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    parent_id BIGINT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_categories_parent 
        FOREIGN KEY (parent_id) REFERENCES categories(id)
        ON DELETE SET NULL,
    INDEX idx_categories_deleted_at (deleted_at)
) COMMENT 'Danh mục sản phẩm (category)';

--------------------------------------------------------
-- CẤU TRÚC SẢN PHẨM & BIẾN THỂ (GIỮ NGUYÊN)
--------------------------------------------------------

-- 4. BẢNG PRODUCTS (Sản phẩm GỐC)
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NULL,
    name VARCHAR(255) NOT NULL COMMENT 'VD: Áo Thun Cổ Tròn',
    slug VARCHAR(255) NOT NULL UNIQUE,
    short_description VARCHAR(500) NULL,
    description TEXT,
    gender ENUM('male', 'female', 'unisex') NOT NULL DEFAULT 'unisex',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE SET NULL,
    INDEX idx_products_category (category_id),
    INDEX idx_products_deleted_at (deleted_at)
) COMMENT 'Sản phẩm GỐC (cha) - lưu thông tin chung';

-- 5. BẢNG PRODUCT_OPTIONS (Mới)
CREATE TABLE product_options (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL COMMENT 'VD: Màu sắc, Kích cỡ',
    
    CONSTRAINT fk_product_options_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,
    UNIQUE KEY uq_product_option_name (product_id, name)
) COMMENT 'Các loại thuộc tính của sản phẩm';

-- 6. BẢNG PRODUCT_OPTION_VALUES (Mới)
CREATE TABLE product_option_values (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_option_id BIGINT NOT NULL,
    value VARCHAR(100) NOT NULL COMMENT 'VD: Xanh, L',
    meta VARCHAR(255) NULL COMMENT 'Lưu thêm (VD: mã hex #FF0000)',

    CONSTRAINT fk_product_option_values_option
        FOREIGN KEY (product_option_id) REFERENCES product_options(id)
        ON DELETE CASCADE,
    UNIQUE KEY uq_option_value (product_option_id, value)
) COMMENT 'Các giá trị cho mỗi loại thuộc tính';

-- 7. BẢNG PRODUCT_VARIANTS (Cập nhật: Quay lại dùng `stock` đơn giản)
CREATE TABLE product_variants (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE COMMENT 'VD: AO-XANH-L',
    price DECIMAL(12,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0 COMMENT 'Tồn kho đơn giản',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_product_variants_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,
    INDEX idx_product_variants_sku (sku),
    INDEX idx_product_variants_deleted_at (deleted_at)
) COMMENT 'Biến thể sản phẩm (SKU, giá, tồn kho)';

-- 8. BẢNG PRODUCT_VARIANT_OPTIONS (Mới)
CREATE TABLE product_variant_options (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_variant_id BIGINT NOT NULL,
    product_option_value_id BIGINT NOT NULL,

    CONSTRAINT fk_pvo_variant
        FOREIGN KEY (product_variant_id) REFERENCES product_variants(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_pvo_option_value
        FOREIGN KEY (product_option_value_id) REFERENCES product_option_values(id)
        ON DELETE CASCADE,
    UNIQUE KEY uq_variant_option_value (product_variant_id, product_option_value_id)
) COMMENT 'Nối biến thể với các giá trị thuộc tính của nó';

-- 9. BẢNG PRODUCT_IMAGES (Cập nhật: Thêm variant_id, deleted_at)
CREATE TABLE product_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    product_variant_id BIGINT NULL COMMENT 'Link tới biến thể (VD: ảnh áo màu Xanh)',
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_product_images_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_product_images_variant
        FOREIGN KEY (product_variant_id) REFERENCES product_variants(id)
        ON DELETE SET NULL,
    INDEX idx_product_images_product (product_id)
) COMMENT 'Ảnh sản phẩm (chung hoặc cho biến thể)';

-- 10. BẢNG PRODUCT_VIDEOS (Cập nhật: Đơn giản hóa, thêm deleted_at)
CREATE TABLE product_videos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    video_url VARCHAR(500) NOT NULL,
    deleted_at TIMESTAMP NULL,
    
    CONSTRAINT fk_product_videos_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,
    INDEX idx_product_videos_product (product_id)
) COMMENT 'Video giới thiệu của sản phẩm (đơn giản)';

-- 11. BẢNG WISHLISTS (Mới - Theo ghi chú)
CREATE TABLE wishlists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL COMMENT 'Yêu thích sản phẩm GỐC',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_wishlists_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_wishlists_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,
    UNIQUE KEY uq_user_product (user_id, product_id)
) COMMENT 'Sản phẩm yêu thích của user (link tới sản phẩm gốc)';

--------------------------------------------------------
-- GIỎ HÀNG, ĐƠN HÀNG & THANH TOÁN (TINH GỌN)
--------------------------------------------------------

-- 12. BẢNG CARTS (Đơn giản hóa)
CREATE TABLE carts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_carts_user 
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) COMMENT 'Giỏ hàng (chỉ dành cho user đã login)';

-- 13. BẢNG CART_ITEMS (Cập nhật: Link tới product_variant_id)
CREATE TABLE cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    product_variant_id BIGINT NOT NULL COMMENT 'Thêm biến thể vào giỏ',
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL COMMENT 'Giá tại thời điểm thêm vào giỏ',

    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id) REFERENCES carts(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_variant
        FOREIGN KEY (product_variant_id) REFERENCES product_variants(id)
        ON DELETE RESTRICT,

    INDEX idx_cart_items_cart (cart_id),
    UNIQUE KEY uq_cart_variant (cart_id, product_variant_id)
) COMMENT 'Chi tiết biến thể sản phẩm trong giỏ hàng';

-- 14. BẢNG ORDERS (Cập nhật: Quay lại dùng ENUM, Bỏ discount)
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    status ENUM(
        'PENDING_PAYMENT',
        'CONFIRMED',
        'PAID',
        'SHIPPING',
        'COMPLETED',
        'CANCELLED',
        'PAYMENT_FAILED'
    ) NOT NULL DEFAULT 'PENDING_PAYMENT',
    
    -- Thông tin giao hàng snapshot (VẪN LƯU DẠNG TEXT)
    shipping_full_name VARCHAR(255) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_address_line VARCHAR(255) NOT NULL,
    shipping_ward VARCHAR(100) NOT NULL,
    shipping_district VARCHAR(100) NOT NULL,
    shipping_province VARCHAR(100) NOT NULL,

    -- Tổng tiền (Đã bỏ discount)
    items_total DECIMAL(12,2) NOT NULL,
    shipping_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL COMMENT 'items_total + shipping_fee',

    payment_method ENUM('VNPAY_FAKE', 'COD', 'TEST') NOT NULL DEFAULT 'VNPAY_FAKE',
    payment_status ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    paid_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,

    CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE RESTRICT,
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_status (status)
) COMMENT 'Đơn hàng (dùng ENUM, không có discount)';

-- 15. BẢNG ORDER_ITEMS (Cập nhật: Link tới variant, snapshot info)
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_variant_id BIGINT NOT NULL,
    
    -- Snapshot info
    product_name_snapshot VARCHAR(255) NOT NULL COMMENT 'Snapshot tên sản phẩm GỐC',
    product_variant_description_snapshot VARCHAR(500) COMMENT 'Snapshot mô tả biến thể (VD: Xanh / L)',
    product_sku_snapshot VARCHAR(100) NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL COMMENT 'Snapshot giá tại thời điểm đặt',
    
    quantity INT NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_order_items_variant
        FOREIGN KEY (product_variant_id) REFERENCES product_variants(id)
        ON DELETE RESTRICT,
    INDEX idx_order_items_order (order_id)
) COMMENT 'Chi tiết biến thể sản phẩm trong đơn hàng';

-- 16. BẢNG PAYMENT_TRANSACTIONS (Cập nhật: Quay lại dùng ENUM)
CREATE TABLE payment_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    provider ENUM('VNPAY_FAKE') NOT NULL DEFAULT 'VNPAY_FAKE',
    amount DECIMAL(12,2) NOT NULL,
    status ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    transaction_code VARCHAR(100) NULL,
    message VARCHAR(255) NULL,
    raw_request TEXT NULL,
    raw_response TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_transactions_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE,
    INDEX idx_payment_transactions_order (order_id),
    INDEX idx_payment_transactions_status (status)
) COMMENT 'Giao dịch thanh toán (dùng ENUM)';

--------------------------------------------------------
-- REVIEW & LỊCH SỬ
--------------------------------------------------------

-- 17. BẢNG PRODUCT_REVIEWS (Cập nhật: thêm deleted_at)
CREATE TABLE product_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL COMMENT 'Review cho sản phẩm GỐC',
    order_id BIGINT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    CONSTRAINT fk_product_reviews_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_product_reviews_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_product_reviews_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE SET NULL,
    INDEX idx_product_reviews_product (product_id),
    INDEX idx_product_reviews_deleted_at (deleted_at)
) COMMENT 'Đánh giá (review + rating) cho sản phẩm GỐC';

-- 18. BẢNG PRODUCT_VIEWS (Cập nhật: Bỏ session_id)
CREATE TABLE product_views (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL COMMENT 'Null nếu user chưa login',
    product_id BIGINT NOT NULL,
    viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_views_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_product_views_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,
    INDEX idx_product_views_user (user_id)
) COMMENT 'Lịch sử xem sản phẩm (phục vụ gợi ý)';

Chốt! Đây là một schema rất tốt và cân bằng. Nó giữ lại được toàn bộ các tính năng quan trọng (biến thể, địa chỉ chuẩn, soft delete, wishlist, review) đồng thời tinh gọn ở những chỗ cần thiết (dùng ENUM cho status, dùng stock đơn giản) để dự án dễ dàng phát triển.

Dưới đây là giải thích chi tiết toàn bộ 18 bảng của schema này để bạn tham khảo.

🚀 Giải thích Toàn bộ CSDL E-Commerce (18 Bảng)
Thiết kế này được chia thành 4 nhóm chức năng chính.

1. 👪 Nhóm Người dùng & Địa chỉ (5 bảng)
Nhóm này quản lý AI là người mua và họ ở ĐÂU.

users (Bảng 1): Bảng trung tâm lưu tài khoản.

Chứa thông tin đăng nhập (email, password_hash).

Phân quyền (role là 'customer' hay 'admin').

Có cột deleted_at để hỗ trợ Soft Delete (xóa mềm), giúp bạn vô hiệu hóa tài khoản thay vì xóa vĩnh viễn, bảo toàn dữ liệu đơn hàng cũ của họ.

provinces (Bảng 2A): Bảng tra cứu Tỉnh/Thành phố.

districts (Bảng 2B): Bảng tra cứu Quận/Huyện (liên kết với provinces).

wards (Bảng 2C): Bảng tra cứu Phường/Xã (liên kết với districts).

Lý do có 3 bảng này: Đây là Chuẩn hóa dữ liệu địa chỉ. Nó giúp bạn tạo các menu dropdown (ô chọn) nhất quán, buộc người dùng chọn địa chỉ chuẩn thay vì gõ tay (tránh lỗi "HN" vs "Hà Nội").

user_addresses (Bảng 2D): Sổ địa chỉ của người dùng.

Một user có thể có nhiều địa chỉ.

Liên kết user_id với các ID địa chỉ chuẩn (ward_id, district_id, province_id).

Cột is_default để xác định địa chỉ mặc định khi checkout.

2. 👕 Nhóm Catalog & Biến thể Sản phẩm (6 bảng)
Đây là nhóm cốt lõi và phức tạp nhất, cho phép bạn bán quần áo (có size, màu sắc, ...).

categories (Bảng 3): Phân loại sản phẩm (VD: Áo Sơ Mi, Quần Jeans). Cột parent_id cho phép tạo danh mục cha-con.

products (Bảng 4): Đây là Sản phẩm GỐC (hay "sản phẩm cha").

Chỉ lưu thông tin chung: name (VD: "Áo Sơ Mi Cổ Tròn"), description, short_description.

Quan trọng: Bảng này KHÔNG chứa price (giá) hay stock (tồn kho).

product_variants (Bảng 7): Đây là Sản phẩm BÁN (hay "biến thể" / SKU).

Đây là thứ mà người dùng thực sự mua (VD: "Áo Sơ Mi-Màu Trắng-Size M").

Quan trọng: Bảng này chứa sku (mã quản lý kho), price và stock cho từng biến thể cụ thể.

product_options (Bảng 5): Định nghĩa các loại lựa chọn.

Ví dụ: một product_id (Áo Sơ Mi) sẽ có 2 dòng ở bảng này: (1, "Màu sắc"), (2, "Kích cỡ").

product_option_values (Bảng 6): Định nghĩa các giá trị cho lựa chọn.

Ví dụ: (Giá trị "Trắng", "Xanh" -> liên kết với Option "Màu sắc"), (Giá trị "S", "M", "L" -> liên kết với Option "Kích cỡ").

product_variant_options (Bảng 8): Bảng "keo" (bảng nối). Nó kết nối một biến thể với các giá trị của nó.

Ví dụ thực tế:

Bạn có 1 biến thể: product_variants (ID: 101, SKU: "AOSOMI-TRANG-M")

Bảng này sẽ có 2 dòng để mô tả nó:

product_variant_id = 101, product_option_value_id = (ID của "Trắng")

product_variant_id = 101, product_option_value_id = (ID của "M")

3. 🛒 Nhóm Luồng Mua hàng (5 bảng)
Nhóm này xử lý nghiệp vụ từ lúc thêm vào giỏ đến lúc đặt hàng thành công.

carts (Bảng 12): Giỏ hàng. Thiết kế đã được đơn giản hóa:

Bắt buộc đăng nhập (user_id là NOT NULL).

Mỗi user chỉ có 1 giỏ duy nhất (user_id là UNIQUE).

cart_items (Bảng 13): Các món hàng trong giỏ.

Quan trọng: Nó liên kết tới product_variant_id (Bảng 7), vì người dùng thêm một "biến thể" (Áo-Trắng-M) vào giỏ, chứ không phải sản phẩm gốc.

orders (Bảng 14): Hóa đơn, được tạo khi người dùng "Checkout".

Snapshot Địa chỉ (Cực kỳ quan trọng): Các trường shipping_ward, shipping_district, shipping_province được lưu dưới dạng TEXT (VARCHAR). Đây là "ảnh chụp" thông tin tại thời điểm đặt. Nó đảm bảo địa chỉ đơn hàng cũ không bị thay đổi, ngay cả khi sau này người dùng cập nhật sổ địa chỉ của họ.

Tinh gọn: Dùng ENUM cho status và payment_status. Cách này đơn giản, nhanh gọn cho dự án.

order_items (Bảng 15): Chi tiết các món hàng trong một đơn hàng.

Snapshot Sản phẩm (Cực kỳ quan trọng): Nó lưu lại product_name_snapshot, unit_price, product_sku_snapshot... tại thời điểm đặt. Điều này đảm bảo hóa đơn không bao giờ thay đổi, ngay cả khi admin đổi giá hoặc tên sản phẩm trong tương lai.

payment_transactions (Bảng 16): Nhật ký (log) các lần thanh toán.

Lưu lại mọi nỗ lực thanh toán (thành công, thất bại) cho một đơn hàng. Hữu ích cho việc đối soát.

4. ✨ Nhóm Tính năng Phụ trợ & Trải nghiệm (5 bảng)
Đây là các bảng (mà bạn đã giữ lại) để làm cho trang web đầy đủ tính năng và phong phú hơn.

product_images (Bảng 9): Lưu ảnh sản phẩm.

Thiết kế rất linh hoạt: product_id (ảnh chung cho sản phẩm) VÀ product_variant_id (có thể gán ảnh riêng cho từng màu). Khi user chọn "Màu Xanh", bạn có thể ưu tiên hiển thị ảnh có product_variant_id của màu Xanh.

product_videos (Bảng 10): Lưu link video giới thiệu (đã đơn giản hóa).

wishlists (Bảng 11): Lưu "Sản phẩm yêu thích" của người dùng.

Nó liên kết user_id với product_id (Sản phẩm GỐC). Người dùng "yêu thích" cái "Áo Sơ Mi" nói chung.

product_reviews (Bảng 17): Lưu đánh giá (rating + comment).

Cũng liên kết với product_id (Sản phẩm GỐC).

Cột order_id (có thể NULL) dùng để xác minh "Đánh giá từ người đã mua".

product_views (Bảng 18): Lưu lịch sử xem sản phẩm.