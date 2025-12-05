import React from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, DollarSign, Mail, Phone, Users, ArrowLeft } from 'lucide-react';
import { router } from '@inertiajs/react';

interface Tour {
    id: number;
    title: string;
    day: number;
    night: number;
}

interface Passenger {
    id: number;
    fullname: string;
    gender: number;
    type: number;
    birth?: string;
}

interface Payment {
    id: number;
    amount: number;
    method: number;
    status: number;
    date: string;
}

interface Booking {
    id: number;
    code: string;
    client_name: string;
    client_email: string;
    client_phone: string;
    count_adult: number;
    count_children: number;
    final_price: number;
    left_payment: number;
    status: number;
    tourInstance?: {
        tourTemplate: Tour;
        date_start: string;
        date_end: string;
    };
    passengers?: Passenger[];
    payments?: Payment[];
    created_at: string;
}

interface Props {
    booking: Booking;
}

const STATUS_OPTIONS = {
    0: { label: 'Chờ xử lý', color: 'bg-yellow-500' },
    1: { label: 'Đã xác nhận', color: 'bg-green-500' },
    2: { label: 'Đã hủy', color: 'bg-red-500' },
    3: { label: 'Hoàn thành', color: 'bg-blue-500' },
};

const METHOD_OPTIONS = {
    0: 'Tiền mặt',
    1: 'Chuyển khoản',
    2: 'Thẻ tín dụng',
};

export default function BookingLookupResult({ booking }: Props) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <Head title={`Tra cứu Booking: ${booking.code}`} />

            <div className="mx-auto max-w-4xl">
                <Button
                    variant="ghost"
                    onClick={() => router.visit('/booking/lookup')}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Tra cứu lại
                </Button>

                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold">Booking: {booking.code}</h1>
                        <Badge className={STATUS_OPTIONS[booking.status as keyof typeof STATUS_OPTIONS]?.color || 'bg-gray-500'}>
                            {STATUS_OPTIONS[booking.status as keyof typeof STATUS_OPTIONS]?.label || 'Unknown'}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
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
                                <p className="font-medium">{booking.tourInstance?.tourTemplate?.title || 'N/A'}</p>
                            </div>
                            {booking.tourInstance && (
                                <>
                                    <div>
                                        <p className="text-sm text-gray-500">Ngày khởi hành</p>
                                        <p className="font-medium">{formatDate(booking.tourInstance.date_start)}</p>
                                    </div>
                                    {booking.tourInstance.date_end && (
                                        <div>
                                            <p className="text-sm text-gray-500">Ngày kết thúc</p>
                                            <p className="font-medium">{formatDate(booking.tourInstance.date_end)}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

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
                        </CardContent>
                    </Card>
                </div>

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
                                        <TableHead>Loại</TableHead>
                                        <TableHead>Ngày sinh</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {booking.passengers.map((passenger) => (
                                        <TableRow key={passenger.id}>
                                            <TableCell className="font-medium">{passenger.fullname}</TableCell>
                                            <TableCell>
                                                {passenger.type === 0 ? 'Người lớn' : passenger.type === 1 ? 'Trẻ em' : 'Em bé'}
                                            </TableCell>
                                            <TableCell>{passenger.birth ? formatDate(passenger.birth) : 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {booking.payments && booking.payments.length > 0 && (
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Lịch sử Thanh toán</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ngày</TableHead>
                                        <TableHead>Số tiền</TableHead>
                                        <TableHead>Phương thức</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {booking.payments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>{formatDate(payment.date)}</TableCell>
                                            <TableCell className="font-medium">{formatPrice(payment.amount)}</TableCell>
                                            <TableCell>{METHOD_OPTIONS[payment.method as keyof typeof METHOD_OPTIONS] || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Badge className={payment.status === 1 ? 'bg-green-500' : 'bg-red-500'}>
                                                    {payment.status === 1 ? 'Thành công' : 'Thất bại'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

