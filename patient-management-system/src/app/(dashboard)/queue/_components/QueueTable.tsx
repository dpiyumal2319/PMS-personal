import React from 'react';
import PrimaryButton from "@/app/_components/PrimaryButton";

const QueueTable = () => {

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-primary-100">
                <tr>
                    <th scope="col" className="px-6 py-3">
                        Queue #
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Status
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Created
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Patients
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Action
                    </th>
                </tr>
                </thead>
                <tbody>
                <tr className="bg-white border-b border-gray-200 hover:bg-gray-50 ">
                    <th scope="row" className="px-6 py-4 font-medium">
                        Queue 1
                    </th>
                    <td className="px-6 py-4">
                        <span
                            className="bg-green-200 text-green-900 font-medium me-2 px-2.5 py-0.5 rounded-md">Green</span>
                    </td>
                    <td className="px-6 py-4">
                        2024/01/1
                    </td>
                    <td className="px-6 py-4">
                        9
                    </td>
                    <td className="px-6 py-4">
                        <PrimaryButton text={'View'}/>
                    </td>
                </tr>
                </tbody>
            </table>
            <nav className="flex items-center flex-column md:flex-row justify-end p-4"
                 aria-label="Table navigation">
                <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
                    <li>
                        <a href="#"
                           className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-primary bg-white border border-gray-300 rounded-s-lg hover:bg-primary-100 hover:text-primary-700">Previous</a>
                    </li>
                    <li>
                        <a href="#"
                           className="flex items-center justify-center px-3 h-8 leading-tight text-primary bg-white border border-gray-300 hover:bg-primary-100 hover:text-primary-700">1</a>
                    </li>
                    <li>
                        <a href="#"
                           className="flex items-center justify-center px-3 h-8 leading-tight text-primary bg-white border border-gray-300 rounded-e-lg hover:bg-primary-100 hover:text-primary-700">Next</a>
                    </li>
                </ul>
            </nav>
        </div>

    );
};

export default QueueTable;