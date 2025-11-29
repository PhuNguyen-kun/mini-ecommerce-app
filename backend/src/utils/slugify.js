const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .normalize("NFD") // Chuyển sang unicode tổ hợp
        .replace(/[\u0300-\u036f]/g, "") // Xóa các dấu thanh
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d")
        .replace(/\s+/g, "-") // Thay khoảng trắng bằng dấu gạch ngang
        .replace(/[^\w\-]+/g, "") // Xóa ký tự đặc biệt
        .replace(/\-\-+/g, "-") // Xóa gạch ngang kép
        .replace(/^-+/, "") // Xóa gạch ngang đầu
        .replace(/-+$/, ""); // Xóa gạch ngang cuối
};

module.exports = slugify;