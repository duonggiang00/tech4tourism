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
import countriesUrl from '@/routes/countries';
import { BreadcrumbItem } from '@/types';

import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CircleCheck } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Countries',
        href: countriesUrl.index().url,
    },
];

interface Country {
    id: number;
    name: string;
    code: string;
    description: string;
}

interface PageProps {
    flash: {
        message?: string;
    };
    countries: Country[];
}

export default function Index() {
    const { countries, flash } = usePage().props as PageProps;
    const { processing, delete: destroy } = useForm();
    const handleDelete = (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa quốc gia ${name} id: ${id} ?`)) {
            destroy(countriesUrl.destroy(id).url);
        }
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Danh sách Quốc gia" />
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
                <Link href={countriesUrl.create()}>
                    <Button>Tạo một quốc gia mới</Button>
                </Link>
            </div>
            {countries.length > 0 && (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>STT</TableHead>
                            <TableHead>Tên Nước</TableHead>
                            <TableHead>Mã</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Hành Động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {countries.map((country) => (
                            <TableRow>
                                <TableCell>{country.id}</TableCell>
                                <TableCell>{country.name}</TableCell>
                                <TableCell>{country.code}</TableCell>
                                <TableCell>{country.description}</TableCell>
                                <TableCell className="space-x-7 text-center">
                                    <Link
                                        href={countriesUrl.edit(country.id).url}
                                    >
                                        <Button className="bg-amber-500 hover:bg-amber-700">
                                            Edit
                                        </Button>
                                    </Link>
                                    <Button
                                        disabled={processing}
                                        onClick={() =>
                                            handleDelete(
                                                country.id,
                                                country.name,
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
