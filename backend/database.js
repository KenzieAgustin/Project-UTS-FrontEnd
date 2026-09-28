const mysql = require("mysql2");


const db = mysql.createConnection({

    user: "root",

    password: "LamakBana123!",

    database: "lamak_bana",

    socketPath: "/tmp/mysql.sock"

});


db.connect((err) => {

    if (err) {
        console.log("Database connection failed");
        console.log(err);
        return;
    }

    console.log("MySQL Connected");

});


module.exports = db;