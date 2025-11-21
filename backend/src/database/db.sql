-- File này chỉ để check SQL thiết kế CSDL cho ứng dụng e-commerce mini

1. Tổng quan các bảng (Đã cập nhật)
Nhóm người dùng & địa chỉ

users: Tài khoản (customer + admin).

provinces: (Mới) Danh mục Tỉnh/Thành phố.

districts: (Mới) Danh mục Quận/Huyện.

wards: (Mới) Danh mục Phường/Xã.

user_addresses: Địa chỉ giao hàng (dùng ID tham chiếu đến 3 bảng trên).

Nhóm catalog sản phẩm

categories: Phân loại sản phẩm.

products: Thông tin sản phẩm (thêm short_description).

product_images: Nhiều ảnh cho mỗi sản phẩm.

product_videos: Video giới thiệu (đã đơn giản hóa).

wishlists: (Mới) Sản phẩm yêu thích của user.

Nhóm giỏ hàng & đặt hàng

carts: Giỏ hàng (đã đơn giản hóa, chỉ dành cho user đã login).

cart_items: Từng dòng sản phẩm trong giỏ.

orders: Đơn hàng (vẫn snapshot địa chỉ dạng text).

order_items: Chi tiết từng sản phẩm trong đơn.

Nhóm thanh toán & đánh giá

payment_transactions: Giao dịch VNPay giả lập.

product_reviews: Review + rating.

(Optional) Nhóm lịch sử xem

product_views: Log ai xem sản phẩm nào.

(Tất cả các bảng chính đều được thêm deleted_at để hỗ trợ soft delete).

-- Sử dụng InnoDB để hỗ trợ FK + Transaction
SET default_storage_engine = InnoDB;
SET NAMES utf8mb4;

-- 1. BẢNG USERS (Cập nhật: thêm deleted_at)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL COMMENT 'Nên lưu hash, không lưu clear text',
    role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL, -- Hỗ trợ Soft Delete
    
    INDEX idx_users_role (role),
    INDEX idx_users_is_active (is_active),
    INDEX idx_users_deleted_at (deleted_at)
) COMMENT 'Thông tin tài khoản người dùng và admin';

--------------------------------------------------------

-- (MỚI) 2A. BẢNG PROVINCES
CREATE TABLE provinces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
) COMMENT 'Danh sách Tỉnh/Thành phố';

-- (MỚI) 2B. BẢNG DISTRICTS
CREATE TABLE districts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    province_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT fk_districts_province
        FOREIGN KEY (province_id) REFERENCES provinces(id)
        ON DELETE CASCADE,
    INDEX idx_districts_province (province_id)
) COMMENT 'Danh sách Quận/Huyện';

-- (MỚI) 2C. BẢNG WARDS
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
    receiver_name VARCHAR(255) NOT NULL COMMENT 'Tên người nhận',
    phone VARCHAR(20) NOT NULL,
    address_line VARCHAR(255) NOT NULL COMMENT 'Số nhà, tên đường',
    ward_id INT NOT NULL,
    district_id INT NOT NULL,
    province_id INT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL, -- Hỗ trợ Soft Delete

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
    INDEX idx_user_addresses_default (is_default),
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
    deleted_at TIMESTAMP NULL, -- Hỗ trợ Soft Delete

    CONSTRAINT fk_categories_parent 
        FOREIGN KEY (parent_id) REFERENCES categories(id)
        ON DELETE SET NULL,
    
    INDEX idx_categories_active (is_active),
    INDEX idx_categories_deleted_at (deleted_at)
) COMMENT 'Danh mục sản phẩm (category)';

--------------------------------------------------------

-- 4. BẢNG PRODUCTS (Cập nhật: thêm short_description, deleted_at)
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    short_description VARCHAR(500) NULL COMMENT 'Mô tả ngắn (cho list view)',
    description TEXT COMMENT 'Mô tả chi tiết',
    price DECIMAL(12,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0 COMMENT 'Tồn kho hiện tại',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL, -- Hỗ trợ Soft Delete

    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE SET NULL,

    INDEX idx_products_category (category_id),
    INDEX idx_products_active (is_active),
    INDEX idx_products_price (price),
    INDEX idx_products_deleted_at (deleted_at)
) COMMENT 'Thông tin sản phẩm';

