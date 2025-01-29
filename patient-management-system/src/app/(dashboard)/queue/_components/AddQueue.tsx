'use client';

import { useTransition, useState } from 'react';
import { addQueue} from "@/app/lib/actions";

// Toast Component
const Toast = ({ message, onClose }: { message: string, onClose: () => void }) => {
    return (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
            <div className="flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800" role="alert">
                <div className="inline-flex items-center justify-center shrink-0 w-8 h-8 text-orange-500 bg-orange-100 rounded-lg dark:bg-orange-700 dark:text-orange-200">
                    <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/>
                    </svg>
                    <span className="sr-only">Warning icon</span>
                </div>
                <div className="ms-3 text-sm font-normal">{message}</div>
                <button
                    type="button"
                    onClick={onClose}
                    className="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
                    aria-label="Close"
                >
                    <span className="sr-only">Close</span>
                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

// Queue Button Component
const QueueButton = () => {
    const [isPending, startTransition] = useTransition();
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleClick = () => {
        startTransition(async () => {
            const result = await addQueue();
            setToastMessage(result.message);
            setShowToast(true);

            // Auto-hide toast after 3 seconds
            setTimeout(() => {
                setShowToast(false);
            }, 3000);
        });
    };

    return (
        <div className={'flex justify-end py-2'}>
            <button
                onClick={handleClick}
                disabled={isPending}
                className={`
          px-4 py-2 
          bg-primary-500 
          text-white 
          rounded-md 
          hover:bg-primary-600 
          focus:outline-none 
          focus:ring-2 
          focus:ring-primary-500 
          focus:ring-offset-2
          transition-colors
          disabled:opacity-50 
          disabled:cursor-not-allowed
        `}
            >
                {isPending ? 'Creating Queue...' : 'Create New Queue'}
            </button>

            {showToast && (
                <Toast
                    message={toastMessage}
                    onClose={() => setShowToast(false)}
                />
            )}
        </div>
    );
};

export default QueueButton;