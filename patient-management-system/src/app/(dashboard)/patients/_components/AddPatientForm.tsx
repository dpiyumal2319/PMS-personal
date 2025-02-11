"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import {
  FaUser, FaIdCard, FaPhone, FaCalendarAlt, FaMapMarkerAlt,
  FaRuler, FaWeight
} from "react-icons/fa";
import { IoMdMale, IoMdFemale } from "react-icons/io";
import { PatientFormData } from "@/app/lib/definitions";
import { handleServerAction } from "@/app/lib/utils";
import { addPatient } from "@/app/lib/actions";
import IconedInput from "@/app/(dashboard)/_components/IconedInput";
import {usePathname, useRouter} from "next/navigation";

type Gender = "" | "MALE" | "FEMALE";

export default function AddPatientForm({modal}: {modal: boolean}) {
  const [open, setOpen] = useState(modal);
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

  const handleGenderChange = (value: Gender) => {
    setFormData({ ...formData, gender: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await handleServerAction(() => addPatient({ formData }), {
      loadingMessage: "Adding Patient...",
    });

    if (result.success) {
      setOpen(false);
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
      return;
    }
  };

  const pathName = usePathname();
  const searchParams = new URLSearchParams(pathName);
  const router = useRouter();

  const handleModal = (value: boolean) => {
    searchParams.set("model", value.toString());
    router.replace(`${pathName}?${searchParams.toString()}`);
    setOpen(value);
  }

  const handleCancel = () => {
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
    handleModal(false);
  };

  return (
      <Dialog open={open} onOpenChange={handleModal}>
        <DialogTrigger asChild>
          <Button className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add Patient</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="w-6 h-6 mr-2 text-green-600" /> Add Patient
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <IconedInput icon={<FaUser />} name="name" value={formData.name} onChange={handleChange} placeholder="Full Name *" required={true} />
              <IconedInput icon={<FaIdCard />} name="NIC" value={formData.NIC} onChange={handleChange} placeholder="NIC" />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <IconedInput icon={<FaPhone />} name="telephone" value={formData.telephone} onChange={handleChange} placeholder="Telephone *" required={true} />
              <IconedInput icon={<FaCalendarAlt />} name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} required={true} />
            </div>

            <IconedInput icon={<FaMapMarkerAlt />} name="address" value={formData.address} onChange={handleChange} placeholder="Address" />

            <div className="grid grid-cols-3 gap-6">
              <IconedInput icon={<FaRuler />} name="height" type="number" value={formData.height} onChange={handleChange} placeholder="Height (cm)" />
              <IconedInput icon={<FaWeight />} name="weight" type="number" value={formData.weight} onChange={handleChange} placeholder="Weight (kg)" />
              <Select value={formData.gender} onValueChange={handleGenderChange}>
                <SelectTrigger className={'h-full'}>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">
                    <div className="flex gap-2 items-center">
                      <IoMdMale className={'text-lg text-blue-600'}/>
                      <span>Male</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="FEMALE">
                    <div className="flex gap-2 items-center">
                      <IoMdFemale className={'text-lg text-pink-600'}/>
                      <span>Female</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Add Patient
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
  );
}