--------------------------------------------------------

-- 5. BẢNG PRODUCT_IMAGES (Cập nhật: thêm deleted_at)
CREATE TABLE product_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL COMMENT 'Đường dẫn file ảnh',
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP NULL, -- Hỗ trợ Soft Delete

    CONSTRAINT fk_product_images_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,

    INDEX idx_product_images_product (product_id),
    INDEX idx_product_images_primary (product_id, is_primary)
) COMMENT 'Danh sách ảnh của sản phẩm';

--------------------------------------------------------

-- 6. BẢNG PRODUCT_VIDEOS (Cập nhật: Đơn giản hóa)
CREATE TABLE product_videos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    video_url VARCHAR(500) NOT NULL COMMENT 'Đường dẫn file video',
    -- Đã bỏ title, description, sort_order
    
    CONSTRAINT fk_product_videos_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,

    INDEX idx_product_videos_product (product_id)
) COMMENT 'Video giới thiệu của sản phẩm (đơn giản)';

--------------------------------------------------------

-- 7. BẢNG CARTS (Cập nhật: Bỏ session_id, status. Yêu cầu login)
CREATE TABLE carts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE COMMENT 'Mỗi user chỉ có 1 giỏ hàng',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_carts_user 
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) COMMENT 'Giỏ hàng (chỉ dành cho user đã login)';

--------------------------------------------------------

-- 8. BẢNG CART_ITEMS (Không đổi)
-- Tự động liên kết với user thông qua cart_id
CREATE TABLE cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL COMMENT 'Giá tại thời điểm thêm vào giỏ',

    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id) REFERENCES carts(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE RESTRICT,

    INDEX idx_cart_items_cart (cart_id),
    UNIQUE KEY uq_cart_product (cart_id, product_id)
) COMMENT 'Chi tiết sản phẩm trong giỏ hàng';

--------------------------------------------------------

-- 9. BẢNG ORDERS (Cập nhật: Vẫn giữ snapshot text cho địa chỉ)
-- Quan trọng: Bảng orders phải snapshot lại tên Tỉnh/Huyện/Xã
-- vì địa chỉ của user có thể thay đổi, nhưng địa chỉ của đơn hàng cũ thì KHÔNG.
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    status ENUM(
        'PENDING_PAYMENT',
        'PAID',
        'SHIPPING',
        'COMPLETED',
        'CANCELLED',
        'PAYMENT_FAILED'
    ) NOT NULL DEFAULT 'PENDING_PAYMENT',
    
    -- Thông tin giao hàng snapshot tại thời điểm đặt (Lưu dạng TEXT)
    shipping_full_name VARCHAR(255) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_address_line VARCHAR(255) NOT NULL,
    shipping_ward VARCHAR(100) NOT NULL,
    shipping_district VARCHAR(100) NOT NULL,
    shipping_province VARCHAR(100) NOT NULL,

    -- Tổng tiền
    items_total DECIMAL(12,2) NOT NULL,
    shipping_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,

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
) COMMENT 'Đơn hàng của khách (snapshot địa chỉ dạng text)';

--------------------------------------------------------

-- 10. BẢNG ORDER_ITEMS (Không đổi)
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL COMMENT 'Snapshot tên sản phẩm',
    unit_price DECIMAL(12,2) NOT NULL COMMENT 'Snapshot giá tại thời điểm đặt',
    quantity INT NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL COMMENT 'unit_price * quantity',

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE RESTRICT,

    INDEX idx_order_items_order (order_id)
) COMMENT 'Chi tiết sản phẩm trong đơn hàng';

--------------------------------------------------------

-- 11. BẢNG PAYMENT_TRANSACTIONS (Không đổi)
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
) COMMENT 'Giao dịch thanh toán VNPay giả lập';

--------------------------------------------------------

