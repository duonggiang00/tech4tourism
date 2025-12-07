
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Link } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle,
    Clock,
    MapPin,
    Users
} from 'lucide-react';

interface GuideDashboardProps {
    upcomingAssignments: any[];
    pastAssignments: any[];
    stats: {
        total_trips: number;
        upcoming_count: number;
        completed_month: number;
        next_trip_days: number | null;
    };
    user: any;
}

export default function GuideDashboard({
    upcomingAssignments,
    pastAssignments,
    stats,
    user
}: GuideDashboardProps) {
    const breadcrumbs = [
        { title: 'Dashboard Hướng Dẫn Viên', href: '/dashboard' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-6 p-4 md:p-6 min-h-screen bg-gray-50">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Xin chào, {user.name} 👋
                        </h1>
                        <p className="text-gray-500">
                            Chúc bạn một ngày làm việc tràn đầy năng lượng!
                        </p>
                    </div>
                    {upcomingAssignments.length > 0 && (
                        <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                            <Link href="/guide/schedule" className="flex items-center justify-center gap-2 w-full">
                                <Calendar className="w-4 h-4" /> Xem lịch chi tiết
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-l-4 border-blue-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-500" /> Tour Sắp Tới
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-800">
                                {stats.upcoming_count}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {stats.next_trip_days !== null
                                    ? `Chuyến tiếp theo trong ${Math.abs(Math.round(stats.next_trip_days))} ngày nữa`
                                    : 'Hiện chưa có lịch mới'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-green-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500" /> Hoàn Thành Tháng Này
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-800">
                                {stats.completed_month}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Chuyến đi thành công
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-purple-500 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-purple-500" /> Tổng Số Tour Đã Dẫn
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-800">
                                {stats.total_trips}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Kinh nghiệm tích lũy
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Upcoming Assignments */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" /> Lịch Trình Sắp Tới
                        </h2>

                        {upcomingAssignments.length > 0 ? (
                            <div className="grid gap-4">
                                {upcomingAssignments.map((assignment) => (
                                    <div key={assignment.id} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                            <div>
                                                <Badge className="mb-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">
                                                    {new Date(assignment.tour_instance.date_start).toLocaleDateString('vi-VN')}
                                                </Badge>
                                                <h3 className="font-bold text-gray-800 text-lg mb-1">
                                                    {assignment.tour_instance.tour_template?.title || 'Chuyến đi chưa cập nhật tên'}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" /> {assignment.tour_instance.tour_template?.day}N{assignment.tour_instance.tour_template?.night}Đ
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-4 h-4" /> {assignment.tour_instance.booked_count || 0} khách
                                                    </span>
                                                </div>
                                            </div>
                                            <Button variant="outline" asChild className="shrink-0 w-full sm:w-auto">
                                                <Link href={`/guide/trip/${assignment.id}`}>
                                                    Chi tiết
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl p-8 border border-dashed border-gray-300 text-center">
                                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                    <Calendar className="w-6 h-6 text-gray-400" />
                                </div>
                                <p className="text-gray-500">Bạn chưa có lịch trình nào sắp tới.</p>
                                <p className="text-sm text-gray-400 mt-1">Hãy nghỉ ngơi và nạp năng lượng nhé!</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: History & Notifications */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" /> Lịch Sử Chuyến Đi
                        </h2>

                        <Card>
                            <CardContent className="p-0">
                                {pastAssignments.length > 0 ? (
                                    <div className="divide-y divide-gray-100">
                                        {pastAssignments.map((assignment) => (
                                            <div key={assignment.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex justify-between items-start mb-1 h-auto min-h-[3rem]">
                                                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                                        {assignment.tour_instance.tour_template?.title}
                                                    </p>

                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(assignment.tour_instance.date_start).toLocaleDateString('vi-VN')}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs font-normal text-green-600 border-green-200 bg-green-50">
                                                        Hoàn thành
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center text-sm text-gray-500">
                                        Chưa có lịch sử chuyến đi.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
