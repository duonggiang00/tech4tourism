import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CircleCheck, CircleX, Eye, Trash2 } from 'lucide-react';
import bookings from '@/routes/admin/bookings';

interface Tour {
    id: number;
    title: string;
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
    tour?: Tour;
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

export default function BookingsIndex({ bookings: bookingsData, filters = {}, flash }: Props) {
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [deletingBooking, setDeletingBooking] = useState<Booking | null>(null);
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState<number | null>(filters.status ?? null);

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

        put(bookings.update(editingBooking.id).url, {
            onSuccess: () => {
                setEditingBooking(null);
                reset();
            },
        });
    };

    // Xử lý search và filter
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(bookings.index().url, { 
            search, 
            status: statusFilter 
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Xử lý xóa booking
    const handleDelete = () => {
        if (!deletingBooking) return;
        destroy(bookings.destroy(deletingBooking.id).url, {
            onSuccess: () => {
                setDeletingBooking(null);
            },
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
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

            <div className="p-6 space-y-4">
                {/* Flash Messages */}
                {flash?.success && (
                    <Alert variant="default" className="bg-green-50 border-green-200">
                        <CircleCheck className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Thành công!</AlertTitle>
                        <AlertDescription className="text-green-700">{flash.success}</AlertDescription>
                    </Alert>
                )}
                {flash?.error && (
                    <Alert variant="destructive">
                        <CircleX className="h-4 w-4" />
                        <AlertTitle>Lỗi!</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Danh sách Bookings</h2>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="mb-4">
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Tìm kiếm theo mã, tên, email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="max-w-md"
                            />
                            <Select 
                                value={statusFilter !== null ? String(statusFilter) : 'all'}
                                onValueChange={(val) => setStatusFilter(val === 'all' ? null : parseInt(val))}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Tất cả trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="0">Chờ xử lý</SelectItem>
                                    <SelectItem value="1">Đã xác nhận</SelectItem>
                                    <SelectItem value="2">Đã hủy</SelectItem>
                                    <SelectItem value="3">Hoàn thành</SelectItem>
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
                                        router.get(bookings.index().url);
                                    }}
                                >
                                    Xóa
                                </Button>
                            )}
                        </div>
                    </form>

                    {/* Table */}
                    {bookingsData.data && bookingsData.data.length > 0 ? (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mã Booking</TableHead>
                                        <TableHead>Tour</TableHead>
                                        <TableHead>Khách hàng</TableHead>
                                        <TableHead>Ngày đi</TableHead>
                                        <TableHead>Số người</TableHead>
                                        <TableHead>Tổng tiền</TableHead>
                                        <TableHead>Còn nợ</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bookingsData.data.map((booking) => (
                                        <TableRow key={booking.id}>
                                            <TableCell className="font-medium">{booking.code}</TableCell>
                                            <TableCell>{booking.tour?.title || 'N/A'}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{booking.client_name}</div>
                                                    <div className="text-sm text-gray-500">{booking.client_email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{formatDate(booking.date_start)}</TableCell>
                                            <TableCell>
                                                {booking.count_adult} người lớn
                                                {booking.count_children > 0 && `, ${booking.count_children} trẻ em`}
                                            </TableCell>
                                            <TableCell className="font-medium">{formatPrice(booking.final_price)}</TableCell>
                                            <TableCell className={booking.left_payment > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                                                {formatPrice(booking.left_payment)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={STATUS_OPTIONS[booking.status as keyof typeof STATUS_OPTIONS]?.color || 'bg-gray-500'}>
                                                    {STATUS_OPTIONS[booking.status as keyof typeof STATUS_OPTIONS]?.label || 'Unknown'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={bookings.show(booking.id).url}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Xem
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditModal(booking)}
                                                    >
                                                        Cập nhật
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => setDeletingBooking(booking)}
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
                            {bookingsData.links && bookingsData.links.length > 3 && (
                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-sm text-gray-700">
                                        Hiển thị {bookingsData.from || 0} đến {bookingsData.to || 0} trong tổng số {bookingsData.total || 0} bookings
                                    </div>
                                    <div className="flex gap-2">
                                        {bookingsData.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 rounded-md text-sm font-medium ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : link.url
                                                        ? 'bg-white text-gray-700 hover:bg-gray-50 border'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            Không tìm thấy booking nào.
                        </div>
                    )}
                </div>
            </div>

            {/* Dialog Edit Booking Status */}
            <Dialog open={!!editingBooking} onOpenChange={(open) => !open && setEditingBooking(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cập nhật trạng thái: {editingBooking?.code}</DialogTitle>
                    </DialogHeader>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Trạng thái</Label>
                            <Select 
                                value={String(data.status)} 
                                onValueChange={(val) => setData('status', parseInt(val))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Chờ xử lý</SelectItem>
                                    <SelectItem value="1">Đã xác nhận</SelectItem>
                                    <SelectItem value="2">Đã hủy</SelectItem>
                                    <SelectItem value="3">Hoàn thành</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <div className="text-red-500 text-sm">{errors.status}</div>}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setEditingBooking(null)}>
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
            <AlertDialog open={!!deletingBooking} onOpenChange={(open) => !open && setDeletingBooking(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa booking</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa booking <strong>{deletingBooking?.code}</strong>?
                            Hành động này không thể hoàn tác.
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

