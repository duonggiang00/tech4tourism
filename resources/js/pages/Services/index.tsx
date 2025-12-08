import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import serviceUrl from '@/routes/services';
import { BreadcrumbItem } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CircleCheck, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ServiceFormDialog } from './dialog';

// ... (Các interface và breadcrumbs giữ nguyên)
// ... (Các interface và breadcrumbs giữ nguyên)
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Danh sách Dịch vụ',
        href: serviceUrl.index().url,
    },
];

interface ServiceType {
    id: number;
    name: string;
}

interface Provider {
    id: number;
    name: string;
}

interface Service {
    id: number;
    service_type_id: number;
    provider_id: number;
    name: string;
    description: string;
    price: number;
    unit?: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PageProps {
    flash: { message?: string };
    services: {
        data: Service[];
        links: PaginationLink[];
    };
    service_types: ServiceType[];
    providers: Provider[];
    filters: {
        search?: string;
        provider_id?: string;
        service_type_id?: string;
    };
    [key: string]: unknown;
}

export default function Index() {
    const { services, flash, service_types, providers, filters } =
        usePage<PageProps>().props;
    const { delete: destroy } = useForm();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentService, setCurrentService] = useState<Service | undefined>(
        undefined,
    );
    const [search, setSearch] = useState(filters.search || '');

