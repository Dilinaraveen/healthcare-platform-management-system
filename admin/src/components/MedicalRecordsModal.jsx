import React, { useEffect, useState, useContext } from "react";
import { DoctorContext } from "../context/DoctorContext";
import { FaPlus, FaEdit } from "react-icons/fa";
import axios from 'axios';
import { toast } from 'react-toastify';

const MedicalRecordsModal = ({ patient, onClose }) => {
  const {
    getMedicalRecordsByDoctor,
    medicalRecords,
    setMedicalRecords,
    profileData,
    backendUrl,
    dToken,
    getProfileData,
    
  } = useContext(DoctorContext);

  const [adding, setAdding] = useState(false);
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    if (patient) {
      getMedicalRecordsByDoctor();
      getProfileData();
    }
  }, [patient]);

  const handleSave = async () => {
    console.log(profileData)
    const today = new Date();
    const formattedDate = `${today.getDate()}_${today.getMonth() + 1}_${today.getFullYear()}`;
  
    const payload = {
      userId: patient._id,
      docId: profileData?._id,
      userData: patient,
      docData: profileData,
      date: formattedDate,
      description: newDescription,
    };
  
    try {
      const { data } = await axios.post(
        backendUrl+'/api/doctor/create-medical-record',
        payload,
        {
          headers: { dToken},
        }
      );
  
      if (data.success) {
        setMedicalRecords([data.record, ...medicalRecords]); // update state
        setNewDescription("");
        setAdding(false);
        toast.success("Medical record created.");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error saving record:", error);
      toast.error("Failed to create medical record.");
    }
  };
  

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-full sm:w-[90%] md:w-[700px] lg:w-[1000px] max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-lg m-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Medical Records of {patient?.name}
          </h2>
          <button
            onClick={onClose}
            className="text-red-500 font-bold text-lg hover:text-red-700"
          >
            ✖
          </button>
        </div>

        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="mb-4 flex items-center gap-2 text-sm bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            <FaPlus size={12} /> Add New Record
          </button>
        )}

        {adding && (
          <div className="bg-gray-50 border p-4 rounded mb-4">
            <textarea
              rows={3}
              className="w-full border rounded p-2 resize-none"
              placeholder="Enter medical record description..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <div className="flex gap-3 mt-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setNewDescription("");
                  setAdding(false);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {medicalRecords
          .filter((item) => item.userId === patient._id)
          .map((item) => (
            <div
              key={item._id}
              className="flex items-start justify-between bg-white p-4 mb-4 rounded-md shadow-sm border w-full"
            >
              <div className="flex items-start gap-4">
                <img
                  className="w-10 h-10 rounded-full object-cover"
                  src={item?.userData?.image}
                  alt={item?.userData?.name || "Patient"}
                />
                <div>
                  <p className="font-semibold text-gray-800">
                    {item.userData.name}
                  </p>
                  <p className="text-sm text-gray-500">{item.date}</p>
                  <p className="mt-1 text-gray-700">{item.description}</p>
                </div>
              </div>
              <button
                onClick={() => console.log("Edit:", item._id)}
                className="text-gray-500 hover:text-gray-700"
                title="Edit Record"
              >
                <FaEdit />
              </button>
            </div>
          ))}

        {medicalRecords.filter((item) => item.userId === patient._id).length ===
          0 &&
          !adding && (
            <p className="text-gray-500 text-center">
              No medical records found for this patient.
            </p>
          )}
      </div>
    </div>
  );
};

export default MedicalRecordsModal;
