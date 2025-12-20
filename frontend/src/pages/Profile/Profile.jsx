import { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, message, Modal } from 'antd';
import { HiOutlineUser, HiOutlineCamera, HiOutlineTrash } from 'react-icons/hi2';
import authService from '../../services/authService';
import userService from '../../services/userService';

const Profile = () => {
  const [form] = Form.useForm();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await authService.getProfile();
      setUser(response.data);
      form.setFieldsValue({
        full_name: response.data.full_name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
      });
    } catch (err) {
      message.error('Không thể tải thông tin người dùng');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = async (values) => {
    setIsSaving(true);

    try {
      const response = await userService.updateProfile(values);
      setUser(response.data);
      setIsEditing(false);
      message.success('Cập nhật thông tin thành công!');
      
      // Update form with latest data
      form.setFieldsValue({
        full_name: response.data.full_name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
      });
    } catch (err) {
      message.error(err.message || 'Cập nhật thông tin thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      message.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const response = await userService.uploadAvatar(file);
      setUser(response.data);
      message.success('Cập nhật ảnh đại diện thành công!');
    } catch (err) {
      message.error(err.message || 'Tải ảnh lên thất bại');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async () => {
    Modal.confirm({
      title: 'Xác nhận xóa ảnh đại diện',
      content: 'Bạn có chắc chắn muốn xóa ảnh đại diện?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        setIsUploadingAvatar(true);

        try {
          const response = await userService.deleteAvatar();
          setUser(response.data);
          message.success('Xóa ảnh đại diện thành công!');
        } catch (err) {
          message.error(err.message || 'Xóa ảnh thất bại');
        } finally {
          setIsUploadingAvatar(false);
        }
      },
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.setFieldsValue({
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Không thể tải thông tin người dùng</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light mb-2">Thông Tin Cá Nhân</h1>
          <p className="text-gray-600">Quản lý thông tin của bạn</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Avatar Section */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Avatar */}
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>';
                      }}
                    />
                  ) : (
                    <HiOutlineUser className="w-16 h-16 text-gray-400" />
                  )}
                </div>

                {/* Camera Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HiOutlineCamera className="w-5 h-5" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {/* Delete Avatar Button */}
              {user.avatar_url && (
                <button
                  onClick={handleDeleteAvatar}
                  disabled={isUploadingAvatar}
                  className="mt-4 text-sm text-red-600 hover:text-red-700 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                  Xóa ảnh đại diện
                </button>
              )}

              {isUploadingAvatar && (
                <p className="mt-2 text-sm text-gray-600">Đang xử lý...</p>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <Form
            form={form}
            onFinish={handleSaveProfile}
            layout="vertical"
            className="p-8"
          >
            {/* Email */}
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input
                size="large"
                placeholder="Nhập email"
                disabled={!isEditing}
              />
            </Form.Item>

            {/* Full Name */}
            <Form.Item
              label="Họ và tên"
              name="full_name"
              rules={[
                { required: true, message: 'Vui lòng nhập họ và tên!' },
                { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' },
                { max: 255, message: 'Họ và tên không được vượt quá 255 ký tự!' }
              ]}
            >
              <Input
                size="large"
                placeholder="Nhập họ và tên"
                disabled={!isEditing}
              />
            </Form.Item>

            {/* Phone */}
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[
                { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số!' }
              ]}
            >
              <Input
                size="large"
                placeholder="Nhập số điện thoại"
                disabled={!isEditing}
              />
            </Form.Item>

            {/* Role (Read only) */}
            <Form.Item label="Vai trò">
              <Input
                size="large"
                value={user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                disabled
              />
            </Form.Item>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              {!isEditing ? (
                <Button
                  type="primary"
                  size="large"
                  onClick={() => setIsEditing(true)}
                  style={{ height: '48px', backgroundColor: '#000', borderColor: '#000' }}
                  className="flex-1 hover:!bg-gray-800 hover:!border-gray-800"
                >
                  Chỉnh sửa thông tin
                </Button>
              ) : (
                <>
                  <Button
                    size="large"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex-1"
                    style={{ height: '48px' }}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    loading={isSaving}
                    style={{ height: '48px', backgroundColor: '#000', borderColor: '#000' }}
                    className="flex-1 hover:!bg-gray-800 hover:!border-gray-800"
                  >
                    Lưu thay đổi
                  </Button>
                </>
              )}
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
