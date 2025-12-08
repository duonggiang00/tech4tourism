import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
    icon: string;
    description: string;
    order: number;
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

            <div className="m-8 rounded-lg border border-gray-200 bg-white shadow-sm">
                {/* Desktop View */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px] text-center">
                                    STT
                                </TableHead>
                                <TableHead>Tên Loại Dịch Vụ</TableHead>
                                {/* <TableHead>Icon</TableHead> */}
                                <TableHead>Mô tả</TableHead>
                                <TableHead>Thứ tự</TableHead>
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
                                    {/* <TableCell>
                                        {type.icon ? (
                                            <img
                                                src={type.icon}
                                                alt={type.name}
                                                className="h-10 w-10 rounded-md border object-cover"
                                            />
                                        ) : (
                                            <Badge variant="outline">No Icon</Badge>
                                        )}
                                    </TableCell> */}
                                    <TableCell className="max-w-xs truncate">
                                        {type.description || '—'}
                                    </TableCell>
                                    <TableCell>{type.order}</TableCell>
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
                </div>

                {/* Mobile View */}
                <div className="md:hidden">
                    <div className="divide-y divide-gray-200">
                        {service_types.map((type, index) => (
                            <div key={type.id} className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-2">
                                        <span className="text-gray-400 font-mono text-sm pt-0.5">#{index + 1}</span>
                                        <div className="flex gap-3">
                                            {type.icon ? (
                                                <img
                                                    src={type.icon}
                                                    alt={type.name}
                                                    className="h-12 w-12 rounded-md border object-cover bg-gray-50"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-md border bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                                                    No Icon
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{type.name}</h3>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                                    Order: {type.order}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {type.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {type.description}
                                    </p>
                                )}

                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    <Button variant="outline" size="sm" onClick={() => openEditDialog(type)} className="w-full text-amber-600">
                                        <Pencil className="h-4 w-4 mr-1" /> Sửa
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleDelete(type.id, type.name)} className="w-full text-red-600">
                                        <Trash2 className="h-4 w-4 mr-1" /> Xóa
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {service_types.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        Chưa có loại dịch vụ nào. Hãy tạo mới!
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
