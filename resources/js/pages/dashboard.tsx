import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowDownRight,
    ArrowRight,
    ArrowUpRight,
    Calendar,
    Clock,
    DollarSign,
    MapPin,
    Plane,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface Stats {
    bookings: { value: number; change: number; label: string };
    revenue: { value: number; change: number; label: string };
    customers: { value: number; change: number; label: string };
    tours: { value: number; label: string };
}

interface RevenueData {
    month: string;
    monthName: string;
    revenue: number;
}

interface BookingStatus {
    name: string;
    value: number;
    color: string;
}

interface LatestBooking {
    id: number;
    code: string;
    client_name: string;
    client_email: string;
    tour?: { id: number; title: string };
    status: number;
    final_price: number;
    created_at: string;
}

interface PopularTour {
    id: number;
    title: string;
    bookings_count: number;
    percentage: number;
}

interface Alert {
    type: string;
    icon: string;
    message: string;
    count: number;
    link: string;
}

interface DashboardProps {
    stats: Stats;
    revenueChart: RevenueData[];
    bookingsByStatus: BookingStatus[];
    latestBookings: LatestBooking[];
    popularTours: PopularTour[];
    alerts: Alert[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tổng quan',
        href: '/dashboard',
    },
];

const STATUS_MAP: Record<number, { label: string; color: string }> = {
    0: { label: 'Chờ xử lý', color: 'bg-yellow-500' },
    1: { label: 'Đã xác nhận', color: 'bg-green-500' },
    2: { label: 'Đã hủy', color: 'bg-red-500' },
    3: { label: 'Hoàn thành', color: 'bg-blue-500' },
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(value);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export default function Dashboard({
    stats,
    revenueChart,
    bookingsByStatus,
    latestBookings,
    popularTours,
    alerts,
}: DashboardProps) {
    const totalBookings = bookingsByStatus.reduce((sum, item) => sum + item.value, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tổng quan" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Tổng quan
                        </h1>
                        <p className="mt-1 text-gray-500">
                            Chào mừng bạn trở lại! Đây là tình hình kinh doanh hôm nay.
                        </p>
                    </div>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/admin/bookings/create">
                            <Plane className="mr-2 h-4 w-4" />
                            Tạo Booking mới
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Booking Card */}
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                {stats.bookings.label}
                            </CardTitle>
                            <Calendar className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.bookings.value}</div>
                            <div className="mt-1 flex items-center text-sm">
                                {stats.bookings.change >= 0 ? (
                                    <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                                ) : (
                                    <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                                )}
                                <span className={stats.bookings.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {Math.abs(stats.bookings.change)}%
                                </span>
                                <span className="ml-1 text-gray-500">so với tháng trước</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Revenue Card */}
                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                {stats.revenue.label}
                            </CardTitle>
                            <DollarSign className="h-5 w-5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(stats.revenue.value)}
                            </div>
                            <div className="mt-1 flex items-center text-sm">
                                {stats.revenue.change >= 0 ? (
                                    <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                                ) : (
                                    <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                                )}
                                <span className={stats.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {Math.abs(stats.revenue.change)}%
                                </span>
                                <span className="ml-1 text-gray-500">so với tháng trước</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customers Card */}
                    <Card className="border-l-4 border-l-purple-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                {stats.customers.label}
                            </CardTitle>
                            <Users className="h-5 w-5 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.customers.value}</div>
                            <div className="mt-1 flex items-center text-sm">
                                {stats.customers.change >= 0 ? (
                                    <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                                ) : (
                                    <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                                )}
                                <span className={stats.customers.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {Math.abs(stats.customers.change)}%
                                </span>
                                <span className="ml-1 text-gray-500">so với tháng trước</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tours Card */}
                    <Card className="border-l-4 border-l-orange-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                {stats.tours.label}
                            </CardTitle>
                            <MapPin className="h-5 w-5 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.tours.value}</div>
                            <div className="mt-1 text-sm text-gray-500">
                                Tour đang hoạt động
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Revenue Chart */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                    Doanh thu 6 tháng gần nhất
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueChart}>
                                        <XAxis
                                            dataKey="monthName"
                                            tick={{ fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12 }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) =>
                                                `${(value / 1000000).toFixed(0)}M`
                                            }
                                        />
                                        <Tooltip
                                            formatter={(value: number) => [
                                                formatCurrency(value),
                                                'Doanh thu',
                                            ]}
                                            labelFormatter={(label) => `Tháng ${label}`}
                                        />
                                        <Bar
                                            dataKey="revenue"
                                            fill="#3b82f6"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Booking Status Pie Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                Booking theo trạng thái
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={bookingsByStatus}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={80}
                                            paddingAngle={2}
                                            dataKey="value"
                                        >
                                            {bookingsByStatus.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number, name: string) => [
                                                `${value} (${totalBookings > 0 ? Math.round((value / totalBookings) * 100) : 0}%)`,
                                                name,
                                            ]}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 space-y-2">
                                {bookingsByStatus.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-3 w-3 rounded-full"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span>{item.name}</span>
                                        </div>
                                        <span className="font-medium">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Middle Row */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Latest Bookings */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-blue-500" />
                                    Booking mới nhất
                                </CardTitle>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/admin/bookings">
                                        Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Desktop View */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Mã</TableHead>
                                            <TableHead>Khách hàng</TableHead>
                                            <TableHead>Tour</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {latestBookings && latestBookings.length > 0 ? (
                                            latestBookings.map((booking) => (
                                                <TableRow key={booking.id}>
                                                    <TableCell className="font-mono text-sm font-medium">
                                                        {booking.code}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">
                                                                {booking.client_name}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {booking.client_email}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="max-w-[150px] truncate text-sm">
                                                        {booking.tour?.title || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={
                                                                STATUS_MAP[booking.status]?.color ||
                                                                'bg-gray-500'
                                                            }
                                                        >
                                                            {STATUS_MAP[booking.status]?.label ||
                                                                'Unknown'}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-gray-500">
                                                    Chưa có booking nào
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile View */}
                            <div className="md:hidden space-y-4">
                                {latestBookings && latestBookings.length > 0 ? (
                                    latestBookings.map((booking) => (
                                        <div key={booking.id} className="border rounded-lg p-3 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono font-bold text-sm">
                                                    {booking.code}
                                                </span>
                                                <Badge
                                                    className={
                                                        STATUS_MAP[booking.status]?.color ||
                                                        'bg-gray-500'
                                                    }
                                                >
                                                    {STATUS_MAP[booking.status]?.label ||
                                                        'Unknown'}
                                                </Badge>
                                            </div>

                                            <div className="text-sm">
                                                <div className="font-medium">{booking.client_name}</div>
                                                <div className="text-muted-foreground text-xs">{booking.client_email}</div>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                                <MapPin className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">{booking.tour?.title || 'N/A'}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 py-4">Chưa có booking nào</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Popular Tours */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-orange-500" />
                                    Tour phổ biến nhất
                                </CardTitle>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/tours">
                                        Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {popularTours && popularTours.length > 0 ? (
                                    popularTours.map((tour, index) => (
                                        <div key={tour.id} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                                                        {index + 1}
                                                    </span>
                                                    <span className="font-medium text-gray-900 line-clamp-1">
                                                        {tour.title}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-medium text-gray-600">
                                                    {tour.bookings_count} booking
                                                </span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                                                    style={{ width: `${tour.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center text-gray-500">
                                        Chưa có dữ liệu tour
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Alerts Section */}
                {alerts && alerts.some((alert) => alert.count > 0) && (
                    <Card className="border-orange-200 bg-orange-50/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-700">
                                <AlertCircle className="h-5 w-5" />
                                Cần xử lý
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                                {alerts.map((alert, index) =>
                                    alert.count > 0 ? (
                                        <Link
                                            key={index}
                                            href={alert.link}
                                            className="flex items-center justify-between rounded-lg border border-orange-200 bg-white p-4 transition-colors hover:bg-orange-50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex h-10 w-10 items-center justify-center rounded-full ${alert.type === 'danger'
                                                            ? 'bg-red-100 text-red-600'
                                                            : 'bg-yellow-100 text-yellow-600'
                                                        }`}
                                                >
                                                    {alert.type === 'danger' ? (
                                                        <AlertCircle className="h-5 w-5" />
                                                    ) : (
                                                        <Clock className="h-5 w-5" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {alert.count}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {alert.message}
                                                    </div>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-gray-400" />
                                        </Link>
                                    ) : null,
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
