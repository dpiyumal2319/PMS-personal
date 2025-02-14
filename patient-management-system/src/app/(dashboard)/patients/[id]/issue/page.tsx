import React from 'react';

const Page = async ({params}: {
    params: Promise<{id : string}>
}) => {
    const resolvedParams = await params
    const id = resolvedParams.id

    return (
        <div>
            Issue Medicines
        </div>
    );
};

export default Page;