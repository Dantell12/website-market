import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();


const sequelize = new Sequelize("marketplace", "postgres", "admin123", {
  host: "localhost",
  dialect: "postgres",
  port: 5432,
});

export default sequelize;
