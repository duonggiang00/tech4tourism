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
import providersUrl from '@/routes/providers';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CircleCheck, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ProviderFormDialog } from './diablog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Danh sách Nhà Cung Cấp',
        href: providersUrl.index().url,
    },
];

interface Provider {
    id: number;
    name: string;
    description?: string;
    email?: string;
    hotline?: string;
    address?: string;
    website?: string;
    status: string;
    notes?: string;
}

interface PageProps {
    flash: { message?: string };
    providers: Provider[];
}

export default function Index() {
    const { providers, flash } = usePage<PageProps>().props;

    const { delete: destroy } = useForm();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentProvider, setCurrentProvider] = useState<
        Provider | undefined
    >(undefined);

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa nhà cung cấp "${name}"?`)) {
            destroy(providersUrl.destroy(id).url);
        }
    };

    const openCreateDialog = () => {
        setCurrentProvider(undefined);
        setIsDialogOpen(true);
    };

    const openEditDialog = (provider: Provider) => {
        setCurrentProvider(provider);
        setIsDialogOpen(true);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case '0':
                return (
                    <Badge variant="outline" className="text-gray-600">
                        Không hoạt động
                    </Badge>
                );
            case '1':
                return (
                    <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-700"
                    >
                        Hoạt động
                    </Badge>
                );
            case '2':
                return (
                    <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-700"
                    >
                        Tạm ngưng
                    </Badge>
                );
            default:
                return <Badge variant="outline">Không rõ</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Danh sách Nhà Cung Cấp" />

            {/* Thông báo */}
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

            {/* Nút thêm */}
            <div className="m-4 flex justify-end">
                <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm Nhà Cung Cấp
                </Button>

                <ProviderFormDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    initialData={currentProvider}
                    title={
                        currentProvider
                            ? `Chỉnh sửa: ${currentProvider.name}`
                            : 'Thêm Nhà Cung Cấp Mới'
                    }
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
                            <TableHead>Tên</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Hotline</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-center">
                                Hành động
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {providers.map((provider, index) => (
                            <TableRow key={provider.id}>
                                <TableCell className="text-center">
                                    {index + 1}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {provider.name}
                                </TableCell>
                                <TableCell>{provider.email || '—'}</TableCell>
                                <TableCell>{provider.hotline || '—'}</TableCell>
                                <TableCell>
                                    {getStatusBadge(provider.status)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-center gap-2">
                                        {/* 👁 Nút xem chi tiết */}
                                        <Link
                                            href={
                                                providersUrl.show(provider.id)
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

                                        {/* ✏ Sửa */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                openEditDialog(provider)
                                            }
                                            className="hover:bg-amber-50 hover:text-amber-600"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        {/* 🗑 Xóa */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleDelete(
                                                    provider.id,
                                                    provider.name,
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

                {providers.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        Chưa có nhà cung cấp nào. Hãy tạo mới!
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
