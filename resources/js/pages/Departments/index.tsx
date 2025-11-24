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
import departmentUrl from '@/routes/departments';
import { BreadcrumbItem } from '@/types';

import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CircleCheck } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: departmentUrl.index().url,
    },
];

interface Department {
    id: number;
    name: string;
    description: string;
}

interface PageProps {
    flash: {
        message?: string;
    };
    departments: Department[];
}

export default function Index() {
    const { departments, flash } = usePage().props as PageProps;
    const { processing, delete: destroy } = useForm();
    const handleDelete = (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa quốc gia ${name} id: ${id} ?`)) {
            destroy(departmentUrl.destroy(id).url);
        }
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Department" />
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
                <Link href={departmentUrl.create()}>
                    <Button>Tạo một Department mới</Button>
                </Link>
            </div>
            {departments.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Tên</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Hành Động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {departments.map((department) => (
                            <TableRow>
                                <TableCell>{department.id}</TableCell>
                                <TableCell>{department.name}</TableCell>
                                <TableCell>{department.description}</TableCell>
                                <TableCell className="space-x-7 text-center">
                                    <Link
                                        href={
                                            departmentUrl.edit(department.id)
                                                .url
                                        }
                                    >
                                        <Button className="bg-amber-500 hover:bg-amber-700">
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        disabled={processing}
                                        onClick={() =>
                                            handleDelete(
                                                department.id,
                                                department.name,
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
