import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//change availability of doctor
const changeAvailability = async (req,res) => {

    try {

        const {docId} = req.body;

        console.log("docId", docId)

        const docData = await doctorModel.findById(docId);

        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available });

        res.json({success:true, message:"Availability changed successfully"})

    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//get all doctors
const doctorList = async (req,res) => {
    try {

        const doctors = await doctorModel.find({}).select(['-password','-email']);

        res.json({success:true, doctors})
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//API for doctor login
const loginDoctor = async (req,res) => {
    
    try {
        const {email, password} = req.body;

        const doctor = await doctorModel.findOne({email});

        if(!doctor) {
            return res.json({success:false, message:"Invalid Credentials"})
        }

        const isMatch = await bcrypt.compare(password, doctor.password);

        if(isMatch) {
            const token = jwt.sign({id:doctor._id}, process.env.JWT_SECRET, {expiresIn:"1d"});
            res.json({success:true, message:"Login Success", token})
        } else {
            res.json({success:false, message:"Invalid Password"})
        }

    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
    }
}

//API to get

export {changeAvailability,doctorList,loginDoctor}