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
import { BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { CircleCheck, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ServiceFormDialog } from './dialog';

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
    id_service_type: number;
    id_provider: number;
    name: string;
    description: string;
    price: number;
    type_room?: string;
    type_car?: string;
    type_meal?: string;
    limit?: number;
    unit?: string;
    priceDefault?: string;
}

interface PageProps {
    flash: { message?: string };
    services: Service[];
    service_types: ServiceType[];
    providers: Provider[];
}

export default function Index() {
    const { services, flash, service_types, providers } =
        usePage<PageProps>().props;

    const { delete: destroy } = useForm();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentService, setCurrentService] = useState<Service | undefined>(
        undefined,
    );

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa dịch vụ "${name}" (ID: ${id})?`)) {
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

            {/* Alert thông báo */}
            <div className="m-4">
                {flash.message && (
                    <Alert
                        variant="default"
                        className="border-green-200 bg-green-50"
                    >
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

            {/* Nút tạo mới */}
            <div className="m-4 flex justify-end">
                <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm Dịch vụ
                </Button>

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

            {/* Bảng danh sách */}
            <div className="m-8 rounded-lg border border-gray-200 bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px] text-center">
                                STT
                            </TableHead>
                            <TableHead>Tên dịch vụ</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Nhà cung cấp</TableHead>
                            <TableHead>Giá</TableHead>
                            <TableHead>Đơn vị</TableHead>
                            <TableHead className="text-center">
                                Hành động
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {services.map((service, index) => (
                            <TableRow key={service.id}>
                                <TableCell className="text-center">
                                    {index + 1}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {service.name}
                                </TableCell>
                                <TableCell>
                                    {
                                        service_types.find(
                                            (t) =>
                                                t.id ===
                                                service.id_service_type,
                                        )?.name
                                    }
                                </TableCell>
                                <TableCell>
                                    {
                                        providers.find(
                                            (p) => p.id === service.id_provider,
                                        )?.name
                                    }
                                </TableCell>
                                <TableCell className="font-medium text-green-600">
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                        minimumFractionDigits: 0,
                                    }).format(service.price)}
                                </TableCell>
                                <TableCell>{service.unit || '—'}</TableCell>
                                <TableCell>
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
                        ))}
                    </TableBody>
                </Table>

                {services.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        Chưa có dịch vụ nào. Hãy tạo mới!
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
