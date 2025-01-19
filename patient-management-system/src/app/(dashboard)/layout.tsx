export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {

    return (
        <div className="flex">
            <div className="flex flex-col w-full">
                {children}
            </div>
        </div>
    );
}