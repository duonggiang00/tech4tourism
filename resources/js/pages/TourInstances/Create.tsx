import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import tourUrl from '@/routes/tours';
import { User, PageProps } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Users } from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface GuideWithStatus extends User {
    has_active_tour?: boolean;
}

interface TourTemplate {
    id: number;
    title: string;
    day: number;
    today: number;
    night: number;
    price_adult?: number;
    price_children?: number;
}

interface CreateProps {
    template: TourTemplate;
    guides: GuideWithStatus[];
}

const CurrencyInput = ({ value, onChange, placeholder, id }: { value: any, onChange: (val: string) => void, placeholder?: string, id?: string }) => {
    const [isFocused, setIsFocused] = useState(false);

    const displayValue = isFocused
        ? value
        : value
            ? Number(value).toLocaleString('vi-VN')
            : '';

    return (
        <Input
            id={id}
            type="text"
            value={displayValue}
            onChange={(e) => {
                const rawValue = e.target.value.replace(/\D/g, '');
                onChange(rawValue);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
        />
    );
};

export default function Create({ template, guides }: CreateProps) {
    const { props } = usePage<PageProps>();
    const flash = props.flash as any;

    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [timeValue, setTimeValue] = useState('08:00');

    const { data, setData, post, processing, errors } = useForm({
        date_start: '',
        limit: '20', // Default limit
        price_adult: template.price_adult ? Math.round(Number(template.price_adult)) : '',
        price_children: template.price_children ? Math.round(Number(template.price_children)) : '',
        status: '1',
        guide_ids: [] as number[],
    });

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.error('Validation errors:', errors);
            toast.error('Vui lòng kiểm tra lại thông tin trong form (ngày, giá, v.v...)');
        }
    }, [errors]);

    useEffect(() => {
        if (flash?.success_instance_id) {
            console.log('Success instance ID received:', flash.success_instance_id);
            setIsSuccessModalOpen(true);
        }
    }, [flash]);

    const handleCreateBooking = () => {
        setIsSuccessModalOpen(false);
        const instanceId = flash?.success_instance_id;
        if (instanceId) {
            router.visit(`/booking/create?tour_instance_id=${instanceId}`);
        } else {
            console.error('Missing instance ID for booking creation');
            toast.error('Không tìm thấy ID chuyến đi để tạo booking');
        }
    };

    const handleContinueCreating = () => {
        setIsSuccessModalOpen(false);
        setData('date_start', ''); // Reset date to prevent duplicate submission
        toast.info('Đã làm mới form. Bạn có thể tiếp tục tạo chuyến đi khác.');
    };

    const handleBackToTour = () => {
        setIsSuccessModalOpen(false);
        router.visit(tourUrl.show(template.id).url);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        console.log('Submitting tour instance...', data);

        post(`/tours/${template.id}/instances`, {
            preserveScroll: true,
            onSuccess: (page) => {
                console.log('Submission successful', page);
                const flash = page.props.flash as any;
                if (flash?.success_instance_id) {
                    setIsSuccessModalOpen(true);
                } else {
                    // Fallback purely on hook if this fails, but log it
                    console.warn('Success ID missing in immediate page prop, relying on useEffect');
                }
            },
            onError: (errors) => {
                console.error('Submission errors:', errors);
                toast.error('Có lỗi xảy ra: ' + (Object.values(errors)[0] || 'Vui lòng kiểm tra lại form'));
            },
        });
    };

    const toggleGuide = (guideId: number) => {
        setData(
            'guide_ids',
            data.guide_ids.includes(guideId)
                ? data.guide_ids.filter((id) => id !== guideId)
                : [...data.guide_ids, guideId],
        );
    };

    // Tính date_end dựa trên date_start và day
    const startDate = data.date_start ? new Date(data.date_start) : null;
    const dateEnd = startDate && !isNaN(startDate.getTime())
        ? new Date(
            startDate.getTime() +
            (template.day - 1) * 24 * 60 * 60 * 1000,
        )
            .toISOString()
            .split('T')[0]
        : '';

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Danh sách Tour', href: tourUrl.index().url },
                {
                    title: template.title,
                    href: tourUrl.show(template.id).url,
                },
                { title: 'Tạo Chuyến Đi Mới', href: '#' },
            ]}
        >
            <Head title={`Tạo chuyến đi: ${template.title}`} />

            <div className="min-h-screen bg-gray-50/50 py-8">
                <div className="mx-auto max-w-4xl px-4">
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
                            Tạo Chuyến Đi Mới
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Thông tin Template */}
                        <Card className="border-blue-100 bg-blue-50/50">
                            <CardHeader>
                                <CardTitle className="text-blue-700">
                                    Tour Template: {template.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-600">
                                            Thời gian:
                                        </span>{' '}
                                        {template.day} ngày {template.night} đêm
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thông tin Instance */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin Chuyến Đi</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Ngày khởi hành */}
                                <div className="space-y-2">
                                    <Label htmlFor="date_start">
                                        Ngày khởi hành{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={'outline'}
                                                        className={cn(
                                                            'w-full justify-start text-left font-normal',
                                                            !data.date_start && 'text-muted-foreground'
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {data.date_start && !isNaN(new Date(data.date_start).getTime()) ? (
                                                            format(new Date(data.date_start), 'dd/MM/yyyy')
                                                        ) : (
                                                            <span>Chọn ngày</span>
                                                        )}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <CalendarComponent
                                                        mode="single"
                                                        selected={data.date_start ? new Date(new Date(data.date_start).setHours(0, 0, 0, 0)) : undefined}
                                                        onSelect={(date) => {
                                                            if (date) {
                                                                const year = date.getFullYear();
                                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                                const day = String(date.getDate()).padStart(2, '0');
                                                                // Keep existing time or default
                                                                setData('date_start', `${year}-${month}-${day} ${timeValue}`);
                                                            } else {
                                                                setData('date_start', '');
                                                            }
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="w-[120px]">
                                            <div className="relative">
                                                <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                                <Input
                                                    type="time"
                                                    value={timeValue}
                                                    onChange={(e) => {
                                                        const newTime = e.target.value;
                                                        setTimeValue(newTime);
                                                        if (data.date_start) {
                                                            const datePart = data.date_start.split(' ')[0].split('T')[0];
                                                            setData('date_start', `${datePart} ${newTime}`);
                                                        }
                                                    }}
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {errors.date_start && (
                                        <p className="text-sm text-red-500">
                                            {errors.date_start}
                                        </p>
                                    )}
                                    {data.date_start && !isNaN(new Date(data.date_start).getTime()) && (
                                        <p className="text-sm text-blue-600">
                                            Khởi hành: <span className="font-medium">
                                                {format(new Date(data.date_start), "HH:mm, EEEE, 'ngày' dd 'tháng' MM 'năm' yyyy", { locale: vi })}
                                            </span>
                                        </p>
                                    )}
                                    {dateEnd && (
                                        <p className="text-sm text-gray-500">
                                            Ngày kết thúc dự kiến:{' '}
                                            <span className="font-medium">
                                                {new Date(
                                                    dateEnd,
                                                ).toLocaleDateString('vi-VN')}
                                            </span>
                                        </p>
                                    )}
                                </div>

                                {/* Số chỗ */}
                                <div className="space-y-2">
                                    <Label htmlFor="limit">
                                        Số chỗ tối đa (để trống = không giới
                                        hạn)
                                    </Label>
                                    <Input
                                        id="limit"
                                        type="number"
                                        min="1"
                                        value={data.limit}
                                        onChange={(e) =>
                                            setData('limit', e.target.value)
                                        }
                                        placeholder="Ví dụ: 30"
                                        className="max-w-xs"
                                    />
                                    {errors.limit && (
                                        <p className="text-sm text-red-500">
                                            {errors.limit}
                                        </p>
                                    )}
                                </div>

                                {/* Giá */}
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="price_adult">
                                            Giá người lớn (VNĐ)
                                        </Label>
                                        <CurrencyInput
                                            id="price_adult"
                                            value={data.price_adult}
                                            onChange={(val) => setData('price_adult', val)}
                                            placeholder="Ví dụ: 5000000"
                                        />
                                        {errors.price_adult && (
                                            <p className="text-sm text-red-500">
                                                {errors.price_adult}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="price_children">
                                            Giá trẻ em (VNĐ)
                                        </Label>
                                        <CurrencyInput
                                            id="price_children"
                                            value={data.price_children}
                                            onChange={(val) => setData('price_children', val)}
                                            placeholder="Ví dụ: 3000000"
                                        />
                                        {errors.price_children && (
                                            <p className="text-sm text-red-500">
                                                {errors.price_children}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Trạng thái */}
                                <div className="space-y-2">
                                    <Label htmlFor="status">Trạng thái</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(value) =>
                                            setData('status', value)
                                        }
                                    >
                                        <SelectTrigger className="max-w-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">
                                                Đã hủy
                                            </SelectItem>
                                            <SelectItem value="1">
                                                Sắp có
                                            </SelectItem>
                                            <SelectItem value="2">
                                                Đang diễn ra
                                            </SelectItem>
                                            <SelectItem value="3">
                                                Đã hoàn thành
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <p className="text-sm text-red-500">
                                            {errors.status}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hướng dẫn viên */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" /> Hướng dẫn
                                    viên
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {guides.length === 0 ? (
                                    <p className="text-sm text-gray-500">
                                        Chưa có hướng dẫn viên nào trong hệ
                                        thống.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {guides.map((guide) => (
                                            <div
                                                key={guide.id}
                                                className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-gray-50"
                                            >
                                                <Checkbox
                                                    id={`guide-${guide.id}`}
                                                    checked={data.guide_ids.includes(
                                                        guide.id,
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleGuide(guide.id)
                                                    }
                                                    disabled={
                                                        guide.has_active_tour &&
                                                        !data.guide_ids.includes(
                                                            guide.id,
                                                        )
                                                    }
                                                />
                                                <Label
                                                    htmlFor={`guide-${guide.id}`}
                                                    className="flex-1 cursor-pointer"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <span className="font-medium">
                                                                {guide.name}
                                                            </span>
                                                            {guide.has_active_tour &&
                                                                !data.guide_ids.includes(
                                                                    guide.id,
                                                                ) && (
                                                                    <span className="ml-2 rounded bg-orange-100 px-1.5 py-0.5 text-xs font-medium text-orange-700">
                                                                        Đã có
                                                                        tour
                                                                    </span>
                                                                )}
                                                        </div>
                                                        <span className="text-xs text-gray-500">
                                                            {guide.email}
                                                        </span>
                                                    </div>
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Footer */}
                        <div className="flex justify-end gap-4 border-t pt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="min-w-[200px]"
                            >
                                {processing
                                    ? 'Đang tạo...'
                                    : 'Tạo Chuyến Đi'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Success Modal */}
                <Dialog open={isSuccessModalOpen} onOpenChange={setIsSuccessModalOpen}>
                    <DialogContent className="max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Tạo chuyến đi thành công!</DialogTitle>
                            <DialogDescription>
                                Bạn muốn thực hiện thao tác gì tiếp theo với chuyến đi này?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button variant="outline" onClick={handleBackToTour}>
                                Về trang Tour
                            </Button>
                            <Button variant="secondary" onClick={handleContinueCreating}>
                                Tạo thêm chuyến khác
                            </Button>
                            <Button onClick={handleCreateBooking}>
                                Tạo Booking ngay
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
