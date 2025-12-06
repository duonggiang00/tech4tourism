import React, { useState, useMemo } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, Calendar, DollarSign, Mail, Phone, Users, Trash2, CircleCheck, CircleX, Plus, Edit, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import bookings from '@/routes/admin/bookings';
import axios from 'axios';
import { toast } from 'sonner';

interface Tour {
    id: number;
    title: string;
    day: number;
    night: number;
    price_adult: number;
    price_children: number;
}

interface Passenger {
    id: number;
    fullname: string;
    phone?: string;
    email?: string;
    gender: number;
    birth?: string;
    type: number;
    request?: string;
}

interface Payment {
    id: number;
    amount: number;
    method: number;
    status: number;
    date: string;
    thumbnail?: string;
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
    passengers?: Passenger[];
    payments?: Payment[];
    created_at: string;
}

interface Props {
    booking: Booking;
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

const GENDER_OPTIONS = {
    0: 'Nam',
    1: 'Nữ',
};

const TYPE_OPTIONS = {
    0: 'Người lớn',
    1: 'Trẻ em',
    2: 'Em bé',
};

const METHOD_OPTIONS = {
    0: 'Tiền mặt',
    1: 'Chuyển khoản',
    2: 'Thẻ tín dụng',
};

export default function BookingShow({ booking, flash }: Props) {
    const [editingStatus, setEditingStatus] = useState(false);
    const [deletingBooking, setDeletingBooking] = useState(false);
    const [addingPayment, setAddingPayment] = useState(false);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
    const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);

    const { data, setData, put, processing, errors } = useForm({
        status: booking.status,
    });