-- 12. BẢNG PRODUCT_REVIEWS (Cập nhật: thêm deleted_at)
CREATE TABLE product_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    order_id BIGINT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL, -- Hỗ trợ Soft Delete

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
    INDEX idx_product_reviews_user (user_id),
    INDEX idx_product_reviews_deleted_at (deleted_at)
) COMMENT 'Đánh giá (review + rating) cho sản phẩm';

--------------------------------------------------------

-- 13. BẢNG PRODUCT_VIEWS (Cập nhật: Bỏ session_id)
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

    INDEX idx_product_views_user (user_id),
    INDEX idx_product_views_product (product_id),
    INDEX idx_product_views_viewed_at (viewed_at)
) COMMENT 'Lịch sử xem sản phẩm (phục vụ gợi ý)';

--------------------------------------------------------

-- (MỚI) 14. BẢNG WISHLISTS
CREATE TABLE wishlists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_wishlists_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_wishlists_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,
    UNIQUE KEY uq_user_product (user_id, product_id)
) COMMENT 'Sản phẩm yêu thích của user';

Chào bạn, tôi đã xem các ghi chú của bạn. Đây là những thay đổi rất thực tế và hợp lý!

Chuẩn hóa Địa chỉ (Provinces/Districts/Wards): Rất tốt! Điều này giúp chuẩn hóa dữ liệu đầu vào, tránh sai sót (ví dụ: "HN" vs "Hà Nội") và dễ dàng làm các bộ lọc/dropdown.

Soft Delete (deleted_at): Đây là một thông lệ (best practice) tuyệt vời. Nó giúp bạn giữ lại dữ liệu lịch sử (ví dụ: một đơn hàng cũ vẫn tham chiếu được sản phẩm đã "xóa") và cho phép khôi phục dữ liệu.

short_description: Rất hữu dụng, dùng để hiển thị ở trang danh sách sản phẩm, trong khi description (dài) dùng cho trang chi tiết.

Đơn giản hóa product_videos: Hợp lý. Giảm bớt các trường không cần thiết cho một hệ thống "mini".

Bắt buộc Login cho Giỏ hàng: Đây là một thay đổi lớn về nghiệp vụ. Nó đơn giản hóa rất nhiều về mặt kỹ thuật (không cần xử lý giỏ hàng của khách, không cần gộp giỏ hàng...). Tuy nhiên, nó có thể tăng "ma sát" (friction) khi người dùng mua hàng. Nhưng vì bạn đã quyết định, tôi sẽ cập nhật schema theo hướng này.

wishlists: Một tính năng cơ bản và cần thiết của e-commerce. Thêm vào là hoàn toàn chính xác.

Dưới đây là phiên bản CSDL đã được cập nhật dựa trên tất cả các ghi chú của bạn, cùng với phần giải thích đã được điều chỉnh cho phù hợp.

1. Tổng quan các bảng (Đã cập nhật)
Nhóm người dùng & địa chỉ

users: Tài khoản (customer + admin).

provinces: (Mới) Danh mục Tỉnh/Thành phố.

districts: (Mới) Danh mục Quận/Huyện.

wards: (Mới) Danh mục Phường/Xã.

user_addresses: Địa chỉ giao hàng (dùng ID tham chiếu đến 3 bảng trên).

Nhóm catalog sản phẩm

categories: Phân loại sản phẩm.

products: Thông tin sản phẩm (thêm short_description).

product_images: Nhiều ảnh cho mỗi sản phẩm.

product_videos: Video giới thiệu (đã đơn giản hóa).

wishlists: (Mới) Sản phẩm yêu thích của user.

Nhóm giỏ hàng & đặt hàng

carts: Giỏ hàng (đã đơn giản hóa, chỉ dành cho user đã login).

cart_items: Từng dòng sản phẩm trong giỏ.

orders: Đơn hàng (vẫn snapshot địa chỉ dạng text).

order_items: Chi tiết từng sản phẩm trong đơn.

Nhóm thanh toán & đánh giá

payment_transactions: Giao dịch VNPay giả lập.

