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

    // Check both possible keys
    const successMessage = flash?.success || flash?.message;

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa quốc gia ${name} id: ${id} ?`)) {
            destroy(countriesUrl.destroy(id).url);
        }
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Quản lý Quốc gia" />

            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                {/* Alert Notification */}
                {successMessage && (
                    <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                        <CircleCheck className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800 font-semibold">Thành công</AlertTitle>
                        <AlertDescription className="text-green-700">
                            {successMessage}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý Quốc gia</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Danh sách các quốc gia được hỗ trợ trong hệ thống tour.
                        </p>
                    </div>
                    <Link href={countriesUrl.create()}>
                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm">
                            <span className="mr-2">+</span> Thêm quốc gia
                        </Button>
                    </Link>
                </div>

                {/* Content Section */}
                <Card className="shadow-sm border-gray-200">
                    <CardHeader className="border-b border-gray-100 bg-gray-50/50 py-4">
                        <CardTitle className="text-base font-medium text-gray-700">
                            Danh sách ({countries.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {countries.length > 0 ? (
                            <>
                                {/* Desktop View */}
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader className="bg-gray-50/50">
                                            <TableRow>
                                                <TableHead className="w-[80px] text-center font-semibold text-gray-600">STT</TableHead>
                                                <TableHead className="w-[200px] font-semibold text-gray-600">Tên Quốc Gia</TableHead>
                                                <TableHead className="w-[100px] font-semibold text-gray-600">Mã</TableHead>
                                                <TableHead className="font-semibold text-gray-600">Mô tả</TableHead>
                                                <TableHead className="w-[180px] text-center font-semibold text-gray-600">Hành Động</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {countries.map((country: any, index) => (
                                                <TableRow key={country.id} className="hover:bg-gray-50 transition-colors">
                                                    <TableCell className="text-center text-gray-500">{index + 1}</TableCell>
                                                    <TableCell className="font-medium text-gray-900">{country.name}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="font-mono text-xs bg-gray-50 text-gray-700 border-gray-300">
                                                            {country.code}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-gray-600 max-w-md truncate" title={country.description}>
                                                        {country.description || <span className="text-gray-400 italic">Không có mô tả</span>}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-center items-center gap-2">
                                                            <Link href={countriesUrl.edit(country.id).url}>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                                                    <span className="sr-only">Sửa</span>
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                disabled={processing}
                                                                onClick={() => handleDelete(country.id, country.name)}
                                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                                                                <span className="sr-only">Xóa</span>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile View */}
                                <div className="md:hidden grid grid-cols-1 gap-4 p-4 text-sm bg-gray-50/50">
                                    {countries.map((country: any) => (
                                        <Card key={country.id} className="shadow-sm border border-gray-100 bg-white">
                                            <CardHeader className="pb-3 border-b border-gray-50">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-base font-bold text-gray-900">{country.name}</CardTitle>
                                                        <div className="mt-1">
                                                            <Badge variant="outline" className="font-mono text-xs bg-blue-50 text-blue-700 border-blue-200">
                                                                {country.code}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="py-3">
                                                <p className="text-gray-600 line-clamp-2 min-h-[1.25rem]">
                                                    {country.description || <span className="italic text-gray-400">Chưa cập nhật mô tả</span>}
                                                </p>
                                            </CardContent>
                                            <CardFooter className="grid grid-cols-2 gap-3 pt-0 pb-4 px-4">
                                                <Link href={countriesUrl.edit(country.id).url} className="w-full">
                                                    <Button variant="outline" className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm">
                                                        Chỉnh sửa
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    className="w-full border-red-100 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 shadow-sm"
                                                    disabled={processing}
                                                    onClick={() => handleDelete(country.id, country.name)}
                                                >
                                                    Xóa bỏ
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <p>Chưa có quốc gia nào được thêm vào hệ thống.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
