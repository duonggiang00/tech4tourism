import ExcelImportDialog from '@/components/booking/ExcelImportDialog';
import TourCombobox from '@/components/booking/TourCombobox';
import TourTemplateCombobox from '@/components/booking/TourTemplateCombobox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

// --- Types ---
export interface Tour {
    id: number;
    title: string;
    price_adult?: number;
    price_children?: number;
    thumbnail: string;
    day: number;
}

export interface TourInstance {
    id: number;
    tour_template_id: number;
    date_start: string;
    date_end: string;
    limit: number | null;
    booked_count: number;
    price_adult: number | null;
    price_children: number | null;
    status: number;
    tourTemplate?: Tour;
}

interface CreateBookingProps {
    tour?: Tour;
    tourInstance?: TourInstance;
    tours?: Tour[];
    templates?: Array<Tour & { instances?: TourInstance[] }>;
    instances?: TourInstance[];
    isAdmin?: boolean;
    adults?: number;
    children?: number;
}

interface Passenger {
    fullname: string;
    age?: number | null;
    cccd?: string;
    phone?: string;
    request?: string;
    type: number;
    gender: number;
}

interface BookingFormData {
    booking: {
        tour_instance_id: number | string;
        tour_id: number | string;
        adults: number;
        children: number;
        client_name: string;
        client_phone: string;
        client_email: string;
    };
    passengers: Passenger[];
}

// --- HELPER FIX ẢNH 403 ---
const getImageUrl = (path: string | undefined) => {
    if (!path) return 'https://placehold.co/600x400?text=No+Image';
    if (path.startsWith('http')) return path;
    // Xóa dấu / ở đầu và chữ storage/ nếu đã có để tránh lặp
    const cleanPath = path.replace(/^\/?(storage\/)?/, '');
    return `/storage/${cleanPath}`;
};

