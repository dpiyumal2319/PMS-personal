"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addNewItem } from "@/app/lib/actions";
import { Plus } from "lucide-react";
import { handleServerAction } from "@/app/lib/utils";
import { AddItemButton } from "../../_components/AddButton";
import { InventoryFormData } from "@/app/lib/definitions";

// Define the type for DrugType
type DrugType = "Tablet" | "Syrup";

interface DrugFormProps {
  setOpen: (open: boolean) => void;
}

export function DrugForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<InventoryFormData>({
    brandName: "",
    brandDescription: "",
    drugName: "",
    batchNumber: "",
    drugType: "Tablet",
    quantity: 0,
    expiry: new Date(),
    price: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await handleServerAction(() => addNewItem({ formData }), {
      loadingMessage: "Adding new item...",
    });

    if (result.success) {
      setIsOpen(false);
    }
    setFormData({
      brandName: "",
      brandDescription: "",
      drugName: "",
      batchNumber: "",
      drugType: "Tablet",
      quantity: 0,
      expiry: new Date(),
      price: 0,
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button className="bg-primary-500 hover:bg-primary-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add New Item
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Brand Name</label>
            <Input
              value={formData.brandName}
              onChange={handleChange}
              required
              name="brandName"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Drug Name</label>
            <Input
              value={formData.drugName}
              onChange={handleChange}
              required
              name="drugNmae"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Batch Number
              </label>
              <Input
                value={formData.batchNumber}
                onChange={handleChange}
                required
                name="batchNumber"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Drug Type
              </label>
              <select
                value={formData.drugType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    drugType: e.target.value as DrugType,
                  })
                } // Explicit type assertion
                className="w-full p-2 border rounded"
              >
                <option value="Tablet">Tablet</option>
                <option value="Syrup">Syrup</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <Input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Expiry Date
            </label>
            <Input
              type="date"
              value={formData.expiry.toISOString().split("T")[0]}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary-500 hover:bg-primary-600"
          >
            Add Item
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
