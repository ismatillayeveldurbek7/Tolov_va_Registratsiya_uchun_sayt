import express from "express";
import cors from "cors";
import pg from "pg";

const app = express();
app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.get("/", (req, res) => {
  res.send("Backend ishlayapti 🚀");
});

app.post("/api/applications", async (req, res) => {
  try {
    const { fullname, phone, address } = req.body;

    const result = await pool.query(
      `INSERT INTO applications(fullname, phone, address)
       VALUES($1,$2,$3)
       RETURNING *`,
      [fullname, phone, address]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Xatolik" });
  }
});

app.get("/api/applications", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM applications ORDER BY id DESC"
    );

    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Xatolik" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server ${PORT} portda ishladi`);
});