export default function CreateBooking({
    tour: initialTour,
    tourInstance: initialInstance,
    tours,
    templates,
    instances,
    isAdmin = false,
    adults: initialAdults,
    children: initialChildren,
}: CreateBookingProps) {
    const isAdminMode = isAdmin || (Array.isArray(templates) && templates.length > 0) || (Array.isArray(instances) && instances.length > 0);
    const [showImportDialog, setShowImportDialog] = useState(false);

    // State quản lý việc chọn Template
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

    const { data, setData, post, processing, errors, reset } = useForm<BookingFormData>({
        booking: {
            tour_instance_id: initialInstance?.id || '',
            tour_id: initialTour?.id || '',
            adults: initialAdults || 1,
            children: initialChildren || 0,
            client_name: '',
            client_phone: '',
            client_email: '',
        },
        passengers: [],
    });

    // Helper update state an toàn
    const updateBookingField = (field: keyof BookingFormData['booking'], value: any) => {
        setData((prevData) => ({
            ...prevData,
            booking: {
                ...prevData.booking,
                [field]: value,
            },
        }));
    };

    const updatePassengers = (newPassengers: Passenger[]) => {
        setData((prevData) => ({
            ...prevData,
            passengers: newPassengers
        }));
    };

    // --- LOGIC LỌC INSTANCE ---
    // Khi chọn Template -> Lọc ra danh sách Instances thuộc Template đó
    const availableInstances = useMemo(() => {
        if (!isAdminMode) return instances || [];

        // Nếu đã chọn Template, chỉ hiện instance của template đó
        if (selectedTemplateId && templates) {
            const template = templates.find(t => t.id === Number(selectedTemplateId));
            return template?.instances || [];
        }

        // Mặc định hiện tất cả instances có sẵn
        return instances || [];
    }, [selectedTemplateId, templates, instances, isAdminMode]);

    // Tìm Instance đang được chọn để hiển thị thông tin
    const selectedInstance = useMemo(() => {
        const id = Number(data.booking.tour_instance_id);
        if (!id) return initialInstance || null;

        // Ưu tiên check initialInstance trước
        if (initialInstance && initialInstance.id === id) return initialInstance;

        // Tìm trong list đã lọc trước
        let found = availableInstances.find(i => i.id === id);
        if (found) return found;

        // Nếu không thấy, tìm trong toàn bộ instances
        if (instances) found = instances.find(i => i.id === id);
        if (found) return found;

        return null;
    }, [data.booking.tour_instance_id, availableInstances, instances, initialInstance]);

    // Tìm Tour để hiển thị (Thumbnail, Title)
    const displayTour = useMemo(() => {
        if (selectedInstance?.tourTemplate) return selectedInstance.tourTemplate;
        if (selectedTemplateId && templates) return templates.find(t => t.id === Number(selectedTemplateId));
        if (data.booking.tour_id && tours) return tours.find(t => t.id === Number(data.booking.tour_id));
        return initialTour;
    }, [selectedInstance, selectedTemplateId, templates, data.booking.tour_id, tours, initialTour]);

    // --- AUTO FILL PASSENGERS ---
    useEffect(() => {
        const currentTotal = data.passengers.length;
        const targetTotal = (data.booking.adults || 0) + (data.booking.children || 0);

        if (currentTotal === targetTotal) return;

        let newPassengers = [...data.passengers];
        if (currentTotal < targetTotal) {
            const needed = targetTotal - currentTotal;
            for (let i = 0; i < needed; i++) {
                const currentAdults = newPassengers.filter(p => p.type === 0).length;
                const type = currentAdults < data.booking.adults ? 0 : 1;
                newPassengers.push({ fullname: '', cccd: '', phone: '', request: '', type, gender: 0 });
            }
        } else {
            newPassengers = newPassengers.slice(0, targetTotal);
            let adultCount = 0;
            newPassengers = newPassengers.map(p => {
                if (adultCount < data.booking.adults) {
                    adultCount++;
                    return { ...p, type: 0 };
                }
                return { ...p, type: 1 };
            });
        }
        updatePassengers(newPassengers);
    }, [data.booking.adults, data.booking.children]);

    const handleExcelImport = (importedPassengers: Passenger[]) => {
        const adultCount = importedPassengers.filter((p) => p.type === 0).length;
        const childCount = importedPassengers.filter((p) => p.type === 1 || p.type === 2).length;
        setData(prev => ({
            ...prev,
            booking: {
                ...prev.booking,
                adults: adultCount || 1,
                children: childCount
            },
            passengers: importedPassengers
        }));
        toast.success(`Đã import ${importedPassengers.length} hành khách!`);
    };

    // --- SUBMIT ---
    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // 1. Validate Client
        if (!data.booking.tour_instance_id && !data.booking.tour_id) {
            toast.error('Vui lòng chọn Tour và Lịch khởi hành!');
            return;
        }

        const submitUrl = isAdminMode ? '/admin/bookings' : '/booking';

        // 2. Chuẩn bị dữ liệu gửi đi (Clean Data)
        const flatData: any = {
            adults: data.booking.adults,
            children: data.booking.children,
            client_name: data.booking.client_name,
            client_phone: data.booking.client_phone,
            client_email: data.booking.client_email,
            passengers: data.passengers,
        };

        // 3. Logic quan trọng: Ưu tiên gửi tour_instance_id
        if (data.booking.tour_instance_id) {
            flatData.tour_instance_id = Number(data.booking.tour_instance_id);
            // KHÔNG gửi tour_id nếu đã có instance để tránh conflict validation ở backend
            // Trừ khi backend bắt buộc cả 2, nhưng thường instance_id là đủ để suy ra tour
        } else if (data.booking.tour_id) {
            flatData.tour_id = Number(data.booking.tour_id);
        }

        console.log('Sending Data:', flatData);

        router.post(submitUrl, flatData, {
            onSuccess: () => {
                toast.success('Thành công!');
                if (isAdminMode) {
                    reset();
                    setSelectedTemplateId('');
                }
            },
            onError: (err: any) => {
                console.error(err);
                if (err.tour_id) toast.error(`Lỗi Tour: ${err.tour_id}`);
                else if (err.tour_instance_id) toast.error(`Lỗi Lịch trình: ${err.tour_instance_id}`);
                else toast.error('Vui lòng kiểm tra lại thông tin form');
            }
        });
    };

    // Tính tiền
    const totalPrice = useMemo(() => {
        if (!displayTour) return 0;
        const pAdult = selectedInstance?.price_adult ?? selectedInstance?.tourTemplate?.price_adult ?? displayTour.price_adult ?? 0;
        const pChild = selectedInstance?.price_children ?? selectedInstance?.tourTemplate?.price_children ?? displayTour.price_children ?? 0;
        return (Number(pAdult) * data.booking.adults) + (Number(pChild) * data.booking.children);
    }, [displayTour, selectedInstance, data.booking.adults, data.booking.children]);


    return (
        <AppLayout
            breadcrumbs={[
                { title: isAdminMode ? 'Quản trị' : 'Trang chủ', href: isAdminMode ? '/dashboard' : '/' },
                { title: 'Tạo Booking', href: '#' },
            ]}
        >
            <Head title="Tạo Booking" />

            <div className="min-h-screen bg-gray-50/50 py-4 lg:py-8">
                <div className="mx-auto max-w-5xl px-4">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <Button variant="ghost" onClick={() => window.history.back()} className="self-start sm:self-auto">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
                        </Button>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                            {isAdminMode ? 'Tạo Booking (Admin)' : 'Đặt tour'}
                        </h1>
                    </div>

                    <form onSubmit={submit} className="grid gap-6 lg:gap-8 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            {/* --- SECTION 1: CHỌN TOUR --- */}
                            {isAdminMode && (instances || templates || tours) && (
                                <Card className="border-blue-100 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="flex items-center text-blue-700">
                                            <CalendarIcon className="mr-2 h-5 w-5" /> Chọn Tour & Lịch Trình
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">

                                        {/* 1. Chọn Template Tour (Nếu có) */}
                                        {templates && templates.length > 0 && (
                                            <div className="space-y-2">
                                                <Label>Bước 1: Chọn Tour Template <span className="text-red-500">*</span></Label>
                                                <TourTemplateCombobox
                                                    templates={templates}
                                                    value={selectedTemplateId}
                                                    onChange={(val) => {
                                                        setSelectedTemplateId(String(val));
                                                        // Reset instance cũ khi chọn template mới
                                                        updateBookingField('tour_instance_id', '');
                                                        // KHÔNG update tour_id ở đây để tránh lỗi validation 'invalid id'
                                                        // Chỉ dùng state local để lọc danh sách instances bên dưới
                                                    }}
                                                    placeholder="Tìm tên tour..."
                                                />
                                            </div>
                                        )}

                                        {/* 2. Chọn Instance (Ngày khởi hành) */}
                                        {/* Hiển thị khi đã chọn Template HOẶC có sẵn danh sách instances */}
                                        {(availableInstances.length > 0) && (
                                            <div className="space-y-2">
                                                <Label>
                                                    {selectedTemplateId ? 'Bước 2: ' : ''}Chọn Ngày Khởi Hành <span className="text-red-500">*</span>
                                                </Label>
                                                <Select
                                                    value={String(data.booking.tour_instance_id || '')}
                                                    onValueChange={(val) => {
                                                        // Đây là ID quan trọng nhất cần gửi đi
                                                        updateBookingField('tour_instance_id', Number(val));
                                                    }}
                                                    disabled={!selectedTemplateId && templates && templates.length > 0}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={selectedTemplateId ? "Chọn ngày..." : "Vui lòng chọn Tour trước"} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableInstances.map((i) => (
                                                            <SelectItem key={i.id} value={String(i.id)}>
                                                                {new Date(i.date_start).toLocaleDateString('vi-VN')}
                                                                {i.tourTemplate ? ` - ${i.tourTemplate.title}` : ''}
                                                                {i.price_adult ? ` (${new Intl.NumberFormat('vi-VN').format(i.price_adult)}đ)` : ''}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {!data.booking.tour_instance_id && selectedTemplateId && (
                                                    <p className="text-sm text-red-500">Bạn phải chọn ngày khởi hành để tiếp tục.</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Fallback cho trường hợp dùng Tour ID trực tiếp (Cũ) */}
                                        {(!templates || templates.length === 0) && tours && tours.length > 0 && (
                                            <div className="space-y-2">
                                                <Label>Chọn Tour <span className="text-red-500">*</span></Label>
                                                <TourCombobox
                                                    tours={tours && tours.map(t => ({ ...t, price_adult: t.price_adult || 0, price_children: t.price_children || 0 }))}
                                                    value={data.booking.tour_id}
                                                    onChange={(val) => updateBookingField('tour_id', val)}
                                                    placeholder="Tìm tour..."
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* --- SECTION 2: THÔNG TIN KHÁCH --- */}
                            <Card>
                                <CardHeader><CardTitle>Thông tin liên hệ</CardTitle></CardHeader>
                                <CardContent className="grid gap-5 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <Label>Họ tên <span className="text-red-500">*</span></Label>
                                        <Input
                                            value={data.booking.client_name}
                                            onChange={(e) => updateBookingField('client_name', e.target.value)}
                                            required placeholder="Nguyễn Văn A"
                                        />
                                    </div>
                                    <div>
                                        <Label>Số điện thoại <span className="text-red-500">*</span></Label>
                                        <Input
                                            value={data.booking.client_phone}
                                            onChange={(e) => updateBookingField('client_phone', e.target.value)}
                                            required placeholder="09xxxx"
                                        />
                                    </div>
                                    <div>
                                        <Label>Email <span className="text-red-500">*</span></Label>
                                        <Input
                                            type="email"
                                            value={data.booking.client_email}
                                            onChange={(e) => updateBookingField('client_email', e.target.value)}
                                            required placeholder="email@example.com"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* --- SECTION 3: SỐ LƯỢNG --- */}
                            <Card>
                                <CardHeader><CardTitle>Số lượng khách</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <Label>Người lớn</Label>
                                        <div className="flex items-center gap-3 mt-2">
                                            <Button type="button" variant="outline" size="icon"
                                                onClick={() => updateBookingField('adults', Math.max(1, data.booking.adults - 1))}>
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="font-bold text-lg w-8 text-center">{data.booking.adults}</span>
                                            <Button type="button" variant="outline" size="icon"
                                                onClick={() => updateBookingField('adults', data.booking.adults + 1)}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Trẻ em</Label>
                                        <div className="flex items-center gap-3 mt-2">
                                            <Button type="button" variant="outline" size="icon"
                                                onClick={() => updateBookingField('children', Math.max(0, data.booking.children - 1))}>
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="font-bold text-lg w-8 text-center">{data.booking.children}</span>
                                            <Button type="button" variant="outline" size="icon"
                                                onClick={() => updateBookingField('children', data.booking.children + 1)}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* --- SECTION 4: DANH SÁCH --- */}
                            <Card>
                                <CardHeader className="flex flex-row justify-between items-center">
                                    <CardTitle>Danh sách hành khách</CardTitle>
                                    <Button type="button" variant="outline" size="sm" onClick={() => setShowImportDialog(true)} className="text-green-700 border-green-200 hover:bg-green-50">
                                        <FileSpreadsheet className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Excel</span>
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {data.passengers.map((pax, idx) => (
                                        <div key={idx} className="space-y-3">
                                            <div className="bg-gray-50 p-3 rounded-lg border grid gap-3 grid-cols-1 sm:grid-cols-12 items-start sm:items-center">
                                                <div className="sm:col-span-1 flex justify-between sm:justify-center font-bold text-gray-400">
                                                    <span>#{idx + 1}</span>
                                                    <span className={`sm:hidden text-xs px-2 py-1 rounded-full ${pax.type === 0 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {pax.type === 0 ? 'Người lớn' : 'Trẻ em'}
                                                    </span>
                                                </div>
                                                <div className="sm:col-span-4">
                                                    <Input
                                                        placeholder="Họ tên"
                                                        value={pax.fullname}
                                                        onChange={(e) => {
                                                            const next = [...data.passengers];
                                                            next[idx].fullname = e.target.value;
                                                            updatePassengers(next);
                                                        }}
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <Input
                                                        placeholder="CCCD"
                                                        value={pax.cccd || ''}
                                                        onChange={(e) => {
                                                            const next = [...data.passengers];
                                                            next[idx].cccd = e.target.value;
                                                            updatePassengers(next);
                                                        }}
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <Input
                                                        placeholder="Số điện thoại"
                                                        value={pax.phone || ''}
                                                        onChange={(e) => {
                                                            const next = [...data.passengers];
                                                            next[idx].phone = e.target.value;
                                                            updatePassengers(next);
                                                        }}
                                                    />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <Select
                                                        value={String(pax.gender)}
                                                        onValueChange={(v) => {
                                                            const next = [...data.passengers];
                                                            next[idx].gender = Number(v);
                                                            updatePassengers(next);
                                                        }}
                                                    >
                                                        <SelectTrigger><SelectValue placeholder="Giới tính" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="0">Nam</SelectItem>
                                                            <SelectItem value="1">Nữ</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="hidden sm:flex sm:col-span-1 justify-center">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${pax.type === 0 ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {pax.type === 0 ? 'NL' : 'TE'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <Textarea
                                                    placeholder="Yêu cầu đặc biệt (nếu có)"
                                                    value={pax.request || ''}
                                                    onChange={(e) => {
                                                        const next = [...data.passengers];
                                                        next[idx].request = e.target.value;
                                                        updatePassengers(next);
                                                    }}
                                                    className="min-h-[60px]"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        {/* --- CỘT PHẢI: BILLING --- */}
                        <div className="lg:col-span-1">
                            <Card className="sticky bottom-0 lg:top-6 border-blue-200 shadow-lg z-10">
                                <CardHeader className="bg-blue-50 border-b border-blue-100">
                                    <CardTitle>Tổng quan</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    {displayTour ? (
                                        <>
                                            <div className="hidden lg:block aspect-video bg-gray-200 rounded overflow-hidden">
                                                {/* FIX LỖI ẢNH 403 TẠI ĐÂY */}
                                                <img
                                                    src={getImageUrl(displayTour.thumbnail)}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        // Fallback nếu ảnh lỗi
                                                        e.currentTarget.src = 'https://placehold.co/600x400?text=Error+Loading';
                                                    }}
                                                />
                                            </div>
                                            <h3 className="font-bold text-lg lg:text-lg">{displayTour.title}</h3>

                                            {selectedInstance ? (
                                                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                                    <p>Khởi hành: <span className="font-semibold">{new Date(selectedInstance.date_start).toLocaleDateString('vi-VN')}</span></p>
                                                    {selectedInstance.limit && (
                                                        <p className="text-xs text-blue-600 mt-1">Còn nhận: {selectedInstance.limit - selectedInstance.booked_count} khách</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-red-500 italic bg-red-50 p-2 rounded">
                                                    Vui lòng chọn ngày khởi hành
                                                </div>
                                            )}

                                            <div className="border-t pt-4 space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span>Người lớn x {data.booking.adults}</span>
                                                    <span className="font-medium">
                                                        {(Number(selectedInstance?.price_adult || displayTour.price_adult || 0) * data.booking.adults).toLocaleString()} đ
                                                    </span>
                                                </div>
                                                {data.booking.children > 0 && (
                                                    <div className="flex justify-between">
                                                        <span>Trẻ em x {data.booking.children}</span>
                                                        <span className="font-medium">
                                                            {(Number(selectedInstance?.price_children || displayTour.price_children || 0) * data.booking.children).toLocaleString()} đ
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="border-t pt-4 flex justify-between items-center">
                                                <span className="font-bold text-lg">Tổng cộng</span>
                                                <span className="font-bold text-xl text-blue-600">{totalPrice.toLocaleString()} đ</span>
                                            </div>

                                            <Button type="submit" disabled={processing || !displayTour || !data.booking.tour_instance_id} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-lg py-6">
                                                {processing ? 'Đang xử lý...' : 'Xác nhận đặt tour'}
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            Vui lòng chọn tour để xem giá
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </form>
                </div>
            </div>

            <ExcelImportDialog
                open={showImportDialog}
                onOpenChange={setShowImportDialog}
                onImport={handleExcelImport}
            />
        </AppLayout>
    );
}