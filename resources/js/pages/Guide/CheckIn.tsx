import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, MapPin, Clock, CheckCircle2, XCircle, Users, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import guide from '@/routes/guide';

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
    checkedIn: Record<number, boolean>;
}

const passengerTypeLabels: Record<number, string> = {
    0: 'Người lớn',
    1: 'Trẻ em',
    2: 'Em bé',
};

export default function CheckInPage({ checkIn, passengers, checkedIn: initialCheckedIn }: Props) {
    const [attendance, setAttendance] = useState<Record<number, { is_present: boolean; notes: string }>>({});
    const [saving, setSaving] = useState(false);

    // Initialize attendance state
    useEffect(() => {
        const initial: Record<number, { is_present: boolean; notes: string }> = {};
        passengers.forEach((p) => {
            initial[p.id] = {
                is_present: initialCheckedIn[p.id] ?? false,
                notes: '',
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
                    <Link href={guide.tripDetail(checkIn.trip_assignment.id)}>
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
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[60px]">Có mặt</TableHead>
                                        <TableHead>#</TableHead>
                                        <TableHead>Họ tên</TableHead>
                                        <TableHead>CCCD</TableHead>
                                        <TableHead>Loại</TableHead>
                                        <TableHead>Booking</TableHead>
                                        <TableHead>Ghi chú</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {passengers.map((passenger, index) => (
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
                                            <TableCell>{index + 1}</TableCell>
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

