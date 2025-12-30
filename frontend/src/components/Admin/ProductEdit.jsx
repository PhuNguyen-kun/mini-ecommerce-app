import { useState, useEffect, useRef } from "react";
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

const COMMON_COLORS = [
  "Đen", "Trắng", "Xám", "Be", "Nâu", "Đỏ", "Hồng",
  "Cam", "Vàng", "Xanh lá", "Xanh dương", "Xanh navy", "Tím",
];

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const removeVietnameseTones = (str) => {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str;
};

const ProductEdit = () => {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);

  // Refs để quản lý trạng thái dữ liệu
  const dbVariantsRef = useRef([]);
  const isFirstLoad = useRef(true);

  // State Form
  const [formData, setFormData] = useState({
    name: "",
    short_description: "",
    description: "",
    category_id: "",
    gender: "unisex",
  });

  const [options, setOptions] = useState([]);
  const [variants, setVariants] = useState([]);
  const [tempOptionInputs, setTempOptionInputs] = useState({});
  const [bulkInputs, setBulkInputs] = useState({ price: "", stock: "" });

  useEffect(() => {
    fetchCategories();
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Trigger generate variants khi options thay đổi (trừ lần load đầu)
  useEffect(() => {
    if (!isFirstLoad.current && dataLoaded && options.length > 0) {
      generateVariants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      if (response.success) setCategories(response.data || []);
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

        // 1. Load Basic Info
        setFormData({
          name: p.name || "",
          short_description: p.short_description || "",
          description: p.description || "",
          category_id: p.category_id || "",
          gender: p.gender || "unisex",
        });

        // 2. Load Options
        let loadedOptions = [];
        if (p.options?.length > 0) {
          loadedOptions = p.options.map((opt) => ({
            id: opt.id,
            name: opt.name,
            values: opt.values ? opt.values.map((v) => v.value) : [],
          }));
          setOptions(loadedOptions);
        }

        // 3. Load Variants & Map combination string
        if (p.variants?.length > 0) {
          const loadedVariants = p.variants.map((v) => {
            let combinationParts = [];

            // Ưu tiên map theo option_values để đúng thứ tự
            if (v.option_values?.length > 0) {
              loadedOptions.forEach((opt) => {
                const variantOptValue = v.option_values.find(
                  (vo) => vo.product_option_id === opt.id
                );
                if (variantOptValue?.value) {
                  combinationParts.push(variantOptValue.value);
                }
              });
            }

            // Fallback nếu data không khớp
            if (combinationParts.length === 0 && v.option_values) {
              combinationParts = v.option_values.map((o) => o.value).filter(Boolean);
            }

            return {
              id: v.id,
              combination: combinationParts.join(" - "),
              sku: v.sku || "",
              price: v.price || "",
              stock: v.stock || "",
              is_active: v.is_active !== false,
            };
          });

          dbVariantsRef.current = loadedVariants;
          setVariants(loadedVariants);
        }
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
      message.error("Không thể tải thông tin sản phẩm");
      navigate("/admin/products");
    } finally {
      setInitialLoading(false);
      setDataLoaded(true);
      setTimeout(() => { isFirstLoad.current = false; }, 100);
    }
  };

  // === XỬ LÝ OPTIONS ===
  const handleToggleCommonValue = (optionId, value) => {
    setOptions((prev) =>
      prev.map((opt) => {
        if (opt.id === optionId) {
          return opt.values.includes(value)
            ? { ...opt, values: opt.values.filter((v) => v !== value) }
            : { ...opt, values: [...opt.values, value] };
        }
        return opt;
      })
    );
  };

  const handleAddOptionValue = (optionId) => {
    const inputValue = tempOptionInputs[optionId]?.trim();
    if (!inputValue) return message.warning("Vui lòng nhập giá trị");

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
      prev.map((opt) =>
        opt.id === optionId ? { ...opt, values: opt.values.filter((v) => v !== value) } : opt
      )
    );
  };

  const handleAddOption = () => {
    setOptions((prev) => [...prev, { id: Date.now(), name: "", values: [] }]);
  };

  const handleRemoveOption = (optionId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Xóa tùy chọn này sẽ xóa các biến thể liên quan. Bạn chắc chứ?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => setOptions((prev) => prev.filter((opt) => opt.id !== optionId)),
    });
  };

  const handleOptionNameChange = (optionId, newName) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === optionId ? { ...opt, name: newName } : opt))
    );
  };

  // === XỬ LÝ VARIANTS ===
  const cartesianProduct = (arrays) => {
    if (arrays.length === 0) return [];
    if (arrays.length === 1) return arrays[0].map((x) => [x]);
    const [first, ...rest] = arrays;
    return first.flatMap((x) => cartesianProduct(rest).map((r) => [x, ...r]));
  };

  const generateVariants = () => {
    const validOptions = options.filter((opt) => opt.values.length > 0);
    if (validOptions.length === 0) {
      setVariants([]);
      return;
    }

    const combinations = cartesianProduct(validOptions.map((opt) => opt.values));

    const newVariants = combinations.map((combo) => {
      const comboStr = combo.join(" - ");

      // Logic quan trọng: Tìm trong state hiện tại HOẶC tìm trong dữ liệu gốc từ DB
      let existing = variants.find((v) => v.combination === comboStr);
      if (!existing && dbVariantsRef.current.length > 0) {
        existing = dbVariantsRef.current.find((v) => v.combination === comboStr);
      }

      if (existing) {
        return { ...existing, combination: comboStr };
      }

      return {
        id: `new_${Date.now()}_${Math.random()}`,
        combination: comboStr,
        sku: "",
        price: "",
        stock: "",
        is_active: true,
      };
    });

    setVariants(newVariants);
  };

  const handleVariantChange = (variantId, field, value) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, [field]: value } : v))
    );
  };

  const handleToggleVariant = (variantId) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === variantId ? { ...v, is_active: !v.is_active } : v))
    );
  };

  const handleDeleteVariant = (variantId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa variant này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => setVariants((prev) => prev.filter((v) => v.id !== variantId)),
    });
  };

  const handleBulkApplyAll = () => {
    const { price, stock } = bulkInputs;
    if (!price && !stock) return message.warning("Vui lòng nhập giá trị");

    setVariants((prev) =>
      prev.map((v) => ({
        ...v,
        price: price || v.price,
        stock: stock || v.stock,
      }))
    );
    message.success("Đã áp dụng cho tất cả variants");
  };

  const handleAutoGenerateSKU = () => {
    const baseName = removeVietnameseTones(formData.name.trim()).toUpperCase().replace(/\s+/g, "-");
    if (!baseName) return message.warning("Vui lòng nhập tên sản phẩm trước");

    setVariants((prev) =>
      prev.map((v) => {
        const parts = v.combination.split(" - ").map((p) =>
          removeVietnameseTones(p.trim()).toUpperCase().replace(/\s+/g, "-")
        );
        return { ...v, sku: `${baseName}-${parts.join("-")}` };
      })
    );
    message.success("Đã tạo SKU tự động");
  };

  // === SUBMIT ===
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation cơ bản
    if (!formData.name.trim()) return message.warning("Vui lòng nhập tên sản phẩm");
    if (!formData.category_id) return message.warning("Vui lòng chọn danh mục");

    // 2. Lấy danh sách variants đang active (PHẢI KHAI BÁO TRƯỚC KHI DÙNG)
    const activeVariants = variants.filter((v) => v.is_active);

    // 3. Validate variants
    if (activeVariants.length === 0) return message.warning("Phải có ít nhất một variant được kích hoạt");

    // Validate SKU
    const skus = activeVariants.map((v) => v.sku.trim()).filter(Boolean);
    if (skus.length > 0 && new Set(skus).size !== skus.length) {
      return message.error("SKU bị trùng lặp, vui lòng kiểm tra lại");
    }

    // Validate Price & Stock
    for (const v of activeVariants) {
      if (v.price && parseFloat(v.price) < 0) return message.error(`Giá variant "${v.combination}" không hợp lệ`);
      if (v.stock !== "" && parseInt(v.stock) < 0) return message.error(`Kho variant "${v.combination}" không hợp lệ`);
    }

    // 4. Chuẩn bị dữ liệu để gửi đi (Map dữ liệu từ activeVariants)
    const validVariants = activeVariants.map((v) => {
      const variantData = {
        sku: v.sku,
        price: parseFloat(v.price) || 0,
        stock: parseInt(v.stock) || 0,
      };

      // Check xem là variant cũ hay mới
      if (typeof v.id === "number") {
        // Cũ: chỉ gửi ID
        variantData.id = v.id;
      } else {
        // Mới: Gửi thêm options map để Backend biết đường tạo
        const combinationValues = v.combination.split(" - ");
        const optionsPayload = {};

        // Map giá trị vào tên Option tương ứng
        options.forEach((opt, index) => {
          if (combinationValues[index]) {
            optionsPayload[opt.name] = combinationValues[index];
          }
        });

        variantData.options = optionsPayload;
      }

      return variantData;
    });

    try {
      setLoading(true);
      const payload = {
        ...formData,
        variants: validVariants, // Gửi danh sách đã xử lý
      };

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

  if (initialLoading) return <div className="flex justify-center min-h-screen pt-20"><Spin size="large" /></div>;

  if (!product) return (
    <div className="text-center pt-20">
      <p className="text-gray-600">Không tìm thấy sản phẩm</p>
      <button onClick={() => navigate("/admin/products")} className="mt-4 text-indigo-600">Quay lại danh sách</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate("/admin/products")} className="text-gray-600 hover:text-gray-900">
          <FiArrowLeft size={24} />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa sản phẩm</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <h2 className="text-xl font-semibold mb-2 md:col-span-2">Thông tin cơ bản</h2>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="Ví dụ: Áo thun nam" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục <span className="text-red-500">*</span></label>
            <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="">-- Chọn danh mục --</option>
              {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
            <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="unisex">Unisex</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
            <textarea value={formData.short_description} onChange={(e) => setFormData({ ...formData, short_description: e.target.value })} rows={2} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        {/* Options */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Tùy chọn sản phẩm</h2>
            <button type="button" onClick={handleAddOption} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              <FiPlus /> Thêm tùy chọn
            </button>
          </div>

          {options.map((option) => (
            <div key={option.id} className="mb-6 p-4 border rounded-lg">
              <div className="flex items-center gap-4 mb-4">
                <input type="text" value={option.name} onChange={(e) => handleOptionNameChange(option.id, e.target.value)} className="flex-1 px-4 py-2 border rounded-lg" placeholder="Tên tùy chọn (VD: Màu sắc, Size)" />
                <button type="button" onClick={() => handleRemoveOption(option.id)} className="text-red-600 p-2"><FiTrash2 /></button>
              </div>

              {/* Suggestions */}
              {(option.name.toLowerCase().includes("màu") || option.name.toLowerCase().includes("size")) && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">{option.name.toLowerCase().includes("màu") ? "Màu sắc" : "Size"} phổ biến:</p>
                  <div className="flex flex-wrap gap-2">
                    {(option.name.toLowerCase().includes("màu") ? COMMON_COLORS : COMMON_SIZES).map((val) => (
                      <button key={val} type="button" onClick={() => handleToggleCommonValue(option.id, val)} className={`px-3 py-1 text-sm rounded-full border ${option.values.includes(val) ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:border-indigo-600"}`}>
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Manual Input */}
              <div className="flex gap-2 mb-3">
                <input type="text" value={tempOptionInputs[option.id] || ""} onChange={(e) => setTempOptionInputs({ ...tempOptionInputs, [option.id]: e.target.value })} onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddOptionValue(option.id))} className="flex-1 px-4 py-2 border rounded-lg" placeholder="Nhập giá trị..." />
                <button type="button" onClick={() => handleAddOptionValue(option.id)} className="px-4 py-2 bg-green-600 text-white rounded-lg"><FiPlus /></button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {option.values.map((val) => (
                  <span key={val} className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                    {val}
                    <button type="button" onClick={() => handleRemoveOptionValue(option.id, val)} className="text-indigo-600"><FiX /></button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Variants */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Biến thể ({variants.filter(v => v.is_active).length}/{variants.length})</h2>

          {variants.length > 0 ? (
            <>
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="number" value={bulkInputs.price} onChange={(e) => setBulkInputs({ ...bulkInputs, price: e.target.value })} className="px-3 py-2 border rounded-lg" placeholder="Giá hàng loạt" />
                <input type="number" value={bulkInputs.stock} onChange={(e) => setBulkInputs({ ...bulkInputs, stock: e.target.value })} className="px-3 py-2 border rounded-lg" placeholder="Kho hàng loạt" />
                <div className="flex gap-2">
                  <button type="button" onClick={handleBulkApplyAll} className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg">Áp dụng</button>
                  <button type="button" onClick={handleAutoGenerateSKU} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg">Tạo SKU</button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổ hợp</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kho</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">TT</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {variants.map((variant) => (
                      <tr key={variant.id} className={!variant.is_active ? "bg-gray-100 opacity-50" : ""}>
                        <td className="px-4 py-3 text-sm">{variant.combination}</td>
                        <td className="px-4 py-3"><input type="text" value={variant.sku} onChange={(e) => handleVariantChange(variant.id, "sku", e.target.value)} disabled={!variant.is_active} className="w-full px-2 py-1 border rounded" /></td>
                        <td className="px-4 py-3"><input type="number" value={variant.price} onChange={(e) => handleVariantChange(variant.id, "price", e.target.value)} disabled={!variant.is_active} className="w-full px-2 py-1 border rounded" /></td>
                        <td className="px-4 py-3"><input type="number" value={variant.stock} onChange={(e) => handleVariantChange(variant.id, "stock", e.target.value)} disabled={!variant.is_active} className="w-full px-2 py-1 border rounded" /></td>
                        <td className="px-4 py-3 text-center"><button type="button" onClick={() => handleToggleVariant(variant.id)} className={`px-2 py-1 text-xs rounded-full ${variant.is_active ? "bg-green-100 text-green-800" : "bg-gray-200"}`}>{variant.is_active ? "Bật" : "Tắt"}</button></td>
                        <td className="px-4 py-3 text-center"><button type="button" onClick={() => handleDeleteVariant(variant.id)} className="text-red-600"><FiTrash2 /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 py-4">Vui lòng thêm tùy chọn và giá trị để tạo biến thể.</p>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate("/admin/products")} className="px-6 py-3 border rounded-lg hover:bg-gray-50">Hủy</button>
          <button type="submit" disabled={loading} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400">{loading ? "Đang lưu..." : "Lưu thay đổi"}</button>
        </div>
      </form>
    </div>
  );
};

export default ProductEdit;