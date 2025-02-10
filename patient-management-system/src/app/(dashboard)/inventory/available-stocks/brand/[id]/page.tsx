import React from 'react';

async function Page({ params }: {
    params: Promise<{ id: string }>
    query: string,
    currentPage: number,
    selection: string,
    sort: string,
}) {

    const id = (await params).id;

    return (
        <div>
            <h1>Dynamic Page</h1>
            <p>The ID is: {id}</p>
        </div>
    );
}

export default Page;


