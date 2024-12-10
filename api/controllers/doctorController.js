import doctorModel from "../models/doctorModel.js";

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

export {changeAvailability,doctorList}