"use client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function AddItemButton() {
  return (
    <Button
      className="bg-primary-500 hover:bg-primary-600 text-white rounded-md px-4 py-2 transition-colors"
      onClick={() => console.log("Add new item clicked")} // Add your click handler
    >
      <Plus className="w-4 h-4 mr-2" />
      Add New Item
    </Button>
  );
}
