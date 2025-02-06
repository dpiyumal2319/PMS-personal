import { AiOutlineMedicineBox } from "react-icons/ai";
import { FaPrescriptionBottle } from "react-icons/fa";
import { MdOutlineInventory } from "react-icons/md";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Drug {
    name: string;
    totalRemainingQuantity: number;
}

export default function DrugList({ drugs }: { drugs: Drug[] }) {
    return (
        <div className="space-y-6 p-4">
            {drugs.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drugs.map((drug) => (
                        <Card
                            className="hover:shadow-lg transition-all duration-200"
                            key={drug.name}
                        >
                            {/* Icon and Name */}
                            <CardHeader className="flex gap-4">
                                <CardTitle className="flex items-center justify-start gap-4">
                                    <AiOutlineMedicineBox className="size-10 text-primary-500" />
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                                        {drug.name}
                                    </h3>
                                </CardTitle>
                            </CardHeader>

                            {/* Remaining Stock */}
                            <CardContent>
                                <div className="flex items-center gap-3 mt-4 text-gray-600 dark:text-gray-300">
                                    <MdOutlineInventory className="w-6 h-6 text-gray-500" />
                                    <span className="text-lg font-medium">
                                        {drug.totalRemainingQuantity} in stock
                                    </span>
                                </div>

                                {/* View Details Button */}
                                <Link href={`/drugs/${drug.name}`} passHref>
                                    <Button className="mt-6 w-full bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg">
                                        View Details
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-center">No medicines found.</p>
            )}
        </div>
    );
}
