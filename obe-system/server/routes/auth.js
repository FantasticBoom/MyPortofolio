// routes/auth.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.post("/login", (req, res) => {
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [req.body.email, req.body.password], (err, result) => {
    if (err) {
      console.log("Database Error:", err);
      return res.json({ Error: "Login error in server" });
    }
    if (result.length > 0) {
      return res.json({
        Status: "Success",
        Role: result[0].role,
        User: result[0],
      });
    } else {
      return res.json({ Error: "Email atau Password salah" });
    }
  });
});

module.exports = router;
