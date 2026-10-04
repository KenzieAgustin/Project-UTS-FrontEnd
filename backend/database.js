require("dotenv").config();
const mysql = require("mysql2/promise");

const config = {
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "lamak_bana",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true,
    dateStrings: true,
    charset: "utf8mb4"
};

if (process.env.DB_SOCKET) {
    config.socketPath = process.env.DB_SOCKET;
} else {
    config.host = process.env.DB_HOST || "localhost";
    config.port = Number(process.env.DB_PORT) || 3306;
}

const pool = mysql.createPool(config);

async function checkConnection() {
    const connection = await pool.getConnection();
    try {
        await connection.ping();
        console.log("MySQL Connected");
    } finally {
        connection.release();
    }
}

module.exports = pool;
module.exports.checkConnection = checkConnection;
