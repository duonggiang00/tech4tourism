import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import bookingsRoutes from '@/routes/admin/bookings';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { CircleCheck, CircleX, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

interface Tour {
    id: number;
    title: string;
}

interface TourInstance {
    id: number;
    tourTemplate?: Tour;
}

interface Booking {
    id: number;
    code: string;
    date_start: string;
    date_end: string | null;
    client_name: string;
    client_email: string;
    client_phone: string;
    count_adult: number;
    count_children: number;
    final_price: number;
    left_payment: number;
    status: number;
    tour?: Tour | null;
    tourInstance?: TourInstance;
    created_at: string;
}

interface PaginatedBookings {
    data: Booking[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    current_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

interface Props {
    bookings: PaginatedBookings;
    filters?: {
        search?: string;
        status?: number | null;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

const STATUS_OPTIONS = {
    0: { label: 'Chờ xử lý', color: 'bg-yellow-500' },
    1: { label: 'Đã xác nhận', color: 'bg-green-500' },
    2: { label: 'Đã hủy', color: 'bg-red-500' },
    3: { label: 'Hoàn thành', color: 'bg-blue-500' },
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Quản lý Bookings',
        href: '/admin/bookings',
    },
];

export default function BookingsIndex({
    bookings: bookingsData,
    filters = {},
    flash,
}: Props) {
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [deletingBooking, setDeletingBooking] = useState<Booking | null>(
        null,
    );
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState<number | null>(
        filters.status ?? null,
    );

    // Form xử lý update
    const { data, setData, put, processing, reset, errors } = useForm({
        status: 0,
    });

    // Form xử lý delete
    const { delete: destroy, processing: deleting } = useForm();

    // Khi bấm nút "Cập nhật"
    const openEditModal = (booking: Booking) => {
        setEditingBooking(booking);
        setData({
            status: booking.status,
        });
    };

    // Khi bấm "Lưu"
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBooking) return;

        put(bookingsRoutes.update(editingBooking.id).url, {
            onSuccess: () => {
                setEditingBooking(null);
                reset();
            },
        });
    };

    // Xử lý search và filter
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            bookingsRoutes.index().url,
            {
                search,
                status: statusFilter,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Xử lý xóa booking
    const handleDelete = () => {
        if (!deletingBooking) return;
        destroy(bookingsRoutes.destroy(deletingBooking.id).url, {
            onSuccess: () => {
                setDeletingBooking(null);
            },
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Quản lý Bookings" />

            <div className="space-y-4 p-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <Alert
                        variant="default"
                        className="border-green-200 bg-green-50"
                    >
                        <CircleCheck className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">
                            Thành công!
                        </AlertTitle>
                        <AlertDescription className="text-green-700">
                            {flash.success}
                        </AlertDescription>
                    </Alert>
                )}
                {flash?.error && (
                    <Alert variant="destructive">
                        <CircleX className="h-4 w-4" />
                        <AlertTitle>Lỗi!</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                <div className="rounded-lg bg-white p-6 shadow">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-2xl font-bold">
                            Danh sách Bookings
                        </h2>
                        <Link href={bookingsRoutes.create().url}>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2 h-4 w-4" /> Thêm booking
                            </Button>
                        </Link>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="mb-4">
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Tìm kiếm theo mã, tên khách, email, tên tour..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="max-w-md"
                            />
                            <Select
                                value={
                                    statusFilter !== null
                                        ? String(statusFilter)
                                        : 'all'
                                }
                                onValueChange={(val) => {
                                    const newStatus = val === 'all' ? null : parseInt(val);
                                    setStatusFilter(newStatus);
                                    // Tự động filter khi chọn trạng thái
                                    router.get(
                                        bookingsRoutes.index().url,
                                        {
                                            search,
                                            status: newStatus,
                                        },
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                        },
                                    );
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Tất cả trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        Tất cả trạng thái
                                    </SelectItem>
                                    <SelectItem value="0">Chờ xử lý</SelectItem>
                                    <SelectItem value="1">
                                        Đã xác nhận
                                    </SelectItem>
                                    <SelectItem value="2">Đã hủy</SelectItem>
                                    <SelectItem value="3">
                                        Hoàn thành
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Button type="submit">Tìm kiếm</Button>
                            {(search || statusFilter !== null) && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setSearch('');
                                        setStatusFilter(null);
                                        router.get(bookingsRoutes.index().url);
                                    }}
                                >
                                    Xóa bộ lọc
                                </Button>
                            )}
                        </div>
                    </form>

                    {/* Table */}
                    {/* Desktop Table */}
                    <div className="hidden md:block">
                        {bookingsData.data && bookingsData.data.length > 0 ? (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Mã Booking</TableHead>
                                            <TableHead>Tour</TableHead>
                                            <TableHead>Khách hàng</TableHead>
                                            <TableHead>Ngày đi</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                            <TableHead className="text-right">
                                                Hành động
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bookingsData.data.map((booking) => (
                                            <TableRow key={booking.id}>
                                                <TableCell className="font-medium">
                                                    {booking.code}
                                                </TableCell>
                                                <TableCell>
                                                    {booking.tourInstance?.tourTemplate?.title || booking.tour?.title || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">
                                                            {booking.client_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {booking.client_email}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(booking.date_start)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            STATUS_OPTIONS[
                                                                booking.status as keyof typeof STATUS_OPTIONS
                                                            ]?.color ||
                                                            'bg-gray-500'
                                                        }
                                                    >
                                                        {STATUS_OPTIONS[
                                                            booking.status as keyof typeof STATUS_OPTIONS
                                                        ]?.label || 'Unknown'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={
                                                                bookingsRoutes.show(
                                                                    booking.id,
                                                                ).url
                                                            }
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                title="Xem chi tiết"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    booking,
                                                                )
                                                            }
                                                            title="Cập nhật trạng thái"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() =>
                                                                setDeletingBooking(
                                                                    booking,
                                                                )
                                                            }
                                                            title="Xóa booking"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {bookingsData.links &&
                                    bookingsData.links.length > 3 && (
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="text-sm text-gray-700">
                                                Hiển thị {bookingsData.from || 0}{' '}
                                                đến {bookingsData.to || 0} trong
                                                tổng số {bookingsData.total || 0}{' '}
                                                bookings
                                            </div>
                                            <div className="flex gap-2">
                                                {bookingsData.links.map(
                                                    (link, index) => (
                                                        <Link
                                                            key={index}
                                                            href={link.url || '#'}
                                                            className={`rounded-md px-3 py-2 text-sm font-medium ${link.active
                                                                ? 'bg-blue-600 text-white'
                                                                : link.url
                                                                    ? 'border bg-white text-gray-700 hover:bg-gray-50'
                                                                    : 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                                }`}
                                                            dangerouslySetInnerHTML={{
                                                                __html: link.label,
                                                            }}
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </>
                        ) : (
                            <div className="py-8 text-center text-gray-500">
                                Không tìm thấy booking nào.
                            </div>
                        )}
                    </div>

                    {/* Mobile Card Layout */}
                    <div className="md:hidden space-y-4">
                        {bookingsData.data && bookingsData.data.length > 0 ? (
                            bookingsData.data.map((booking) => (
                                <div key={booking.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{booking.code}</div>
                                            <div className="text-xs text-gray-500">{formatDate(booking.date_start)}</div>
                                        </div>
                                        <Badge
                                            className={
                                                STATUS_OPTIONS[
                                                    booking.status as keyof typeof STATUS_OPTIONS
                                                ]?.color || 'bg-gray-500'
                                            }
                                        >
                                            {STATUS_OPTIONS[
                                                booking.status as keyof typeof STATUS_OPTIONS
                                            ]?.label || 'Unknown'}
                                        </Badge>
                                    </div>

                                    <div className="mb-3">
                                        <div className="font-medium text-gray-800 line-clamp-2">
                                            {booking.tourInstance?.tourTemplate?.title || booking.tour?.title || 'N/A'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3 bg-gray-50 p-2 rounded">
                                        <div>
                                            <span className="block text-xs text-gray-400 uppercase">Khách hàng</span>
                                            <span className="font-medium">{booking.client_name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-xs text-gray-400 uppercase">Tổng tiền</span>
                                            <span className="font-bold text-green-600">{formatPrice(booking.final_price)}</span>
                                        </div>
                                        <div className="col-span-2 text-xs border-t pt-2 mt-1 border-gray-200">
                                            {booking.count_adult} người lớn
                                            {booking.count_children > 0 && `, ${booking.count_children} trẻ em`}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 border-t pt-3">
                                        <Link href={bookingsRoutes.show(booking.id).url} className="flex-1">
                                            <Button variant="outline" size="sm" className="w-full">
                                                <Eye className="mr-1 h-3 w-3" /> Chi tiết
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => openEditModal(booking)}
                                        >
                                            <Pencil className="mr-1 h-3 w-3" /> Cập nhật
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-10 px-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            onClick={() => setDeletingBooking(booking)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-gray-500 bg-gray-50 rounded border border-dashed">
                                Không tìm thấy booking nào.
                            </div>
                        )}

                        {/* Mobile Pagination (Simplified) */}
                        {bookingsData.links && bookingsData.links.length > 3 && (
                            <div className="flex items-center justify-center gap-2 mt-4">
                                {bookingsData.links.map((link, index) => {
                                    if (link.label.includes('&laquo;') || link.label.includes('&raquo;') || link.active) {
                                        return (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`rounded-md px-3 py-2 text-sm font-medium ${link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : link.url
                                                        ? 'border bg-white text-gray-700 hover:bg-gray-50'
                                                        : 'cursor-not-allowed bg-gray-100 text-gray-400 opacity-50'
                                                    }`}
                                                dangerouslySetInnerHTML={{
                                                    __html: link.label,
                                                }}
                                            />
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Dialog Edit Booking Status */}
            <Dialog
                open={!!editingBooking}
                onOpenChange={(open) => !open && setEditingBooking(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Cập nhật trạng thái: {editingBooking?.code}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Trạng thái</Label>
                            <Select
                                value={String(data.status)}
                                onValueChange={(val) =>
                                    setData('status', parseInt(val))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Chờ xử lý</SelectItem>
                                    <SelectItem value="1">
                                        Đã xác nhận
                                    </SelectItem>
                                    <SelectItem value="2">Đã hủy</SelectItem>
                                    <SelectItem value="3">
                                        Hoàn thành
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <div className="text-sm text-red-500">
                                    {errors.status}
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setEditingBooking(null)}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Alert Dialog Xác nhận xóa */}
            <AlertDialog
                open={!!deletingBooking}
                onOpenChange={(open) => !open && setDeletingBooking(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Xác nhận xóa booking
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa booking{' '}
                            <strong>{deletingBooking?.code}</strong>? Hành động
                            này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleting ? 'Đang xóa...' : 'Xóa'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
