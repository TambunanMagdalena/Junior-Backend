const mssql = require("mssql");
require("dotenv").config();

const dbConfig = {
  server: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

let pool;

const getConnection = async () => {
  try {
    if (!pool) {
      pool = await mssql.connect(dbConfig);
      console.log(" Connected to SQL Server successfully");
    }
    return pool;
  } catch (err) {
    console.error("Database connection failed:", err.message);
    throw err;
  }
};

const closeConnection = async () => {
  try {
    if (pool) {
      await pool.close();
      pool = null;
      console.log("Connection closed");
    }
  } catch (err) {
    console.error("Error closing connection:", err.message);
  }
};

module.exports = {
  mssql,
  getConnection,
  closeConnection,
  dbConfig,
};
