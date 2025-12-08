import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

interface PropsPage {
    flash: {
        message?: string;
    };
    countries: Country[];
}

export default function Index() {
    const { countries, flash } = usePage<any>().props;
    const { processing, delete: destroy } = useForm();
    const handleDelete = (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa quốc gia ${name} id: ${id} ?`)) {
            destroy(countriesUrl.destroy(id).url);
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
                <Link href={countriesUrl.create()}>
                    <Button>Tạo một quốc gia mới</Button>
                </Link>
            </div>
            {countries.length > 0 && (
                <>
                    {/* Desktop View */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>STT</TableHead>
                                    <TableHead>Tên Nước</TableHead>
                                    <TableHead>Mã</TableHead>
                                    <TableHead>Mô tả</TableHead>
                                    <TableHead className="text-center">Hành Động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {countries.map((country: any, index) => (
                                    <TableRow key={country.id}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{country.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{country.code}</Badge>
                                        </TableCell>
                                        <TableCell>{country.description}</TableCell>
                                        <TableCell className="space-x-2 text-center">
                                            <Link href={countriesUrl.edit(country.id).url}>
                                                <Button size="sm" className="bg-amber-500 hover:bg-amber-700">
                                                    Edit
                                                </Button>
                                            </Link>
                                            <Button
                                                size="sm"
                                                disabled={processing}
                                                onClick={() => handleDelete(country.id, country.name)}
                                                className="bg-red-500 hover:bg-red-700"
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden grid grid-cols-1 gap-4">
                        {countries.map((country: any) => (
                            <Card key={country.id} className="shadow-sm">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg font-bold">{country.name}</CardTitle>
                                        <Badge variant="secondary">{country.code}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-2">
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {country.description || 'Không có mô tả'}
                                    </p>
                                </CardContent>
                                <CardFooter className="grid grid-cols-2 gap-3 pt-2">
                                    <Link href={countriesUrl.edit(country.id).url} className="w-full">
                                        <Button variant="outline" className="w-full border-amber-200 text-amber-700 hover:bg-amber-50">
                                            Sửa
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        className="w-full border-red-200 text-red-700 hover:bg-red-50"
                                        disabled={processing}
                                        onClick={() => handleDelete(country.id, country.name)}
                                    >
                                        Xóa
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </AppLayout>
    );
}
