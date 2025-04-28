import express from "express";
import {
  addDoctor,
  adminDashboard,
  allDoctors,
  appointmentsAdmin,
  cancelAppointment,
  getMessages,
  loginAdmin,
  usersWithMessages,
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";
import { changeAvailability } from "../controllers/doctorController.js";
const adminRouter = express.Router();

adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/login", loginAdmin);
adminRouter.get("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailability);
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, cancelAppointment);
adminRouter.get("/dashboard", authAdmin, adminDashboard);
adminRouter.get("/users-with-messages", usersWithMessages);
adminRouter.get("/messages/:userId", getMessages);

export default adminRouter;
