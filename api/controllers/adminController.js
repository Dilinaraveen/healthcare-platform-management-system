import validator from "validator";
import bcrypt from "bcrypt";
import {v2 as cloudinary} from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import Message from "../models/messageModel.js";

//Adding a new doctor
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body; 
        const imageFile = req.file;
       
        //checking if all the fields are filled
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        //validating email format
        if(!validator.isEmail(email)){
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        //validating password length
        if(password.length < 8){
            return res.json({ success: false, message: "Password strong password" });
        }

        //hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //uploading image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path,{resource_type: "image"});
        const imageURL = imageUpload.secure_url;

        //creating new doctor
        const doctorData = {
            name,
            email,
            image: imageURL,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address:JSON.parse(address),
            date: Date.now()
        }

        //saving doctor to database
        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();

        res.json({ success: true, message: "Doctor added" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }

}

//API for admin login
const loginAdmin = async (req,res) => {

    try {

        const { email, password } = req.body;

        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
        
            const token = jwt.sign(email+password,process.env.JWT_SECRET);
            res.json({ success: true, message: "Login successful", token });

        }else{
            res.json({ success: false, message: "Invalid credentials" });
        }

    }catch(error){
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

//API to get all doctors list for admin panel
const allDoctors = async (req,res) => {
    try {
        
        const doctors = await doctorModel.find({}).select("-password");
        res.json({ success: true, doctors });

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message });
    }
}

//API to get all appointments list
const appointmentsAdmin = async (req,res) => {
    try {
        const appointments = await appointmentModel.find({});
        res.json({ success: true, appointments });
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message });
    }
}

//API to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);


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

//API to get dashbaord data for admin panel
const adminDashboard = async (req,res) => {
    try {
        const doctors = await doctorModel.find({});
        const users = await userModel.find({});
        const appointments = await appointmentModel.find({});
        
        const dashData = {
            doctors: doctors.length,
            patients: users.length,
            appointments: appointments.length,
            latestAppointments: appointments.reverse().slice(0, 5),
        }
        
        res.json({ success: true, dashData });
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message });
    }
}

//API to get users with messages
const usersWithMessages = async (req, res) => {
  try {
    // Get users who have sent messages
    const uniqueUsers = await Message.distinct("from", {
      from: { $ne: "admin" },
    });

    // Get user details from your User model
    const users = await userModel.find({ _id: { $in: uniqueUsers } }).select(
      "_id name email"
    );

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//API to get messages of a user
const getMessages = async (req, res) => {
    try {
      const { userId } = req.params;
      const messages = await Message.find({
        $or: [
          { from: userId, to: "admin" },
          { from: "admin", to: userId },
        ],
      }).sort({ createdAt: 1 });
  
      // Format messages for the client
      const formattedMessages = messages.map((msg) => ({
        from: msg.from === "admin" ? "admin" : "user",
        text: msg.text,
      }));
  
      res.status(200).json(formattedMessages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

export { addDoctor, loginAdmin, allDoctors, appointmentsAdmin, cancelAppointment, adminDashboard, usersWithMessages, getMessages };