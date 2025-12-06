import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Calendar, Package, BarChart3 } from 'lucide-react';

interface RevenueByDay {
    date: string;
    revenue: number;
    bookings_count: number;
}

interface RevenueByTour {
    tour_title: string;
    date_start: string;
    revenue: number;
    bookings_count: number;
}

interface RevenueByStatus {
    status: number;
    label: string;
    revenue: number;
    count: number;
}

interface TopBooking {
    code: string;
    client_name: string;
    tour_title: string;
    final_price: number;
    created_at: string;
}

interface Props {
    startDate: string;
    endDate: string;
    totalRevenue: number;
    totalBookings: number;
    confirmedBookings: number;
    revenueByDay: RevenueByDay[];
    revenueByTour: RevenueByTour[];
    revenueByStatus: RevenueByStatus[];
    topBookings: TopBooking[];
    totalDiscount: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Báo cáo doanh thu',
        href: '/admin/reports/revenue',
    },
];

export default function RevenueReport({
    startDate: initialStartDate,
    endDate: initialEndDate,
    totalRevenue,
    totalBookings,
    confirmedBookings,
    revenueByDay,
    revenueByTour,
    revenueByStatus,
    topBookings,
    totalDiscount,
}: Props) {
    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
    };

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/reports/revenue', { start_date: startDate, end_date: endDate });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Báo cáo doanh thu" />

            <div className="min-h-screen bg-gray-50 p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold">Báo cáo doanh thu</h1>
                    </div>

                    {/* Filter Form */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Lọc theo thời gian</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleFilter} className="flex gap-4">
                                <div className="space-y-2">
                                    <Label>Từ ngày</Label>
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Đến ngày</Label>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button type="submit">Lọc</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    <div className="grid gap-6 md:grid-cols-4 mb-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tổng booking</CardTitle>
                                <Package className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalBookings}</div>
                                <p className="text-xs text-muted-foreground">
                                    {confirmedBookings} đã xác nhận
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Tổng giảm giá</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatPrice(totalDiscount)}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Doanh thu trung bình</CardTitle>
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatPrice(confirmedBookings > 0 ? totalRevenue / confirmedBookings : 0)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Doanh thu theo ngày */}
                    {revenueByDay.length > 0 && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Doanh thu theo ngày</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Ngày</TableHead>
                                            <TableHead>Số booking</TableHead>
                                            <TableHead>Doanh thu</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {revenueByDay.map((item) => (
                                            <TableRow key={item.date}>
                                                <TableCell>{formatDate(item.date)}</TableCell>
                                                <TableCell>{item.bookings_count}</TableCell>
                                                <TableCell className="font-medium">{formatPrice(item.revenue)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}

                    {/* Doanh thu theo tour */}
                    {revenueByTour.length > 0 && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle>Top 10 Tour có doanh thu cao nhất</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tour</TableHead>
                                            <TableHead>Ngày khởi hành</TableHead>
                                            <TableHead>Số booking</TableHead>
                                            <TableHead>Doanh thu</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {revenueByTour.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{item.tour_title}</TableCell>
                                                <TableCell>{formatDate(item.date_start)}</TableCell>
                                                <TableCell>{item.bookings_count}</TableCell>
                                                <TableCell className="font-medium">{formatPrice(item.revenue)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}

                    {/* Doanh thu theo trạng thái */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Doanh thu theo trạng thái</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Số lượng</TableHead>
                                        <TableHead>Doanh thu</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {revenueByStatus.map((item) => (
                                        <TableRow key={item.status}>
                                            <TableCell>
                                                <Badge className={
                                                    item.status === 0 ? 'bg-yellow-500' :
                                                    item.status === 1 ? 'bg-green-500' :
                                                    item.status === 2 ? 'bg-red-500' :
                                                    'bg-blue-500'
                                                }>
                                                    {item.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{item.count}</TableCell>
                                            <TableCell className="font-medium">{formatPrice(item.revenue)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Top bookings */}
                    {topBookings.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Top 10 Booking có giá trị cao nhất</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Mã booking</TableHead>
                                            <TableHead>Khách hàng</TableHead>
                                            <TableHead>Tour</TableHead>
                                            <TableHead>Giá trị</TableHead>
                                            <TableHead>Ngày tạo</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {topBookings.map((booking) => (
                                            <TableRow key={booking.code}>
                                                <TableCell className="font-medium">{booking.code}</TableCell>
                                                <TableCell>{booking.client_name}</TableCell>
                                                <TableCell>{booking.tour_title}</TableCell>
                                                <TableCell className="font-medium">{formatPrice(booking.final_price)}</TableCell>
                                                <TableCell>{formatDate(booking.created_at)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

