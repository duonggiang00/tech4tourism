import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MapPin, Users, Plus, Eye, Trash2, Clock, CheckCircle2, FileText, Check, XCircle, ChevronDown, ChevronRight, Save, FileDown, CalendarIcon } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import guide from '@/routes/guide';
import axios from 'axios';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Schedule {
    id: number;
    name: string;
    description: string | null;
    date: number;
    destination_id: number | null;
    destination?: {
        id: number;
        name: string;
    };
}

interface Tour {
    id: number;
    title: string;
    days: number;
    thumbnail: string | null;
    schedules: Schedule[];
}

interface CheckInDetail {
    id: number;
    passenger_id: number;
    is_present: boolean;
    notes: string | null;
    passenger: Passenger;
}

interface TripCheckIn {
    id: number;
    title: string;
    checkin_time: string;
    check_in_details: CheckInDetail[];
}

interface TripNote {
    id: number;
    title: string;
    content: string;
    created_at: string;
}

interface Booking {
    id: number;
    code: string;
    client_name: string;
    status?: number;
}

interface Passenger {
    id: number;
    fullname: string;
    phone: string | null;
    email: string | null;
    cccd: string | null;
    request: string | null;
    gender: number;
    type: number;
    booking: Booking;
}

interface TourInstance {
    id: number;
    date_start: string;
    date_end: string;
    status: number;
}

interface TripAssignment {
    id: number;
    tour_id: number;
    user_id: number;
    status: string;
    tour: Tour;
    tourInstance?: TourInstance;
    trip_check_ins: TripCheckIn[];
    trip_notes: TripNote[];
}

interface Props {
    assignment: TripAssignment;
    passengers: Passenger[];
}

