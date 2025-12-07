import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, MapPin, Clock, CheckCircle2, XCircle, Users, Save, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import guide from '@/routes/guide';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Booking {
    id: number;
    code: string;
    client_name: string;
    status: number; // 0: Chờ xác nhận, 1: Đã xác nhận
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

interface Tour {
    id: number;
    title: string;
}

interface TripAssignment {
    id: number;
    tour: Tour;
}

interface CheckIn {
    id: number;
    title: string;
    checkin_time: string;
    trip_assignment: TripAssignment;
}

interface Props {
    checkIn: CheckIn;
    passengers: Passenger[];
    checkedIn: Record<number, { is_present: boolean; notes: string | null }>;
}

const passengerTypeLabels: Record<number, string> = {
    0: 'Người lớn',
    1: 'Trẻ em',
    2: 'Em bé',
};

export default function CheckInPage({ checkIn, passengers, checkedIn: initialCheckedIn }: Props) {
    const [attendance, setAttendance] = useState<Record<number, { is_present: boolean; notes: string }>>({});
    const [saving, setSaving] = useState(false);
    const [expandedBookings, setExpandedBookings] = useState<Set<string>>(new Set());

    // Nhóm passengers theo booking code
    const passengersByBooking = useMemo(() => {
        const grouped: Record<string, Passenger[]> = {};
        passengers.forEach((passenger) => {
            const bookingCode = passenger.booking?.code || 'Không có booking';
            if (!grouped[bookingCode]) {
                grouped[bookingCode] = [];
            }
            grouped[bookingCode].push(passenger);
        });
        return grouped;
    }, [passengers]);

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

    // Initialize attendance state
    useEffect(() => {
        const initial: Record<number, { is_present: boolean; notes: string }> = {};
        passengers.forEach((p) => {
            const savedState = initialCheckedIn[p.id];
            initial[p.id] = {
                is_present: savedState?.is_present ?? false,
                notes: savedState?.notes ?? '',
            };
        });
        setAttendance(initial);
    }, [passengers, initialCheckedIn]);

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

    const handleSave = () => {
        setSaving(true);
        const passengersData = Object.entries(attendance).map(([id, data]) => ({
            passenger_id: parseInt(id),
            is_present: data.is_present,
            notes: data.notes,
        }));

        router.post(`/guide/checkin/${checkIn.id}/save`, {
            passengers: passengersData,
        }, {
            onFinish: () => setSaving(false),
        });
    };

    const presentCount = Object.values(attendance).filter((a) => a.is_present).length;
    const absentCount = passengers.length - presentCount;

    return (
        <AppLayout>
            <Head title={`Check-in - ${checkIn.title}`} />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={guide.trip.detail(checkIn.trip_assignment.id)}>
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <MapPin className="h-6 w-6 text-primary" />
                            {checkIn.title}
                        </h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {new Date(checkIn.checkin_time).toLocaleString('vi-VN')}
                            <span className="mx-2">•</span>
                            {checkIn.trip_assignment.tour.title}
                        </p>
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                        <Save className="h-4 w-4" />
                        {saving ? 'Đang lưu...' : 'Lưu điểm danh'}
                    </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="p-2 rounded-full bg-blue-100">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{passengers.length}</p>
                                <p className="text-sm text-muted-foreground">Tổng số</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="p-2 rounded-full bg-green-100">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">{presentCount}</p>
                                <p className="text-sm text-muted-foreground">Có mặt</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="p-2 rounded-full bg-red-100">
                                <XCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-600">{absentCount}</p>
                                <p className="text-sm text-muted-foreground">Vắng mặt</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

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

                {/* Attendance Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>📋 Điểm danh khách hàng</CardTitle>
                        <CardDescription>
                            Đánh dấu những khách có mặt tại điểm {checkIn.title}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {passengers.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                                Không có khách hàng nào
                            </p>
                        ) : (
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
                                                    <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            {isExpanded ? (
                                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                            )}
                                                            <Badge variant="secondary" className="font-medium">
                                                                {bookingCode}
                                                            </Badge>
                                                            {booking?.status === 0 && (
                                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                                                    Chờ xác nhận
                                                                </Badge>
                                                            )}
                                                            <span className="text-sm text-muted-foreground">
                                                                ({bookingPassengers.length} khách)
                                                            </span>
                                                            {isExpanded && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    • {bookingPresentCount}/{bookingPassengers.length} có mặt
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CollapsibleTrigger>
                                                <CollapsibleContent>
                                                    <div className="border-t">
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
                                                                                className="h-8 w-40"
                                                                                value={attendance[passenger.id]?.notes || ''}
                                                                                onChange={(e) => updateNote(passenger.id, e.target.value)}
                                                                            />
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </CollapsibleContent>
                                            </div>
                                        </Collapsible>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => {
                            const all: Record<number, { is_present: boolean; notes: string }> = {};
                            passengers.forEach((p) => {
                                all[p.id] = { is_present: true, notes: attendance[p.id]?.notes || '' };
                            });
                            setAttendance(all);
                        }}
                    >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Đánh dấu tất cả có mặt
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            const all: Record<number, { is_present: boolean; notes: string }> = {};
                            passengers.forEach((p) => {
                                all[p.id] = { is_present: false, notes: attendance[p.id]?.notes || '' };
                            });
                            setAttendance(all);
                        }}
                    >
                        <XCircle className="h-4 w-4 mr-2" />
                        Bỏ chọn tất cả
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}

