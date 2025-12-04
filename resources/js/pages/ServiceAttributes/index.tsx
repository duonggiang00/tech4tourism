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
    service_id: number;
    name: string;
    value: string;
    service?: { id: number; name: string };
}

interface Service {
    id: number;
    name: string;
}

// PAGINATE FIXED HERE
interface PageProps {
    flash: { message?: string };
    attributes: {
        data: Attribute[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    services: Service[];
}

export default function Index() {
    const { attributes, flash, services } = usePage<PageProps>().props;
    const { delete: destroy } = useForm();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentAttr, setCurrentAttr] = useState<Attribute | undefined>();

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa thuộc tính "${name}"?`)) {
            destroy(serviceAttributes.destroy(id).url);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Thuộc tính dịch vụ" />

            {/* Flash message */}
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

            {/* Add button + Dialog */}
            <div className="m-4 flex justify-end">
                <Button
                    onClick={() => {
                        setCurrentAttr(undefined);
                        setIsDialogOpen(true);
                    }}
                >
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
                            : 'Thêm Thuộc Tính'
                    }
                />
            </div>

            {/* Table */}
            <div className="m-8 rounded-lg border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px] text-center">
                                STT
                            </TableHead>
                            <TableHead>Tên thuộc tính</TableHead>
                            <TableHead>Dịch vụ</TableHead>
                            <TableHead>Giá trị</TableHead>
                            <TableHead className="text-center">
                                Hành động
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {attributes.data.map((attr, index) => (
                            <TableRow key={attr.id}>
                                <TableCell className="text-center">
                                    {index + 1}
                                </TableCell>
                                <TableCell>{attr.name}</TableCell>
                                <TableCell>
                                    {attr.service?.name || '—'}
                                </TableCell>
                                <TableCell>{attr.value || '—'}</TableCell>

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
                                                className="hover:text-blue-600"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setCurrentAttr(attr);
                                                setIsDialogOpen(true);
                                            }}
                                            className="hover:text-amber-600"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleDelete(attr.id, attr.name)
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

                {/* Empty */}
                {attributes.data.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        Chưa có thuộc tính nào.
                    </div>
                )}

                {/* PAGINATION */}
                <div className="flex justify-center gap-2 p-4">
                    {attributes.links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.url || '#'}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`rounded border px-3 py-1 ${
                                link.active
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white hover:bg-gray-100'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