const statusLabels: Record<string, { label: string; color: string }> = {
    '0': { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
    '1': { label: 'Đang thực hiện', color: 'bg-blue-100 text-blue-800' },
    '2': { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
    '3': { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
};

const passengerTypeLabels: Record<number, string> = {
    0: 'Người lớn',
    1: 'Trẻ em',
    2: 'Em bé',
};

export default function TripDetail({ assignment, passengers }: Props) {
    const [showCheckInDialog, setShowCheckInDialog] = useState(false);
    const [showNoteDialog, setShowNoteDialog] = useState(false);
    const [modalPassengers, setModalPassengers] = useState<Passenger[]>([]);
    const [loadingPassengers, setLoadingPassengers] = useState(false);
    const [attendance, setAttendance] = useState<Record<number, { is_present: boolean; notes: string }>>({});
    const [expandedBookings, setExpandedBookings] = useState<Set<string>>(new Set());

    const checkInForm = useForm({
        title: '',
        checkin_time: new Date().toISOString().slice(0, 16),
        passengers: [] as Array<{ passenger_id: number; is_present: boolean; notes: string }>,
    });

    const noteForm = useForm({
        title: '',
        content: '',
    });

    // Nhóm passengers theo booking code
    const passengersByBooking = useMemo(() => {
        const grouped: Record<string, Passenger[]> = {};
        modalPassengers.forEach((passenger) => {
            const bookingCode = passenger.booking?.code || 'Không có booking';
            if (!grouped[bookingCode]) {
                grouped[bookingCode] = [];
            }
            grouped[bookingCode].push(passenger);
        });
        return grouped;
    }, [modalPassengers]);

    // Tính tổng số yêu cầu đặc biệt
    const specialRequestsCount = useMemo(() => {
        return passengers.filter(p => p.request && p.request.trim() !== '').length;
    }, [passengers]);

    // Danh sách passengers có yêu cầu đặc biệt
    const passengersWithRequests = useMemo(() => {
        return passengers.filter(p => p.request && p.request.trim() !== '');
    }, [passengers]);

    // Mở tất cả booking mặc định
    useEffect(() => {
        const allCodes = Object.keys(passengersByBooking);
        setExpandedBookings(new Set(allCodes));
    }, [passengersByBooking]);

    // Initialize attendance khi có passengers
    useEffect(() => {
        const initial: Record<number, { is_present: boolean; notes: string }> = {};
        modalPassengers.forEach((p) => {
            initial[p.id] = {
                is_present: false,
                notes: '',
            };
        });
        setAttendance(initial);
    }, [modalPassengers]);

    // Tự động fetch passengers khi mở dialog và có checkin_time
    useEffect(() => {
        if (showCheckInDialog && checkInForm.data.checkin_time) {
            handleCheckInTimeChange(checkInForm.data.checkin_time);
        }
    }, [showCheckInDialog]); // Chỉ chạy khi dialog mở/đóng

    // Fetch passengers khi chọn checkin_time
    const handleCheckInTimeChange = async (checkinTime: string) => {
        checkInForm.setData('checkin_time', checkinTime);

        if (!checkinTime) {
            setModalPassengers([]);
            return;
        }

        setLoadingPassengers(true);
        try {
            const response = await axios.get(`/guide/trip/${assignment.id}/passengers`, {
                params: { checkin_time: checkinTime },
            });
            setModalPassengers(response.data);
        } catch (error: any) {
            toast.error('Không thể tải danh sách khách hàng');
            console.error(error);
        } finally {
            setLoadingPassengers(false);
        }
    };

    const toggleAttendance = (passengerId: number) => {
        setAttendance((prev) => ({
            ...prev,
            [passengerId]: {
                ...prev[passengerId],
                is_present: !prev[passengerId]?.is_present,
            },
        }));
    };

    const updateNote = (passengerId: number, notes: string) => {
        setAttendance((prev) => ({
            ...prev,
            [passengerId]: {
                ...prev[passengerId],
                notes,
            },
        }));
    };

    const toggleBooking = (bookingCode: string) => {
        setExpandedBookings((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(bookingCode)) {
                newSet.delete(bookingCode);
            } else {
                newSet.add(bookingCode);
            }
            return newSet;
        });
    };

    const handleCreateCheckIn = (e: React.FormEvent) => {
        e.preventDefault();

        checkInForm.transform((data) => ({
            ...data,
            passengers: Object.entries(attendance).map(([id, att]) => ({
                passenger_id: parseInt(id),
                is_present: att.is_present,
                notes: att.notes,
            })),
        }));

        checkInForm.post(`/guide/trip/${assignment.id}/checkin`, {
            onSuccess: () => {
                setShowCheckInDialog(false);
                checkInForm.reset();
                setModalPassengers([]);
                setAttendance({});
                router.reload();
            },
        });
    };

    const handleCreateNote = (e: React.FormEvent) => {
        e.preventDefault();
        noteForm.post(`/guide/trip/${assignment.id}/note`, {
            onSuccess: () => {
                setShowNoteDialog(false);
                noteForm.reset();
            },
        });
    };

    const handleDeleteCheckIn = (checkInId: number) => {
        if (confirm('Bạn có chắc muốn xóa đợt check-in này?')) {
            router.delete(`/guide/checkin/${checkInId}`);
        }
    };

    const handleDeleteNote = (noteId: number) => {
        if (confirm('Bạn có chắc muốn xóa nhật ký này?')) {
            router.delete(`/guide/note/${noteId}`);
        }
    };

    const handleConfirmAssignment = async () => {
        try {
            await axios.post(`/assignments/${assignment.id}/confirm`);
            toast.success('Đã xác nhận nhận tour thành công!');
            router.reload();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    // Kiểm tra xem hôm nay có phải là ngày cuối cùng (hoặc sau đó) không
    const isEndedOrLater = useMemo(() => {
        if (!assignment.tourInstance?.date_end) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dateEnd = new Date(assignment.tourInstance.date_end);
        dateEnd.setHours(0, 0, 0, 0);
        return today.getTime() >= dateEnd.getTime();
    }, [assignment.tourInstance?.date_end]);

    const handleCompleteTour = async () => {
        if (!confirm('Bạn có chắc muốn xác nhận đã kết thúc tour? Hành động này không thể hoàn tác.')) {
            return;
        }
        try {
            await axios.post(`/guide/trip/${assignment.id}/complete`);
            toast.success('Đã xác nhận kết thúc tour thành công!');
            router.reload();
        } catch (error: any) {
            toast.error(error.response?.data?.error || error.response?.data?.message || 'Có lỗi xảy ra');
        }
    };

    return (
        <AppLayout>
            <Head title={`Chi tiết chuyến đi - ${assignment.tour.title}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                    <Link href={guide.schedule()}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex flex-col items-start gap-2 mb-2 sm:flex-row sm:items-center">
                            <Badge className={statusLabels[assignment.status]?.color || 'bg-gray-100'}>
                                {statusLabels[assignment.status]?.label || 'Không xác định'}
                            </Badge>
                            {assignment.status === '0' && (
                                <Button
                                    onClick={handleConfirmAssignment}
                                    size="sm"
                                    className="gap-2 w-full sm:w-auto justify-center"
                                >
                                    <Check className="h-4 w-4" />
                                    Xác nhận đã nhận
                                </Button>
                            )}
                            {assignment.status === '1' && (
                                <Button
                                    onClick={handleCompleteTour}
                                    size="sm"
                                    className="gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto justify-center"
                                >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Xác nhận đã kết thúc tour
                                </Button>
                            )}
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold">{assignment.tour.title}</h1>
                        <p className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
                            <Clock className="h-4 w-4" />
                            {assignment.tour.days} ngày
                            <span className="mx-2">•</span>
                            <Users className="h-4 w-4" />
                            {passengers.length} khách
                            {assignment.tourInstance && (
                                <>
                                    <span className="mx-2">•</span>
                                    <span className="font-medium text-blue-600">
                                        {new Date(assignment.tourInstance.date_start).toLocaleDateString('vi-VN')} - {new Date(assignment.tourInstance.date_end).toLocaleDateString('vi-VN')}
                                    </span>
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="itinerary" className="w-full">
                    <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1">
                        <TabsTrigger value="itinerary" className="flex-1 min-w-[100px]">Lịch trình</TabsTrigger>
                        <TabsTrigger value="passengers" className="flex-1 min-w-[100px]">Khách hàng</TabsTrigger>
                        <TabsTrigger value="checkin" className="flex-1 min-w-[100px]">Check-in</TabsTrigger>
                        <TabsTrigger value="notes" className="flex-1 min-w-[100px]">Nhật ký</TabsTrigger>
                    </TabsList>

                    {/* Lịch trình Tour */}
                    <TabsContent value="itinerary" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>📍 Lịch trình chi tiết</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {assignment.tour.schedules.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        Chưa có lịch trình chi tiết
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {assignment.tour.schedules
                                            .sort((a, b) => a.date - b.date)
                                            .map((item) => (
                                                <div key={item.id} className="border-l-4 border-primary pl-4 py-2">
                                                    <div className="font-semibold text-primary">
                                                        Ngày {item.date}: {item.name}
                                                    </div>
                                                    {item.destination && (
                                                        <p className="text-xs text-muted-foreground">
                                                            📍 {item.destination.name}
                                                        </p>
                                                    )}
                                                    {item.description && (
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Danh sách khách hàng */}
                    <TabsContent value="passengers" className="space-y-4">
                        {/* Thông báo yêu cầu đặc biệt */}
                        {specialRequestsCount > 0 && (
                            <Card className="border-orange-200 bg-orange-50">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                                                <FileText className="h-5 w-5 text-orange-600" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-orange-900">
                                                Có {specialRequestsCount} khách hàng có yêu cầu đặc biệt
                                            </h3>
                                            <p className="text-sm text-orange-700 mt-1">
                                                Vui lòng kiểm tra và đảm bảo đáp ứng các yêu cầu này trong suốt chuyến đi
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 space-y-2">
                                        {passengersWithRequests.map((passenger) => (
                                            <div key={passenger.id} className="bg-white rounded-lg p-3 border border-orange-200">
                                                <div className="flex items-start gap-2">
                                                    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                                                        {passenger.booking?.code || 'N/A'}
                                                    </Badge>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">{passenger.fullname}</p>
                                                        <p className="text-xs text-muted-foreground mt-1">{passenger.request}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Danh sách khách hàng ({passengers.length})
                                </CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 text-green-700 bg-green-50 border-green-200 hover:bg-green-100 hover:text-green-800"
                                    onClick={() => window.location.href = `/guide/trip/${assignment.id}/export`}
                                >
                                    <FileDown className="w-4 h-4" /> Xuất CSV
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {passengers.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        Chưa có khách hàng nào
                                    </p>
                                ) : (
                                    <>
                                        {/* Desktop Table */}
                                        <div className="hidden md:block">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>#</TableHead>
                                                        <TableHead>Họ tên</TableHead>
                                                        <TableHead>SĐT</TableHead>
                                                        <TableHead>CCCD</TableHead>
                                                        <TableHead>Loại</TableHead>
                                                        <TableHead>Yêu cầu đặc biệt</TableHead>
                                                        <TableHead>Mã booking</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {passengers.map((passenger, index) => (
                                                        <TableRow key={passenger.id}>
                                                            <TableCell>{index + 1}</TableCell>
                                                            <TableCell className="font-medium">
                                                                {passenger.fullname}
                                                            </TableCell>
                                                            <TableCell className="font-mono text-sm">
                                                                {passenger.phone || '-'}
                                                            </TableCell>
                                                            <TableCell>{passenger.cccd || '-'}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline">
                                                                    {passengerTypeLabels[passenger.type] || 'N/A'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                {passenger.request && passenger.request.trim() !== '' ? (
                                                                    <div className="max-w-[200px]">
                                                                        <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-300 text-xs">
                                                                            <FileText className="h-3 w-3 mr-1" />
                                                                            Có yêu cầu
                                                                        </Badge>
                                                                        <p className="text-xs text-muted-foreground mt-1 truncate" title={passenger.request}>
                                                                            {passenger.request}
                                                                        </p>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted-foreground text-sm">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="secondary">
                                                                    {passenger.booking?.code || '-'}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Mobile Card View */}
                                        <div className="md:hidden space-y-4">
                                            {passengers.map((passenger, index) => (
                                                <div key={passenger.id} className="bg-white border rounded-lg p-4 space-y-3 shadow-sm">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-semibold text-gray-500">#{index + 1}</span>
                                                                <h3 className="font-bold text-gray-900">{passenger.fullname}</h3>
                                                            </div>
                                                            <div className="flex gap-2 mt-1">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {passengerTypeLabels[passenger.type] || 'N/A'}
                                                                </Badge>
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {passenger.booking?.code || '-'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        {passenger.request && passenger.request.trim() !== '' && (
                                                            <div className="flex-shrink-0">
                                                                <FileText className="h-5 w-5 text-orange-500" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                                        <div>
                                                            <p className="text-xs text-gray-400">Số điện thoại</p>
                                                            <p className="font-mono">{passenger.phone || '-'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-400">CCCD</p>
                                                            <p>{passenger.cccd || '-'}</p>
                                                        </div>
                                                    </div>

                                                    {passenger.request && passenger.request.trim() !== '' && (
                                                        <div className="bg-orange-50 p-2 rounded text-sm text-orange-800 border border-orange-100">
                                                            <p className="text-xs font-bold mb-1">Yêu cầu đặc biệt:</p>
                                                            {passenger.request}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Check-in */}
                    <TabsContent value="checkin" className="space-y-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5" />
                                        Check-in theo điểm đến
                                    </CardTitle>
                                    <CardDescription>
                                        Điểm danh khách hàng tại mỗi điểm đến
                                    </CardDescription>
                                </div>
                                <Dialog open={showCheckInDialog} onOpenChange={(open) => {
                                    setShowCheckInDialog(open);
                                    if (!open) {
                                        setModalPassengers([]);
                                        setAttendance({});
                                        checkInForm.reset();
                                    }
                                }}>
                                    <DialogTrigger asChild>
                                        <Button className="gap-2">
                                            <Plus className="h-4 w-4" />
                                            Tạo đợt check-in
                                        </Button>
                                    </DialogTrigger>

                                    {/* --- CHỈNH SỬA Ở ĐÂY: Tăng chiều rộng modal --- */}
                                    <DialogContent className="max-w-[95vw] sm:max-w-7xl max-h-[100vh] flex flex-col">
                                        <DialogHeader>
                                            <DialogTitle>Tạo đợt check-in mới</DialogTitle>
                                            <DialogDescription>
                                                Nhập tên điểm đến, thời gian check-in và điểm danh khách hàng
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleCreateCheckIn} className="flex flex-col flex-1 overflow-hidden">
                                            <ScrollArea className="flex-1 -mr-4 pr-4">
                                                <div className="space-y-4 py-4">
                                                    {/* Form thông tin check-in */}
                                                    <div className="space-y-4 border-b pb-4">
                                                        <div className="space-y-2">
                                                            <Label>Tên điểm đến *</Label>
                                                            <Input
                                                                placeholder="VD: Bãi biển Mỹ Khê"
                                                                value={checkInForm.data.title}
                                                                onChange={(e) => checkInForm.setData('title', e.target.value)}
                                                            />
                                                            {checkInForm.errors.title && (
                                                                <p className="text-sm text-red-500">{checkInForm.errors.title}</p>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Thời gian check-in *</Label>
                                                            <div className="flex flex-col sm:flex-row gap-3">
                                                                <div className="relative flex-1 w-full">
                                                                    <Input
                                                                        type="date"
                                                                        value={checkInForm.data.checkin_time ? checkInForm.data.checkin_time.split('T')[0] : ''}
                                                                        onChange={(e) => {
                                                                            const date = e.target.value;
                                                                            const time = checkInForm.data.checkin_time ? (checkInForm.data.checkin_time.split('T')[1] || '08:00') : '08:00';
                                                                            if (date) handleCheckInTimeChange(`${date}T${time}`);
                                                                        }}
                                                                        className="pl-10 h-10 w-full"
                                                                    />
                                                                    <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                                                </div>
                                                                <div className="relative w-full sm:w-40">
                                                                    <Input
                                                                        type="time"
                                                                        value={checkInForm.data.checkin_time ? (checkInForm.data.checkin_time.split('T')[1]?.slice(0, 5) || '08:00') : '08:00'}
                                                                        onChange={(e) => {
                                                                            const time = e.target.value;
                                                                            const date = checkInForm.data.checkin_time ? checkInForm.data.checkin_time.split('T')[0] : new Date().toISOString().split('T')[0];
                                                                            if (date && time) handleCheckInTimeChange(`${date}T${time}`);
                                                                        }}
                                                                        className="pl-10 h-10 w-full"
                                                                    />
                                                                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                                                                </div>
                                                            </div>

                                                            {checkInForm.errors.checkin_time && (
                                                                <p className="text-sm text-red-500">{checkInForm.errors.checkin_time}</p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Form điểm danh */}
                                                    {loadingPassengers ? (
                                                        <div className="text-center py-8">
                                                            <p className="text-muted-foreground">Đang tải danh sách khách hàng...</p>
                                                        </div>
                                                    ) : modalPassengers.length > 0 ? (
                                                        <div className="space-y-4">
                                                            <div className="flex flex-col gap-3">
                                                                <Label className="text-base font-semibold">Điểm danh khách hàng</Label>
                                                                <div className="flex flex-wrap gap-2">
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="flex-1 whitespace-nowrap min-w-[120px]"
                                                                        onClick={() => {
                                                                            const all: Record<number, { is_present: boolean; notes: string }> = {};
                                                                            modalPassengers.forEach((p) => {
                                                                                all[p.id] = { is_present: true, notes: attendance[p.id]?.notes || '' };
                                                                            });
                                                                            setAttendance(all);
                                                                        }}
                                                                    >
                                                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                                                        Tất cả có mặt
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="flex-1 whitespace-nowrap min-w-[120px]"
                                                                        onClick={() => {
                                                                            const all: Record<number, { is_present: boolean; notes: string }> = {};
                                                                            modalPassengers.forEach((p) => {
                                                                                all[p.id] = { is_present: false, notes: attendance[p.id]?.notes || '' };
                                                                            });
                                                                            setAttendance(all);
                                                                        }}
                                                                    >
                                                                        <XCircle className="h-4 w-4 mr-1" />
                                                                        Bỏ chọn tất cả
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {Object.entries(passengersByBooking).map(([bookingCode, bookingPassengers]) => {
                                                                    const booking = bookingPassengers[0]?.booking;
                                                                    const isExpanded = expandedBookings.has(bookingCode);
                                                                    const bookingPresentCount = bookingPassengers.filter(
                                                                        (p) => attendance[p.id]?.is_present
                                                                    ).length;

                                                                    return (
                                                                        <Collapsible
                                                                            key={bookingCode}
                                                                            open={isExpanded}
                                                                            onOpenChange={() => toggleBooking(bookingCode)}
                                                                        >
                                                                            <div className="border rounded-lg">
                                                                                <CollapsibleTrigger className="w-full">
                                                                                    <div className="flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors text-left">
                                                                                        <div className="pt-1 flex-shrink-0">
                                                                                            {isExpanded ? (
                                                                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                                                            ) : (
                                                                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                                                                <Badge variant="secondary" className="font-medium">
                                                                                                    {bookingCode}
                                                                                                </Badge>
                                                                                                {booking?.status === 0 && (
                                                                                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 whitespace-nowrap">
                                                                                                        Chờ xác nhận
                                                                                                    </Badge>
                                                                                                )}
                                                                                            </div>
                                                                                            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                                                                                <span>({bookingPassengers.length} khách)</span>
                                                                                                {isExpanded && (
                                                                                                    <span className="whitespace-nowrap">
                                                                                                        • {bookingPresentCount}/{bookingPassengers.length} có mặt
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </CollapsibleTrigger>
                                                                                <CollapsibleContent>
                                                                                    <div className="border-t">
                                                                                        {/* Desktop Table */}
                                                                                        <div className="hidden md:block">
                                                                                            <Table>
                                                                                                <TableHeader>
                                                                                                    <TableRow>
                                                                                                        <TableHead className="w-[60px]">Có mặt</TableHead>
                                                                                                        <TableHead>#</TableHead>
                                                                                                        <TableHead>Họ tên</TableHead>
                                                                                                        <TableHead>SĐT</TableHead>
                                                                                                        <TableHead>CCCD</TableHead>
                                                                                                        <TableHead>Loại</TableHead>
                                                                                                        <TableHead>Yêu cầu đặc biệt</TableHead>
                                                                                                        <TableHead>Ghi chú</TableHead>
                                                                                                    </TableRow>
                                                                                                </TableHeader>
                                                                                                <TableBody>
                                                                                                    {bookingPassengers.map((passenger, idx) => (
                                                                                                        <TableRow
                                                                                                            key={passenger.id}
                                                                                                            className={attendance[passenger.id]?.is_present ? 'bg-green-50' : ''}
                                                                                                        >
                                                                                                            <TableCell>
                                                                                                                <Checkbox
                                                                                                                    checked={attendance[passenger.id]?.is_present || false}
                                                                                                                    onCheckedChange={() => toggleAttendance(passenger.id)}
                                                                                                                />
                                                                                                            </TableCell>
                                                                                                            <TableCell>{idx + 1}</TableCell>
                                                                                                            <TableCell className="font-medium">
                                                                                                                <div className="flex items-center gap-2">
                                                                                                                    {attendance[passenger.id]?.is_present ? (
                                                                                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                                                                                    ) : (
                                                                                                                        <XCircle className="h-4 w-4 text-red-400" />
                                                                                                                    )}
                                                                                                                    {passenger.fullname}
                                                                                                                </div>
                                                                                                            </TableCell>
                                                                                                            <TableCell className="font-mono text-sm">
                                                                                                                {passenger.phone || '-'}
                                                                                                            </TableCell>
                                                                                                            <TableCell>{passenger.cccd || '-'}</TableCell>
                                                                                                            <TableCell>
                                                                                                                <Badge variant="outline">
                                                                                                                    {passengerTypeLabels[passenger.type] || 'N/A'}
                                                                                                                </Badge>
                                                                                                            </TableCell>
                                                                                                            <TableCell className="max-w-[150px]">
                                                                                                                {passenger.request && passenger.request.trim() !== '' ? (
                                                                                                                    <div className="space-y-1">
                                                                                                                        <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-300 text-xs">
                                                                                                                            <FileText className="h-3 w-3 mr-1" />
                                                                                                                            Có yêu cầu
                                                                                                                        </Badge>
                                                                                                                        <p className="text-xs text-muted-foreground truncate" title={passenger.request}>
                                                                                                                            {passenger.request}
                                                                                                                        </p>
                                                                                                                    </div>
                                                                                                                ) : (
                                                                                                                    <span className="text-muted-foreground text-sm">-</span>
                                                                                                                )}
                                                                                                            </TableCell>
                                                                                                            <TableCell>
                                                                                                                <Input
                                                                                                                    placeholder="Ghi chú..."
                                                                                                                    className="h-8 w-full min-w-[150px]"
                                                                                                                    value={attendance[passenger.id]?.notes || ''}
                                                                                                                    onChange={(e) => updateNote(passenger.id, e.target.value)}
                                                                                                                />
                                                                                                            </TableCell>
                                                                                                        </TableRow>
                                                                                                    ))}
                                                                                                </TableBody>
                                                                                            </Table>
                                                                                        </div>

                                                                                        {/* Mobile Card List */}
                                                                                        <div className="md:hidden space-y-2 p-3">
                                                                                            {bookingPassengers.map((passenger, idx) => (
                                                                                                <div
                                                                                                    key={passenger.id}
                                                                                                    className={`border rounded-lg p-3 ${attendance[passenger.id]?.is_present ? 'bg-green-50 border-green-200' : 'bg-white'}`}
                                                                                                >
                                                                                                    <div className="flex items-start gap-3">
                                                                                                        <div className="pt-1">
                                                                                                            <Checkbox
                                                                                                                checked={attendance[passenger.id]?.is_present || false}
                                                                                                                onCheckedChange={() => toggleAttendance(passenger.id)}
                                                                                                                className="h-5 w-5"
                                                                                                            />
                                                                                                        </div>
                                                                                                        <div className="flex-1 space-y-2">
                                                                                                            <div className="flex justify-between">
                                                                                                                <div className="font-medium">
                                                                                                                    {passenger.fullname}
                                                                                                                </div>
                                                                                                                <Badge variant="outline" className="text-xs">
                                                                                                                    {passengerTypeLabels[passenger.type] || 'N/A'}
                                                                                                                </Badge>
                                                                                                            </div>

                                                                                                            {(passenger.phone || passenger.cccd) && (
                                                                                                                <div className="text-xs text-gray-500 grid grid-cols-2 gap-2">
                                                                                                                    {passenger.phone && (
                                                                                                                        <div>SĐT: <span className="font-mono">{passenger.phone}</span></div>
                                                                                                                    )}
                                                                                                                    {passenger.cccd && (
                                                                                                                        <div>CCCD: {passenger.cccd}</div>
                                                                                                                    )}
                                                                                                                </div>
                                                                                                            )}

                                                                                                            {passenger.request && passenger.request.trim() !== '' && (
                                                                                                                <div className="bg-orange-50 p-2 rounded text-xs text-orange-800 border border-orange-100 flex gap-2 items-center">
                                                                                                                    <FileText className="h-3 w-3 flex-shrink-0" />
                                                                                                                    <span>{passenger.request}</span>
                                                                                                                </div>
                                                                                                            )}

                                                                                                            <Input
                                                                                                                placeholder="Ghi chú (nếu có)..."
                                                                                                                className="h-8 w-full text-sm"
                                                                                                                value={attendance[passenger.id]?.notes || ''}
                                                                                                                onChange={(e) => updateNote(passenger.id, e.target.value)}
                                                                                                            />
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    </div>
                                                                                </CollapsibleContent>
                                                                            </div>
                                                                        </Collapsible>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ) : checkInForm.data.checkin_time ? (
                                                        <div className="text-center py-8 border rounded-lg">
                                                            <p className="text-muted-foreground">
                                                                Không có khách hàng nào cho ngày này
                                                            </p>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </ScrollArea>
                                            <DialogFooter className="mt-4 pt-4 border-t">
                                                <Button type="button" variant="outline" onClick={() => {
                                                    setShowCheckInDialog(false);
                                                    setModalPassengers([]);
                                                    setAttendance({});
                                                    checkInForm.reset();
                                                }}>
                                                    Hủy
                                                </Button>
                                                <Button type="submit" disabled={checkInForm.processing || !checkInForm.data.title || !checkInForm.data.checkin_time} className="gap-2">
                                                    <Save className="h-4 w-4" />
                                                    {checkInForm.processing ? 'Đang lưu...' : 'Lưu check-in'}
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                {assignment.trip_check_ins.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        Chưa có đợt check-in nào
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {assignment.trip_check_ins.map((checkIn) => (
                                            <div
                                                key={checkIn.id}
                                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                                            >
                                                <div>
                                                    <div className="font-medium flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-primary" />
                                                        {checkIn.title}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(checkIn.checkin_time).toLocaleString('vi-VN')}
                                                    </div>
                                                    <div className="text-sm mt-1">
                                                        <Badge variant="outline">
                                                            {checkIn.check_in_details.filter(d => d.is_present).length}/{passengers.length} có mặt
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Link href={guide.checkin.show(checkIn.id)}>
                                                        <Button variant="outline" size="sm" className="gap-1">
                                                            <Eye className="h-4 w-4" />
                                                            Điểm danh
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={() => handleDeleteCheckIn(checkIn.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Nhật ký */}
                    <TabsContent value="notes" className="space-y-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Nhật ký chuyến đi
                                    </CardTitle>
                                    <CardDescription>
                                        Ghi chép trong quá trình dẫn tour
                                    </CardDescription>
                                </div>
                                <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
                                    <DialogTrigger asChild>
                                        <Button className="gap-2">
                                            <Plus className="h-4 w-4" />
                                            Viết nhật ký
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Viết nhật ký mới</DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleCreateNote}>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label>Tiêu đề *</Label>
                                                    <Input
                                                        placeholder="VD: Ngày 1 - Đến Đà Nẵng"
                                                        value={noteForm.data.title}
                                                        onChange={(e) => noteForm.setData('title', e.target.value)}
                                                    />
                                                    {noteForm.errors.title && (
                                                        <p className="text-sm text-red-500">{noteForm.errors.title}</p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Nội dung *</Label>
                                                    <Textarea
                                                        placeholder="Ghi chép của bạn..."
                                                        rows={5}
                                                        value={noteForm.data.content}
                                                        onChange={(e) => noteForm.setData('content', e.target.value)}
                                                    />
                                                    {noteForm.errors.content && (
                                                        <p className="text-sm text-red-500">{noteForm.errors.content}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="button" variant="outline" onClick={() => setShowNoteDialog(false)}>
                                                    Hủy
                                                </Button>
                                                <Button type="submit" disabled={noteForm.processing}>
                                                    Lưu
                                                </Button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                {assignment.trip_notes.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        Chưa có nhật ký nào
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {assignment.trip_notes.map((note) => (
                                            <div
                                                key={note.id}
                                                className="p-4 border rounded-lg"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-medium">{note.title}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {new Date(note.created_at).toLocaleString('vi-VN')}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={() => handleDeleteNote(note.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <p className="mt-2 text-sm whitespace-pre-wrap">{note.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}