    /** 🗑️ Xóa dịch vụ */
    const handleDelete = (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa dịch vụ "${name}" (ID: ${id})?`)) {
            destroy(serviceUrl.destroy(id).url);
        }
    };

    /** 🆕 Mở dialog thêm mới */
    const openCreateDialog = () => {
        setCurrentService(undefined);
        setIsDialogOpen(true);
    };

    /** ✏️ Mở dialog chỉnh sửa */
    const openEditDialog = (service: Service) => {
        setCurrentService(service);
        setIsDialogOpen(true);
    };

    /** 🔍 Xử lý filter + tìm kiếm */
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(serviceUrl.index().url, {
            ...filters,
            search: search,
        }, {
            preserveScroll: true,
            replace: true,
        });
    };

    const handleFilterChange = (key: string, value: string) => {
        router.get(serviceUrl.index().url, {
            ...filters,
            search: search,
            [key]: value === 'all' ? '' : value,
        }, {
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Danh sách Dịch vụ" />

            {/* ⚡ Alert thông báo */}
            <div className="m-4">
                {flash.message && (
                    <Alert
                        variant="default"
                        className="border-green-200 bg-green-50"
                    >
                        <CircleCheck className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">
                            Thông báo
                        </AlertTitle>
                        <AlertDescription className="text-green-700">
                            {flash.message}
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {/* 🔎 Thanh tìm kiếm và bộ lọc */}
            <div className="mx-4 my-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <form onSubmit={handleSearch} className="flex w-full items-center gap-2 md:w-auto">
                    <div className="relative w-full md:w-80">
                        <Input
                            type="text"
                            placeholder="🔍 Tìm kiếm theo tên hoặc mô tả..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pr-10"
                        />
                        {/* Button search absolute like Tour page or just next to it? Tour page has it wrapping. Let's follow plan: Form with Button. */}
                    </div>
                    <Button type="submit" variant="secondary" className="max-md:hidden">
                        Tìm kiếm
                    </Button>
                </form>

                <div className="flex flex-wrap items-center justify-end gap-3">
                    {/* Lọc theo loại dịch vụ */}
                    <Select
                        defaultValue={filters.service_type_id || 'all'}
                        onValueChange={(value) =>
                            handleFilterChange('service_type_id', value)
                        }
                    >
                        {/* W-full trên mobile, giới hạn w-[180px] trên desktop */}
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Loại dịch vụ" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả loại</SelectItem>
                            {service_types.map((type) => (
                                <SelectItem
                                    key={type.id}
                                    value={String(type.id)}
                                >
                                    {type.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Lọc theo nhà cung cấp */}
                    <Select
                        defaultValue={filters.provider_id || 'all'}
                        onValueChange={(value) =>
                            handleFilterChange('provider_id', value)
                        }
                    >
                        {/* W-full trên mobile, giới hạn w-[180px] trên desktop */}
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Nhà cung cấp" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tất cả NCC</SelectItem>
                            {providers.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                    {p.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Nút tìm kiếm mobile */}
                    <Button onClick={(e) => handleSearch(e)} variant="secondary" className="w-full md:hidden">
                        Tìm kiếm
                    </Button>

                    {/* Nút thêm mới */}
                    <Button
                        onClick={openCreateDialog}
                        className="w-full sm:w-auto"
                    >
                        {' '}
                        {/* Thêm w-full trên mobile */}
                        <Plus className="mr-2 h-4 w-4" /> Thêm Dịch vụ
                    </Button>
                </div>

                {/* Dialog thêm/sửa */}
                <ServiceFormDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    initialData={currentService}
                    title={
                        currentService
                            ? `Chỉnh sửa: ${currentService.name}`
                            : 'Tạo mới Dịch vụ'
                    }
                    service_types={service_types}
                    providers={providers}
                />
            </div>

            {/* 🧾 Bảng danh sách dịch vụ (DESKTOP) */}
            <div className="mx-4 my-8 hidden overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm md:block">
                <Table className="min-w-full">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px] text-center whitespace-nowrap">
                                STT
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                                Tên dịch vụ
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                                Loại
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                                Nhà cung cấp
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                                Giá
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                                Đơn vị
                            </TableHead>
                            <TableHead className="text-center whitespace-nowrap">
                                Hành động
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {services.data.length > 0 ? (
                            services.data.map((service, index) => (
                                <TableRow key={service.id}>
                                    <TableCell className="text-center whitespace-nowrap">
                                        {index + 1}
                                    </TableCell>
                                    <TableCell className="font-medium whitespace-nowrap">
                                        {service.name}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {
                                            service_types.find(
                                                (t) =>
                                                    t.id ===
                                                    service.service_type_id,
                                            )?.name
                                        }
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {
                                            providers.find(
                                                (p) =>
                                                    p.id ===
                                                    service.provider_id,
                                            )?.name
                                        }
                                    </TableCell>
                                    <TableCell className="font-semibold whitespace-nowrap text-green-600">
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                            minimumFractionDigits: 0,
                                        }).format(service.price)}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        {service.unit || '—'}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    openEditDialog(service)
                                                }
                                                className="hover:bg-amber-50 hover:text-amber-600"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    handleDelete(
                                                        service.id,
                                                        service.name,
                                                    )
                                                }
                                                className="hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="py-8 text-center text-gray-500"
                                >
                                    Không có dữ liệu phù hợp
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* 📱 Danh sách dạng thẻ (MOBILE) */}
            <div className="mx-4 my-8 block space-y-4 md:hidden">
                {services.data.length > 0 ? (
                    services.data.map((service) => (
                        <div
                            key={service.id}
                            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                        >
                            <div className="mb-2 flex items-start justify-between">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900">
                                        {service.name}
                                    </h3>
                                    <p className="text-sm font-bold text-green-600">
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                            minimumFractionDigits: 0,
                                        }).format(service.price)}
                                        <span className="ml-1 text-xs font-normal text-gray-500">
                                            / {service.unit || 'Lần'}
                                        </span>
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => openEditDialog(service)}
                                        className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-50"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            handleDelete(
                                                service.id,
                                                service.name,
                                            )
                                        }
                                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-2 space-y-1 border-t pt-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Loại:</span>
                                    <span className="font-medium">
                                        {
                                            service_types.find(
                                                (t) =>
                                                    t.id ===
                                                    service.service_type_id,
                                            )?.name
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">NCC:</span>
                                    <span className="font-medium">
                                        {
                                            providers.find(
                                                (p) =>
                                                    p.id ===
                                                    service.provider_id,
                                            )?.name
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-500">
                        Không có dữ liệu phù hợp
                    </div>
                )}
            </div>

            {/* 📄 Phân trang */}
            {services.links && services.links.length > 3 && (
                <div className="flex justify-center gap-2 p-4">
                    {services.links.map((link, index) => (
                        <button
                            key={index}
                            disabled={!link.url}
                            onClick={() =>
                                link.url &&
                                router.get(
                                    link.url,
                                    { ...filters, search },
                                    { preserveScroll: true, replace: true },
                                )
                            }
                            className={`rounded border px-3 py-1 text-sm ${link.active
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
