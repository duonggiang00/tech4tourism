
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
import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, CalendarIcon, Minus, Plus, User, Users } from 'lucide-react';
import { FormEventHandler, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

// Định nghĩa kiểu dữ liệu Tour
export interface Tour {
    id: number;
    title: string;
    price_adult: number;
    price_children: number;
    thumbnail: string;
    day: number;
}

interface CreateBookingProps {
    tour?: Tour;          // Dùng cho Public (Đã chọn tour trước)
    tours?: Tour[];       // Dùng cho Admin (List để chọn)
    isAdmin?: boolean;    // Cờ đánh dấu Admin
    // Các giá trị mặc định (nếu có)
    date_start?: string;
    adults?: number;
    children?: number;
}

interface Passenger {
    fullname: string;
    type: number;   // 0: Adult, 1: Child
    gender: number; // 0: Male, 1: Female
}

export default function CreateBooking({
    tour: initialTour,
    tours,
    isAdmin = false,
    date_start,
    adults: initialAdults,
    children: initialChildren,
}: CreateBookingProps) {
    
    // Auto-detect admin mode: nếu có tours array thì là admin
    const isAdminMode = isAdmin || (Array.isArray(tours) && tours.length > 0);
    
    // --- KHỞI TẠO FORM ---
    const { data, setData, post, processing, errors, reset } = useForm({
        tour_id: initialTour?.id || (tours?.[0]?.id || ''),
        date_start: date_start || new Date().toISOString().split('T')[0],
        adults: initialAdults || 1,
        children: initialChildren || 0,
        client_name: '',
        client_phone: '',
        client_email: '',
        passengers: [] as Passenger[],
    });

    // --- LOGIC TÍNH TOÁN TOUR HIỆN TẠI ---
    // Nếu là Admin thì lấy tour từ dropdown (tours), nếu là Khách thì lấy tour từ props (initialTour)
    const selectedTour = useMemo(() => {
        if (initialTour) return initialTour;
        if (tours && data.tour_id) {
            return tours.find((t) => t.id.toString() == data.tour_id.toString());
        }
        return null;
    }, [data.tour_id, initialTour, tours]);

    // --- EFFECT: TỰ ĐỘNG CẬP NHẬT DANH SÁCH HÀNH KHÁCH ---
    useEffect(() => {
        const currentTotal = data.passengers.length;
        const targetTotal = (data.adults || 0) + (data.children || 0);

        if (currentTotal === targetTotal) return;

        let newPassengers = [...data.passengers];

        if (currentTotal < targetTotal) {
            // Thêm người mới
            const needed = targetTotal - currentTotal;
            for (let i = 0; i < needed; i++) {
                // Logic thông minh: Đếm số người lớn hiện có để gán type mặc định
                const currentAdults = newPassengers.filter((p) => p.type === 0).length;
                // Nếu chưa đủ số lượng người lớn theo input -> Gán là Adult (0), ngược lại là Child (1)
                const type = currentAdults < data.adults ? 0 : 1;
                newPassengers.push({ fullname: '', type, gender: 0 });
            }
        } else {
            // Xóa bớt người thừa (cắt từ cuối)
            newPassengers = newPassengers.slice(0, targetTotal);
            
            // Cập nhật lại type cho đúng số lượng (Re-balance)
            // Ví dụ: Giảm người lớn thì phải chuyển type của người còn lại cho đúng
            let adultCount = 0;
            newPassengers = newPassengers.map(p => {
                if (adultCount < data.adults) {
                    adultCount++;
                    return { ...p, type: 0 };
                }
                return { ...p, type: 1 };
            });
        }
        setData('passengers', newPassengers);
    }, [data.adults, data.children]);


    // --- XỬ LÝ SUBMIT ---
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        // Chọn URL dựa trên quyền hạn
        const submitUrl = isAdminMode ? '/admin/bookings' : '/booking';
        
        post(submitUrl, {
            onSuccess: () => {
                toast.success('Tạo Booking thành công!');
                if(isAdminMode) reset(); // Reset form nếu là admin tạo tiếp
            },
            onError: () => toast.error('Vui lòng kiểm tra lại thông tin.'),
        });
    };

    // Tính tổng tiền
    const totalPrice = selectedTour
        ? (selectedTour.price_adult * data.adults) + (selectedTour.price_children * data.children)
        : 0;

    return (
        <AppLayout
            breadcrumbs={[
                { title: isAdminMode ? 'Quản trị' : 'Trang chủ', href: isAdminMode ? '/dashboard' : '/' },
                ...(isAdminMode 
                    ? [{ title: 'Quản lý Booking', href: '/admin/bookings' }] 
                    : initialTour ? [{ title: initialTour.title, href: `/tours/${initialTour.id}` }] : []
                ),
                { title: 'Tạo Booking', href: '#' },
            ]}
        >
            <Head title={isAdmin ? "Thêm Booking Mới" : `Đặt tour: ${selectedTour?.title || '...'}`} />

            <div className="min-h-screen bg-gray-50/50 py-8">
                <div className="mx-auto max-w-5xl px-4">
                    <div className="flex items-center justify-between mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => window.history.back()}
                            className="pl-0 hover:bg-transparent hover:text-blue-600"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {isAdminMode ? 'Tạo Booking Mới (Admin)' : 'Xác nhận đặt tour'}
                        </h1>
                    </div>

                    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-3">
                        {/* --- CỘT TRÁI: FORM NHẬP LIỆU --- */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* 1. CHỌN TOUR (CHỈ HIỆN KHI LÀ ADMIN) */}
                            {isAdminMode && tours && (
                                <Card className="border-blue-100 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center text-blue-700">
                                            <CalendarIcon className="w-5 h-5 mr-2"/> Chọn Tour Du Lịch
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <Label>Tour muốn đặt</Label>
                                            <Select 
                                                value={data.tour_id.toString()} 
                                                onValueChange={(val) => setData('tour_id', val)}
                                            >
                                                <SelectTrigger className="h-11">
                                                    <SelectValue placeholder="-- Chọn tour --" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {tours.map((t) => (
                                                        <SelectItem key={t.id} value={t.id.toString()}>
                                                            {t.title} ({Number(t.price_adult).toLocaleString()}đ)
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.tour_id && <p className="text-sm text-red-500">{errors.tour_id}</p>}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* 2. THÔNG TIN KHÁCH HÀNG */}
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle>Thông tin người liên hệ</CardTitle>
                                </CardHeader>
                                <CardContent className="grid gap-5 sm:grid-cols-2">
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="client_name">Họ và tên <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="client_name"
                                            value={data.client_name}
                                            onChange={(e) => setData('client_name', e.target.value)}
                                            placeholder="Nguyễn Văn A"
                                            required
                                        />
                                        {errors.client_name && <p className="text-sm text-red-500">{errors.client_name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="client_phone">Số điện thoại <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="client_phone"
                                            value={data.client_phone}
                                            onChange={(e) => setData('client_phone', e.target.value)}
                                            placeholder="0912..."
                                            required
                                        />
                                        {errors.client_phone && <p className="text-sm text-red-500">{errors.client_phone}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="client_email">Email <span className="text-red-500">*</span></Label>
                                        <Input
                                            id="client_email"
                                            type="email"
                                            value={data.client_email}
                                            onChange={(e) => setData('client_email', e.target.value)}
                                            placeholder="example@email.com"
                                            required
                                        />
                                        {errors.client_email && <p className="text-sm text-red-500">{errors.client_email}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 3. SỐ LƯỢNG & NGÀY GIỜ */}
                            <Card className="shadow-sm">
                                <CardHeader>
                                    <CardTitle>Chi tiết chuyến đi</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label>Ngày khởi hành</Label>
                                        <Input
                                            type="date"
                                            value={data.date_start}
                                            onChange={(e) => setData('date_start', e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                        {errors.date_start && <p className="text-sm text-red-500">{errors.date_start}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Người lớn */}
                                        <div className="space-y-3">
                                            <Label>Người lớn</Label>
                                            <div className="flex items-center gap-3">
                                                <Button type="button" variant="outline" size="icon"
                                                    onClick={() => setData('adults', Math.max(1, data.adults - 1))}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="w-10 text-center font-bold text-lg">{data.adults}</span>
                                                <Button type="button" variant="outline" size="icon"
                                                    onClick={() => setData('adults', data.adults + 1)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <p className="text-xs text-gray-500">Trên 12 tuổi</p>
                                        </div>

                                        {/* Trẻ em */}
                                        <div className="space-y-3">
                                            <Label>Trẻ em</Label>
                                            <div className="flex items-center gap-3">
                                                <Button type="button" variant="outline" size="icon"
                                                    onClick={() => setData('children', Math.max(0, data.children - 1))}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="w-10 text-center font-bold text-lg">{data.children}</span>
                                                <Button type="button" variant="outline" size="icon"
                                                    onClick={() => setData('children', data.children + 1)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <p className="text-xs text-gray-500">5 - 11 tuổi</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 4. DANH SÁCH HÀNH KHÁCH */}
                            <Card className="shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="flex items-center">
                                        <Users className="w-5 h-5 mr-2" /> Danh sách hành khách
                                    </CardTitle>
                                    <span className="text-sm text-gray-500">
                                        {data.passengers.length} người
                                    </span>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {data.passengers.map((pax, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row gap-3 p-3 border rounded-lg bg-gray-50/50">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-xs shrink-0">
                                                {index + 1}
                                            </div>
                                            
                                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3">
                                                {/* Tên */}
                                                <div className="sm:col-span-6">
                                                    <Input
                                                        placeholder="Họ và tên"
                                                        value={pax.fullname}
                                                        onChange={(e) => {
                                                            const newPax = [...data.passengers];
                                                            newPax[index].fullname = e.target.value;
                                                            setData('passengers', newPax);
                                                        }}
                                                        required
                                                    />
                                                </div>
                                                
                                                {/* Giới tính */}
                                                <div className="sm:col-span-3">
                                                    <Select
                                                        value={pax.gender.toString()}
                                                        onValueChange={(val) => {
                                                            const newPax = [...data.passengers];
                                                            newPax[index].gender = parseInt(val);
                                                            setData('passengers', newPax);
                                                        }}
                                                    >
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="0">Nam</SelectItem>
                                                            <SelectItem value="1">Nữ</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {/* Loại khách (Readonly) */}
                                                <div className="sm:col-span-3 flex items-center justify-center bg-white rounded border text-sm text-gray-600">
                                                    {pax.type === 0 ? 'Người lớn' : 'Trẻ em'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {errors.passengers && <p className="text-sm text-red-500 text-center">{errors.passengers}</p>}
                                </CardContent>
                            </Card>
                        </div>

                        {/* --- CỘT PHẢI: TÓM TẮT --- */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-6 shadow-md border-blue-200">
                                <CardHeader className="bg-blue-50/50 border-b border-blue-100 pb-4">
                                    <CardTitle>Tóm tắt đơn hàng</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5 pt-6">
                                    {selectedTour ? (
                                        <>
                                            {/* Ảnh Tour */}
                                            <div className="aspect-video w-full overflow-hidden rounded-md bg-gray-200">
                                                <img
                                                    src={selectedTour.thumbnail ? `/storage/${selectedTour.thumbnail}` : 'https://placehold.co/600x400?text=No+Image'}
                                                    alt={selectedTour.title}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x400?text=Error'; }}
                                                />
                                            </div>
                                            
                                            {/* Tên Tour */}
                                            <h3 className="font-bold text-lg leading-tight text-gray-900">
                                                {selectedTour.title}
                                            </h3>

                                            {/* Chi tiết giá */}
                                            <div className="space-y-2 border-t pt-4 text-sm text-gray-600">
                                                <div className="flex justify-between">
                                                    <span>Người lớn x {data.adults}</span>
                                                    <span className="font-medium text-gray-900">
                                                        {(Number(selectedTour.price_adult) * data.adults).toLocaleString()} đ
                                                    </span>
                                                </div>
                                                {data.children > 0 && (
                                                    <div className="flex justify-between">
                                                        <span>Trẻ em x {data.children}</span>
                                                        <span className="font-medium text-gray-900">
                                                            {(Number(selectedTour.price_children) * data.children).toLocaleString()} đ
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Tổng tiền */}
                                            <div className="border-t pt-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-lg font-bold text-gray-700">Tổng cộng</span>
                                                    <span className="text-xl font-bold text-blue-600">
                                                        {totalPrice.toLocaleString()} đ
                                                    </span>
                                                </div>
                                                <p className="text-xs text-right text-gray-400 mt-1">Đã bao gồm thuế & phí</p>
                                            </div>

                                            {/* Nút Submit */}
                                            <Button
                                                type="submit"
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6 mt-2"
                                                disabled={processing}
                                            >
                                                {processing ? 'Đang xử lý...' : (isAdmin ? 'Tạo Booking' : 'Xác nhận đặt tour')}
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="text-center py-10 text-gray-500">
                                            <p>Vui lòng chọn tour để xem giá</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}