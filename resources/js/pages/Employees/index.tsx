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
import employeeUrl from '@/routes/employees';
import { BreadcrumbItem } from '@/types';

import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CircleCheck } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: employeeUrl.index().url,
    },
];

interface Employee {
    id: number;
    name: string;
    avatar: string;
    email: string;
    phone: string;
    department_id: number;
    position: string;
    salary: number;
}

interface PageProps {
    flash: {
        message?: string;
    };
    employees: Employee[];
}

export default function Index() {
    const { employees, flash } = usePage().props as PageProps;
    const { processing, delete: destroy } = useForm();
    const handleDelete = (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa quốc gia ${name} id: ${id} ?`)) {
            destroy(employeeUrl.destroy(id).url);
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
                <Link href={employeeUrl.create()}>
                    <Button>Tạo một employee mới</Button>
                </Link>
            </div>
            {employees.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>avatar</TableHead>
                            <TableHead>email</TableHead>
                            <TableHead>phone</TableHead>
                            <TableHead>department_id</TableHead>
                            <TableHead>position</TableHead>
                            <TableHead>salary</TableHead>
                            <TableHead>Hành Động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees.map((employee) => (
                            <TableRow>
                                <TableCell>{employee.id}</TableCell>
                                <TableCell>{employee.name}</TableCell>
                                <TableCell>
                                    <img src="{employee.avatar}" alt="" width={100} height={100} />
                                </TableCell>
                                <TableCell>{employee.email}</TableCell>
                                <TableCell>{employee.phone}</TableCell>
                                <TableCell>{employee.department_id}</TableCell>
                                <TableCell>{employee.position}</TableCell>
                                <TableCell>{employee.salary}</TableCell>
                                <TableCell className="space-x-7 text-center">
                                    <Link
                                        href={employeeUrl.edit(employee.id).url}
                                    >
                                        <Button className="bg-amber-500 hover:bg-amber-700">
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        disabled={processing}
                                        onClick={() =>
                                            handleDelete(
                                                employee.id,
                                                employee.name,
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
