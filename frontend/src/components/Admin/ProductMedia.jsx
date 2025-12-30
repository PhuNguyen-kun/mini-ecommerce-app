import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiUpload,
  FiTrash2,
  FiArrowLeft,
  FiCheck,
  FiImage,
  FiBarChart2,
  FiPlay,
} from "react-icons/fi";
import { message, Modal } from "antd";
import productService from "../../services/productService";
import adminService from "../../services/adminService";

/**
 * ADMIN - QUẢN LÝ ẢNH & VIDEO (Giai đoạn 2)
 * Tính năng:
 * - Upload ảnh & video lên Cloudinary
 * - Hiển thị danh sách ảnh & video
 * - Gán nhãn màu cho từng ảnh
 * - Lưu mapping
 */

const ProductMedia = () => {
  const { productId } = useParams(); // productId ở đây thực ra là slug
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [uploadingVideos, setUploadingVideos] = useState([]);

  // Mapping: imageId -> optionValueId
  const [imageMappings, setImageMappings] = useState({});

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      // productId từ params thực ra là slug
      const response = await productService.getProductBySlug(productId);

      if (response.success) {
        const prod = response.data;
        setProduct(prod);
        setImages(prod.images || []);
        setVideos(prod.videos || []);

        // Lấy option màu sắc
        const colorOption =
          prod.options?.find(
            (opt) =>
              opt.name.toLowerCase().includes("màu") ||
              opt.name.toLowerCase().includes("color")
          ) || prod.options?.[0];

        if (colorOption) {
          setColorOptions(colorOption.values || []);
        }

        // Khôi phục mapping đã có
        const existingMappings = {};
        prod.images?.forEach((img) => {
          if (img.product_option_value_id) {
            existingMappings[img.id] = img.product_option_value_id;
          }
        });
        setImageMappings(existingMappings);
      }
    } catch (error) {
      console.error(error);
      message.error("Không thể tải thông tin sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  // === UPLOAD ẢNH ===

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (!product?.id) {
      message.warning("Chưa tải được thông tin sản phẩm!");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    try {
      setUploadingFiles(files.map((f) => f.name));
      setLoading(true);

      // Dùng product.id (số) thay vì productId (slug)
      const response = await adminService.uploadProductMedia(
        product.id,
        formData
      );

      if (response.success) {
        setImages(response.data.product.images || []);
        message.success("Upload ảnh thành công!");
      }
    } catch (error) {
      message.error(error.message || "Upload thất bại!");
    } finally {
      setUploadingFiles([]);
      setLoading(false);
    }
  };

  // === UPLOAD VIDEO ===

  const handleVideoSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (!product?.id) {
      message.warning("Chưa tải được thông tin sản phẩm!");
      return;
    }

    // Kiểm tra dung lượng video (tối đa 50MB mỗi video)
    const maxSize = 50 * 1024 * 1024; // 50MB
    const oversizedFiles = files.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      message.error(
        `Video ${oversizedFiles[0].name} vượt quá 50MB! Vui lòng chọn video nhỏ hơn.`
      );
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("videos", file);
    });

    try {
      setUploadingVideos(files.map((f) => f.name));
      setLoading(true);

      const response = await adminService.uploadProductMedia(
        product.id,
        formData
      );

      if (response.success) {
        setVideos(response.data.product.videos || []);
        message.success("Upload video thành công!");
      }
    } catch (error) {
      message.error(error.message || "Upload video thất bại!");
    } finally {
      setUploadingVideos([]);
      setLoading(false);
    }
  };

  // === GÁN NHÃN MÀU ===

  const handleAssignColor = (imageId, optionValueId) => {
    setImageMappings((prev) => ({
      ...prev,
      [imageId]: optionValueId ? parseInt(optionValueId) : null,
    }));
  };

  const handleSaveMappings = async () => {
    const pairs = Object.entries(imageMappings)
      .filter(([imageId, optionValueId]) => optionValueId)
      .map(([imageId, optionValueId]) => ({
        imageId: parseInt(imageId),
        optionValueId: parseInt(optionValueId),
      }));

    if (pairs.length === 0) {
      message.warning("Chưa có ảnh nào được gán màu!");
      return;
    }

    try {
      setLoading(true);
      const response = await adminService.assignImagesToOptions(pairs);

      if (response.success) {
        message.success(" Gán nhãn màu cho ảnh thành công!");
        navigate("/admin/products");
      }
    } catch (error) {
      message.error(error.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  // === XÓA ẢNH ===

  const handleDeleteImage = async (imageId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa ảnh này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          await adminService.deleteProductImage(imageId);

          setImages((prev) => prev.filter((img) => img.id !== imageId));
          setImageMappings((prev) => {
            const newMappings = { ...prev };
            delete newMappings[imageId];
            return newMappings;
          });

          message.success("Xóa ảnh thành công!");
        } catch (error) {
          message.error("Xóa ảnh thất bại!");
        }
      },
    });
  };

  // === XÓA VIDEO ===

  const handleDeleteVideo = async (videoId) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc muốn xóa video này?",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          await adminService.deleteProductVideo(videoId);

          setVideos((prev) => prev.filter((vid) => vid.id !== videoId));
          message.success("Xóa video thành công!");
        } catch (error) {
          message.error("Xóa video thất bại!");
        }
      },
    });
  };

  if (loading && !product) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <FiImage className="text-2xl text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">
          Quản lý Ảnh Sản Phẩm
        </h1>
      </div>
      <p className="text-gray-600 mb-6">
        Sản phẩm: <span className="font-semibold">{product?.name}</span>
      </p>

      {/* UPLOAD ẢNH */}
      <section className="border-b pb-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          1. Upload Ảnh
        </h2>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <FiUpload /> Chọn Ảnh
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
          <span className="text-sm text-gray-600">
            Chọn nhiều ảnh cùng lúc (Ctrl/Cmd + Click)
          </span>
        </div>

        {uploadingFiles.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="font-medium">
              Đang upload {uploadingFiles.length} ảnh...
            </p>
            <div className="mt-2 space-y-1">
              {uploadingFiles.map((name, idx) => (
                <div key={idx} className="text-sm text-gray-600">
                  • {name}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* UPLOAD VIDEO */}
      <section className="border-b pb-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          2. Upload Video
        </h2>
        <div className="flex items-center gap-4">
          <label className="cursor-pointer px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
            <FiPlay /> Chọn Video
            <input
              type="file"
              multiple
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
            />
          </label>
          <span className="text-sm text-gray-600">
            Tối đa 50MB mỗi video • MP4, MOV, AVI
          </span>
        </div>

        {uploadingVideos.length > 0 && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <p className="font-medium">
              Đang upload {uploadingVideos.length} video...
            </p>
            <div className="mt-2 space-y-1">
              {uploadingVideos.map((name, idx) => (
                <div key={idx} className="text-sm text-gray-600">
                  • {name}
                </div>
              ))}
            </div>
          </div>
        )}

        {videos.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="relative group">
                <div className="aspect-video rounded-lg overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition bg-gray-900">
                  <video
                    src={video.video_url}
                    className="w-full h-full object-cover"
                    controls
                  />
                </div>

                <button
                  onClick={() => handleDeleteVideo(video.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  title="Xóa video"
                >
                  <FiTrash2 />
                </button>

                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                  <FiPlay />
                  <span>Video giới thiệu</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* GÁN NHÃN MÀU */}
      <section className="border-b pb-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          3. Gán Nhãn Màu Cho Ảnh
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Chọn màu tương ứng cho mỗi ảnh. Để trống nếu ảnh là ảnh chung (size
          chart, mô tả...).
        </p>

        {images.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có ảnh nào. Hãy upload ảnh ở bước 1.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img) => (
              <div key={img.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition">
                  <img
                    src={img.image_url}
                    alt="Product"
                    className="w-full h-full object-cover"
                  />
                </div>

                <select
                  value={imageMappings[img.id] || ""}
                  onChange={(e) => handleAssignColor(img.id, e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">-- Ảnh chung --</option>
                  {colorOptions.map((colorVal) => (
                    <option key={colorVal.id} value={colorVal.id}>
                      {colorVal.value}
                    </option>
                  ))}
                </select>

                {imageMappings[img.id] && (
                  <div className="mt-1 text-xs text-center bg-green-100 text-green-700 py-1 rounded flex items-center justify-center gap-1">
                    <FiCheck />{" "}
                    {
                      colorOptions.find((c) => c.id === imageMappings[img.id])
                        ?.value
                    }
                  </div>
                )}

                <button
                  onClick={() => handleDeleteImage(img.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  title="Xóa ảnh"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* NÚT LƯU */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <FiArrowLeft /> Quay lại
        </button>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleSaveMappings}
            disabled={loading || images.length === 0}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {loading ? (
              "Đang lưu..."
            ) : (
              <>
                <FiCheck /> Lưu & Hoàn thành
              </>
            )}
          </button>
        </div>
      </div>

      {/* THỐNG KÊ */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <FiBarChart2 className="text-blue-600" /> Thống kê:
        </h3>
        <ul className="text-sm space-y-1">
          <li>
            • Tổng số ảnh: <strong>{images.length}</strong>
          </li>
          <li>
            • Ảnh đã gán màu:{" "}
            <strong>
              {Object.values(imageMappings).filter((v) => v).length}
            </strong>
          </li>
          <li>
            • Ảnh chung (chưa gán):{" "}
            <strong>
              {images.length -
                Object.values(imageMappings).filter((v) => v).length}
            </strong>
          </li>
          <li>
            • Tổng số video: <strong>{videos.length}</strong>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProductMedia;
