import express from "express";
import cors from "cors";
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
import scheduleReminders from "./config/reminderScheduler.js";
import Message from "./models/messageModel.js";

// app config
const app = express();
const port = process.env.PORT || 4000;
const httpServer = createServer(app);
connectCloudinary();

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

// middlewares
app.use(express.json());
app.use(cors());
connectDB();

// Scheduler
scheduleReminders();

// api endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
 
  socket.on("join", ({ userId, role }) => {
    socket.join(userId);
    console.log(`${role} joined room: ${userId}`);
  });
  
  socket.on("sendMessage", ({ from, to, text }) => {

    saveMessageToDatabase(from, to, text);
    
    io.to(to).emit("newMessage", { from, text });
    
 
    if (from !== to) {
      io.to(from).emit("messageSent", { to, text });
    }
  });
  

  socket.on("typing", ({ from, to }) => {
    io.to(to).emit("userTyping", { userId: from });
  });
  
  socket.on("stopTyping", ({ from, to }) => {
    io.to(to).emit("userStopTyping", { userId: from });
  });
  

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});



const saveMessageToDatabase = async (from, to, text) => {
  try {
  
    const newMessage = await Message.create({
      from,
      to,
      text,
      read: false,
    
    });
    
    console.log("Message saved to database:", newMessage._id);
    return newMessage;
  } catch (error) {
    console.error("Error saving message to database:", error);
    throw error; 
  }
};

httpServer.listen(port, () => {
  console.log("Server Started on port", port);
});