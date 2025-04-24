import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    docId: {type: String, required: true},
    userData: {type: Object, required: true},
    docData: {type: Object, required: true},
    date: {type: String, required: true},
    description: {type: String, default: false},
})

const medicalRecordModel = mongoose.models.medicalRecord || mongoose.model("medicalRecord", medicalRecordSchema)
export default medicalRecordModel;