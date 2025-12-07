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
import AppLayout from '@/layouts/app-layout';
import tourUrl from '@/routes/tours';
import { User } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Trash2, Users } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
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
    night: number;
    price_adult?: number;
    price_children?: number;
}

interface TourInstance {
    id: number;
    tour_template_id: number;
    date_start: string;
    date_end: string;
    limit: number | null;
    booked_count: number;
    price_adult: number | null;
    price_children: number | null;
    status: number;
}

interface EditProps {
    instance: TourInstance;
    template: TourTemplate;
    guides: GuideWithStatus[];
    currentGuideIds: number[];
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

export default function Edit({ instance, template, guides, currentGuideIds }: EditProps) {
    const [timeValue, setTimeValue] = useState(() => {
        if (instance.date_start) {
            const date = new Date(instance.date_start);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        }
        return '08:00';
    });
    const { data, setData, put, delete: destroy, processing, errors } = useForm({
        date_start: instance.date_start,
        limit: instance.limit?.toString() || '',
        price_adult: instance.price_adult?.toString() || '',
        price_children: instance.price_children?.toString() || '',
        status: instance.status.toString(),
        guide_ids: currentGuideIds,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        put(`/tour-instances/${instance.id}`, {
            onError: (errors) => {
                console.error('Errors:', errors);
                toast.error('Có lỗi xảy ra khi cập nhật chuyến đi');
            },
        });
    };

    const handleDelete = () => {
        if (confirm('Bạn có chắc chắn muốn xóa chuyến đi này không? Hành động này không thể hoàn tác.')) {
            destroy(`/tour-instances/${instance.id}`, {
                onError: (errors) => {
                    toast.error('Không thể xóa chuyến đi (có thể đã có booking)');
                }
            });
        }
    };

    const toggleGuide = (guideId: number) => {
        setData(
            'guide_ids',
            data.guide_ids.includes(guideId)
                ? data.guide_ids.filter((id) => id !== guideId)
                : [...data.guide_ids, guideId],
        );
    };

    // Tính date_end dự kiến
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
                { title: `Chỉnh sửa chuyến đi #${instance.id}`, href: '#' },
            ]}
        >
            <Head title={`Chỉnh sửa chuyến đi: ${template.title}`} />

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
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Xóa Chuyến Đi
                            </Button>
                        </div>
                    </div>
                    <h1 className="mb-6 text-2xl font-bold text-gray-800">
                        Chỉnh sửa Chuyến Đi #{instance.id}
                    </h1>

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
                                                        selected={data.date_start ? new Date(data.date_start) : undefined}
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
                                    <div className="text-xs text-gray-500">
                                        Đã đặt: {instance.booked_count} khách
                                    </div>
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
                                    viên (Lưu ý: chưa cập nhật logic xóa/thêm chi tiết trong prototype này, chỉ có thể thay đổi assignment)
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
                                    ? 'Đang lưu...'
                                    : 'Lưu thay đổi'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
