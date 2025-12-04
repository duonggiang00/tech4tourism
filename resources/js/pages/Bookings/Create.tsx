import ExcelImportDialog from '@/components/booking/ExcelImportDialog';
import TourCombobox from '@/components/booking/TourCombobox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { ArrowLeft, CalendarIcon, FileSpreadsheet, Minus, Plus, Users } from 'lucide-react';
import { FormEventHandler, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

export interface Tour {
    id: number;
    title: string;
    price_adult: number;
    price_children: number;
    thumbnail: string;
    day: number;
}

interface CreateBookingProps {
    tour?: Tour;
    tours?: Tour[];
    isAdmin?: boolean;
    // date_start đã bị xóa
    adults?: number;
    children?: number;
}

interface Passenger {
    fullname: string;
    age?: number | null;
    cccd?: string;
    type: number;
    gender: number;
}

// 1. Định nghĩa cấu trúc dữ liệu mới
interface BookingFormData {
    booking: {
        tour_id: number | string;
        // date_start đã bị xóa
        adults: number;
        children: number;
        client_name: string;
        client_phone: string;
        client_email: string;
    };
    passengers: Passenger[];
}

export default function CreateBooking({
    tour: initialTour,
    tours,
    isAdmin = false,
    // date_start, // Đã xóa
    adults: initialAdults,
    children: initialChildren,
}: CreateBookingProps) {
    const isAdminMode = isAdmin || (Array.isArray(tours) && tours.length > 0);
    const [showImportDialog, setShowImportDialog] = useState(false);

    // --- 2. KHỞI TẠO FORM VỚI CẤU TRÚC NESTED ---
    const { data, setData, post, processing, errors, reset } =
        useForm<BookingFormData>({
            booking: {
                tour_id: initialTour?.id || tours?.[0]?.id || '',
                // date_start: date_start || new Date().toISOString().split('T')[0], // Đã xóa
                adults: initialAdults || 1,
                children: initialChildren || 0,
                client_name: '',
                client_phone: '',
                client_email: '',
            },
            passengers: [],
        });

    // Helper để update dữ liệu trong object 'booking' gọn gàng hơn
    const setBookingData = (key: keyof typeof data.booking, value: any) => {
        setData('booking', {
            ...data.booking,
            [key]: value,
        });
    };

    // --- LOGIC TÍNH TOÁN ---
    const selectedTour = useMemo(() => {
        if (initialTour) return initialTour;
        if (tours && data.booking.tour_id) {
            return tours.find((t) => t.id == Number(data.booking.tour_id));
        }
        return null;
    }, [data.booking.tour_id, initialTour, tours]);

    // --- FIX: ĐỒNG BỘ TOUR_ID ---
    useEffect(() => {
        if (initialTour?.id) {
            setBookingData('tour_id', initialTour.id);
        } else if (
            isAdminMode &&
            tours &&
            tours.length > 0 &&
            !data.booking.tour_id
        ) {
            setBookingData('tour_id', tours[0].id);
        }
    }, [initialTour, tours, isAdminMode]);

    // --- EFFECT: TỰ ĐỘNG CẬP NHẬT DANH SÁCH HÀNH KHÁCH ---
    // Lưu ý: Theo dõi data.booking.adults thay vì data.adults cũ
    useEffect(() => {
        const currentTotal = data.passengers.length;
        const targetTotal =
            (data.booking.adults || 0) + (data.booking.children || 0);

        if (currentTotal === targetTotal) return;

        let newPassengers = [...data.passengers];

        if (currentTotal < targetTotal) {
            // Thêm người
            const needed = targetTotal - currentTotal;
            for (let i = 0; i < needed; i++) {
                const currentAdults = newPassengers.filter(
                    (p) => p.type === 0,
                ).length;
                const type = currentAdults < data.booking.adults ? 0 : 1;
                newPassengers.push({ fullname: '', cccd: '', type, gender: 0 });
            }
        } else {
            // Xóa bớt
            newPassengers = newPassengers.slice(0, targetTotal);
            // Re-balance type
            let adultCount = 0;
            newPassengers = newPassengers.map((p) => {
                if (adultCount < data.booking.adults) {
                    adultCount++;
                    return { ...p, type: 0 };
                }
                return { ...p, type: 1 };
            });
        }
        setData('passengers', newPassengers);
    }, [data.booking.adults, data.booking.children]);

    // --- XỬ LÝ IMPORT TỪ EXCEL ---
    const handleExcelImport = (importedPassengers: Passenger[]) => {
        // Đếm số người lớn và trẻ em từ dữ liệu import
        const adultCount = importedPassengers.filter((p) => p.type === 0).length;
        const childCount = importedPassengers.filter((p) => p.type === 1 || p.type === 2).length;

        // Cập nhật cả booking và passengers cùng lúc
        setData({
            booking: {
                ...data.booking,
                adults: adultCount > 0 ? adultCount : 1,
                children: childCount,
            },
            passengers: importedPassengers,
        });

        toast.success(`Đã import ${importedPassengers.length} hành khách từ Excel!`);
    };

    // --- XỬ LÝ SUBMIT ---
    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!data.booking.tour_id) {
            toast.error('Vui lòng chọn Tour du lịch!');
            return;
        }

        const submitUrl = isAdminMode ? '/admin/bookings' : '/booking';

        // Transform nested data thành flat structure như backend mong đợi
        const flatData = {
            tour_id: Number(data.booking.tour_id), // Đảm bảo là number
            date_start: data.booking.date_start || new Date().toISOString().split('T')[0],
            adults: data.booking.adults,
            children: data.booking.children || 0,
            client_name: data.booking.client_name,
            client_phone: data.booking.client_phone,
            client_email: data.booking.client_email,
            passengers: data.passengers,
        };

        // Kiểm tra lại trước khi gửi
        if (!flatData.tour_id || flatData.tour_id === 0) {
            toast.error('Vui lòng chọn Tour du lịch!');
            return;
        }

        // Gửi data dạng flat trực tiếp
        router.post(submitUrl, flatData, {
            onSuccess: () => {
                toast.success('Tạo Booking thành công!');
                if (isAdminMode) reset();
            },
            onError: (err) => {
                console.error('Booking error:', err);
                // Hiển thị lỗi cụ thể nếu có
                if (err?.errors?.tour_id) {
                    toast.error(err.errors.tour_id);
                } else if (err?.message) {
                    toast.error(err.message);
                } else {
                toast.error('Vui lòng kiểm tra lại thông tin.');
                }
            },
        });
    };

    const totalPrice = selectedTour
        ? Number(selectedTour.price_adult) * data.booking.adults +
          Number(selectedTour.price_children) * data.booking.children
        : 0;

    return (
        <AppLayout
            breadcrumbs={[
                {
                    title: isAdminMode ? 'Quản trị' : 'Trang chủ',
                    href: isAdminMode ? '/dashboard' : '/',
                },
                ...(isAdminMode
                    ? [{ title: 'Quản lý Booking', href: '/admin/bookings' }]
                    : initialTour
                      ? [
                            {
                                title: initialTour.title,
                                href: `/tours/${initialTour.id}`,
                            },
                        ]
                      : []),
                { title: 'Tạo Booking', href: '#' },
            ]}
        >
            <Head
                title={
                    isAdmin
                        ? 'Thêm Booking Mới'
                        : `Đặt tour: ${selectedTour?.title || '...'}`
                }
            />

            <div className="min-h-screen bg-gray-50/50 py-8">
                <div className="mx-auto max-w-5xl px-4">
                    <div className="mb-6 flex items-center justify-between">
                        <Button
                            variant="ghost"
                            onClick={() => window.history.back()}
                            className="pl-0 hover:bg-transparent hover:text-blue-600"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {isAdminMode
                                ? 'Tạo Booking Mới (Admin)'
                                : 'Xác nhận đặt tour'}
                        </h1>
                    </div>

                    <form
                        onSubmit={submit}
                        className="grid gap-8 lg:grid-cols-3"
                    >
                        <div className="space-y-6 lg:col-span-2">
                            {/* 1. CHỌN TOUR */}
                            {isAdminMode && tours && (
                                <Card className="border-blue-100 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center text-blue-700">
                                            <CalendarIcon className="mr-2 h-5 w-5" />{' '}
                                            Chọn Tour Du Lịch
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <Label>
                                                Tour muốn đặt{' '}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </Label>
                                            <TourCombobox
                                                tours={tours}
                                                value={data.booking.tour_id}
                                                onChange={(tourId) =>
                                                    setBookingData('tour_id', tourId)
                                                }
                                                placeholder="Tìm và chọn tour..."
                                            />
                                            {/* Laravel Form Request nested rules trả về lỗi dạng 'booking.tour_id' */}
                                            {/* @ts-ignore */}
                                            {errors['booking.tour_id'] && (
                                                <p className="text-sm text-red-500">
                                                    {errors['booking.tour_id']}
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* 2. THÔNG TIN KHÁCH HÀNG */}
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle>
                                        Thông tin người liên hệ
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-5 sm:grid-cols-2">
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="client_name">
                                            Họ và tên{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="client_name"
                                            value={data.booking.client_name}
                                            onChange={(e) =>
                                                setBookingData(
                                                    'client_name',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Nguyễn Văn A"
                                            required
                                        />
                                        {/* @ts-ignore */}
                                        {errors['booking.client_name'] && (
                                            <p className="text-sm text-red-500">
                                                {errors['booking.client_name']}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="client_phone">
                                            Số điện thoại{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="client_phone"
                                            value={data.booking.client_phone}
                                            onChange={(e) =>
                                                setBookingData(
                                                    'client_phone',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="0912..."
                                            required
                                        />
                                        {/* @ts-ignore */}
                                        {errors['booking.client_phone'] && (
                                            <p className="text-sm text-red-500">
                                                {errors['booking.client_phone']}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="client_email">
                                            Email{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="client_email"
                                            type="email"
                                            value={data.booking.client_email}
                                            onChange={(e) =>
                                                setBookingData(
                                                    'client_email',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="example@email.com"
                                            required
                                        />
                                        {/* @ts-ignore */}
                                        {errors['booking.client_email'] && (
                                            <p className="text-sm text-red-500">
                                                {errors['booking.client_email']}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 3. SỐ LƯỢNG & NGÀY GIỜ (Đã bỏ Ngày Khởi Hành) */}
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle>Chi tiết chuyến đi</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Phần chọn ngày đã được xóa theo yêu cầu */}

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label>Người lớn</Label>
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        setBookingData(
                                                            'adults',
                                                            Math.max(
                                                                1,
                                                                data.booking
                                                                    .adults - 1,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="w-10 text-center text-lg font-bold">
                                                    {data.booking.adults}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        setBookingData(
                                                            'adults',
                                                            data.booking
                                                                .adults + 1,
                                                        )
                                                    }
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Trên 12 tuổi
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <Label>Trẻ em</Label>
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        setBookingData(
                                                            'children',
                                                            Math.max(
                                                                0,
                                                                data.booking
                                                                    .children -
                                                                    1,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="w-10 text-center text-lg font-bold">
                                                    {data.booking.children}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        setBookingData(
                                                            'children',
                                                            data.booking
                                                                .children + 1,
                                                        )
                                                    }
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                5 - 11 tuổi
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 4. DANH SÁCH HÀNH KHÁCH */}
                            <Card className="shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="flex items-center">
                                        <Users className="mr-2 h-5 w-5" /> Danh
                                        sách hành khách
                                    </CardTitle>
                                    <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-500">
                                        {data.passengers.length} người
                                    </span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowImportDialog(true)}
                                            className="border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800"
                                        >
                                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                                            Nhập từ Excel
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {data.passengers.map((pax, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col gap-3 rounded-lg border bg-gray-50/50 p-3 sm:flex-row"
                                        >
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                                                {index + 1}
                                            </div>

                                            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-12">
                                                {/* Họ và tên */}
                                                <div className="sm:col-span-4">
                                                    <Input
                                                        placeholder="Họ và tên"
                                                        value={pax.fullname}
                                                        onChange={(e) => {
                                                            const newPax = [
                                                                ...data.passengers,
                                                            ];
                                                            newPax[index].fullname = e.target.value;
                                                            setData('passengers', newPax);
                                                        }}
                                                        required
                                                    />
                                                    {/* @ts-ignore */}
                                                    {errors[`passengers.${index}.fullname`] && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {errors[`passengers.${index}.fullname`]}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* CCCD */}
                                                <div className="sm:col-span-3">
                                                    <Input
                                                        placeholder="Số CCCD"
                                                        value={pax.cccd || ''}
                                                        onChange={(e) => {
                                                            const newPax = [...data.passengers];
                                                            newPax[index].cccd = e.target.value;
                                                            setData('passengers', newPax);
                                                        }}
                                                    />
                                                    {/* @ts-ignore */}
                                                    {errors[`passengers.${index}.cccd`] && (
                                                        <p className="mt-1 text-xs text-red-500">
                                                            {errors[`passengers.${index}.cccd`]}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Giới tính */}
                                                <div className="sm:col-span-2">
                                                    <Select
                                                        value={pax.gender.toString()}
                                                        onValueChange={(val) => {
                                                            const newPax = [...data.passengers];
                                                            newPax[index].gender = parseInt(val);
                                                            setData('passengers', newPax);
                                                        }}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="0">Nam</SelectItem>
                                                            <SelectItem value="1">Nữ</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Tuổi (chỉ hiển thị nếu có) */}
                                                {pax.age && (
                                                    <div className="flex items-center justify-center text-sm text-gray-600 sm:col-span-1">
                                                        {pax.age} tuổi
                                                    </div>
                                                )}

                                                {/* Loại hành khách */}
                                                <div className={`flex items-center justify-center rounded border bg-white text-sm text-gray-600 ${pax.age ? 'sm:col-span-2' : 'sm:col-span-3'}`}>
                                                    <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                                                        pax.type === 0
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : pax.type === 1
                                                              ? 'bg-amber-100 text-amber-800'
                                                              : 'bg-pink-100 text-pink-800'
                                                    }`}>
                                                    {pax.type === 0
                                                        ? 'Người lớn'
                                                            : pax.type === 1
                                                              ? 'Trẻ em'
                                                              : 'Em bé'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {errors.passengers && (
                                        <p className="text-center text-sm text-red-500">
                                            {errors.passengers}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* --- CỘT PHẢI: TÓM TẮT --- */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-6 border-blue-200 shadow-md">
                                <CardHeader className="border-b border-blue-100 bg-blue-50/50 pb-4">
                                    <CardTitle>Tóm tắt đơn hàng</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5 pt-6">
                                    {selectedTour ? (
                                        <>
                                            <div className="aspect-video w-full overflow-hidden rounded-md bg-gray-200">
                                                <img
                                                    src={
                                                        selectedTour.thumbnail
                                                            ? `/storage/${selectedTour.thumbnail}`
                                                            : 'https://placehold.co/600x400?text=Chưa+có+ảnh'
                                                    }
                                                    alt={selectedTour.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <h3 className="text-lg leading-tight font-bold text-gray-900">
                                                {selectedTour.title}
                                            </h3>
                                            <div className="space-y-2 border-t pt-4 text-sm text-gray-600">
                                                <div className="flex justify-between">
                                                    <span>
                                                        Người lớn x{' '}
                                                        {data.booking.adults}
                                                    </span>
                                                    <span className="font-medium text-gray-900">
                                                        {(
                                                            Number(
                                                                selectedTour.price_adult,
                                                            ) *
                                                            data.booking.adults
                                                        ).toLocaleString()}{' '}
                                                        đ
                                                    </span>
                                                </div>
                                                {data.booking.children > 0 && (
                                                    <div className="flex justify-between">
                                                        <span>
                                                            Trẻ em x{' '}
                                                            {
                                                                data.booking
                                                                    .children
                                                            }
                                                        </span>
                                                        <span className="font-medium text-gray-900">
                                                            {(
                                                                Number(
                                                                    selectedTour.price_children,
                                                                ) *
                                                                data.booking
                                                                    .children
                                                            ).toLocaleString()}{' '}
                                                            đ
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="border-t pt-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-lg font-bold text-gray-700">
                                                        Tổng cộng
                                                    </span>
                                                    <span className="text-xl font-bold text-blue-600">
                                                        {totalPrice.toLocaleString()}{' '}
                                                        đ
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-right text-xs text-gray-400">
                                                    Đã bao gồm thuế & phí
                                                </p>
                                            </div>
                                            <Button
                                                type="submit"
                                                className="mt-2 w-full bg-blue-600 py-6 text-lg hover:bg-blue-700"
                                                disabled={processing}
                                            >
                                                {processing
                                                    ? 'Đang xử lý...'
                                                    : isAdminMode
                                                      ? 'Tạo Booking'
                                                      : 'Xác nhận đặt tour'}
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="py-10 text-center text-gray-500">
                                            <p>Vui lòng chọn tour để xem giá</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </form>
                </div>
            </div>

            {/* Dialog Import Excel */}
            <ExcelImportDialog
                open={showImportDialog}
                onOpenChange={setShowImportDialog}
                onImport={handleExcelImport}
            />
        </AppLayout>
    );
}
