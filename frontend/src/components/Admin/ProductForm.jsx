import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiX,
  FiTrash2,
  FiCheck,
  FiDroplet,
  FiMaximize,
  FiEdit3,
} from "react-icons/fi";
import { message, Modal } from "antd";
import categoryService from "../../services/categoryService";
import adminService from "../../services/adminService";

/**
 * ADMIN - TẠO SẢN PHẨM (Giai đoạn 1)
 * Tính năng:
 * - Nhập thông tin cơ bản
 * - Tạo Options (Màu, Size) với các giá trị
 * - Hệ thống tự sinh tất cả variants (nhân chéo)
 * - Admin tắt/xóa variants không cần
 * - Nhập SKU, Giá, Kho cho từng variant
 */

// Danh sách màu sắc cơ bản
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

// Danh sách size cơ bản
const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const ProductForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // Thông tin cơ bản
  const [formData, setFormData] = useState({
    name: "",
    short_description: "",
    description: "",
    category_id: "",
    gender: "unisex",
  });

  // Options (Màu sắc, Size)
  const [options, setOptions] = useState([
    { id: Date.now(), name: "Màu sắc", values: [] },
    { id: Date.now() + 1, name: "Size", values: [] },
  ]);

  // Variants (tự động sinh)
  const [variants, setVariants] = useState([]);

  // Input tạm cho thêm giá trị option
  const [tempOptionInputs, setTempOptionInputs] = useState({});

  // Input cho nhập hàng loạt (không bao gồm SKU vì SKU phải duy nhất)
  const [bulkInputs, setBulkInputs] = useState({
    price: "",
    stock: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    generateVariants();
  }, [options]);

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

  // === XỬ LÝ OPTIONS ===

  const handleToggleCommonValue = (optionId, value) => {
    setOptions((prev) =>
      prev.map((opt) => {
        if (opt.id === optionId) {
          if (opt.values.includes(value)) {
            // Bỏ chọn - xóa giá trị
            return { ...opt, values: opt.values.filter((v) => v !== value) };
          } else {
            // Tick chọn - thêm giá trị
            return { ...opt, values: [...opt.values, value] };
          }
        }
        return opt;
      })
    );
  };

  const handleAddOptionValue = (optionId) => {
    const inputValue = tempOptionInputs[optionId]?.trim();
    if (!inputValue) return;

    setOptions((prev) =>
      prev.map((opt) => {
        if (opt.id === optionId) {
          if (opt.values.includes(inputValue)) {
            message.warning("Giá trị này đã tồn tại!");
            return opt;
          }
          return { ...opt, values: [...opt.values, inputValue] };
        }
        return opt;
      })
    );

    setTempOptionInputs((prev) => ({ ...prev, [optionId]: "" }));
  };

  const handleRemoveOptionValue = (optionId, valueIndex) => {
    setOptions((prev) =>
      prev.map((opt) => {
        if (opt.id === optionId) {
          return {
            ...opt,
            values: opt.values.filter((_, idx) => idx !== valueIndex),
          };
        }
        return opt;
      })
    );
  };

  const handleOptionNameChange = (optionId, newName) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === optionId ? { ...opt, name: newName } : opt))
    );
  };

  // === TỰ ĐỘNG SINH VARIANTS ===

  const generateVariants = () => {
    const validOptions = options.filter((opt) => opt.values.length > 0);

    if (validOptions.length === 0) {
      setVariants([]);
      return;
    }

    const combinations = cartesianProduct(
      validOptions.map((opt) =>
        opt.values.map((val) => ({ name: opt.name, value: val }))
      )
    );

    const newVariants = combinations.map((combo, index) => {
      const comboKey = combo
        .map((c) => `${c.name}:${c.value}`)
        .sort()
        .join("|");

      const existingVariant = variants.find((v) => {
        const existingKey = Object.entries(v.options)
          .map(([k, val]) => `${k}:${val}`)
          .sort()
          .join("|");
        return existingKey === comboKey;
      });

      if (existingVariant) {
        return existingVariant;
      }

      const optionsObj = {};
      combo.forEach((c) => {
        optionsObj[c.name] = c.value;
      });

      return {
        id: Date.now() + index,
        options: optionsObj,
        sku: "",
        price: "",
        stock: "",
        enabled: true,
      };
    });

    setVariants(newVariants);
  };

  const cartesianProduct = (arrays) => {
    return arrays.reduce(
      (acc, array) => {
        return acc.flatMap((x) => array.map((y) => [...x, y]));
      },
      [[]]
    );
  };

  // === XỬ LÝ VARIANTS ===

  const handleBulkApply = (field) => {
    const value = bulkInputs[field];
    if (!value) {
      message.warning(
        `Vui lòng nhập giá trị cho ${field === "price" ? "Giá" : "Kho"}!`
      );
      return;
    }

    setVariants((prev) =>
      prev.map((v) => (v.enabled ? { ...v, [field]: value } : v))
    );

    // Reset input sau khi áp dụng
    setBulkInputs((prev) => ({ ...prev, [field]: "" }));
    message.success(
      `Đã áp dụng ${
        field === "price" ? "Giá" : "Kho"
      } cho tất cả biến thể đang bật!`
    );
  };

  const handleBulkApplyAll = () => {
    if (!bulkInputs.price && !bulkInputs.stock) {
      message.warning("Vui lòng nhập ít nhất một giá trị!");
      return;
    }

    setVariants((prev) =>
      prev.map((v) => {
        if (!v.enabled) return v;
        return {
          ...v,
          ...(bulkInputs.price && { price: bulkInputs.price }),
          ...(bulkInputs.stock && { stock: bulkInputs.stock }),
        };
      })
    );

    setBulkInputs({ price: "", stock: "" });
    message.success("Đã áp dụng cho tất cả biến thể đang bật!");
  };

  const handleAutoGenerateSKU = () => {
    if (!formData.name.trim()) {
      message.warning("Vui lòng nhập tên sản phẩm trước!");
      return;
    }

    const productPrefix = formData.name
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Bỏ dấu tiếng Việt
      .replace(/Đ/g, "D")
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 6);

    setVariants((prev) =>
      prev.map((v) => {
        if (!v.enabled) return v;

        const variantSuffix = Object.values(v.options)
          .join("-")
          .toUpperCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/Đ/g, "D")
          .replace(/[^A-Z0-9-]/g, "");

        return {
          ...v,
          sku: `${productPrefix}-${variantSuffix}`,
        };
      })
    );

    message.success("Đã tạo SKU tự động cho tất cả biến thể!");
  };

  const handleVariantChange = (variantId, field, value) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, [field]: value } : v))
    );
  };

  const handleToggleVariant = (variantId) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, enabled: !v.enabled } : v))
    );
  };

  const handleRemoveVariant = (variantId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa biến thể này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: () => {
        setVariants((prev) => prev.filter((v) => v.id !== variantId));
      },
    });
  };

  // === SUBMIT ===

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      message.error("Vui lòng nhập tên sản phẩm!");
      return;
    }

    const enabledVariants = variants.filter((v) => v.enabled);
    if (enabledVariants.length === 0) {
      message.error("Vui lòng tạo ít nhất 1 biến thể!");
      return;
    }

    for (const v of enabledVariants) {
      if (!v.sku || !v.price || v.stock === "") {
        message.error(
          "Vui lòng nhập đầy đủ SKU, Giá, Kho cho tất cả biến thể!"
        );
        return;
      }
    }

    const payload = {
      ...formData,
      category_id: formData.category_id || null,
      options: options
        .filter((opt) => opt.values.length > 0)
        .map((opt) => ({
          name: opt.name,
          values: opt.values,
        })),
      variants: enabledVariants.map((v) => ({
        sku: v.sku,
        price: parseFloat(v.price),
        stock: parseInt(v.stock),
        options: v.options,
      })),
    };

    try {
      setLoading(true);
      const response = await adminService.createProduct(payload);

      if (response.success) {
        message.success("Tạo sản phẩm thành công!");
        navigate("/admin/products");
      }
    } catch (error) {
      console.error("Create product error:", error);

      // Xử lý các loại lỗi khác nhau
      if (
        error.message?.includes("Forbidden") ||
        error.message?.includes("Admin access required")
      ) {
        message.error({
          content:
            "Bạn không có quyền admin! Vui lòng đăng nhập bằng tài khoản admin@gmail.com",
          duration: 5,
        });
      } else if (error.message?.includes("not authenticated")) {
        message.error("Vui lòng đăng nhập trước!");
        navigate("/login");
      } else {
        message.error(error.message || "Có lỗi xảy ra!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="flex items-center gap-2 mb-6">
        <FiPlus className="text-2xl text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">Tạo Sản Phẩm Mới</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* THÔNG TIN CƠ BẢN */}
        <section className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            1. Thông tin cơ bản
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="VD: Áo Thun Mùa Hè"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giới tính
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="unisex">Unisex</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả ngắn
              </label>
              <input
                type="text"
                value={formData.short_description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    short_description: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Mô tả ngắn gọn (tối đa 500 ký tự)"
                maxLength={500}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả chi tiết
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={5}
                placeholder="Mô tả chi tiết về sản phẩm..."
              />
            </div>
          </div>
        </section>

        {/* PHÂN LOẠI HÀNG */}
        <section className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            2. Phân loại hàng
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Nhập các lựa chọn như Màu sắc, Size. Hệ thống sẽ tự động tạo tất cả
            biến thể.
          </p>

          <div className="space-y-6">
            {options.map((option, optIndex) => {
              const optionNameLower = option.name.toLowerCase();
              const isColorOption =
                optionNameLower.includes("màu") ||
                optionNameLower.includes("color");
              const isSizeOption =
                optionNameLower.includes("size") ||
                optionNameLower.includes("kích");
              const commonValues = isColorOption
                ? COMMON_COLORS
                : isSizeOption
                ? COMMON_SIZES
                : [];

              return (
                <div key={option.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="font-medium text-gray-700">
                      Phân loại {optIndex + 1}:
                    </span>
                    <input
                      type="text"
                      value={option.name}
                      onChange={(e) =>
                        handleOptionNameChange(option.id, e.target.value)
                      }
                      className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: Màu sắc, Size"
                    />
                  </div>

                  {/* Hiển thị giá trị đã chọn */}
                  {option.values.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-600 mb-2">Đã chọn:</p>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value, valIndex) => (
                          <div
                            key={valIndex}
                            className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full border border-blue-200"
                          >
                            <span className="text-sm font-medium text-blue-700">
                              {value}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveOptionValue(option.id, valIndex)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <FiX />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lựa chọn nhanh từ danh sách cơ bản */}
                  {commonValues.length > 0 && (
                    <div className="mb-3 p-3 bg-white rounded border border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                        {isColorOption ? (
                          <>
                            <FiDroplet className="text-blue-500" /> Chọn nhanh
                            màu sắc:
                          </>
                        ) : (
                          <>
                            <FiMaximize className="text-green-500" /> Chọn nhanh
                            size:
                          </>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {commonValues.map((value) => {
                          const isSelected = option.values.includes(value);
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() =>
                                handleToggleCommonValue(option.id, value)
                              }
                              className={`px-3 py-1 text-sm rounded border transition-all ${
                                isSelected
                                  ? "bg-blue-500 text-white border-blue-600 font-medium"
                                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                              }`}
                            >
                              {isSelected && (
                                <FiCheck className="inline mr-1" />
                              )}
                              {value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Nhập tay giá trị tùy chỉnh */}
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <FiEdit3 className="text-purple-500" /> Hoặc nhập tay:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempOptionInputs[option.id] || ""}
                        onChange={(e) =>
                          setTempOptionInputs((prev) => ({
                            ...prev,
                            [option.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddOptionValue(option.id);
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        placeholder={`VD: ${
                          option.name === "Màu sắc" ? "Đen, Trắng" : "M, L, XL"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleAddOptionValue(option.id)}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
                      >
                        <FiPlus /> Thêm
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* DANH SÁCH BIẾN THỂ */}
        <section className="border-b pb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            3. Danh sách biến thể ({variants.filter((v) => v.enabled).length}/
            {variants.length})
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Hệ thống tự động sinh ra {variants.length} biến thể. Bạn có thể
            tắt/xóa những biến thể không muốn bán.
          </p>

          {variants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có biến thể nào. Hãy thêm Options ở bước 2.
            </div>
          ) : (
            <>
              {/* Nhập hàng loạt */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <FiCheck className="text-blue-600" />
                  Nhập hàng loạt (Áp dụng cho tất cả biến thể đang bật)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">
                      Giá chung (VND)
                    </label>
                    <input
                      type="number"
                      value={bulkInputs.price}
                      onChange={(e) =>
                        setBulkInputs((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: 250000"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 mb-1">
                      Kho chung
                    </label>
                    <input
                      type="number"
                      value={bulkInputs.stock}
                      onChange={(e) =>
                        setBulkInputs((prev) => ({
                          ...prev,
                          stock: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: 100"
                      min="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleBulkApplyAll}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
                    >
                      Áp dụng tất cả
                    </button>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAutoGenerateSKU}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium flex items-center justify-center gap-2"
                    >
                      <FiCheck /> Tạo SKU tự động
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {variants.map((variant) => (
                  <div
                    key={variant.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      variant.enabled
                        ? "bg-white border-gray-300"
                        : "bg-gray-100 border-gray-200 opacity-60"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={variant.enabled}
                      onChange={() => handleToggleVariant(variant.id)}
                      className="w-5 h-5"
                    />

                    <div className="flex-1 font-medium text-gray-700">
                      {Object.entries(variant.options).map(([key, val]) => (
                        <span key={key} className="mr-2">
                          {key}: <span className="text-blue-600">{val}</span>
                        </span>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) =>
                        handleVariantChange(variant.id, "sku", e.target.value)
                      }
                      disabled={!variant.enabled}
                      className="w-32 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder="SKU"
                    />

                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) =>
                        handleVariantChange(variant.id, "price", e.target.value)
                      }
                      disabled={!variant.enabled}
                      className="w-32 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder="Giá (VND)"
                      min="0"
                    />

                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) =>
                        handleVariantChange(variant.id, "stock", e.target.value)
                      }
                      disabled={!variant.enabled}
                      className="w-24 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      placeholder="Kho"
                      min="0"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(variant.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Xóa biến thể"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* NÚT SUBMIT */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {loading ? (
              "Đang tạo..."
            ) : (
              <>
                <FiCheck /> Tạo sản phẩm & Tiếp tục
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
