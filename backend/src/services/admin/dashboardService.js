const db = require("../../models");
const { Op } = require("sequelize");

class DashboardService {
  async getDashboardStats() {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    
    const startOfMonth = new Date(now);
    startOfMonth.setMonth(now.getMonth() - 1);
    
    const startOf30Days = new Date(now);
    startOf30Days.setDate(now.getDate() - 30);

    // ========== OVERVIEW STATS ==========
    
    // Tổng đơn hàng
    const totalOrders = await db.Order.count();
    const todayOrders = await db.Order.count({
      where: { created_at: { [Op.gte]: startOfToday } }
    });
    const weekOrders = await db.Order.count({
      where: { created_at: { [Op.gte]: startOfWeek } }
    });

    // Doanh thu (chỉ tính các đơn đã thanh toán/thành công)
    const totalRevenue = await db.Order.sum('total_amount', {
      where: { 
        status: { [Op.in]: ['PAID', 'SHIPPING', 'COMPLETED'] }
      }
    }) || 0;
    
    const todayRevenue = await db.Order.sum('total_amount', {
      where: { 
        created_at: { [Op.gte]: startOfToday },
        status: { [Op.in]: ['PAID', 'SHIPPING', 'COMPLETED'] }
      }
    }) || 0;

    const monthRevenue = await db.Order.sum('total_amount', {
      where: { 
        created_at: { [Op.gte]: startOfMonth },
        status: { [Op.in]: ['PAID', 'SHIPPING', 'COMPLETED'] }
      }
    }) || 0;

    // Tổng người dùng
    const totalUsers = await db.User.count({ where: { role: 'customer' } });
    const newUsersThisMonth = await db.User.count({
      where: {
        role: 'customer',
        created_at: { [Op.gte]: startOfMonth }
      }
    });

    // Tổng sản phẩm
    const totalProducts = await db.Product.count();
    const activeProducts = await db.Product.count({ where: { is_active: true } });

    // Tổng danh mục
    const totalCategories = await db.Category.count();

    // ========== ORDERS BY STATUS ==========
    const ordersByStatus = await db.Order.findAll({
      attributes: [
        'status',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const statusMap = ordersByStatus.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});

    // ========== REVENUE CHART DATA (30 days) - Optimized with GROUP BY ==========
    const revenueDataRaw = await db.Order.findAll({
      attributes: [
        [db.sequelize.fn('DATE', db.sequelize.col('created_at')), 'date'],
        [db.sequelize.fn('SUM', db.sequelize.col('total_amount')), 'revenue']
      ],
      where: {
        created_at: { [Op.gte]: startOf30Days },
        status: { [Op.in]: ['PAID', 'SHIPPING', 'COMPLETED'] }
      },
      group: [db.sequelize.fn('DATE', db.sequelize.col('created_at'))],
      raw: true
    });

    // Create a map for quick lookup
    const revenueMap = {};
    revenueDataRaw.forEach(item => {
      const dateStr = new Date(item.date).toISOString().split('T')[0];
      revenueMap[dateStr] = parseFloat(item.revenue || 0);
    });

    // Fill in all 30 days
    const revenueData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      revenueData.push({
        date: dateStr,
        revenue: revenueMap[dateStr] || 0
      });
    }

    // ========== ORDERS CHART DATA (30 days) - Optimized with GROUP BY ==========
    const ordersDataRaw = await db.Order.findAll({
      attributes: [
        [db.sequelize.fn('DATE', db.sequelize.col('created_at')), 'date'],
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      where: {
        created_at: { [Op.gte]: startOf30Days }
      },
      group: [db.sequelize.fn('DATE', db.sequelize.col('created_at'))],
      raw: true
    });

    const ordersMap = {};
    ordersDataRaw.forEach(item => {
      const dateStr = new Date(item.date).toISOString().split('T')[0];
      ordersMap[dateStr] = parseInt(item.count || 0);
    });

    const ordersData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      ordersData.push({
        date: dateStr,
        count: ordersMap[dateStr] || 0
      });
    }

    // ========== REVENUE CHART DATA (7 days) - Extract from 30 days data ==========
    const revenueData7Days = revenueData.slice(-7);

    // ========== ORDERS CHART DATA (7 days) - Extract from 30 days data ==========
    const ordersData7Days = ordersData.slice(-7);

    // ========== TOP 10 BEST-SELLING PRODUCTS ==========
    const topProductsRaw = await db.sequelize.query(`
      SELECT 
        p.id as product_id,
        p.name as product_name,
        SUM(oi.quantity) as total_quantity
      FROM order_items oi
      INNER JOIN orders o ON oi.order_id = o.id
      INNER JOIN product_variants pv ON oi.product_variant_id = pv.id
      INNER JOIN products p ON pv.product_id = p.id
      WHERE o.status IN ('PAID', 'SHIPPING', 'COMPLETED')
      GROUP BY p.id, p.name
      ORDER BY total_quantity DESC
      LIMIT 10
    `, {
      type: db.sequelize.QueryTypes.SELECT
    });

    const topProductsData = topProductsRaw.map(item => ({
      productId: item.product_id,
      productName: item.product_name || 'Unknown Product',
      totalQuantity: parseInt(item.total_quantity || 0)
    }));

    return {
      overview: {
        totalOrders,
        todayOrders,
        weekOrders,
        totalRevenue: parseFloat(totalRevenue),
        todayRevenue: parseFloat(todayRevenue),
        monthRevenue: parseFloat(monthRevenue),
        totalUsers,
        newUsersThisMonth,
        totalProducts,
        activeProducts,
        totalCategories
      },
      ordersByStatus: statusMap,
      topSellingProducts: topProductsData,
      revenueChart: {
        last7Days: revenueData7Days,
        last30Days: revenueData
      },
      ordersChart: {
        last7Days: ordersData7Days,
        last30Days: ordersData
      }
    };
  }
}

module.exports = new DashboardService();
