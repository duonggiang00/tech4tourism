import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
import providersUrl from '@/routes/providers';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CircleCheck, Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ProviderFormDialog } from './diablog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Danh sách Nhà Cung Cấp', href: providersUrl.index().url },
];

interface Provider {
    id: number;
    name: string;
    email?: string;
    hotline?: string;
    status: string;
    notes?: string;
}

interface ServiceType {
    id: number;
    name: string;
}

interface PageProps {
    flash: { message?: string };
    providers: {
        data: Provider[];
        links: { url: string | null; label: string; active: boolean }[];
    };
    filters: { search?: string; status?: string };
    serviceTypes: ServiceType[];
    [key: string]: unknown;
}

export default function Index() {
    const { providers, flash, filters, serviceTypes } =
        usePage<PageProps>().props;

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentProvider, setCurrentProvider] = useState<Provider | null>(
        null,
    );

    // 🔍 Tìm kiếm realtime debounce - REMOVED
    // useEffect(() => { ... });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            providersUrl.index().url,
            { search, status: status === 'all' ? '' : status },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        router.get(
            providersUrl.index().url,
            { search, status: newStatus === 'all' ? '' : newStatus },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa nhà cung cấp "${name}"?`)) {
            router.delete(providersUrl.destroy(id).url, {
                onSuccess: () =>
                    toast.success('Đã xóa nhà cung cấp thành công!'),
                onError: () => toast.error('Không thể xóa nhà cung cấp!'),
            });
        }
    };

    // ... helper functions ...

    const getStatusBadge = (status: string) => {
        switch (status) {
            case '1':
                return (
                    <Badge className="bg-green-100 text-green-700">
                        Hoạt động
                    </Badge>
                );
            case '0':
                return <Badge variant="outline">Không hoạt động</Badge>;
            case '2':
                return (
                    <Badge className="bg-yellow-100 text-yellow-700">
                        Tạm ngưng
                    </Badge>
                );
            default:
                return <Badge variant="outline">Không rõ</Badge>;
        }
    };

    const openCreateDialog = () => {
        setCurrentProvider(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (provider: Provider) => {
        setCurrentProvider(provider);
        setIsDialogOpen(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nhà Cung Cấp" />

            {flash.message && (
                <div className="m-4">
                    <Alert className="border-green-200 bg-green-50">
                        <CircleCheck className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">
                            Thông báo
                        </AlertTitle>
                        <AlertDescription className="text-green-700">
                            {flash.message}
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            {/* 🔍 Bộ lọc - Đã chỉnh sửa responsive */}
            <div className="m-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm theo tên, email, hotline..."
                        className="w-full flex-1"
                    />
                    <Button type="submit" variant="secondary" className="max-sm:hidden">
                        <Search className="h-4 w-4" />
                    </Button>
                </form>

                <select
                    value={status}
                    onChange={handleStatusChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 sm:w-auto" // Chiếm toàn bộ chiều rộng trên mobile
                >
                    <option value="all">Tất cả</option>
                    <option value="1">Hoạt động</option>
                    <option value="0">Không hoạt động</option>
                    <option value="2">Tạm ngưng</option>
                </select>
                <Button onClick={handleSearch} className="flex w-full items-center gap-2 sm:hidden">
                    <Search className="h-4 w-4" /> Tìm kiếm
                </Button>
            </div>

            {/* 🧾 Danh sách */}
            <div className="m-6 rounded-lg border bg-white shadow-sm">
                <div className="flex flex-col items-start justify-between gap-3 border-b p-4 sm:flex-row sm:items-center">
                    <h2 className="text-xl font-semibold">
                        Danh sách Nhà Cung Cấp
                    </h2>
                    <Button
                        onClick={openCreateDialog}
                        className="w-full sm:w-auto"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Thêm Nhà Cung Cấp
                    </Button>
                </div>

                {/* BỔ SUNG: Thêm `overflow-x-auto` để cuộn ngang trên mobile */}
                {/* Mobile View: Card Layout */}
                <div className="grid grid-cols-1 gap-4 p-4 sm:hidden">
                    {providers.data.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Không có dữ liệu
                        </div>
                    ) : (
                        providers.data.map((provider) => (
                            <div key={provider.id} className="bg-gray-50 p-4 rounded-lg border shadow-sm space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg">{provider.name}</h3>
                                        <p className="text-sm text-gray-500">ID: {provider.id}</p>
                                    </div>
                                    <div className="shrink-0">
                                        {getStatusBadge(provider.status)}
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Email:</span>
                                        <span className="font-medium text-gray-900 break-all text-right ml-2">{provider.email || '—'}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Hotline:</span>
                                        <span className="font-medium text-gray-900 text-right ml-2">{provider.hotline || '—'}</span>
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-end gap-2">
                                    <Link href={providersUrl.show(provider.id).url} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">
                                            <Eye className="h-4 w-4 mr-2" /> Chi tiết
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openEditDialog(provider)}
                                        className="flex-1"
                                    >
                                        <Pencil className="h-4 w-4 mr-2" /> Sửa
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDelete(provider.id, provider.name)}
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
                <div className="hidden sm:block overflow-x-auto">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px] text-center whitespace-nowrap">
                                    #
                                </TableHead>
                                <TableHead className="whitespace-nowrap">
                                    Tên
                                </TableHead>
                                <TableHead className="whitespace-nowrap">
                                    Email
                                </TableHead>
                                <TableHead className="whitespace-nowrap">
                                    Hotline
                                </TableHead>
                                <TableHead className="whitespace-nowrap">
                                    Trạng thái
                                </TableHead>
                                <TableHead className="text-center whitespace-nowrap">
                                    Hành động
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {providers.data.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="py-8 text-center text-gray-500"
                                    >
                                        Không có dữ liệu
                                    </TableCell>
                                </TableRow>
                            ) : (
                                providers.data.map((provider, index) => (
                                    <TableRow key={provider.id}>
                                        <TableCell className="text-center whitespace-nowrap">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap font-medium">
                                            {provider.name}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {provider.email || '—'}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {provider.hotline || '—'}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {getStatusBadge(provider.status)}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <div className="flex justify-center gap-2">
                                                <Link
                                                    href={
                                                        providersUrl.show(
                                                            provider.id,
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
                                                    onClick={() =>
                                                        openEditDialog(provider)
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="Xóa"
                                                    onClick={() =>
                                                        handleDelete(
                                                            provider.id,
                                                            provider.name,
                                                        )
                                                    }
                                                    className="text-red-500 hover:text-red-700"
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

                <div className="flex flex-wrap justify-center gap-2 p-4">
                    {' '}
                    {providers.links.map((link, index) => (
                        <button
                            key={index}
                            disabled={!link.url}
                            onClick={() => {
                                if (link.url) {
                                    router.get(
                                        link.url,
                                        {
                                            search,
                                            status:
                                                status === 'all' ? '' : status,
                                        },
                                        {
                                            preserveScroll: true,
                                            preserveState: true,
                                            replace: true,
                                        },
                                    );
                                }
                            }}
                            className={`rounded-md border px-3 py-1 text-sm transition-all ${link.active
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                                } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>

            {/* 🧩 Dialog thêm / sửa */}
            <ProviderFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                initialData={currentProvider || undefined}
                title={
                    currentProvider
                        ? `Chỉnh sửa: ${currentProvider.name}`
                        : 'Thêm Nhà Cung Cấp Mới'
                }
                serviceTypes={serviceTypes}
            />
        </AppLayout>
    );
}
