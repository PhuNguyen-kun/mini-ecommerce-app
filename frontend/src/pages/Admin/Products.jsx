import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, message } from 'antd';
import { FiPlus, FiEdit2, FiTrash2, FiImage, FiSearch, FiFilter } from 'react-icons/fi';
import productService from '../../services/productService';
import adminService from '../../services/adminService';
import categoryService from '../../services/categoryService';

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState('all'); // 'all', 'in-stock', 'out-of-stock'
  const [filterCategory, setFilterCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  // Stats tổng thể (không phụ thuộc vào trang hiện tại)
  const [stats, setStats] = useState({
    totalActive: 0,
    totalOutOfStock: 0,
    averagePrice: 0
  });

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, filterStock, filterCategory]);

  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAdminCategories({ limit: 100 });
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const timestamp = Date.now();

      // Gọi API lần đầu để lấy tổng số sản phẩm với cache buster
      const firstResponse = await productService.getProducts({
        page: 1,
        limit: 100,
        view: 'full',
        _t: timestamp
      });

      if (!firstResponse.success) return;

      const totalPages = firstResponse.data.pagination?.total_pages || 1;
      let allProducts = [...(firstResponse.data.products || [])];

      // Nếu có nhiều trang, lấy thêm (với cache buster)
      if (totalPages > 1) {
        const promises = [];
        for (let page = 2; page <= totalPages; page++) {
          promises.push(
            productService.getProducts({
              page,
              limit: 100,
              view: 'full',
              _t: timestamp // Same timestamp for consistency
            })
          );
        }

        const responses = await Promise.all(promises);
        responses.forEach(res => {
          if (res.success) {
            allProducts = [...allProducts, ...(res.data.products || [])];
          }
        });
      }


      // Tính số sản phẩm đang hoạt động
      const totalActive = allProducts.filter(p => p.is_active === true).length;

      // Tính số sản phẩm hết hàng
      const totalOutOfStock = allProducts.filter(p => {
        if (!p.variants || p.variants.length === 0) return false;
        const totalStock = p.variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0);
        return totalStock === 0;
      }).length;

      // Tính giá trị trung bình
      const productsWithVariants = allProducts.filter(p => p.variants && p.variants.length > 0);
      let averagePrice = 0;
      if (productsWithVariants.length > 0) {
        const totalPrice = productsWithVariants.reduce((sum, p) => {
          const minPrice = Math.min(...p.variants.map(v => parseFloat(v.price) || 0));
          return sum + minPrice;
        }, 0);
        averagePrice = totalPrice / productsWithVariants.length;
      }



      setStats({
        totalActive,
        totalOutOfStock,
        averagePrice
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        view: 'full',
        _t: Date.now()
      };

      if (searchTerm) params.search = searchTerm;
      if (filterCategory !== 'all') params.category_id = filterCategory;

      const response = await productService.getProducts(params);

      if (response.success) {
        let filteredProducts = response.data.products || [];
        let originalTotal = response.data.pagination?.total || 0;
        let originalPages = response.data.pagination?.total_pages || 1;

        // Filter stock status client-side
        if (filterStock === 'in-stock') {
          filteredProducts = filteredProducts.filter(p => {
            const totalStock = p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
            return totalStock > 0;
          });
        } else if (filterStock === 'out-of-stock') {
          filteredProducts = filteredProducts.filter(p => {
            const totalStock = p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
            return totalStock === 0;
          });
        }

        setProducts(filteredProducts);

        // Nếu có filter stock, cập nhật lại pagination dựa trên kết quả filter
        if (filterStock !== 'all') {
          setTotalProducts(filteredProducts.length);
          setTotalPages(filteredProducts.length > 0 ? 1 : 0);
        } else {
          setTotalProducts(originalTotal);
          setTotalPages(originalPages);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    Modal.confirm({
      title: 'Xác nhận xóa sản phẩm',
      content: `Bạn có chắc muốn xóa sản phẩm "${product.name}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const deletedId = product.id;

          await adminService.deleteProduct(deletedId);

          // Remove from local state immediately
          setProducts(prev => prev.filter(p => p.id !== deletedId));
          setTotalProducts(prev => prev - 1);

          message.success('Xóa sản phẩm thành công');

          // Wait for DB transaction to commit
          await new Promise(resolve => setTimeout(resolve, 300));

          // Force full refresh with new timestamp
          const timestamp = Date.now();
          await Promise.all([
            (async () => {
              const response = await productService.getProducts({
                page: currentPage,
                limit: 20,
                view: 'full',
                _t: timestamp
              });
              if (response.success) {
                setProducts(response.data.products || []);
                setTotalProducts(response.data.pagination?.total || 0);
                setTotalPages(response.data.pagination?.total_pages || 1);
              }
            })(),
            fetchStats()
          ]);
        } catch (error) {
          console.error('Error deleting product:', error);
          message.error(error.message || 'Không thể xóa sản phẩm');
          // Refresh on error
          await fetchProducts();
        }
      }
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterStock = (e) => {
    setFilterStock(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterCategory = (e) => {
    setFilterCategory(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
          <p className="text-gray-600 mt-1">Quản lý thông tin sản phẩm, biến thể và hình ảnh</p>
        </div>
        <button
          onClick={() => navigate('/admin/products/new')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FiPlus /> Tạo sản phẩm mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Tổng sản phẩm</p>
          <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Đang hoạt động</p>
          <p className="text-2xl font-bold text-green-600">
            {stats.totalActive}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Hết hàng</p>
          <p className="text-2xl font-bold text-red-600">
            {stats.totalOutOfStock}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Giá trị trung bình</p>
          <p className="text-2xl font-bold text-blue-600">
            {stats.averagePrice > 0 ? formatPrice(stats.averagePrice) : '0'}₫
          </p>
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
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3 flex-wrap">
            {/* Filter by Stock */}
            <select
              value={filterStock}
              onChange={handleFilterStock}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">Tất cả tồn kho</option>
              <option value="in-stock">Còn hàng</option>
              <option value="out-of-stock">Hết hàng</option>
            </select>

            {/* Filter by Category */}
            <select
              value={filterCategory}
              onChange={handleFilterCategory}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Đang tải...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 mb-4">Chưa có sản phẩm nào</p>
            <button
              onClick={() => navigate('/admin/products/new')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Tạo sản phẩm đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sản phẩm
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Giá
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Biến thể
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tồn kho
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => {
                  const minPrice = Math.min(...(product.variants?.map(v => v.price) || [0]));
                  const maxPrice = Math.max(...(product.variants?.map(v => v.price) || [0]));
                  const totalStock = product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
                  const variantCount = product.variants?.length || 0;
                  const imageUrl = product.images?.[0]?.image_url;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0 h-12 w-12">
                            {imageUrl ? (
                              <img
                                className="h-12 w-12 rounded object-cover"
                                src={imageUrl}
                                alt={product.name}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center">
                                <FiImage className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate" title={product.name}>
                            {product.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.category?.name || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {minPrice === maxPrice
                            ? `${formatPrice(minPrice)}₫`
                            : `${formatPrice(minPrice)}₫ - ${formatPrice(maxPrice)}₫`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{variantCount} biến thể</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className={totalStock === 0 ? 'text-red-600 font-semibold' : ''}>
                            {totalStock}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${product.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {product.is_active ? 'Hoạt động' : 'Ẩn'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium sticky right-0 bg-white">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/products/${product.slug}/media`)}
                            className="text-blue-600 hover:text-blue-900 p-2"
                            title="Quản lý ảnh"
                          >
                            <FiImage />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/products/${product.slug}/edit`)}
                            className="text-indigo-600 hover:text-indigo-900 p-2"
                            title="Chỉnh sửa"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="text-red-600 hover:text-red-900 p-2"
                            title="Xóa"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <span className="text-sm text-gray-700">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