product_reviews: Review + rating.

(Optional) Nhóm lịch sử xem

product_views: Log ai xem sản phẩm nào.

(Tất cả các bảng chính đều được thêm deleted_at để hỗ trợ soft delete).

2. SQL thiết kế chi tiết (Đã cập nhật)
SQL

-- Sử dụng InnoDB để hỗ trợ FK + Transaction
SET default_storage_engine = InnoDB;
SET NAMES utf8mb4;

-- 1. BẢNG USERS (Cập nhật: thêm deleted_at)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL COMMENT 'Nên lưu hash, không lưu clear text',
    role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL, -- Hỗ trợ Soft Delete
    
    INDEX idx_users_role (role),
    INDEX idx_users_is_active (is_active),
    INDEX idx_users_deleted_at (deleted_at)
) COMMENT 'Thông tin tài khoản người dùng và admin';

--------------------------------------------------------

-- (MỚI) 2A. BẢNG PROVINCES
CREATE TABLE provinces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
) COMMENT 'Danh sách Tỉnh/Thành phố';

-- (MỚI) 2B. BẢNG DISTRICTS
CREATE TABLE districts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    province_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT fk_districts_province
        FOREIGN KEY (province_id) REFERENCES provinces(id)
        ON DELETE CASCADE,
    INDEX idx_districts_province (province_id)
) COMMENT 'Danh sách Quận/Huyện';

-- (MỚI) 2C. BẢNG WARDS
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
    receiver_name VARCHAR(255) NOT NULL COMMENT 'Tên người nhận',
    phone VARCHAR(20) NOT NULL,
    address_line VARCHAR(255) NOT NULL COMMENT 'Số nhà, tên đường',
    ward_id INT NOT NULL,
    district_id INT NOT NULL,
    province_id INT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL, -- Hỗ trợ Soft Delete

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
    INDEX idx_user_addresses_default (is_default),
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
    deleted_at TIMESTAMP NULL, -- Hỗ trợ Soft Delete

    CONSTRAINT fk_categories_parent 
        FOREIGN KEY (parent_id) REFERENCES categories(id)
        ON DELETE SET NULL,
    
    INDEX idx_categories_active (is_active),
    INDEX idx_categories_deleted_at (deleted_at)
) COMMENT 'Danh mục sản phẩm (category)';

--------------------------------------------------------

-- 4. BẢNG PRODUCTS (Cập nhật: thêm short_description, deleted_at)
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    short_description VARCHAR(500) NULL COMMENT 'Mô tả ngắn (cho list view)',
    description TEXT COMMENT 'Mô tả chi tiết',
    price DECIMAL(12,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0 COMMENT 'Tồn kho hiện tại',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL, -- Hỗ trợ Soft Delete

    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE SET NULL,

    INDEX idx_products_category (category_id),
    INDEX idx_products_active (is_active),
    INDEX idx_products_price (price),
    INDEX idx_products_deleted_at (deleted_at)
) COMMENT 'Thông tin sản phẩm';

--------------------------------------------------------

-- 5. BẢNG PRODUCT_IMAGES (Cập nhật: thêm deleted_at)
CREATE TABLE product_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL COMMENT 'Đường dẫn file ảnh',
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    deleted_at TIMESTAMP NULL, -- Hỗ trợ Soft Delete

    CONSTRAINT fk_product_images_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,

    INDEX idx_product_images_product (product_id),
    INDEX idx_product_images_primary (product_id, is_primary)
) COMMENT 'Danh sách ảnh của sản phẩm';

--------------------------------------------------------

-- 6. BẢNG PRODUCT_VIDEOS (Cập nhật: Đơn giản hóa)
CREATE TABLE product_videos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    video_url VARCHAR(500) NOT NULL COMMENT 'Đường dẫn file video',
    -- Đã bỏ title, description, sort_order
    
    CONSTRAINT fk_product_videos_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,

    INDEX idx_product_videos_product (product_id)
) COMMENT 'Video giới thiệu của sản phẩm (đơn giản)';

