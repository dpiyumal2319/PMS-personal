import { MdOutlineBrandingWatermark } from "react-icons/md";
import { FaCubes } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { AiFillMedicineBox } from "react-icons/ai";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Brand {
    id: number;
    name: string;
    modelCount: number;
}

export default function BrandListCard({ brands }: { brands: Brand[] }) {
    return (
        <div className="space-y-6 p-4">
            {brands.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {brands.map((brand) => (
                        <Card
                            className="hover:shadow-lg transition-all duration-200"
                            key={brand.id}
                        >
                            {/* Icon and Brand Name */}
                            <CardHeader className="flex gap-4">
                                <CardTitle className="flex items-center justify-start gap-4">
                                    <MdOutlineBrandingWatermark className="size-10 text-primary-500" />
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                                        {brand.name}
                                    </h3>
                                </CardTitle>
                            </CardHeader>

                            {/* Number of Models Available */}
                            <CardContent>
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-2">
                                        <AiFillMedicineBox className="w-6 h-6 text-gray-500" />
                                        <span className="text-lg font-medium text-gray-600 dark:text-gray-300">
                                            {brand.modelCount} Models Available
                                        </span>
                                    </div>
                                </div>

                                {/* View Details Button */}
                                <Link href={`/brands/${brand.id}`} passHref>
                                    <Button className="mt-6 w-full bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg">
                                        View Details
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-center">No brands with available stock.</p>
            )}
        </div>
    );
}
