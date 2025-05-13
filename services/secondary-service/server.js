require('dotenv').config();

const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const reviewRoutes = require("./routes/reviewRoutes");
const { swaggerUi, specs } = require("./swagger");


dotenv.config();
connectDB();

const app = express();
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(express.json());
app.use("/api/reviews", reviewRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));


const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`✅ Secondary Service running on port ${PORT}`));
