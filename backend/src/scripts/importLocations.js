const axios = require("axios");
const db = require("../models");

const API_URL = "https://provinces.open-api.vn/api/?depth=3";

const importLocations = async () => {
    console.log("🚀 Bắt đầu import dữ liệu hành chính VN...");

    try {
        // 1. Kéo data
        console.log("⏳ Đang tải dữ liệu từ API...");
        const response = await axios.get(API_URL);
        const data = response.data;
        console.log(`✅ Đã tải xong ${data.length} tỉnh/thành.`);

        // 2. Import vào DB
        await db.sequelize.transaction(async (t) => {
            console.log("🗑️ Reset dữ liệu cũ (FK OFF)...");

            // ✅ QUAN TRỌNG: TẮT FK CHECKS TRÊN ĐÚNG CONNECTION
            await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { transaction: t });

            // 👉 Nếu có user_addresses → reset luôn cho sạch (LOCAL DEV)
            await db.UserAddress?.destroy({ where: {}, truncate: true, transaction: t });

            await db.Ward.destroy({ where: {}, truncate: true, transaction: t });
            await db.District.destroy({ where: {}, truncate: true, transaction: t });
            await db.Province.destroy({ where: {}, truncate: true, transaction: t });

            // BẬT LẠI FK
            await db.sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { transaction: t });

            console.log("📥 Đang insert dữ liệu mới...");

            for (const p of data) {
                await db.Province.create(
                    {
                        id: p.code,
                        name: p.name,
                    },
                    { transaction: t }
                );

                console.log(`>> ${p.name}`);

                for (const d of p.districts || []) {
                    await db.District.create(
                        {
                            id: d.code,
                            name: d.name,
                            province_id: p.code,
                        },
                        { transaction: t }
                    );

                    if (d.wards?.length) {
                        const wardPayload = d.wards.map((w) => ({
                            id: w.code,
                            name: w.name,
                            district_id: d.code,
                        }));

                        await db.Ward.bulkCreate(wardPayload, {
                            transaction: t,
                            ignoreDuplicates: true,
                        });
                    }
                }
            }
        });

        console.log("🎉 IMPORT THÀNH CÔNG! Địa chỉ VN đã sẵn sàng.");
        process.exit(0);

    } catch (error) {
        console.error("❌ Import thất bại:", error);
        process.exit(1);
    }
};

importLocations();
