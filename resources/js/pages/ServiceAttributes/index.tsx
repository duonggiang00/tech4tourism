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
import serviceAttributes from '@/routes/service-attributes';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CircleCheck, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ServiceAttributeFormDialog } from './dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Thuộc tính dịch vụ',
        href: serviceAttributes.index().url,
    },
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
    attributes: Attribute[];
    services: Service[];
}

export default function Index() {
    const { attributes, flash, services } = usePage<PageProps>().props;
    const { delete: destroy } = useForm();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentAttr, setCurrentAttr] = useState<Attribute | undefined>(
        undefined,
    );

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa thuộc tính "${name}"?`)) {
            destroy(serviceAttributes.destroy(id).url);
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
                    Thêm thuộc tính
                </Button>

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
            </div>

            <div className="m-8 rounded-lg border border-gray-200 bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center">STT</TableHead>
                            <TableHead>Tên thuộc tính</TableHead>
                            <TableHead>Dịch vụ</TableHead>
                            <TableHead>Giá trị</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead className="text-center">
                                Hành động
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {attributes.map((attr, index) => (
                            <TableRow key={attr.id}>
                                <TableCell className="text-center">
                                    {index + 1}
                                </TableCell>
                                <TableCell>{attr.name}</TableCell>
                                <TableCell>
                                    {attr.service?.name || '—'}
                                </TableCell>
                                <TableCell>{attr.value || '—'}</TableCell>
                                <TableCell>{attr.type || '—'}</TableCell>
                                <TableCell>
                                    <div className="flex justify-center gap-2">
                                        <Link
                                            href={
                                                serviceAttributes.show(attr.id)
                                                    .url
                                            }
                                        >
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditDialog(attr)}
                                            className="hover:bg-amber-50 hover:text-amber-600"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleDelete(attr.id, attr.name)
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
                {attributes.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        Chưa có thuộc tính nào.
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
