import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import destinationUrl from '@/routes/destination';
import { BreadcrumbItem } from '@/types';

import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CircleCheck } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Điểm đến',
        href: destinationUrl.index().url,
    },
];

interface Destination {
    id: number;
    name: string;
    province_id: string;
    address: string;
    status: string;
    description: string;
}

interface PageProps {
    flash: {
        message?: string;
    };
    destinations: Destination[];
}

export default function Index() {
    const { destinations, flash } = usePage().props as PageProps;
    const { processing, delete: destroy } = useForm();
    const handleDelete = (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa tỉnh thành ${name} id: ${id} ?`)) {
            destroy(destinationUrl.destroy(id).url);
        }
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Countries" />
            <div className="m-4">
                <div>
                    {flash.message && (
                        <Alert variant="default">
                            <CircleCheck />
                            <AlertTitle>Thông báo!</AlertTitle>
                            <AlertDescription>{flash.message}</AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
            <div className="m-4">
                <Link href={destinationUrl.create()}>
                    <Button className="cursor-pointer">
                        Thêm điểm đến mới
                    </Button>
                </Link>
            </div>
            {destinations.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>STT</TableHead>
                            <TableHead>Tên địa điểm</TableHead>
                            <TableHead>Tỉnh thành</TableHead>
                            <TableHead>Địa chỉ</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Hành Động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {destinations.map((des) => (
                            <TableRow>
                                <TableCell>{des.id}</TableCell>
                                <TableCell>{des.name}</TableCell>
                                <TableCell>{des.province_id}</TableCell>
                                <TableCell>{des.address}</TableCell>
                                <TableCell>{des.status}</TableCell>
                                <TableCell>{des.description}</TableCell>
                                <TableCell className="space-x-7 text-center">
                                    <Link
                                        href={destinationUrl.edit(des.id).url}
                                    >
                                        <Button className="bg-amber-500 hover:bg-amber-700">
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        disabled={processing}
                                        onClick={() =>
                                            handleDelete(des.id, des.name)
                                        }
                                        className="bg-red-500 hover:bg-red-700"
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </AppLayout>
    );
}
