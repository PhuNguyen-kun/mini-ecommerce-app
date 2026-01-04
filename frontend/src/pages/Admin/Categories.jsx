import { useState, useEffect } from 'react';
import { Modal, message } from 'antd';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiChevronRight,
  FiChevronDown,
  FiCheckCircle,
  FiXCircle,
  FiBarChart2,
  FiFolder
} from 'react-icons/fi';
import categoryService from '../../services/categoryService';
import CategoryForm from '../../components/Admin/CategoryForm';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all'); // 'all', 'active', 'inactive'
  const [filterParent, setFilterParent] = useState('all'); // 'all', 'root', 'sub'
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    root: 0
  });

  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchTerm, filterActive, filterParent]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        _t: Date.now() // Cache buster
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (filterActive !== 'all') {
        params.is_active = filterActive === 'active';
      }

      if (filterParent === 'root') {
        params.parent_id = 'null';
      }

      const response = await categoryService.getAdminCategories(params);

      if (response.success) {
        setCategories(response.data || []);
        setTotalCategories(response.pagination?.total || 0);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await categoryService.getCategoryStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset về trang 1 khi search
  };

  const handleFilterActive = (value) => {
    setFilterActive(value);
    setCurrentPage(1);
  };

  const handleFilterParent = (value) => {
    setFilterParent(value);
    setCurrentPage(1);
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowFormModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowFormModal(true);
  };

  const handleDeleteCategory = async (category) => {
    Modal.confirm({
      title: 'Xác nhận xóa danh mục',
      content: (
        <div>
          <p>Bạn có chắc muốn xóa danh mục <strong>"{category.name}"</strong>?</p>
          {category.children && category.children.length > 0 && (
            <p className="text-red-500 mt-2">
              ⚠️ Danh mục này có {category.children.length} danh mục con
            </p>
          )}
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await categoryService.deleteCategory(category.id);
          message.success('Xóa danh mục thành công');

          // Refresh data
          await Promise.all([fetchCategories(), fetchStats()]);
        } catch (error) {
          console.error('Error deleting category:', error);

          if (error.message.includes('subcategories')) {
            message.error('Không thể xóa danh mục có danh mục con. Vui lòng xóa hoặc di chuyển danh mục con trước.');
          } else if (error.message.includes('products')) {
            message.error('Không thể xóa danh mục có sản phẩm. Vui lòng di chuyển hoặc xóa sản phẩm trước.');
          } else {
            message.error(error.message || 'Không thể xóa danh mục');
          }
        }
      }
    });
  };

  const handleToggleActive = async (category) => {
    try {
      const newStatus = !category.is_active;
      await categoryService.toggleCategoryActive(category.id, newStatus);

      message.success(
        newStatus
          ? `Đã kích hoạt danh mục "${category.name}"`
          : `Đã vô hiệu hóa danh mục "${category.name}"`
      );

      // Cập nhật local state
      setCategories(prev =>
        prev.map(cat =>
          cat.id === category.id
            ? { ...cat, is_active: newStatus }
            : cat
        )
      );

      // Refresh stats
      fetchStats();
    } catch (error) {
      console.error('Error toggling category status:', error);
      message.error('Không thể thay đổi trạng thái danh mục');
    }
  };

  const handleFormSuccess = async () => {
    setShowFormModal(false);
    setEditingCategory(null);

    // Refresh data
    await Promise.all([fetchCategories(), fetchStats()]);
  };

  const toggleExpandRow = (categoryId) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Quản lý danh mục</h1>
        <p className="text-gray-600">Quản lý danh mục sản phẩm và cấu trúc phân cấp</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng danh mục</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <FiBarChart2 className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Đang hoạt động</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.active}</p>
            </div>
            <FiCheckCircle className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Không hoạt động</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.inactive}</p>
            </div>
            <FiXCircle className="text-red-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Danh mục gốc</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.root}</p>
            </div>
            <FiFilter className="text-purple-500" size={32} />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm danh mục..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            <select
              value={filterActive}
              onChange={(e) => handleFilterActive(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>

            <select
              value={filterParent}
              onChange={(e) => handleFilterParent(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả loại</option>
              <option value="root">Danh mục gốc</option>
            </select>

            <button
              onClick={handleCreateCategory}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPlus size={20} />
              Thêm danh mục
            </button>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Không tìm thấy danh mục nào</p>
            <button
              onClick={handleCreateCategory}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Tạo danh mục đầu tiên
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên danh mục
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Danh mục cha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số danh mục con
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <>
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {category.children && category.children.length > 0 && (
                              <button
                                onClick={() => toggleExpandRow(category.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {expandedRows.has(category.id) ? (
                                  <FiChevronDown size={18} />
                                ) : (
                                  <FiChevronRight size={18} />
                                )}
                              </button>
                            )}
                            <FiFolder className="text-blue-500 flex-shrink-0" size={20} />
                            <div>
                              <p className="font-medium text-gray-900">{category.name}</p>
                              <p className="text-sm text-gray-500">{category.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {category.parent ? (
                            <span className="text-sm text-gray-600">{category.parent.name}</span>
                          ) : (
                            <span className="text-sm text-gray-400 italic">Danh mục gốc</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {category.children ? category.children.length : 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleActive(category)}
                            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${category.is_active
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                          >
                            {category.is_active ? 'Hoạt động' : 'Không hoạt động'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(category.created_at)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Chỉnh sửa"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Xóa"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Children rows */}
                      {expandedRows.has(category.id) && category.children && category.children.map((child) => (
                        <tr key={`child-${child.id}`} className="bg-gray-50">
                          <td className="px-6 py-3 pl-16">
                            <div className="flex items-center gap-2">
                              <FiChevronRight className="text-gray-300" size={14} />
                              <FiFolder className="text-amber-500 flex-shrink-0" size={16} />
                              <div>
                                <p className="font-medium text-gray-700 text-sm">{child.name}</p>
                                <p className="text-xs text-gray-500">{child.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <span className="text-sm text-gray-500">{category.name}</span>
                          </td>
                          <td className="px-6 py-3">
                            <span className="text-sm text-gray-500">0</span>
                          </td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${child.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                              }`}>
                              {child.is_active ? 'Hoạt động' : 'Không hoạt động'}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-500">
                            {formatDate(child.created_at)}
                          </td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditCategory(child)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Chỉnh sửa"
                              >
                                <FiEdit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(child)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Xóa"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Hiển thị {categories.length} trong tổng số {totalCategories} danh mục
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Trước
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <CategoryForm
          category={editingCategory}
          onSuccess={handleFormSuccess}
          onClose={() => {
            setShowFormModal(false);
            setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
};

export default Categories;