    const { delete: destroy, processing: deleting } = useForm();

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            {
                title: 'Quản lý Bookings',
                href: bookings.index().url,
            },
            {
                title: `Chi tiết: ${booking.code}`,
                href: bookings.show(booking.id).url,
            },
        ],
        [booking.id, booking.code],
    );

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
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleUpdateStatus = (e: React.FormEvent) => {
        e.preventDefault();
        put(bookings.update(booking.id).url, {
            onSuccess: () => {
                setEditingStatus(false);
            },
        });
    };

    const handleDelete = () => {
        destroy(bookings.destroy(booking.id).url);
    };

    const onBack = () => {
        router.visit(bookings.index().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Chi tiết Booking: ${booking.code}`} />

            <div className="min-h-screen bg-gray-50 p-8">
                {/* Flash Messages */}
                {flash?.success && (
                    <Alert variant="default" className="bg-green-50 border-green-200 mb-4">
                        <CircleCheck className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Thành công!</AlertTitle>
                        <AlertDescription className="text-green-700">{flash.success}</AlertDescription>
                    </Alert>
                )}
                {flash?.error && (
                    <Alert variant="destructive" className="mb-4">
                        <CircleX className="h-4 w-4" />
                        <AlertTitle>Lỗi!</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                <div className="mx-auto max-w-6xl">
                    <div className="mb-6">
                        <Button
                            variant="ghost"
                            onClick={onBack}
                            className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại danh sách
                        </Button>

                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                                <div className="mb-2 flex items-center gap-3">
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        Booking: {booking.code}
                                    </h2>
                                    <Badge className={STATUS_OPTIONS[booking.status as keyof typeof STATUS_OPTIONS]?.color || 'bg-gray-500'}>
                                        {STATUS_OPTIONS[booking.status as keyof typeof STATUS_OPTIONS]?.label || 'Unknown'}
                                    </Badge>
                                </div>
                                <p className="text-gray-600">Ngày tạo: {formatDateTime(booking.created_at)}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setEditingStatus(true)}
                                >
                                    Cập nhật trạng thái
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => setDeletingBooking(true)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Xóa
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Thông tin Tour */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Thông tin Tour
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Tour</p>
                                    <p className="font-medium">{booking.tour?.title || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Ngày khởi hành</p>
                                    <p className="font-medium">{formatDate(booking.date_start)}</p>
                                </div>
                                {booking.date_end && (
                                    <div>
                                        <p className="text-sm text-gray-500">Ngày kết thúc</p>
                                        <p className="font-medium">{formatDate(booking.date_end)}</p>
                                    </div>
                                )}
                                {booking.tour && (
                                    <div>
                                        <p className="text-sm text-gray-500">Thời gian</p>
                                        <p className="font-medium">
                                            {booking.tour.day} ngày {booking.tour.night} đêm
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Thông tin Khách hàng */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Thông tin Khách hàng
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Tên</p>
                                    <p className="font-medium">{booking.client_name}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="font-medium">{booking.client_email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Số điện thoại</p>
                                        <p className="font-medium">{booking.client_phone}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thông tin Thanh toán */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Thông tin Thanh toán
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Tổng tiền</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {formatPrice(booking.final_price)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Còn nợ</p>
                                    <p className={`text-lg font-medium ${booking.left_payment > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {formatPrice(booking.left_payment)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Đã thanh toán</p>
                                    <p className="text-lg font-medium text-green-600">
                                        {formatPrice(booking.final_price - booking.left_payment)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Số người</p>
                                    <p className="font-medium">
                                        {booking.count_adult} người lớn
                                        {booking.count_children > 0 && `, ${booking.count_children} trẻ em`}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Danh sách Hành khách */}
                    {booking.passengers && booking.passengers.length > 0 && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Danh sách Hành khách</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Họ tên</TableHead>
                                            <TableHead>Giới tính</TableHead>
                                            <TableHead>Loại</TableHead>
                                            <TableHead>Ngày sinh</TableHead>
                                            <TableHead>Ghi chú</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {booking.passengers.map((passenger) => (
                                            <TableRow key={passenger.id}>
                                                <TableCell className="font-medium">{passenger.fullname}</TableCell>
                                                <TableCell>{GENDER_OPTIONS[passenger.gender as keyof typeof GENDER_OPTIONS] || 'N/A'}</TableCell>
                                                <TableCell>{TYPE_OPTIONS[passenger.type as keyof typeof TYPE_OPTIONS] || 'N/A'}</TableCell>
                                                <TableCell>{passenger.birth ? formatDate(passenger.birth) : 'N/A'}</TableCell>
                                                <TableCell>{passenger.request || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}

                    {/* Lịch sử Thanh toán */}
                    <Card className="mt-6">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Lịch sử Thanh toán</CardTitle>
                                <Button
                                    onClick={() => setAddingPayment(true)}
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Thêm thanh toán
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {booking.payments && booking.payments.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Ngày</TableHead>
                                            <TableHead>Số tiền</TableHead>
                                            <TableHead>Phương thức</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                            <TableHead>Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {booking.payments.map((payment) => (
                                            <TableRow key={payment.id}>
                                                <TableCell>{formatDateTime(payment.date)}</TableCell>
                                                <TableCell className="font-medium">{formatPrice(payment.amount)}</TableCell>
                                                <TableCell>{METHOD_OPTIONS[payment.method as keyof typeof METHOD_OPTIONS] || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Badge className={payment.status === 1 ? 'bg-green-500' : 'bg-red-500'}>
                                                        {payment.status === 1 ? 'Thành công' : 'Thất bại'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setEditingPayment(payment)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setDeletingPayment(payment)}
                                                        >
                                                            <X className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-gray-500 text-center py-4">Chưa có thanh toán nào</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Dialog Cập nhật trạng thái */}
            <Dialog open={editingStatus} onOpenChange={setEditingStatus}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cập nhật trạng thái</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateStatus} className="space-y-4">
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
                            <Button type="button" variant="ghost" onClick={() => setEditingStatus(false)}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Đang lưu...' : 'Lưu'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Alert Dialog Xác nhận xóa */}
            <AlertDialog open={deletingBooking} onOpenChange={setDeletingBooking}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa booking</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa booking <strong>{booking.code}</strong>?
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

            {/* Dialog Thêm/Sửa Thanh toán */}
            <PaymentFormDialog
                booking={booking}
                payment={editingPayment}
                open={addingPayment || editingPayment !== null}
                onClose={() => {
                    setAddingPayment(false);
                    setEditingPayment(null);
                }}
            />

            {/* Alert Dialog Xác nhận xóa thanh toán */}
            <AlertDialog open={deletingPayment !== null} onOpenChange={(open) => !open && setDeletingPayment(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa thanh toán</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa thanh toán này?
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={async () => {
                                if (!deletingPayment) return;
                                try {
                                    await axios.delete(`/admin/payments/${deletingPayment.id}`);
                                    toast.success('Xóa thanh toán thành công!');
                                    router.reload();
                                } catch (error: any) {
                                    toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
                                } finally {
                                    setDeletingPayment(null);
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

// Component form thanh toán
function PaymentFormDialog({ booking, payment, open, onClose }: { booking: Booking; payment: Payment | null; open: boolean; onClose: () => void }) {
    const [formData, setFormData] = useState({
        amount: payment?.amount || 0,
        method: payment?.method?.toString() || '0',
        date: payment?.date ? new Date(payment.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: payment?.status?.toString() || '1',
        thumbnail: null as File | null,
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('amount', formData.amount.toString());
            formDataToSend.append('method', formData.method);
            formDataToSend.append('date', formData.date);
            formDataToSend.append('status', formData.status);
            if (formData.thumbnail) {
                formDataToSend.append('thumbnail', formData.thumbnail);
            }

            if (payment) {
                await axios.put(`/admin/payments/${payment.id}`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Cập nhật thanh toán thành công!');
            } else {
                await axios.post(`/admin/bookings/${booking.id}/payments`, formDataToSend, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Thêm thanh toán thành công!');
            }
            router.reload();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{payment ? 'Sửa thanh toán' : 'Thêm thanh toán'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Số tiền *</Label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Phương thức *</Label>
                        <Select value={formData.method} onValueChange={(val) => setFormData({ ...formData, method: val })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Tiền mặt</SelectItem>
                                <SelectItem value="1">Chuyển khoản</SelectItem>
                                <SelectItem value="2">Thẻ tín dụng</SelectItem>
                                <SelectItem value="3">Gateway</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Ngày thanh toán *</Label>
                        <Input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Trạng thái *</Label>
                        <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Thất bại</SelectItem>
                                <SelectItem value="1">Thành công</SelectItem>
                                <SelectItem value="2">Chờ xử lý</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Ảnh biên lai (tùy chọn)</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFormData({ ...formData, thumbnail: e.target.files?.[0] || null })}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? 'Đang lưu...' : payment ? 'Cập nhật' : 'Thêm'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

