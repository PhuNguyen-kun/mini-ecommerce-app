import { useState, useEffect } from 'react';
import { Modal, message } from 'antd';
import { FiX, FiAlertCircle } from 'react-icons/fi';
import categoryService from '../../services/categoryService';

const CategoryForm = ({ category = null, onSuccess, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        parent_id: '',
        is_active: true
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchCategories();

        // Nếu đang edit, fetch category detail để có đầy đủ thông tin
        if (category) {
            fetchCategoryDetail(category.id);
        } else {
            // Reset form khi tạo mới
            setFormData({
                name: '',
                description: '',
                parent_id: '',
                is_active: true
            });
        }
    }, [category]);

    const fetchCategoryDetail = async (categoryId) => {
        try {
            const response = await categoryService.getCategoryById(categoryId);
            if (response.success) {
                const cat = response.data;
                setFormData({
                    name: cat.name || '',
                    description: cat.description || '',
                    parent_id: cat.parent_id !== null && cat.parent_id !== undefined ? cat.parent_id : '',
                    is_active: cat.is_active !== undefined ? cat.is_active : true
                });
            }
        } catch (error) {
            console.error('Error fetching category detail:', error);
            message.error('Không thể tải thông tin danh mục');
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getCategoryTree();
            if (response.success) {
                // Flatten tree để hiển thị trong select
                const flatCategories = flattenTree(response.data || []);

                // Nếu đang edit, loại bỏ category hiện tại và các con của nó
                let filteredCategories = flatCategories;
                if (category) {
                    filteredCategories = flatCategories.filter(cat => {
                        // Không cho chọn chính nó hoặc các con của nó làm parent
                        return cat.id !== category.id && !isDescendant(cat.id, category.id, flatCategories);
                    });
                }

                setCategories(filteredCategories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            message.error('Không thể tải danh sách danh mục');
        }
    };

    // Flatten tree structure thành danh sách phẳng với level
    const flattenTree = (tree, level = 0, result = []) => {
        tree.forEach(node => {
            result.push({ ...node, level });
            if (node.children && node.children.length > 0) {
                flattenTree(node.children, level + 1, result);
            }
        });
        return result;
    };

    // Kiểm tra xem categoryId có phải là con của ancestorId không
    const isDescendant = (categoryId, ancestorId, allCategories) => {
        const cat = allCategories.find(c => c.id === categoryId);
        if (!cat || !cat.parent_id) return false;
        if (cat.parent_id === ancestorId) return true;
        return isDescendant(cat.parent_id, ancestorId, allCategories);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error khi user nhập
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Tên danh mục là bắt buộc';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Tên danh mục phải có ít nhất 2 ký tự';
        } else if (formData.name.trim().length > 255) {
            newErrors.name = 'Tên danh mục không được vượt quá 255 ký tự';
        }

        if (formData.description && formData.description.length > 1000) {
            newErrors.description = 'Mô tả không được vượt quá 1000 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const dataToSend = {
                name: formData.name.trim(),
                description: formData.description.trim() || null,
                parent_id: formData.parent_id ? parseInt(formData.parent_id) : null,
                is_active: formData.is_active
            };

            let response;
            if (category) {
                // Update
                response = await categoryService.updateCategory(category.id, dataToSend);
            } else {
                // Create
                response = await categoryService.createCategory(dataToSend);
            }

            if (response.success) {
                message.success(category ? 'Cập nhật danh mục thành công' : 'Tạo danh mục mới thành công');
                if (onSuccess) onSuccess(response.data);
                if (onClose) onClose();
            }
        } catch (error) {
            console.error('Error saving category:', error);

            // Xử lý lỗi từ server
            if (error.message.includes('similar name')) {
                setErrors({ name: 'Tên danh mục đã tồn tại' });
            } else if (error.message.includes('descendant')) {
                setErrors({ parent_id: 'Không thể chọn danh mục con làm danh mục cha' });
            } else if (error.message.includes('Parent category not found')) {
                setErrors({ parent_id: 'Danh mục cha không tồn tại' });
            } else {
                message.error(error.message || 'Có lỗi xảy ra khi lưu danh mục');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                    >
                        <FiX size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Tên danh mục */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên danh mục <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.name
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            placeholder="Nhập tên danh mục"
                            disabled={loading}
                        />
                        {errors.name && (
                            <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                                <FiAlertCircle size={14} />
                                <span>{errors.name}</span>
                            </div>
                        )}
                    </div>

                    {/* Danh mục cha */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Danh mục cha
                        </label>
                        <select
                            name="parent_id"
                            value={formData.parent_id}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.parent_id
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            disabled={loading}
                        >
                            <option value="">-- Không có (danh mục gốc) --</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {'—'.repeat(cat.level)} {cat.name}
                                    {!cat.is_active && ' (Không hoạt động)'}
                                </option>
                            ))}
                        </select>
                        {errors.parent_id && (
                            <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                                <FiAlertCircle size={14} />
                                <span>{errors.parent_id}</span>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Để trống nếu đây là danh mục cấp cao nhất
                        </p>
                    </div>

                    {/* Mô tả */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${errors.description
                                ? 'border-red-300 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500'
                                }`}
                            placeholder="Nhập mô tả cho danh mục (tùy chọn)"
                            disabled={loading}
                        />
                        {errors.description && (
                            <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                                <FiAlertCircle size={14} />
                                <span>{errors.description}</span>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.description.length}/1000 ký tự
                        </p>
                    </div>

                    {/* Trạng thái */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="is_active"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            disabled={loading}
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                            Kích hoạt danh mục
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Đang xử lý...' : (category ? 'Cập nhật' : 'Tạo mới')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryForm;
