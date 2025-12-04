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
import { ArrowLeft, MapPin, Users, Plus, Eye, Trash2, Clock, CheckCircle2, FileText, Check } from 'lucide-react';
import { useState } from 'react';
import guide from '@/routes/guide';
import axios from 'axios';
import { toast } from 'sonner';

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
}

interface Passenger {
    id: number;
    fullname: string;
    phone: string;
    email: string;
    cccd: string | null;
    gender: number;
    type: number;
    booking: Booking;
}

interface TripAssignment {
    id: number;
    tour_id: number;
    user_id: number;
    status: string;
    tour: Tour;
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

    const checkInForm = useForm({
        title: '',
        checkin_time: new Date().toISOString().slice(0, 16),
    });

    const noteForm = useForm({
        title: '',
        content: '',
    });

    const handleCreateCheckIn = (e: React.FormEvent) => {
        e.preventDefault();
        checkInForm.post(`/guide/trip/${assignment.id}/checkin`, {
            onSuccess: () => {
                setShowCheckInDialog(false);
                checkInForm.reset();
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

    return (
        <AppLayout>
            <Head title={`Chi tiết chuyến đi - ${assignment.tour.title}`} />
            
            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={guide.schedule()}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className={statusLabels[assignment.status]?.color || 'bg-gray-100'}>
                                {statusLabels[assignment.status]?.label || 'Không xác định'}
                            </Badge>
                            {assignment.status === '0' && (
                                <Button
                                    onClick={handleConfirmAssignment}
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Check className="h-4 w-4" />
                                    Xác nhận đã nhận
                                </Button>
                            )}
                        </div>
                        <h1 className="text-2xl font-bold">{assignment.tour.title}</h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {assignment.tour.days} ngày
                            <span className="mx-2">•</span>
                            <Users className="h-4 w-4" />
                            {passengers.length} khách
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="itinerary" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="itinerary">Lịch trình</TabsTrigger>
                        <TabsTrigger value="passengers">Khách hàng</TabsTrigger>
                        <TabsTrigger value="checkin">Check-in</TabsTrigger>
                        <TabsTrigger value="notes">Nhật ký</TabsTrigger>
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
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Danh sách khách hàng ({passengers.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {passengers.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        Chưa có khách hàng nào
                                    </p>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>#</TableHead>
                                                <TableHead>Họ tên</TableHead>
                                                <TableHead>CCCD</TableHead>
                                                <TableHead>Loại</TableHead>
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
                                                    <TableCell>{passenger.cccd || '-'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {passengerTypeLabels[passenger.type] || 'N/A'}
                                                        </Badge>
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
                                <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
                                    <DialogTrigger asChild>
                                        <Button className="gap-2">
                                            <Plus className="h-4 w-4" />
                                            Tạo đợt check-in
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Tạo đợt check-in mới</DialogTitle>
                                            <DialogDescription>
                                                Nhập tên điểm đến và thời gian check-in
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleCreateCheckIn}>
                                            <div className="space-y-4 py-4">
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
                                                    <Input
                                                        type="datetime-local"
                                                        value={checkInForm.data.checkin_time}
                                                        onChange={(e) => checkInForm.setData('checkin_time', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="button" variant="outline" onClick={() => setShowCheckInDialog(false)}>
                                                    Hủy
                                                </Button>
                                                <Button type="submit" disabled={checkInForm.processing}>
                                                    Tạo
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
                                                    <Link href={guide.checkIn(checkIn.id)}>
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

