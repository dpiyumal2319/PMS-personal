"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import {
  FaUser,
  FaIdCard,
  FaPhone,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaRuler,
  FaWeight,
  FaMars,
  FaVenus,
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
      setFormData({
        name: "",
        NIC: "",
        telephone: "",
        birthDate: "",
        address: "",
        height: "",
        weight: "",
        gender: "",
      }
      );

      setIsOpen(false);

    }
  };

  return (
    <Dialog open={isOpen} modal={true} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center space-x-2"  >
          <Plus className="w-5 h-5" />
          <span>Add Patient</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl p-6 max-h-screen">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center">
            <Plus className="w-6 h-6 mr-2 text-green-600" /> Add Patient
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center border p-3 rounded-md bg-white focus-within:outline focus-within:outline-primary-500 focus-within:ring focus-within:ring-primary-300">
              <FaUser className="text-gray-500 mr-3" />
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name *" required className="w-full focus:outline-none" />
            </div>
            <div className="flex items-center border p-3 rounded-md bg-white focus-within:outline focus-within:outline-primary-500 focus-within:ring focus-within:ring-primary-300">
              <FaIdCard className="text-gray-500 mr-3" />
              <input type="text" name="NIC" value={formData.NIC} onChange={handleChange} placeholder="NIC" className="w-full focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center border p-3 rounded-md bg-white focus-within:outline focus-within:outline-primary-500 focus-within:ring focus-within:ring-primary-300">
              <FaPhone className="text-gray-500 mr-3" />
              <input type="text" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="Telephone *" required className="w-full focus:outline-none" />
            </div>
            <div className="flex items-center border p-3 rounded-md bg-white focus-within:outline focus-within:outline-primary-500 focus-within:ring focus-within:ring-primary-300">
              <FaCalendarAlt className="text-gray-500 mr-3" />
              <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required className="w-full focus:outline-none" />
            </div>
          </div>
          <div className="flex items-center border p-3 rounded-md bg-white focus-within:outline focus-within:outline-primary-500 focus-within:ring focus-within:ring-primary-300">
            <FaMapMarkerAlt className="text-gray-500 mr-3" />
            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" className="w-full focus:outline-none" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center border p-3 rounded-md bg-white focus-within:outline focus-within:outline-primary-500 focus-within:ring focus-within:ring-primary-300">
              <FaRuler className="text-gray-500 mr-3" />
              <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder="Height (cm)" className="w-full focus:outline-none" />
            </div>
            <div className="flex items-center border p-3 rounded-md bg-white focus-within:outline focus-within:outline-primary-500 focus-within:ring focus-within:ring-primary-300">
              <FaWeight className="text-gray-500 mr-3" />
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder="Weight (kg)" className="w-full focus:outline-none" />
            </div>
            <div className="flex items-center border p-3 rounded-md bg-white focus-within:outline focus-within:outline-primary-500 focus-within:ring focus-within:ring-primary-300">
              {formData.gender === "MALE" ? <FaMars className="text-blue-500 mr-3" /> : formData.gender === "FEMALE" ? <FaVenus className="text-pink-500 mr-3" /> : <FaUser className="text-gray-500 mr-3" />}
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full focus:outline-none">
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-4">
            <Button variant="outline" type="button" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit">Add Patient</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
