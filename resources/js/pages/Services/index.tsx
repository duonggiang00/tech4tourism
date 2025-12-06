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
import serviceUrl from '@/routes/services';
import { BreadcrumbItem, Provider, Service, ServiceType } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CircleCheck, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ServiceFormDialog } from './dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Danh sách Dịch vụ',
        href: serviceUrl.index().url,
    },
];

interface PageProps {
    flash: { message?: string };
    services: {
        data: Service[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
    service_types: ServiceType[];
    providers: Provider[];
}

export default function Index() {
    const { services, flash, service_types, providers } =
        usePage<PageProps>().props;

    const { delete: destroy } = useForm();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentService, setCurrentService] = useState<Service | undefined>();

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Xóa dịch vụ "${name}"?`)) {
            destroy(serviceUrl.destroy(id).url);
        }
    };

    const openCreateDialog = () => {
        setCurrentService(undefined);
        setIsDialogOpen(true);
    };

    const openEditDialog = (service: Service) => {
        setCurrentService(service);
        setIsDialogOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Danh sách Dịch vụ" />

            {/* Thông báo */}
            <div className="m-4">
                {flash.message && (
                    <Alert className="border-green-200 bg-green-50">
                        <CircleCheck className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">
                            Thông báo!
                        </AlertTitle>
                        <AlertDescription className="text-green-700">
                            {flash.message}
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Nút thêm mới */}
            <div className="m-4 flex justify-end">
                <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" /> Thêm Dịch vụ
                </Button>

                <ServiceFormDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    initialData={currentService}
                    title={
                        currentService
                            ? `Chỉnh sửa: ${currentService.name}`
                            : 'Tạo mới dịch vụ'
                    }
                    service_types={service_types}
                    providers={providers}
                />
            </div>

            {/* Bảng danh sách */}
            <div className="m-8 rounded-lg border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60px] text-center">
                                #
                            </TableHead>
                            <TableHead>Tên dịch vụ</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Nhà cung cấp</TableHead>
                            <TableHead className="text-center">
                                Hành động
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {services.data.map((service, index) => (
                            <TableRow key={service.id}>
                                <TableCell className="text-center">
                                    {index + 1}
                                </TableCell>

                                <TableCell>{service.name}</TableCell>

                                <TableCell>
                                    {service.service_type?.name || '—'}
                                </TableCell>

                                <TableCell>
                                    {service.provider?.name || '—'}
                                </TableCell>

                                <TableCell>
                                    <div className="flex justify-center gap-2">
                                        {/* 🔍 Xem chi tiết */}
                                        <Link
                                            href={
                                                serviceUrl.show(service.id).url
                                            }
                                        >
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="hover:text-blue-600"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>

                                        {/* ✏ Sửa */}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                openEditDialog(service)
                                            }
                                            className="hover:text-amber-600"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        {/* 🗑 Xóa */}
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() =>
                                                handleDelete(
                                                    service.id,
                                                    service.name,
                                                )
                                            }
                                            className="hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* PHÂN TRANG */}
                <div className="flex justify-center gap-2 p-4">
                    {services.links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || '#'}
                            className={`rounded border px-3 py-1 ${
                                link.active
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white hover:bg-gray-100'
                            }`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
