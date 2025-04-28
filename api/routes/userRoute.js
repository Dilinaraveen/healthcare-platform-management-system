import express from "express";
import { getProfile, loginUser, registerUser, updateProfile, bookAppointment, listAppointments, cancelAppointment, paymentStripe, verifyPayment, getMedicalRecordsByUser, getMessages } from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";


const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

userRouter.get('/get-profile', authUser, getProfile);
userRouter.put('/update-profile', upload.single('image'), authUser, updateProfile);
userRouter.post('/book-appointment', authUser, bookAppointment);
userRouter.get('/appointments', authUser, listAppointments);
userRouter.post('/cancel-appointment', authUser, cancelAppointment);
userRouter.post('/create-payment', authUser,  paymentStripe);
userRouter.post('/verify-payment', authUser, verifyPayment);
userRouter.get('/user-medical-records/:userId', authUser, getMedicalRecordsByUser);
userRouter.get("/messages/:userId", getMessages);

  

export default userRouter;