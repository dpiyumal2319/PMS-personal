"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import {
  FaUser, FaIdCard, FaPhone, FaCalendarAlt, FaMapMarkerAlt,
  FaRuler, FaWeight, FaMars, FaVenus
} from "react-icons/fa";
import { PatientFormData } from "@/app/lib/definitions";
import { handleServerAction } from "@/app/lib/utils";
import { addPatient } from "@/app/lib/actions";




export default function AddPatientForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>({
    name: "",
    NIC: "",
    telephone: "",
    birthDate: "",
    address: "",
    height: "",
    weight: "",
    gender: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await handleServerAction(() => addPatient({ formData }), {
      loadingMessage: "Adding Patient...",
    });

    if (result.success) {
      setIsOpen(false);
      setFormData({
        name: "",
        NIC: "",
        telephone: "",
        birthDate: "",
        address: "",
        height: "",
        weight: "",
        gender: "",
      });
    }


  };

  return (
    <div>
      {/* Button to Open Modal */}
      <Button onClick={() => setIsOpen(true)} className="flex items-center space-x-2">
        <Plus className="w-5 h-5" />
        <span>Add Patient</span>
      </Button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-xl shadow-lg w-2/3 relative">
            {/* Close Button */}
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900">
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <Plus className="w-6 h-6 mr-2 text-green-600" /> Add Patient
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center border p-3 rounded-md w-full focus-within:outline focus-within:outline-primary-500 focus-within:ring focus-within:ring-primary-300">
                  <FaUser className="text-gray-500 mr-3" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name *"
                    required
                    className="w-full focus:outline-none"
                  />
                </div>


                <div className="flex items-center border p-3 rounded-md w-full focus-within:outline focus-within:outline-primary-500 focus-within:ring focus-within:ring-primary-300">
                  <FaIdCard className="text-gray-500 mr-3" />
                  <input
                    type="text"
                    name="NIC"
                    value={formData.NIC}
                    onChange={handleChange}
                    placeholder="NIC"
                    className="w-full focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center border p-3 rounded-md w-full focus-within:outline focus-within:outline-primary-500 focus-within:ring focus-within:ring-primary-300">
                  <FaPhone className="text-gray-500 mr-3" />
                  <input
                    type="text"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    placeholder="Telephone *"
                    required
                    className="w-full focus:outline-none"
                  />
                </div>

                <div className="flex items-center border p-3 rounded-md w-full focus-within:outline focus-within:outline-primary-500 focus-within:ring focus-within:ring-primary-300">
                  <FaCalendarAlt className="text-gray-500 mr-3" />
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    required
                    className="w-full focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center border p-3 rounded-md w-full focus-within:outline focus-within:outline-primary-500 focus-within:ring focus-within:ring-primary-300">
                <FaMapMarkerAlt className="text-gray-500 mr-3" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                  className="w-full focus:outline-none"
                />
              </div>

              <div className="flex items-center border p-3 rounded-md w-full">
                <div className="flex items-center border p-3 rounded-md w-full focus-within:outline focus-within:outline-primary-500 focus-within:ring focus-within:ring-primary-300">
                  <FaRuler className="text-gray-500 mr-3" />
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="Height (cm)"
                    className="w-full focus:outline-none"
                  />
                </div>

                <div className="flex items-center border p-3 rounded-md w-full focus-within:outline focus-within:outline-primary-500 focus-within:ring focus-within:ring-primary-300">
                  <FaWeight className="text-gray-500 mr-3" />
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="Weight (kg)"
                    className="w-full focus:outline-none"
                  />
                </div>

                <div className="flex items-center border p-3 rounded-md w-full focus-within:outline focus-within:outline-primary-500 focus-within:ring focus-within:ring-primary-300">
                  {formData.gender === "MALE" ? (
                    <FaMars className="text-blue-500 mr-3" />
                  ) : formData.gender === "FEMALE" ? (
                    <FaVenus className="text-pink-500 mr-3" />
                  ) : (
                    <FaUser className="text-gray-500 mr-3" />
                  )}

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full focus:outline-none"
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Patient
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
