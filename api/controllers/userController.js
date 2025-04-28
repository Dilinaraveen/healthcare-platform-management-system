import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import medicalRecordModel from "../models/medicalRecordModel.js";
import Stripe from "stripe";
import { getAppointmentConfirmationTemplate, getPaymentConfirmationTemplate } from "../config/emailTemplate.js";
import { sendEmail } from "../config/emailService.js";
import Message from "../models/messageModel.js";

//API to register a user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please fill all the fields",
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).send({
        success: false,
        message: "Please enter a valid email",
      });
    }

    if (password.length < 8) {
      return res.status(400).send({
        success: false,
        message: "Enter a strong password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = await userModel.create(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ success: true, message: "Account created", token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API for login a user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, message: "Login successful", token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//APi for getting user profile data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId).select("-password");

    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API for update user profile
const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.status(400).send({
        success: false,
        message: "Data missing",
      });
    }

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageUrl = imageUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, { image: imageUrl });
    }

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to book an appointment
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData.available) {
      return res.json({ success: false, message: "Doctor is not available" });
    }

    let slots_booked = docData.slots_booked;

    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({ success: false, message: "Slot not available" });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select("-password");

    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotDate,
      slotTime,
      date: new Date().getDate(),
    };

    const newAppointment = new appointmentModel(appointmentData);

    await newAppointment.save();

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

     // Send confirmation email to the user
    const emailTemplate = getAppointmentConfirmationTemplate(userData, docData, slotDate, slotTime);
    await sendEmail(userData.email, 'Appointment Confirmation', emailTemplate);

    res.json({ success: true, message: "Appointment booked" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API for getting all appointments
const listAppointments = async (req, res) => {
  try {
    const { userId } = req.body;
    const appointments = await appointmentModel.find({ userId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//API to cancel  an appointment
const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData.userId != userId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;

    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime
    );

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// API to create Stripe checkout session for appointment payment
const paymentStripe = async (req, res) => {
  console.log("Payment Stripe API called");
  try {
    const { appointmentId } = req.body;
    const { userId } = req.body;

    // Initialize Stripe with your secret key
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    // Find the appointment
    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    if (appointment.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized action" });
    }

    if (appointment.payment) {
      return res.json({ success: false, message: "Payment already completed" });
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Appointment with Dr. ${appointment.docData.name}`,
              description: `Appointment on ${appointment.slotDate.replace(
                /_/g,
                "/"
              )} at ${appointment.slotTime}`,
            },
            unit_amount: appointment.amount * 100, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment/success?appointment_id=${appointmentId}`,
      cancel_url: `${process.env.FRONTEND_URL}/my-appointments`,
    });

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to verify and update payment status
const verifyPayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const userId = req.body.userId || req.userId;

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    if (appointment.userId.toString() !== userId.toString()) {
        return res.json({ success: false, message: "Unauthorized action" });
    }

    // Update payment status to true
    await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true });

    // Get user and doctor data for the email
    const userData = await userModel.findById(userId).select("-password");
    const docData = await doctorModel.findById(appointment.docId).select("-password");

    // Send payment confirmation email
    const emailTemplate = getPaymentConfirmationTemplate(userData, docData, appointment);
    await sendEmail(userData.email, 'Payment Confirmation - Appointment', emailTemplate);


    res.json({ success: true, message: "Payment verified successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getMedicalRecordsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const records = await medicalRecordModel.find({ userId });

    res.json({
      success: true,
      message: "Medical records for user fetched successfully.",
      records,
    });
  } catch (error) {
    console.error("Error fetching user's medical records:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [
        { from: userId, to: "admin" },
        { from: "admin", to: userId }
      ]
    }).sort({ createdAt: 1 });
    
    const formattedMessages = messages.map(msg => ({
      from: msg.from === userId ? "user" : "admin",
      text: msg.text
    }));

    res.status(200).json(formattedMessages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointments,
  cancelAppointment,
  paymentStripe,
  verifyPayment,
  getMedicalRecordsByUser,
  getMessages
};
