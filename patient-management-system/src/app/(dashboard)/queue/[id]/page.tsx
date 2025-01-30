export default async function page(
    {params}: { params: Promise<{ id: string }> }
) {
    console.log((await params).id);

    return (
        <div>
            <h1 className="text-4xl font-bold text-primary-500">Queue</h1>
            <p className="text-lg">This is the queue page.</p>
        </div>
    );
}