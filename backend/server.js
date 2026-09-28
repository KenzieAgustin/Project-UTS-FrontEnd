const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();

app.use(cors());
app.use(express.json());


app.get("/", (req,res)=>{
    res.send("Lamak Bana API Running");
});


app.get("/api/menu", (req,res)=>{

    db.query(
        "SELECT * FROM menu_items",
        (err,result)=>{

            if(err){
                res.status(500).json(err);
                return;
            }

            res.json(result);

        }
    );

});

app.post("/api/menu", (req,res)=>{

    const {
        name,
        description,
        category,
        price,
        stock,
        image,
        status
    } = req.body;


    const sql = `
        INSERT INTO menu_items
        (name, description, category, price, stock, image, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;


    db.query(
        sql,
        [
            name,
            description,
            category,
            price,
            stock,
            image,
            status
        ],
        (err,result)=>{

            if(err){
                res.status(500).json(err);
                return;
            }


            res.json({
                message:"Menu berhasil ditambahkan",
                id:result.insertId
            });

        }
    );

});

app.put("/api/menu/:id", (req,res)=>{

    const id = req.params.id;

    const {
        name,
        description,
        category,
        price,
        stock,
        image,
        status
    } = req.body;


    const sql = `
        UPDATE menu_items SET
        name=?,
        description=?,
        category=?,
        price=?,
        stock=?,
        image=?,
        status=?
        WHERE id=?
    `;


    db.query(
        sql,
        [
            name,
            description,
            category,
            price,
            stock,
            image,
            status,
            id
        ],
        (err,result)=>{

            if(err){
                res.status(500).json(err);
                return;
            }


            res.json({
                message:"Menu berhasil diperbarui"
            });

        }
    );

});

app.put("/api/menu/:id", (req,res)=>{

    const id = req.params.id;

    const {
        name,
        description,
        category,
        price,
        stock,
        image,
        status
    } = req.body;


    const sql = `
        UPDATE menu_items SET
        name=?,
        description=?,
        category=?,
        price=?,
        stock=?,
        image=?,
        status=?
        WHERE id=?
    `;


    db.query(
        sql,
        [
            name,
            description,
            category,
            price,
            stock,
            image,
            status,
            id
        ],
        (err,result)=>{

            if(err){
                res.status(500).json(err);
                return;
            }


            res.json({
                message:"Menu berhasil diperbarui"
            });

        }
    );

});

app.delete("/api/menu/:id", (req,res)=>{

    const id = req.params.id;


    db.query(
        "DELETE FROM menu_items WHERE id=?",
        [id],
        (err,result)=>{

            if(err){
                res.status(500).json(err);
                return;
            }


            res.json({
                message:"Menu berhasil dihapus"
            });

        }
    );

});

app.get("/api/orders", (req,res)=>{

    db.query(
        "SELECT * FROM orders ORDER BY id DESC",
        (err,result)=>{

            if(err){
                console.log(err);
                res.status(500).json(err);
                return;
            }

            res.json(result);

        }
    );

});

app.get("/api/order-summary",(req,res)=>{

    const sql = `
        SELECT
            SUM(status='Baru') AS baru,
            SUM(status='Diproses') AS diproses,
            SUM(status='Siap') AS siap,
            SUM(status='Selesai') AS selesai
        FROM orders
    `;

    db.query(sql,(err,result)=>{

        if(err){
            console.log(err);
            res.status(500).json(err);
            return;
        }

        res.json(result[0]);

    });

});


app.listen(3000,()=>{
    console.log("Server running on port 3000");
});