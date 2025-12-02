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
import { default as provinceUrl } from '@/routes/province';
import { BreadcrumbItem } from '@/types';

import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CircleCheck } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tỉnh thành',
        href: provinceUrl.index().url,
    },
];

export interface Province {
    id: number;
    name: string;
    description: string;
    country_id: { id: number; name: string } | null;
}

interface PageProps {
    flash: {
        message?: string;
    };
    provinces: Province[];
}

export default function Index() {
    const { provinces, flash } = usePage().props as PageProps;
    const { processing, delete: destroy } = useForm();

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa tỉnh thành ${name} id: ${id} ?`)) {
            destroy(provinceUrl.destroy(id).url);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Danh sách Tỉnh thành" />

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
                    <Link href={provinceUrl.create()}>
                        <Button className="rounded-xl bg-blue-600 px-5 py-2 text-white shadow-lg transition-all duration-200 hover:bg-blue-700">
                            ➕ Tạo một tỉnh thành mới
                        </Button>
                    </Link>
                </div>

                {/* Table */}
                {provinces.length > 0 && (
                    <div className="overflow-hidden rounded-2xl border bg-white shadow-xl">
                        <Table className="w-full">
                            <TableHeader>
                                <TableRow className="border-b bg-gradient-to-r from-gray-100 to-gray-200">
                                    <TableHead className="px-5 py-4 text-sm font-bold text-gray-700 uppercase">
                                        STT
                                    </TableHead>
                                    <TableHead className="px-5 py-4 text-sm font-bold text-gray-700 uppercase">
                                        Tên Tỉnh
                                    </TableHead>
                                    <TableHead className="px-5 py-4 text-sm font-bold text-gray-700 uppercase">
                                        Quốc gia
                                    </TableHead>
                                    <TableHead className="px-5 py-4 text-sm font-bold text-gray-700 uppercase">
                                        Mô tả
                                    </TableHead>
                                    <TableHead className="px-5 py-4 text-center text-sm font-bold text-gray-700 uppercase">
                                        Hành Động
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {provinces.map((province) => (
                                    <TableRow
                                        key={province.id}
                                        className="border-b transition-all duration-150 hover:bg-gray-50"
                                    >
                                        <TableCell className="px-5 py-4 text-gray-800">
                                            {province.id}
                                        </TableCell>

                                        <TableCell className="px-5 py-4 font-medium text-gray-900">
                                            {province.name}
                                        </TableCell>

                                        <TableCell className="px-5 py-4 text-gray-700">
                                            {province.country_id
                                                ? province.country_id.name
                                                : 'Chưa có'}
                                        </TableCell>

                                        <TableCell className="px-5 py-4 text-gray-700">
                                            {province.description}
                                        </TableCell>

                                        <TableCell className="space-x-3 px-5 py-4 text-center">
                                            <Link
                                                href={
                                                    provinceUrl.edit(
                                                        province.id,
                                                    ).url
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
                                                        province.id,
                                                        province.name,
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
