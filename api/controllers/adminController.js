import validator from "validator";
import bcrypt from "bcrypt";
import {v2 as cloudinary} from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";

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

export { addDoctor, loginAdmin, allDoctors };