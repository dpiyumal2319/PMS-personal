"use client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddItemButtonProps {
  onClick: () => void;
}

export function AddItemButton({ onClick }: AddItemButtonProps) {
  return (
    <Button
      className="bg-primary-500 hover:bg-primary-600 text-white rounded-md px-4 py-2 transition-colors"
      onClick={onClick} // Add your click handler
    >
      <Plus className="w-4 h-4 mr-2" />
      Add New Item
    </Button>
  );
}
