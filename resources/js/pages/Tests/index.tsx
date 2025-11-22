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
import { BreadcrumbItem } from '@/types';

import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CircleCheck } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: categoriesUrl.index().url,
    },
];

interface Test {
    id: number;
    name: string;
    email: string;
}

interface PageProps {
    flash: {
        message?: string;
    };
    tests: Test[];
}

export default function Index() {
    const { tests, flash } = usePage().props as PageProps;
    // console.log(tests);
    const { processing, delete: destroy } = useForm();
    const handleDelete = (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa quốc gia ${name} id: ${id} ?`)) {
            destroy(categoriesUrl.destroy(id).url);
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
                <Link href={categoriesUrl.create()}>
                    <Button>Tạo một Danh Mục mới</Button>
                </Link>
            </div>
            {tests.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Danh Mục</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Hành Động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tests.map((test) => (
                            <TableRow key={test.id}>
                                <TableCell>{test.id}</TableCell>
                                <TableCell>{test.name}</TableCell>
                                <TableCell>{test.email}</TableCell>
                                <TableCell className="space-x-7 text-center">
                                    <Link
                                        href={categoriesUrl.edit(test.id).url}
                                    >
                                        <Button className="bg-amber-500 hover:bg-amber-700">
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        disabled={processing}
                                        onClick={() =>
                                            handleDelete(
                                                test.id,
                                                test.name,
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
