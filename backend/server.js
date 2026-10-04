require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./database");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const ORDER_STATUSES = ["Baru", "Diproses", "Siap", "Selesai", "Dibatalkan"];
const MENU_STATUSES = ["tersedia", "habis"];

app.use(cors());
app.use(express.json({ limit: "5mb" }));

const asyncRoute = (handler) => (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);

function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function parseMenuBody(body) {
    const name = String(body.name || "").trim();
    const description = String(body.description || "").trim();
    const category = String(body.category || "").trim();
    const price = Number(body.price);
    const stock = body.stock === undefined || body.stock === "" ? 0 : Number(body.stock);
    const image = body.image ? String(body.image) : null;
    const status = MENU_STATUSES.includes(body.status) ? body.status : "tersedia";

    if (!name) return { error: "Nama menu wajib diisi" };
    if (!category) return { error: "Kategori wajib diisi" };
    if (!Number.isFinite(price) || price < 0) return { error: "Harga tidak valid" };
    if (!Number.isInteger(stock) || stock < 0) return { error: "Stok tidak valid" };

    return { value: [name, description, category, price, stock, image, status] };
}

function toDateString(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function resolveRange(query) {
    const now = new Date();
    const period = query.period || "Bulan ini";
    let from;
    let to;

    if (period === "7 hari terakhir") {
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === "Tahun ini") {
        from = new Date(now.getFullYear(), 0, 1);
        to = new Date(now.getFullYear(), 11, 31);
    } else if (period === "Rentang tanggal") {
        from = new Date(`${query.from}T00:00:00`);
        to = new Date(`${query.to}T00:00:00`);
        if (isNaN(from) || isNaN(to) || to < from) return null;
    } else {
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    return { period, from: toDateString(from), to: toDateString(to) };
}

app.get("/", (req, res) => {
    res.send("Lamak Bana API Running");
});

app.get("/api/health", asyncRoute(async (req, res) => {
    await db.query("SELECT 1");
    res.json({ status: "ok" });
}));

app.get("/api/menu", asyncRoute(async (req, res) => {
    const [rows] = await db.query("SELECT * FROM menu_items ORDER BY id ASC");
    res.json(rows);
}));

app.post("/api/menu", asyncRoute(async (req, res) => {
    const parsed = parseMenuBody(req.body || {});
    if (parsed.error) return res.status(400).json({ message: parsed.error });

    const [result] = await db.query(
        `INSERT INTO menu_items
        (name, description, category, price, stock, image, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        parsed.value
    );

    res.status(201).json({ message: "Menu berhasil ditambahkan", id: result.insertId });
}));

app.put("/api/menu/:id", asyncRoute(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "ID menu tidak valid" });

    const parsed = parseMenuBody(req.body || {});
    if (parsed.error) return res.status(400).json({ message: parsed.error });

    const [result] = await db.query(
        `UPDATE menu_items SET
        name=?, description=?, category=?, price=?, stock=?, image=?, status=?
        WHERE id=?`,
        [...parsed.value, id]
    );

    if (!result.affectedRows) return res.status(404).json({ message: "Menu tidak ditemukan" });
    res.json({ message: "Menu berhasil diperbarui" });
}));

app.delete("/api/menu/:id", asyncRoute(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "ID menu tidak valid" });

    const [result] = await db.query("DELETE FROM menu_items WHERE id=?", [id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Menu tidak ditemukan" });
    res.json({ message: "Menu berhasil dihapus" });
}));

app.get("/api/orders", asyncRoute(async (req, res) => {
    const [rows] = await db.query("SELECT * FROM orders ORDER BY id DESC");
    res.json(rows);
}));

app.patch("/api/orders/:id/status", asyncRoute(async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: "ID pesanan tidak valid" });

    const status = req.body && req.body.status;
    if (!ORDER_STATUSES.includes(status)) {
        return res.status(400).json({ message: "Status pesanan tidak valid" });
    }

    const [result] = await db.query("UPDATE orders SET status=? WHERE id=?", [status, id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    res.json({ message: "Status pesanan diperbarui" });
}));

app.get("/api/order-summary", asyncRoute(async (req, res) => {
    const [rows] = await db.query(
        `SELECT
            COALESCE(SUM(status='Baru'), 0) AS baru,
            COALESCE(SUM(status='Diproses'), 0) AS diproses,
            COALESCE(SUM(status='Siap'), 0) AS siap,
            COALESCE(SUM(status='Selesai'), 0) AS selesai,
            COALESCE(SUM(status='Dibatalkan'), 0) AS dibatalkan
        FROM orders`
    );
    res.json(rows[0]);
}));

app.get("/api/reports/chart", asyncRoute(async (req, res) => {
    const range = resolveRange(req.query);
    if (!range) return res.status(400).json({ message: "Rentang tanggal tidak valid" });

    const channel = req.query.channel && req.query.channel !== "Semua" ? req.query.channel : null;
    const monthly = range.period === "Tahun ini";
    const bucket = monthly ? "DATE_FORMAT(created_at, '%Y-%m')" : "DATE(created_at)";

    const params = [range.from, range.to];
    let channelClause = "";
    if (channel) {
        channelClause = "AND channel = ?";
        params.push(channel);
    }

    const [rows] = await db.query(
        `SELECT
            ${bucket} AS bucket,
            COUNT(*) AS orders,
            COALESCE(SUM(CASE WHEN status <> 'Dibatalkan' THEN total ELSE 0 END), 0) AS revenue
        FROM orders
        WHERE DATE(created_at) BETWEEN ? AND ?
        ${channelClause}
        GROUP BY bucket
        ORDER BY bucket ASC`,
        params
    );

    res.json({
        period: range.period,
        from: range.from,
        to: range.to,
        channel: channel || "Semua",
        interval: monthly ? "month" : "day",
        data: rows
    });
}));

app.use((req, res) => {
    res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
});

async function start() {
    try {
        await db.checkConnection();
    } catch (err) {
        console.error("Database connection failed");
        console.error(err.message);
        process.exit(1);
    }

    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    const shutdown = () => {
        server.close(async () => {
            await db.end();
            process.exit(0);
        });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

start();
