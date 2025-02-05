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
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";

// Define the type for DrugType
type DrugType = "Tablet" | "Syrup";

export function DrugForm() {
  const { toast } = useToast();

  const [brandName, setBrandName] = useState("");
  const [brandDescription, setBrandDescription] = useState("");
  const [drugName, setDrugName] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [drugType, setDrugType] = useState<DrugType>("Tablet"); // Explicit type
  const [quantity, setQuantity] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!expiryDate) {
      toast({
        title: "Error",
        description: "Expiry date is required",
        variant: "destructive",
      });
      return;
    }

    const result = await addNewItem({
      brandName,
      brandDescription,
      drugName,
      batchNumber,
      drugType,
      quantity,
      expiry: new Date(expiryDate),
      price,
    });

    if (result.success) {
      toast({ title: "Success", description: result.message });
      setOpen(false);
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Drug Name</label>
            <Input
              value={drugName}
              onChange={(e) => setDrugName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Batch Number
              </label>
              <Input
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Drug Type
              </label>
              <select
                value={drugType}
                onChange={(e) => setDrugType(e.target.value as DrugType)} // Explicit type assertion
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
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <Input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
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
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
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