--------------------------------------------------------

-- 7. BẢNG CARTS (Cập nhật: Bỏ session_id, status. Yêu cầu login)
CREATE TABLE carts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE COMMENT 'Mỗi user chỉ có 1 giỏ hàng',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_carts_user 
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) COMMENT 'Giỏ hàng (chỉ dành cho user đã login)';

--------------------------------------------------------

-- 8. BẢNG CART_ITEMS (Không đổi)
-- Tự động liên kết với user thông qua cart_id
CREATE TABLE cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL COMMENT 'Giá tại thời điểm thêm vào giỏ',

    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id) REFERENCES carts(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE RESTRICT,

    INDEX idx_cart_items_cart (cart_id),
    UNIQUE KEY uq_cart_product (cart_id, product_id)
) COMMENT 'Chi tiết sản phẩm trong giỏ hàng';

--------------------------------------------------------

-- 9. BẢNG ORDERS (Cập nhật: Vẫn giữ snapshot text cho địa chỉ)
-- Quan trọng: Bảng orders phải snapshot lại tên Tỉnh/Huyện/Xã
-- vì địa chỉ của user có thể thay đổi, nhưng địa chỉ của đơn hàng cũ thì KHÔNG.
CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_code VARCHAR(50) NOT NULL UNIQUE,
    status ENUM(
        'PENDING_PAYMENT',
        'PAID',
        'SHIPPING',
        'COMPLETED',
        'CANCELLED',
        'PAYMENT_FAILED'
    ) NOT NULL DEFAULT 'PENDING_PAYMENT',
    
    -- Thông tin giao hàng snapshot tại thời điểm đặt (Lưu dạng TEXT)
    shipping_full_name VARCHAR(255) NOT NULL,
    shipping_phone VARCHAR(20) NOT NULL,
    shipping_address_line VARCHAR(255) NOT NULL,
    shipping_ward VARCHAR(100) NOT NULL,
    shipping_district VARCHAR(100) NOT NULL,
    shipping_province VARCHAR(100) NOT NULL,

    -- Tổng tiền
    items_total DECIMAL(12,2) NOT NULL,
    shipping_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,

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
) COMMENT 'Đơn hàng của khách (snapshot địa chỉ dạng text)';

--------------------------------------------------------

-- 10. BẢNG ORDER_ITEMS (Không đổi)
CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL COMMENT 'Snapshot tên sản phẩm',
    unit_price DECIMAL(12,2) NOT NULL COMMENT 'Snapshot giá tại thời điểm đặt',
    quantity INT NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL COMMENT 'unit_price * quantity',

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE RESTRICT,

    INDEX idx_order_items_order (order_id)
) COMMENT 'Chi tiết sản phẩm trong đơn hàng';

--------------------------------------------------------

-- 11. BẢNG PAYMENT_TRANSACTIONS (Không đổi)
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
) COMMENT 'Giao dịch thanh toán VNPay giả lập';

--------------------------------------------------------

-- 12. BẢNG PRODUCT_REVIEWS (Cập nhật: thêm deleted_at)
CREATE TABLE product_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    order_id BIGINT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_approved BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL, -- Hỗ trợ Soft Delete

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
    INDEX idx_product_reviews_user (user_id),
    INDEX idx_product_reviews_deleted_at (deleted_at)
) COMMENT 'Đánh giá (review + rating) cho sản phẩm';

--------------------------------------------------------

-- 13. BẢNG PRODUCT_VIEWS (Cập nhật: Bỏ session_id)
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

    INDEX idx_product_views_user (user_id),
    INDEX idx_product_views_product (product_id),
    INDEX idx_product_views_viewed_at (viewed_at)
) COMMENT 'Lịch sử xem sản phẩm (phục vụ gợi ý)';

--------------------------------------------------------

-- (MỚI) 14. BẢNG WISHLISTS
CREATE TABLE wishlists (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_wishlists_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_wishlists_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,
    UNIQUE KEY uq_user_product (user_id, product_id)
) COMMENT 'Sản phẩm yêu thích của user';

