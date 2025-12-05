import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Users, Eye, Clock, Check } from 'lucide-react';
import guide from '@/routes/guide';
import axios from 'axios';
import { toast } from 'sonner';

interface Tour {
    id: number;
    title: string;
    days?: number;
    day?: number;
    thumbnail: string | null;
}

interface TourInstance {
    id: number;
    tour_template_id: number;
    tourTemplate?: Tour;
}

interface TripAssignment {
    id: number;
    tour_id: number;
    user_id: number;
    status: string;
    tour: Tour | null; // Có thể null nếu assignment ở instance level
    tourInstance?: TourInstance; // Mới: assignment có thể thuộc instance
    trip_check_ins: any[];
    trip_notes: any[];
    created_at: string;
}

interface Props {
    assignments: {
        data: TripAssignment[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: {
        status?: string;
    };
}

const statusLabels: Record<string, { label: string; color: string }> = {
    '0': { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
    '1': { label: 'Đang thực hiện', color: 'bg-blue-100 text-blue-800' },
    '2': { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
    '3': { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
};

export default function Schedule({ assignments, filters }: Props) {
    const handleStatusFilter = (value: string) => {
        const scheduleUrl = guide?.schedule ? guide.schedule() : '/guide/schedule';
        router.get(scheduleUrl, {
            status: value === 'all' ? undefined : value,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleConfirmAssignment = async (assignmentId: number) => {
        try {
            await axios.post(`/assignments/${assignmentId}/confirm`);
            toast.success('Đã xác nhận nhận tour thành công!');
            router.reload();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    return (
        <AppLayout>
            <Head title="Lịch trình của tôi" />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">📅 Lịch trình của tôi</h1>
                        <p className="text-muted-foreground">Danh sách các chuyến đi được phân công</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Select 
                            value={filters.status || 'all'} 
                            onValueChange={handleStatusFilter}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="0">Chờ xác nhận</SelectItem>
                                <SelectItem value="1">Đang thực hiện</SelectItem>
                                <SelectItem value="2">Hoàn thành</SelectItem>
                                <SelectItem value="3">Đã hủy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Assignment List */}
                {assignments.data.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium">Chưa có chuyến đi nào</p>
                            <p className="text-muted-foreground">Bạn sẽ thấy các chuyến đi được phân công tại đây</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {assignments.data.map((assignment) => {
                            // Lấy tour từ tourInstance.tourTemplate hoặc tour trực tiếp
                            const tour = assignment.tourInstance?.tourTemplate || assignment.tour;
                            
                            // Nếu không có tour, bỏ qua assignment này
                            if (!tour) {
                                return null;
                            }
                            
                            const days = tour.days || tour.day || 0;
                            const thumbnail = tour.thumbnail ? `/storage/${tour.thumbnail}` : null;
                            
                            return (
                            <Card key={assignment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="flex flex-col md:flex-row">
                                    {/* Thumbnail */}
                                    <div className="w-full md:w-48 h-32 md:h-auto bg-muted flex-shrink-0">
                                        {thumbnail ? (
                                            <img 
                                                src={thumbnail} 
                                                alt={tour.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <MapPin className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 p-4">
                                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge className={statusLabels[assignment.status]?.color || 'bg-gray-100'}>
                                                        {statusLabels[assignment.status]?.label || 'Không xác định'}
                                                    </Badge>
                                                </div>
                                                <h3 className="text-lg font-semibold">{tour.title}</h3>
                                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                    {days > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-4 w-4" />
                                                            {days} ngày
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-4 w-4" />
                                                        {assignment.trip_check_ins.length} điểm check-in
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        📝 {assignment.trip_notes.length} nhật ký
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col gap-2">
                                                {assignment.status === '0' && (
                                                    <Button
                                                        onClick={() => handleConfirmAssignment(assignment.id)}
                                                        className="gap-2"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                        Xác nhận đã nhận
                                                    </Button>
                                                )}
                                                <Link href={guide?.tripDetail ? guide.tripDetail(assignment.id) : `/guide/trip/${assignment.id}`}>
                                                    <Button variant="outline" className="gap-2">
                                                        <Eye className="h-4 w-4" />
                                                        Xem chi tiết
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {assignments.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {assignments.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`px-3 py-1 rounded ${
                                    link.active 
                                        ? 'bg-primary text-primary-foreground' 
                                        : 'bg-muted hover:bg-muted/80'
                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

