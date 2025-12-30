import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiPlus,
  FiX,
  FiTrash2,
  FiCheck,
  FiDroplet,
  FiMaximize,
  FiEdit3,
  FiArrowLeft,
} from "react-icons/fi";
import { message, Modal, Spin } from "antd";
import categoryService from "../../services/categoryService";
import adminService from "../../services/adminService";
import productService from "../../services/productService";

/**
 * ADMIN - SỬA SẢN PHẨM
 * Tương tự ProductForm nhưng load dữ liệu sẵn có
 */

const COMMON_COLORS = [
  "Đen",
  "Trắng",
  "Xám",
  "Be",
  "Nâu",
  "Đỏ",
  "Hồng",
  "Cam",
  "Vàng",
  "Xanh lá",
  "Xanh dương",
  "Xanh navy",
  "Tím",
];

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const ProductEdit = () => {
  const navigate = useNavigate();
  const { productId } = useParams(); // productId is actually slug
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);

  // Thông tin cơ bản
  const [formData, setFormData] = useState({
    name: "",
    short_description: "",
    description: "",
    category_id: "",
    gender: "unisex",
  });

  // Options (Màu sắc, Size)
  const [options, setOptions] = useState([]);

  // Variants
  const [variants, setVariants] = useState([]);

  // Input tạm cho thêm giá trị option
  const [tempOptionInputs, setTempOptionInputs] = useState({});

  // Input cho nhập hàng loạt
  const [bulkInputs, setBulkInputs] = useState({
    price: "",
    stock: "",
  });

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [productId]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProduct = async () => {
    try {
      setInitialLoading(true);
      const response = await productService.getProductBySlug(productId);

      if (response.success && response.data) {
        const p = response.data;
        setProduct(p);

        // Load basic info
        setFormData({
          name: p.name || "",
          short_description: p.short_description || "",
          description: p.description || "",
          category_id: p.category_id || "",
          gender: p.gender || "unisex",
        });

        // Load options
        if (p.options && p.options.length > 0) {
          const loadedOptions = p.options.map((opt) => ({
            id: opt.id,
            name: opt.name,
            values: opt.values ? opt.values.map((v) => v.value) : [],
          }));
          setOptions(loadedOptions);
        }

        // Load variants
        if (p.variants && p.variants.length > 0) {
          const loadedVariants = p.variants.map((v) => ({
            id: v.id,
            combination: v.options
              ? v.options.map((o) => o.value).join(" - ")
              : "",
            sku: v.sku || "",
            price: v.price || "",
            stock: v.stock || "",
            is_active: v.is_active !== false,
          }));
          setVariants(loadedVariants);
        }
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
      message.error("Không thể tải thông tin sản phẩm");
      navigate("/admin/products");
    } finally {
      setInitialLoading(false);
    }
  };

  // Generate new variants when options change
  useEffect(() => {
    if (!initialLoading && options.length > 0) {
      generateVariants();
    }
  }, [options, initialLoading]);

  // === XỬ LÝ OPTIONS ===

  const handleToggleCommonValue = (optionId, value) => {
    setOptions((prev) =>
      prev.map((opt) => {
        if (opt.id === optionId) {
          if (opt.values.includes(value)) {
            return { ...opt, values: opt.values.filter((v) => v !== value) };
          } else {
            return { ...opt, values: [...opt.values, value] };
          }
        }
        return opt;
      })
    );
  };

  const handleAddOptionValue = (optionId) => {
    const inputValue = tempOptionInputs[optionId]?.trim();
    if (!inputValue) {
      message.warning("Vui lòng nhập giá trị");
      return;
    }

    setOptions((prev) =>
      prev.map((opt) => {
        if (opt.id === optionId) {
          if (opt.values.includes(inputValue)) {
            message.warning("Giá trị đã tồn tại");
            return opt;
          }
          return { ...opt, values: [...opt.values, inputValue] };
        }
        return opt;
      })
    );

    setTempOptionInputs((prev) => ({ ...prev, [optionId]: "" }));
  };

  const handleRemoveOptionValue = (optionId, value) => {
    setOptions((prev) =>
      prev.map((opt) => {
        if (opt.id === optionId) {
          return { ...opt, values: opt.values.filter((v) => v !== value) };
        }
        return opt;
      })
    );
  };

  const handleAddOption = () => {
    const newOption = {
      id: Date.now(),
      name: "",
      values: [],
    };
    setOptions((prev) => [...prev, newOption]);
  };

  const handleRemoveOption = (optionId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content:
        "Bạn có chắc muốn xóa tùy chọn này? Các variants liên quan sẽ bị xóa.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        setOptions((prev) => prev.filter((opt) => opt.id !== optionId));
      },
    });
  };

  const handleOptionNameChange = (optionId, newName) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === optionId ? { ...opt, name: newName } : opt))
    );
  };

  // === XỬ LÝ VARIANTS ===

  const generateVariants = () => {
    const validOptions = options.filter((opt) => opt.values.length > 0);

    if (validOptions.length === 0) {
      setVariants([]);
      return;
    }

    const combinations = cartesianProduct(
      validOptions.map((opt) => opt.values)
    );

    const newVariants = combinations.map((combo) => {
      const comboStr = combo.join(" - ");

      // Check if this combination exists in current variants
      const existing = variants.find((v) => v.combination === comboStr);

      if (existing) {
        return existing;
      } else {
        return {
          id: `new_${Date.now()}_${Math.random()}`,
          combination: comboStr,
          sku: "",
          price: "",
          stock: "",
          is_active: true,
        };
      }
    });

    setVariants(newVariants);
  };

  const cartesianProduct = (arrays) => {
    if (arrays.length === 0) return [];
    if (arrays.length === 1) return arrays[0].map((x) => [x]);

    const [first, ...rest] = arrays;
    const restProduct = cartesianProduct(rest);

    return first.flatMap((x) => restProduct.map((r) => [x, ...r]));
  };

  const handleVariantChange = (variantId, field, value) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, [field]: value } : v))
    );
  };

  const handleToggleVariant = (variantId) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId ? { ...v, is_active: !v.is_active } : v
      )
    );
  };

  const handleDeleteVariant = (variantId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa variant này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        setVariants((prev) => prev.filter((v) => v.id !== variantId));
      },
    });
  };

  // === NHẬP HÀNG LOẠT ===

  const handleBulkApplyAll = () => {
    const { price, stock } = bulkInputs;

    if (!price && !stock) {
      message.warning("Vui lòng nhập ít nhất một giá trị");
      return;
    }

    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        price: price ? price : v.price,
        stock: stock ? stock : v.stock,
      }))
    );

    message.success("Đã áp dụng cho tất cả variants");
  };

  // === TỰ ĐỘNG TẠO SKU ===

  const handleAutoGenerateSKU = () => {
    const baseName = formData.name.trim().toUpperCase().replace(/\s+/g, "-");

    if (!baseName) {
      message.warning("Vui lòng nhập tên sản phẩm trước");
      return;
    }

    setVariants((prev) =>
      prev.map((v) => {
        const parts = v.combination
          .split(" - ")
          .map((p) => p.trim().toUpperCase().replace(/\s+/g, "-"));
        const sku = `${baseName}-${parts.join("-")}`;
        return { ...v, sku };
      })
    );

    message.success("Đã tạo SKU tự động cho tất cả variants");
  };

  // === SUBMIT ===

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      message.warning("Vui lòng nhập tên sản phẩm");
      return;
    }

    if (!formData.category_id) {
      message.warning("Vui lòng chọn danh mục");
      return;
    }

    const activeVariants = variants.filter((v) => v.is_active);
    if (activeVariants.length === 0) {
      message.warning("Phải có ít nhất một variant được kích hoạt");
      return;
    }

    // Validate SKU - chỉ check trùng lặp, không bắt buộc nhập
    const skus = activeVariants.map((v) => v.sku.trim()).filter(Boolean);
    const uniqueSkus = new Set(skus);
    if (skus.length > 0 && skus.length !== uniqueSkus.size) {
      message.error("SKU bị trùng lặp, vui lòng kiểm tra lại");
      return;
    }

    // Validate price & stock - chỉ validate nếu có giá trị
    for (const v of activeVariants) {
      if (v.price && parseFloat(v.price) <= 0) {
        message.error(`Giá của variant "${v.combination}" không hợp lệ`);
        return;
      }
      if (v.stock !== "" && parseInt(v.stock) < 0) {
        message.error(`Số lượng của variant "${v.combination}" không hợp lệ`);
        return;
      }
    }

    try {
      setLoading(true);

      // Build payload - chỉ gửi basic info, không update variants qua API này
      // Vì update variants phức tạp hơn (cần thêm/xóa/sửa), tạm thời chỉ update thông tin cơ bản
      const payload = {
        name: formData.name,
        short_description: formData.short_description,
        description: formData.description,
        category_id: formData.category_id,
        gender: formData.gender,
      };

      // Nếu có variants với id hợp lệ thì mới gửi
      const validVariants = activeVariants
        .filter((v) => v.id && typeof v.id === "number")
        .map((v) => {
          const variantData = { id: v.id };
          if (v.sku) variantData.sku = v.sku;
          if (v.price) variantData.price = parseFloat(v.price);
          if (v.stock !== "") variantData.stock = parseInt(v.stock);
          return variantData;
        });

      if (validVariants.length > 0) {
        payload.variants = validVariants;
      }

      const response = await adminService.updateProduct(product.id, payload);

      if (response.success) {
        message.success("Cập nhật sản phẩm thành công");
        navigate("/admin/products");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      message.error(error.message || "Không thể cập nhật sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy sản phẩm</p>
          <button
            onClick={() => navigate("/admin/products")}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/products")}
            className="text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Chỉnh sửa sản phẩm
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Thông tin cơ bản */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Ví dụ: Áo thun nam basic"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới tính
              </label>
              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="unisex">Unisex</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả ngắn
              </label>
              <textarea
                value={formData.short_description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    short_description: e.target.value,
                  })
                }
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Mô tả ngắn gọn về sản phẩm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả chi tiết
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Mô tả đầy đủ về sản phẩm, chất liệu, cách sử dụng..."
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Tùy chọn sản phẩm (Options)
            </h2>
            <button
              type="button"
              onClick={handleAddOption}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <FiPlus /> Thêm tùy chọn
            </button>
          </div>

          {options.map((option, idx) => (
            <div
              key={option.id}
              className="mb-6 p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center gap-4 mb-4">
                <input
                  type="text"
                  value={option.name}
                  onChange={(e) =>
                    handleOptionNameChange(option.id, e.target.value)
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Tên tùy chọn (VD: Màu sắc, Size)"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOption(option.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Xóa option"
                >
                  <FiTrash2 />
                </button>
              </div>

              {/* Quick select cho màu */}
              {option.name.toLowerCase().includes("màu") && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiDroplet className="inline mr-1" />
                    Màu sắc phổ biến:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() =>
                          handleToggleCommonValue(option.id, color)
                        }
                        className={`px-3 py-1.5 text-sm rounded-full border-2 transition-all ${
                          option.values.includes(color)
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-indigo-600"
                        }`}
                      >
                        {option.values.includes(color) && (
                          <FiCheck className="inline mr-1" />
                        )}
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick select cho size */}
              {option.name.toLowerCase().includes("size") && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FiMaximize className="inline mr-1" />
                    Size phổ biến:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleToggleCommonValue(option.id, size)}
                        className={`px-3 py-1.5 text-sm rounded-full border-2 transition-all ${
                          option.values.includes(size)
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-indigo-600"
                        }`}
                      >
                        {option.values.includes(size) && (
                          <FiCheck className="inline mr-1" />
                        )}
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual input */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FiEdit3 className="inline mr-1" />
                  Hoặc nhập thủ công:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempOptionInputs[option.id] || ""}
                    onChange={(e) =>
                      setTempOptionInputs({
                        ...tempOptionInputs,
                        [option.id]: e.target.value,
                      })
                    }
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddOptionValue(option.id);
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Nhập giá trị..."
                  />
                  <button
                    type="button"
                    onClick={() => handleAddOptionValue(option.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <FiPlus />
                  </button>
                </div>
              </div>

              {/* Display selected values */}
              <div className="flex flex-wrap gap-2">
                {option.values.map((val) => (
                  <span
                    key={val}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                  >
                    {val}
                    <button
                      type="button"
                      onClick={() => handleRemoveOptionValue(option.id, val)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <FiX />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Variants */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Biến thể sản phẩm ({variants.filter((v) => v.is_active).length}/
            {variants.length})
          </h2>

          {/* Bulk Input */}
          {variants.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-3">
                Nhập hàng loạt
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá (VND)
                  </label>
                  <input
                    type="number"
                    value={bulkInputs.price}
                    onChange={(e) =>
                      setBulkInputs({ ...bulkInputs, price: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="VD: 299000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng
                  </label>
                  <input
                    type="number"
                    value={bulkInputs.stock}
                    onChange={(e) =>
                      setBulkInputs({ ...bulkInputs, stock: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="VD: 100"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={handleBulkApplyAll}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Áp dụng tất cả
                  </button>
                  <button
                    type="button"
                    onClick={handleAutoGenerateSKU}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    title="Tự động tạo SKU từ tên sản phẩm và tổ hợp"
                  >
                    Tạo SKU tự động
                  </button>
                </div>
              </div>
            </div>
          )}

          {variants.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Chưa có biến thể nào. Vui lòng thêm giá trị cho các tùy chọn bên
              trên.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổ hợp
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá (VND)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số lượng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {variants.map((variant) => (
                    <tr
                      key={variant.id}
                      className={
                        !variant.is_active ? "bg-gray-100 opacity-50" : ""
                      }
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {variant.combination}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) =>
                            handleVariantChange(
                              variant.id,
                              "sku",
                              e.target.value
                            )
                          }
                          disabled={!variant.is_active}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 text-sm"
                          placeholder="SKU"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) =>
                            handleVariantChange(
                              variant.id,
                              "price",
                              e.target.value
                            )
                          }
                          disabled={!variant.is_active}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 text-sm"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) =>
                            handleVariantChange(
                              variant.id,
                              "stock",
                              e.target.value
                            )
                          }
                          disabled={!variant.is_active}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 text-sm"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleVariant(variant.id)}
                          className={`px-3 py-1 text-xs rounded-full font-medium ${
                            variant.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {variant.is_active ? "Kích hoạt" : "Tắt"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteVariant(variant.id)}
                          className="text-red-600 hover:text-red-900 p-2"
                          title="Xóa variant"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Đang cập nhật..." : "Cập nhật sản phẩm"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductEdit;
