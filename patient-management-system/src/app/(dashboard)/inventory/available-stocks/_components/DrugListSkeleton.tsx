export default function DrugList({ isLoading }: { isLoading: boolean }) {
    return (
        <div className="space-y-6 p-4">
            {isLoading ? (
                <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 h-screen">
                    {/* Skeleton loader card */}
                    {Array(12)
                        .fill(0)
                        .map((_, index) => (
                            <div
                                key={index}
                                className="bg-gray-300 p-4 rounded-md shadow-md animate-pulse "
                            >
                                <div className="h-6 bg-gray-400 w-3/4 mb-4"></div> {/* Title placeholder */}
                                <div className="h-4 bg-gray-400 w-full mb-2"></div> {/* Line 1 placeholder */}
                                <div className="h-4 bg-gray-400 w-3/4"></div> {/* Line 2 placeholder */}
                            </div>
                        ))}
                </div>
            ) : (
                <p className="text-gray-500 text-center">No medicines found.</p>
            )}
        </div>
    );
}
