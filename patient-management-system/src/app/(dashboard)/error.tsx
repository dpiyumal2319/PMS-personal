'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-lg shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-red-600">Something went wrong!</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-gray-700 text-sm">{error.message || "An unexpected error occurred."}</p>
                    
                    <Button onClick={reset} className="w-full bg-red-500 hover:bg-red-600">
                        Try Again
                    </Button>
                    
                    <div className="mt-4 border-t pt-4">
                        <h3 className="text-lg font-semibold">Contact Support</h3>
                        <div className="space-y-3 text-sm text-gray-700">
                            <div>
                                <p className="font-medium">Dasun Piyumal</p>
                                <p>📞 077 918 8749</p>
                                <p>✉️ w.piyumal2319@gmail.com</p>
                            </div>
                            <div>
                                <p className="font-medium">Sadeepa Dilhara</p>
                                <p>📞 071 362 7170</p>
                                <p>✉️ sadeepadilharap@gmail.com</p>
                            </div>
                            <div>
                                <p className="font-medium">Pubudu Manoj</p>
                                <p>📞 078 317 2315</p>
                                <p>✉️ pubudumanoj082@gmail.com</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
