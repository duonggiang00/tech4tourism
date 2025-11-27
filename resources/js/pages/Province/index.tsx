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

interface Province {
    id: number;
    name: string;
    country_id: string;
    description: string;
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
            <Head title="Danh sách tỉnh thành" />
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
                <Link href={provinceUrl.create()}>
                    <Button className="cursor-pointer">
                        Thêm tỉnh thành mới
                    </Button>
                </Link>
            </div>
            {provinces.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>STT</TableHead>
                            <TableHead>Tên Tỉnh</TableHead>
                            <TableHead>Quốc gia</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Hành Động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {provinces.map((pro) => (
                            <TableRow>
                                <TableCell>{pro.id}</TableCell>
                                <TableCell>{pro.name}</TableCell>
                                <TableCell>{pro.country_id}</TableCell>
                                <TableCell>{pro.description}</TableCell>
                                <TableCell className="space-x-7 text-center">
                                    <Link href={provinceUrl.edit(pro.id).url}>
                                        <Button className="bg-amber-500 hover:bg-amber-700">
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        disabled={processing}
                                        onClick={() =>
                                            handleDelete(pro.id, pro.name)
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
