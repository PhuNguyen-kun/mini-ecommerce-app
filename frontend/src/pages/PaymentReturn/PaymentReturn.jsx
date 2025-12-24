import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [orderCode, setOrderCode] = useState("");

  useEffect(() => {
    const success = searchParams.get("success");
    const msg = searchParams.get("message");
    const code = searchParams.get("orderCode");

    if (success === "true") {
      setStatus("success");
      setOrderCode(code || "");
    } else {
      setStatus("failed");
      setMessage(msg || "Thanh toán thất bại");
    }
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingOutlined
            style={{ fontSize: 48 }}
            className="text-black mb-4"
          />
          <p className="text-gray-600">Đang xử lý kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          {status === "success" ? (
            <>
              <CheckCircleOutlined
                style={{ fontSize: 64 }}
                className="text-green-500 mb-4"
              />
              <h1 className="text-3xl font-bold mb-2 text-gray-900">
                Thanh toán thành công!
              </h1>
              <p className="text-gray-600 mb-6">
                Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được xác nhận và
                đang được xử lý.
              </p>
              {orderCode && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6 inline-block">
                  <p className="text-sm text-gray-600">Mã đơn hàng</p>
                  <p className="text-xl font-bold text-black">{orderCode}</p>
                </div>
              )}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate("/orders")}
                  className="bg-black text-white px-8 py-3 rounded hover:bg-gray-800 transition-colors font-medium"
                >
                  Xem đơn hàng
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="bg-white text-black px-8 py-3 rounded border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
                >
                  Tiếp tục mua sắm
                </button>
              </div>
            </>
          ) : (
            <>
              <CloseCircleOutlined
                style={{ fontSize: 64 }}
                className="text-red-500 mb-4"
              />
              <h1 className="text-3xl font-bold mb-2 text-gray-900">
                Thanh toán thất bại
              </h1>
              <p className="text-gray-600 mb-2">
                Rất tiếc, giao dịch của bạn không thành công.
              </p>
              {message && (
                <p className="text-red-600 mb-6 font-medium">{message}</p>
              )}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate("/orders")}
                  className="bg-black text-white px-8 py-3 rounded hover:bg-gray-800 transition-colors font-medium"
                >
                  Xem đơn hàng
                </button>
                <button
                  onClick={() => navigate("/cart")}
                  className="bg-white text-black px-8 py-3 rounded border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
                >
                  Quay lại giỏ hàng
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentReturn;
