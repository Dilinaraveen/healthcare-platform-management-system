import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import medicalRecordModel from "../models/medicalRecordModel.js";

//change availability of doctor
const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;

    console.log("docId", docId);

    const docData = await doctorModel.findById(docId);

    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });

    res.json({ success: true, message: "Availability changed successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//get all doctors
const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);

    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API for doctor login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await doctorModel.findOne({ email });

    if (!doctor) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);

    if (isMatch) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
      res.json({ success: true, message: "Login Success", token });
    } else {
      res.json({ success: false, message: "Invalid Password" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.body;

    const appointments = await appointmentModel.find({ docId });

    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId == docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });

      res.json({
        success: true,
        message: "Appointment completed successfully",
      });
    } else {
      res.json({ success: false, message: "Mark Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to cancel appointment for doctor panel
const appointmentCancel = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId == docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });

      res.json({ success: true, message: "Appointment Cancelled" });
    } else {
      res.json({ success: false, message: "Cancellation Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API  to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req.body;

    const appointments = await appointmentModel.find({ docId });

    let earnings = 0;

    appointments.map((item) => {
      if (item.isCompleted || item.payment) {
        earnings += item.amount;
      }
    });

    let patients = [];

    appointments.map((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId);
      }
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      lastestAppointments: appointments.reverse().slice(0, 5),
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to get doctor profile for dooctor panel
const doctorProfile = async (req, res) => {
  try {
    const { docId } = req.body;

    const profileData = await doctorModel.findById(docId).select("-password");

    res.json({ success: true, profileData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to update doctor prooofile data from Doctor Panel
const updateDoctorProfile = async (req, res) => {
  try {
    const { docId, fees, address, available } = req.body;

    await doctorModel.findByIdAndUpdate(docId, { fees, address, available });

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get unique patients for a doctor
const doctorPatients = async (req, res) => {
  try {
    const { docId } = req.body;

    // Find all appointments for the doctor
    const appointments = await appointmentModel.find({ docId });

    // Extract unique userIds
    const uniqueUserIds = [
      ...new Set(appointments.map((a) => a.userId.toString())),
    ];

    // Fetch user details (excluding sensitive fields)
    const patients = await userModel
      .find({ _id: { $in: uniqueUserIds } })
      .select("-password");

    res.json({ success: true, patients });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API to create medical record

const createMedicalRecord = async (req, res) => {
  try {
    const { userId, docId, userData, docData, date, description } = req.body;

    // Validate required fields
    if (!userId || !docId || !userData || !docData || !date || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const newRecord = new medicalRecordModel({
      userId,
      docId,
      userData,
      docData,
      date,
      description,
    });

    await newRecord.save();

    res.json({
      success: true,
      message: "Medical record created successfully.",
      record: newRecord,
    });
  } catch (error) {
    console.log("Error creating medical record:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// API to get all medical records created by a specific doctor
const getMedicalRecordsByDoctor = async (req, res) => {
  try {
    const { docId } = req.body;

    if (!docId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required.",
      });
    }

    const records = await medicalRecordModel.find({ docId });

    res.json({
      success: true,
      message: "Medical records fetched successfully.",
      records,
    });

  } catch (error) {
    console.error("Error fetching doctor's medical records:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateMedicalRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { description, date } = req.body;

    // Optional: you can allow editing other fields like docData, userData too
    if (!description || !date) {
      return res.status(400).json({
        success: false,
        message: "Description and date are required for update.",
      });
    }

    const updatedRecord = await medicalRecordModel.findByIdAndUpdate(
      recordId,
      { description, date },
      { new: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: "Medical record not found.",
      });
    }

    res.json({
      success: true,
      message: "Medical record updated successfully.",
      record: updatedRecord,
    });
  } catch (error) {
    console.error("Error updating medical record:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export {
  changeAvailability,
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentComplete,
  appointmentCancel,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  doctorPatients,
  createMedicalRecord,
  getMedicalRecordsByDoctor,
  updateMedicalRecord
};
