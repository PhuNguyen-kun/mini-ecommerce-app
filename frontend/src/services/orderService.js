import { API_ENDPOINTS } from "../config/api";

class OrderService {
  async checkout(checkoutData) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/orders/checkout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(checkoutData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || "Checkout failed");
        error.response = response;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error during checkout:", error);
      throw error;
    }
  }

  async getOrders(page = 1, limit = 10, search, startDate, endDate, status) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User not authenticated");
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) {
        queryParams.append("search", search);
      }
      if (startDate) {
        queryParams.append("startDate", startDate);
      }
      if (endDate) {
        queryParams.append("endDate", endDate);
      }
      if (status) {
        queryParams.append("status", status);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/orders?${queryParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || "Failed to fetch orders");
        error.response = response;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  }

  async getOrderById(orderId) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || "Failed to fetch order");
        error.response = response;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching order:", error);
      throw error;
    }
  }

  async cancelOrder(orderId) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}/cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || "Failed to cancel order");
        error.response = response;
        error.data = data;
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error cancelling order:", error);
      throw error;
    }
  }
}

export default new OrderService();
