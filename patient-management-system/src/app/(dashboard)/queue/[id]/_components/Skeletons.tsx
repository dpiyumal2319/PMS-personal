import React from 'react';

const StatusCardSkeleton = () => {
    return (
        <div className={'bg-white py-6 px-4 rounded-md shadow-md flex justify-between gap-5 flex-grow animate-pulse'}>
            <div className={'bg-gray-200 text-3xl shadow-md p-5 rounded-md w-14 h-14'}></div>
            <div className={'flex flex-col gap-2 w-full'}>
                <div className={'bg-gray-200 h-4 w-24 rounded'}></div>
                <div className={'bg-gray-300 h-6 w-16 rounded'}></div>
            </div>
        </div>
    );
};

const CardSet = ({number} : {number: number}) => {
    return (
        <div className={'flex gap-5'}>
            {[...Array(number)].map((_, index) => <StatusCardSkeleton key={index}/>)}
        </div>
    );
}

export { StatusCardSkeleton, CardSet };