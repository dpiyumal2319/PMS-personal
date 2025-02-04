import {getQueues} from "@/app/lib/actions";
import {TableBody, TableRow, TableCell,  } from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {Badge} from "@/components/ui/badge";


async function TableContents({ currentPage, size }: { currentPage: number, size: number }) {
    const queues = await getQueues((currentPage - 1) * size, size);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 hover:bg-green-200';
            case 'IN_PROGRESS':
                return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
        }
    };

    return (
        <TableBody>
            {queues.map((queue) => (
                <TableRow key={queue.id}>
                    <TableCell className="font-medium">Queue {queue.id}</TableCell>
                    <TableCell>
                        <Badge className={getStatusStyle(queue.status)}>
                            {queue.status}
                        </Badge>
                    </TableCell>
                    <TableCell>{new Date(queue.start).toLocaleDateString()}</TableCell>
                    <TableCell>{queue._count.entries}</TableCell>
                    <TableCell>
                        <Button asChild variant="default" size="sm">
                            <Link href={`/queue/${queue.id}`}>
                                View
                            </Link>
                        </Button>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    );
}

export default TableContents;