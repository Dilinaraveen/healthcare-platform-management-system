import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";

//app config
const app = express();
const port = process.env.PORT || 4000;
connectCloudinary();

//middlewares
app.use(express.json());
app.use(cors());
connectDB();

//api endpoints
app.use("/api/admin", adminRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, ()=>{
    console.log("Server Started",port)
})