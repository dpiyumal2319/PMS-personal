import type {Metadata} from "next";
import {Inter} from "next/font/google";
// import "./alldrugs.css";
import React from "react";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "Pharmacy Drugs Management",
    description: "Manage your pharmacy inventory with advanced filtering options",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <div className={inter.className}>
            <div className="min-h-screen bg-gray-50">{children}</div>
        </div>
    );
}