const { Sequelize } = require("sequelize");
const config = require("../config/config");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load Models
// 1. Users
db.User = require("./User")(sequelize, Sequelize.DataTypes);

// 2. Catalog
db.Category = require("./Category")(sequelize, Sequelize.DataTypes);
db.Product = require("./Product")(sequelize, Sequelize.DataTypes);

// 3. Variants
db.ProductOption = require("./ProductOption")(sequelize, Sequelize.DataTypes);
db.ProductOptionValue = require("./ProductOptionValue")(sequelize, Sequelize.DataTypes);
db.ProductVariant = require("./ProductVariant")(sequelize, Sequelize.DataTypes);
db.ProductVariantOption = require("./ProductVariantOption")(sequelize, Sequelize.DataTypes);

// 4. Address
db.Province = require("./Province")(sequelize, Sequelize.DataTypes);
db.District = require("./District")(sequelize, Sequelize.DataTypes);
db.Ward = require("./Ward")(sequelize, Sequelize.DataTypes);
db.UserAddress = require("./UserAddress")(sequelize, Sequelize.DataTypes);

// 5. Media & Extra
db.ProductImage = require("./ProductImage")(sequelize, Sequelize.DataTypes);
db.ProductVideo = require("./ProductVideo")(sequelize, Sequelize.DataTypes);
db.Wishlist = require("./Wishlist")(sequelize, Sequelize.DataTypes);
db.ProductView = require("./ProductView")(sequelize, Sequelize.DataTypes);
db.ProductReview = require("./ProductReview")(sequelize, Sequelize.DataTypes);

// 6. Sales
db.Cart = require("./Cart")(sequelize, Sequelize.DataTypes);
db.CartItem = require("./CartItem")(sequelize, Sequelize.DataTypes);
db.Order = require("./Order")(sequelize, Sequelize.DataTypes);
db.OrderItem = require("./OrderItem")(sequelize, Sequelize.DataTypes);
db.PaymentTransaction = require("./PaymentTransaction")(sequelize, Sequelize.DataTypes);

// KÍCH HOẠT QUAN HỆ (ASSOCIATIONS)
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
// ==========================================================

module.exports = db;
