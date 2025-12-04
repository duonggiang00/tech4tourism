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
import serviceTypeUrl from '@/routes/service-types';
import { BreadcrumbItem } from '@/types';

import { Head, useForm, usePage } from '@inertiajs/react';
import { CircleCheck, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ServiceTypeFormDialog } from './dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Service Types',
        href: serviceTypeUrl.index().url,
    },
];

interface ServiceType {
    id: number;
    name: string;
    description: string;
}

interface PageProps {
    flash: { message?: string };
    service_types: ServiceType[];
}

export default function Index() {
    const { service_types, flash } = usePage<PageProps>().props;

    const { delete: destroy } = useForm();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentType, setCurrentType] = useState<ServiceType | undefined>(
        undefined,
    );

    const handleDelete = (id: number, name: string) => {
        if (
            confirm(`Bạn có chắc muốn xóa loại dịch vụ "${name}" (ID: ${id})?`)
        ) {
            destroy(serviceTypeUrl.destroy(id).url);
        }
    };

    const openCreateDialog = () => {
        setCurrentType(undefined);
        setIsDialogOpen(true);
    };

    const openEditDialog = (type: ServiceType) => {
        setCurrentType(type);
        setIsDialogOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Danh sách Loại Dịch Vụ" />

            {/* ALert */}
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

            {/* Button tạo */}
            <div className="m-4 flex justify-end">
                <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo Loại Dịch Vụ
                </Button>

                <ServiceTypeFormDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    initialData={currentType}
                    title={
                        currentType
                            ? `Chỉnh sửa: ${currentType.name}`
                            : 'Tạo mới Loại Dịch Vụ'
                    }
                />
            </div>

            {/* Table */}
            <div className="m-8 rounded-lg border border-gray-200 bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[60px] text-center">
                                STT
                            </TableHead>
                            <TableHead>Tên Loại Dịch Vụ</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead className="text-center">
                                Hành động
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {service_types.map((type, index) => (
                            <TableRow key={type.id}>
                                <TableCell className="text-center">
                                    {index + 1}
                                </TableCell>

                                <TableCell className="font-medium">
                                    {type.name}
                                </TableCell>

                                <TableCell className="max-w-md truncate">
                                    {type.description || '—'}
                                </TableCell>

                                <TableCell>
                                    <div className="flex justify-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditDialog(type)}
                                            className="hover:bg-amber-50 hover:text-amber-600"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleDelete(type.id, type.name)
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

                {service_types.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        Chưa có loại dịch vụ nào. Hãy tạo mới!
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
