import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import serviceAttributes from '@/routes/service-attributes';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { CircleCheck, Eye, Pencil, Trash2, Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ServiceAttributeFormDialog } from './dialog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Thuộc tính dịch vụ', href: serviceAttributes.index().url },
];

interface Attribute {
    id: number;
    id_service: number;
    name: string;
    value: string;
    type: string;
    service?: { id: number; name: string };
}

interface Service {
    id: number;
    name: string;
}

interface PageProps {
    flash: { message?: string };
    attributes: {
        data: Attribute[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    services: Service[];
    service_names: string[];
    filters: { search?: string; service_name?: string };
    [key: string]: unknown;
}

export default function Index() {
    const { attributes, flash, services, service_names, filters } =
        usePage<PageProps>().props;
    const { delete: destroy } = useForm();

    const [search, setSearch] = useState(filters.search || '');
    const [serviceName, setServiceName] = useState(filters.service_name || 'all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentAttr, setCurrentAttr] = useState<Attribute | undefined>(
        undefined,
    );

    // useEffect REMOVED

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            serviceAttributes.index().url,
            {
                search,
                service_name: serviceName === 'all' ? '' : serviceName,
            },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newServiceName = e.target.value;
        setServiceName(newServiceName);
        router.get(
            serviceAttributes.index().url,
            {
                search,
                service_name: newServiceName === 'all' ? '' : newServiceName,
            },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa thuộc tính "${name}"?`)) {
            destroy(serviceAttributes.destroy(id).url, {
                onSuccess: () => toast.success('Xóa thành công!'),
                onError: () => toast.error('Không thể xóa.'),
            });
        }
    };

    const openCreateDialog = () => {
        setCurrentAttr(undefined);
        setIsDialogOpen(true);
    };

    const openEditDialog = (attr: Attribute) => {
        setCurrentAttr(attr);
        setIsDialogOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Thuộc tính dịch vụ" />

            {/* 🟢 Thông báo */}
            {flash.message && (
                <div className="m-4">
                    <Alert className="border-green-200 bg-green-50">
                        <CircleCheck className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">
                            Thông báo!
                        </AlertTitle>
                        <AlertDescription className="text-green-700">
                            {flash.message}
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            {/* 🔍 Bộ lọc và Thêm mới */}
            <div className="m-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                {/* Khu vực tìm kiếm và lọc */}
                <div className="flex flex-col gap-3 md:w-2/3 md:flex-row md:items-center">
                    <form onSubmit={handleSearch} className="flex w-full items-center gap-2 md:flex-1">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm theo tên, giá trị, loại hoặc dịch vụ..."
                            className="w-full flex-1"
                        />
                        <Button type="submit" variant="secondary" className="max-md:hidden">
                            <Search className="h-4 w-4" />
                        </Button>
                    </form>

                    {/* Select filter */}
                    <select
                        value={serviceName}
                        onChange={handleServiceChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 md:w-auto"
                    >
                        <option value="all">Tất cả dịch vụ</option>
                        {service_names.map((name, index) => (
                            <option key={index} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>

                    <Button onClick={handleSearch} className="w-full md:hidden">
                        <Search className="mr-2 h-4 w-4" /> Tìm kiếm
                    </Button>
                </div>

                {/* Nút Thêm mới */}
                <Button onClick={openCreateDialog} className="w-full md:w-auto">
                    <Pencil className="mr-2 h-4 w-4" /> Thêm Thuộc tính
                </Button>
            </div>

            {/* Danh sách */}
            <div className="m-8 rounded-lg border bg-white shadow-sm">
                {/* BỌC BẢNG TRONG DIV OVERFLOW */}
                {/* Mobile View: Card Layout */}
                <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                    {attributes.data.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Không có thuộc tính nào.
                        </div>
                    ) : (
                        attributes.data.map((attr) => (
                            <div key={attr.id} className="bg-gray-50 p-4 rounded-lg border shadow-sm space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{attr.name}</h3>
                                        <p className="text-sm text-gray-500">Service: {attr.service?.name || '—'}</p>
                                    </div>
                                    <div className="shrink-0 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                                        {attr.type || '—'}
                                    </div>
                                </div>

                                <div className="border-t pt-2 mt-2">
                                    <span className="text-gray-500 text-sm block mb-1">Giá trị:</span>
                                    <div className="font-mono text-sm bg-white p-2 rounded border break-all">
                                        {attr.value || '—'}
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end gap-2 border-t mt-2">
                                    <Link href={serviceAttributes.show(attr.id).url} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">
                                            <Eye className="h-4 w-4 mr-2" /> Chi tiết
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setCurrentAttr(attr);
                                            setIsDialogOpen(true);
                                        }}
                                        className="flex-1"
                                    >
                                        <Pencil className="h-4 w-4 mr-2" /> Sửa
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(attr.id, attr.name)}
                                        className="px-3"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop View: Table Layout */}
                <div className="hidden md:block overflow-x-auto">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px] text-center whitespace-nowrap">
                                    #
                                </TableHead>
                                <TableHead className="whitespace-nowrap">
                                    Tên thuộc tính
                                </TableHead>
                                <TableHead className="whitespace-nowrap">
                                    Dịch vụ
                                </TableHead>
                                <TableHead className="whitespace-nowrap">
                                    Giá trị
                                </TableHead>
                                <TableHead className="whitespace-nowrap">
                                    Loại
                                </TableHead>
                                <TableHead className="text-center whitespace-nowrap">
                                    Hành động
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attributes.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-8 text-center text-gray-500"
                                    >
                                        Không có thuộc tính nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                attributes.data.map((attr, index) => (
                                    <TableRow key={attr.id}>
                                        <TableCell className="text-center whitespace-nowrap">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap font-medium">
                                            {attr.name}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {attr.service?.name || '—'}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap max-w-xs truncate" title={attr.value}>
                                            {attr.value || '—'}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {attr.type || '—'}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex justify-center gap-2">
                                                <Link
                                                    href={
                                                        serviceAttributes.show(
                                                            attr.id,
                                                        ).url
                                                    }
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="Chỉnh sửa"
                                                    onClick={() => {
                                                        setCurrentAttr(attr);
                                                        setIsDialogOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="Xóa"
                                                    className="text-red-500 hover:text-red-700"
                                                    onClick={() =>
                                                        handleDelete(
                                                            attr.id,
                                                            attr.name,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* 📄 Phân trang */}
                <div className="flex flex-wrap justify-center gap-2 p-4">
                    {attributes.links.map((link, index) => (
                        <button
                            key={index}
                            disabled={!link.url}
                            onClick={() => {
                                if (link.url) {
                                    router.get(
                                        link.url,
                                        {
                                            search,
                                            service_name:
                                                serviceName === 'all'
                                                    ? ''
                                                    : serviceName,
                                        },
                                        {
                                            preserveScroll: true,
                                            preserveState: true,
                                            replace: true,
                                        },
                                    );
                                }
                            }}
                            className={`rounded-md border px-3 py-1 text-sm ${link.active
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                                } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>

            {/* 🧩 Dialog thêm/sửa */}
            <ServiceAttributeFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                initialData={currentAttr}
                services={services}
                title={
                    currentAttr
                        ? `Chỉnh sửa: ${currentAttr.name}`
                        : 'Thêm Thuộc Tính Dịch Vụ'
                }
            />
        </AppLayout>
    );
}