3. Giải thích: DB này map với chức năng thế nào? (Đã cập nhật)
3.1. Auth & tài khoản
Đăng ký / đăng nhập / phân quyền

Bảng users: email, password_hash (dùng để xác thực), role (phân quyền customer / admin).

is_active dùng để khóa/mở tài khoản.

deleted_at dùng để "xóa mềm" (soft delete) tài khoản.

Địa chỉ giao hàng (Đã cập nhật)

Bảng provinces, districts, wards: Ba bảng MỚI này chứa dữ liệu chuẩn hóa về địa chỉ. Dùng để populate (hiển thị) các dropdown cho người dùng chọn khi nhập địa chỉ, đảm bảo tính nhất quán.

Bảng user_addresses:

Một user có thể có nhiều địa chỉ.

Sử dụng province_id, district_id, ward_id (khóa ngoại) để tham chiếu đến 3 bảng trên.

is_default giúp lấy địa chỉ mặc định khi checkout.

3.2. Catalog sản phẩm
Categories

categories: parent_id cho phép tạo cây category (cha–con). deleted_at để xóa mềm.

Products (Đã cập nhật)

products:

category_id FK sang categories.

short_description (MỚI) dùng cho trang danh sách/card sản phẩm.

description (dài) dùng cho trang chi tiết.

deleted_at để xóa mềm.

Media (Đã cập nhật)

product_images: Một sản phẩm nhiều ảnh. is_primary = ảnh đại diện.

product_videos: (Đã đơn giản hóa) Chỉ cần video_url.

Wishlist (MỚI)

wishlists: Bảng MỚI. Lưu user_id và product_id. Ràng buộc UNIQUE(user_id, product_id) đảm bảo mỗi user chỉ "thích" một sản phẩm 1 lần.

3.3. Giỏ hàng (Cart) & Checkout (Đã cập nhật)
Giỏ hàng (Đã đơn giản hóa)

Logic mới: Bắt buộc đăng nhập để thêm vào giỏ.

carts:

Đã bỏ session_id và status.

user_id giờ là NOT NULL và UNIQUE. Đảm bảo mỗi user chỉ có 1 giỏ hàng duy nhất.

cart_items:

Vẫn như cũ, chứa product_id, quantity.

UNIQUE (cart_id, product_id) để mỗi sản phẩm chỉ 1 dòng.

Checkout → Order

Khi user checkout:

Lấy dữ liệu từ giỏ (cart_items) của user đó.

Tạo bản ghi trong orders.

Tạo nhiều order_items.

3.4. Orders & thanh toán VNPay giả
Đơn hàng (Quan trọng: Giải thích về địa chỉ)

orders:

status: Quản lý trạng thái (Chờ thanh toán, Đang giao, Hoàn thành...).

Thông tin giao hàng snapshot:

Các trường shipping_ward, shipping_district, shipping_province vẫn được lưu dưới dạng VARCHAR (text).

Lý do: Đây là "ảnh chụp nhanh" (snapshot) tại thời điểm đặt hàng. Nếu sau này nhà nước thay đổi tên/gộp Huyện (ví dụ: Quận 2 -> TP. Thủ Đức), hoặc user đổi địa chỉ trong user_addresses, thì thông tin trong đơn hàng cũ không được phép thay đổi.

Chi tiết đơn

order_items: product_name, unit_price cũng là snapshot tại thời điểm đặt.

VNPay giả lập

payment_transactions: Log lại các lần thanh toán (thành công / thất bại) cho 1 đơn hàng.

3.5. Review & rating
product_reviews:

rating 1–5, comment.

order_id (optional): Dùng để kiểm tra logic (chỉ ai đã mua mới được review).

deleted_at: Admin có thể xóa mềm review.

3.6. Recommendation & lịch sử xem (Đã cập nhật)
product_views:

Đã bỏ session_id.

Chỉ lưu user_id (nếu user đã login) và product_id họ đã xem.

Từ bảng này, bạn có thể show "Sản phẩm bạn vừa xem" (chỉ cho user đã login).