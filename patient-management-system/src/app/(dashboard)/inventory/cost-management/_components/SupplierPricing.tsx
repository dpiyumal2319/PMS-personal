import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface SupplierPricingProps {
  supplierName: string;
  batches: {
    batchId: number;
    batchNumber: string;
    brandName: string;
    concentration: number;
    retailPrice: number;
    totalPrice: number;
    remainingQuantity: number;
    expiryDate: string;
  }[];
}

export function SupplierPricingTable({
  supplierName,
  batches,
}: SupplierPricingProps) {
  return (
    <Card className="mb-6  rounded-lg">
      <CardHeader className="bg-primary-100 p-4">
        <h3 className="text-lg font-semibold">{supplierName}</h3>
      </CardHeader>
      <CardContent className="p-0">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Batch Number</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Concentration</TableHead>
              <TableHead>Retail Price</TableHead>
              <TableHead>Total Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Expiry</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((batch) => (
              <TableRow key={batch.batchId}>
                <TableCell>{batch.batchNumber}</TableCell>
                <TableCell>{batch.brandName}</TableCell>
                <TableCell>{batch.concentration} mg</TableCell>
                <TableCell>Rs. {batch.retailPrice.toFixed(2)}</TableCell>
                <TableCell>Rs. {batch.totalPrice.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      batch.remainingQuantity > 0 ? "default" : "destructive"
                    }
                  >
                    {batch.remainingQuantity}
                  </Badge>
                </TableCell>
                <TableCell>{batch.expiryDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
