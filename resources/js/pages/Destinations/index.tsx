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
    { title: 'Điểm đến', href: destinationUrl.index().url },
];

interface Province {
    id: number;
    name: string;
}

interface Destination {
    id: number;
    name: string;
    province_id: string;
    address: string;
    status: string;
    description: string;
    province: Province;
}

interface PageProps {
    flash: { message?: string };
    destinations: Destination[];
}

export default function Index() {
    const { destinations, flash } = usePage().props as PageProps;
    const { processing, delete: destroy } = useForm();

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa điểm đến "${name}" id: ${id} ?`)) {
            destroy(destinationUrl.destroy(id).url);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Danh sách điểm đến" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                {/* Alert */}
                {flash.message && (
                    <div className="mb-6">
                        <Alert
                            className="rounded-xl border border-green-300 bg-green-50 text-green-700 shadow-md"
                            variant="default"
                        >
                            <CircleCheck className="mr-2" />
                            <AlertTitle className="font-bold">
                                Thông báo!
                            </AlertTitle>
                            <AlertDescription>{flash.message}</AlertDescription>
                        </Alert>
                    </div>
                )}

                {/* Create Button */}
                <div className="mb-6">
                    <Link href={destinationUrl.create()}>
                        <Button className="rounded-xl bg-blue-600 px-5 py-2 text-white shadow-lg transition-all duration-200 hover:bg-blue-700">
                            ➕ Thêm điểm đến mới
                        </Button>
                    </Link>
                </div>

                {/* Table */}
                {destinations.length > 0 && (
                    <div className="overflow-hidden rounded-2xl border bg-white shadow-xl">
                        <Table className="w-full">
                            <TableHeader>
                                <TableRow className="border-b bg-gradient-to-r from-gray-100 to-gray-200">
                                    <TableHead className="px-5 py-4 text-sm font-bold text-gray-700 uppercase">
                                        STT
                                    </TableHead>
                                    <TableHead className="px-5 py-4 text-sm font-bold text-gray-700 uppercase">
                                        Tên điểm đến
                                    </TableHead>
                                    <TableHead className="px-5 py-4 text-sm font-bold text-gray-700 uppercase">
                                        Tỉnh thành
                                    </TableHead>
                                    <TableHead className="px-5 py-4 text-sm font-bold text-gray-700 uppercase">
                                        Địa chỉ
                                    </TableHead>
                                    <TableHead className="px-5 py-4 text-sm font-bold text-gray-700 uppercase">
                                        Trạng thái
                                    </TableHead>
                                    <TableHead className="px-5 py-4 text-sm font-bold text-gray-700 uppercase">
                                        Mô tả
                                    </TableHead>
                                    <TableHead className="px-5 py-4 text-center text-sm font-bold text-gray-700 uppercase">
                                        Hành động
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {destinations.map((des) => (
                                    <TableRow
                                        key={des.id}
                                        className="border-b transition-all duration-150 hover:bg-gray-50"
                                    >
                                        <TableCell className="px-5 py-4 text-gray-800">
                                            {des.id}
                                        </TableCell>

                                        <TableCell className="px-5 py-4 font-medium text-gray-900">
                                            {des.name}
                                        </TableCell>

                                        <TableCell className="px-5 py-4 text-gray-700">
                                            {des.province?.name || '-'}
                                        </TableCell>

                                        <TableCell className="px-5 py-4 text-gray-700">
                                            {des.address}
                                        </TableCell>

                                        <TableCell className="px-5 py-4">
                                            {des.status === '1' ? (
                                                <span className="inline-block rounded bg-green-100 px-2 py-1 text-sm text-green-700">
                                                    Hoạt động
                                                </span>
                                            ) : (
                                                <span className="inline-block rounded bg-red-100 px-2 py-1 text-sm text-red-700">
                                                    Không hoạt động
                                                </span>
                                            )}
                                        </TableCell>

                                        <TableCell className="px-5 py-4 text-gray-700">
                                            {des.description || '-'}
                                        </TableCell>

                                        <TableCell className="space-x-3 px-5 py-4 text-center">
                                            <Link
                                                href={
                                                    destinationUrl.edit(des.id)
                                                        .url
                                                }
                                            >
                                                <Button className="bg-white text-yellow-500 hover:bg-yellow-500">
                                                    ✏️
                                                </Button>
                                            </Link>

                                            <Button
                                                disabled={processing}
                                                onClick={() =>
                                                    handleDelete(
                                                        des.id,
                                                        des.name,
                                                    )
                                                }
                                                className="bg-white text-red-300 hover:bg-red-500"
                                            >
                                                🗑️
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
