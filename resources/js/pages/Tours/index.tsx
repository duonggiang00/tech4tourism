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
import categoriesUrl from '@/routes/categories';
import tourUrl from '@/routes/tour';
import { BreadcrumbItem } from '@/types';

import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CircleCheck } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Danh sách Tour',
        href: tourUrl.index().url,
    },
];

interface Tour {
    id: number;
    category_id: number;
    title: string;
    day: number;
    night: number;
    thumbnail: string;
    description: string;
    short_description: string;
    price_adult: number;
    price_chilren: number;
}

interface PageProps {
    flash: {
        message?: string;
    };
    tours: Tour[];
}

export default function Index() {
    const { tours, flash } = usePage().props as PageProps;
    const { processing, delete: destroy } = useForm();
    const handleDelete = (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa quốc gia ${name} id: ${id} ?`)) {
            destroy(categoriesUrl.destroy(id).url);
        }
    };
    console.log(tours);
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
                <Link href={tourUrl.create()}>
                    <Button>Tạo một Danh Mục mới</Button>
                </Link>
            </div>
            {tours.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>STT</TableHead>
                            <TableHead>Tour</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Hành Động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tours.map((tour,index) => (
                            <TableRow>
                                <TableCell>{index+1}</TableCell>
                                <TableCell>{tour.title}</TableCell>
                                <TableCell>{tour.short_description}</TableCell>
                                <TableCell className="space-x-7 text-center">
                                    <Link
                                        href={tourUrl.edit(tour.id).url}
                                    >
                                        <Button className="bg-amber-500 hover:bg-amber-700">
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        disabled={processing}
                                        onClick={() =>
                                            handleDelete(
                                                tour.id,
                                                tour.title,
                                            )
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
