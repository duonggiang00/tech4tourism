import { Destination, Tour } from '@/types'; // Đảm bảo import đúng Types
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tourId: number;
    schedule?: any;
    onSuccess?: () => void;
    existingSchedules?: any[];

    // Props nhận dữ liệu từ cha
    tour: Tour;
    allDestinations: Destination[];
}

interface ScheduleFormState {
    name: string;
    description: string;
    destination_id: string; // Lưu ID địa điểm (dạng string để tương thích Select)
    date: number | string;
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
}

type FormErrors = Partial<Record<keyof ScheduleFormState, string>>;

export function FormTourScheduleDialog({
    open,
    onOpenChange,
    tourId,
    schedule,
    onSuccess,
    existingSchedules = [],
    tour,
    allDestinations = [],
}: Props) {
    const [loading, setLoading] = useState(false);

    // --- 1. LOGIC LỌC ĐỊA ĐIỂM CÙNG TỈNH ---
    const availableLocations = useMemo(() => {
        // Tìm địa điểm chính (gốc) của Tour để biết nó thuộc tỉnh nào
        // Lưu ý: tour.destination_id là ID địa điểm chính
        const mainDestination = allDestinations.find(
            (d) => d.id === tour.destination_id,
        );

        // Nếu không tìm thấy địa điểm gốc, trả về rỗng (hoặc trả về tất cả nếu muốn)
        if (!mainDestination) return [];

        // Lọc các địa điểm có cùng id_provinces với địa điểm chính
        return allDestinations.filter(
            (d) => d.id_provinces === mainDestination.id_provinces,
        );
    }, [tour.destination_id, allDestinations]);

    // --- 2. STATE FORM ---
    const [form, setForm] = useState<ScheduleFormState>({
        name: '',
        description: '',
        destination_id: '', // Mặc định rỗng
        date: 1,
        breakfast: false,
        lunch: true,
        dinner: true,
    });

    const [errors, setErrors] = useState<FormErrors>({});

    // --- 3. INIT DATA KHI MỞ DIALOG ---
    useEffect(() => {
        if (open) {
            setErrors({}); // Reset lỗi

            if (schedule) {
                // Mode: EDIT
                setForm({
                    name: schedule.name,
                    description: schedule.description || '',
                    // Chuyển ID sang string cho Select
                    destination_id: schedule.destination_id
                        ? String(schedule.destination_id)
                        : '',
                    date: schedule.date,
                    breakfast: Boolean(schedule.breakfast),
                    lunch: Boolean(schedule.lunch),
                    dinner: Boolean(schedule.dinner),
                });
            } else {
                // Mode: CREATE
                // Tự động tính ngày tiếp theo
                const maxDate =
                    existingSchedules.length > 0
                        ? Math.max(...existingSchedules.map((s) => s.date))
                        : 0;

                setForm({
                    name: '',
                    description: '',
                    destination_id: '',
                    date: maxDate + 1,
                    breakfast: false,
                    lunch: true,
                    dinner: true,
                });
            }
        }
    }, [schedule, open, existingSchedules]);

    // --- 4. VALIDATION ---
    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        if (!form.name.trim()) {
            newErrors.name = 'Tên hoạt động không được để trống.';
            isValid = false;
        }

        // Validate Destination ID (Bắt buộc)
        if (!form.destination_id) {
            newErrors.destination_id = 'Vui lòng chọn địa điểm.';
            isValid = false;
        }

        const inputDate = Number(form.date);
        if (form.date === '' || inputDate < 1) {
            newErrors.date = 'Ngày phải là số nguyên lớn hơn 0.';
            isValid = false;
        } else {
            // Check trùng ngày
            const isDuplicate = existingSchedules.some((item) => {
                // Nếu đang edit chính nó thì bỏ qua
                if (schedule && item.id === schedule.id) return false;
                return item.date === inputDate;
            });

            if (isDuplicate) {
                newErrors.date = `Ngày thứ ${inputDate} đã tồn tại trong lịch trình.`;
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const clearError = (field: keyof ScheduleFormState) => {
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    // --- 5. SUBMIT ---
    const handleSubmit = async () => {
        if (!validate()) {
            toast.error('Vui lòng kiểm tra lại thông tin nhập vào.');
            return;
        }

        setLoading(true);
        try {
            if (schedule) {
                await axios.put(
                    `/tours/${tourId}/schedules/${schedule.id}`,
                    form,
                );
                toast.success('Cập nhật lịch trình thành công!');
            } else {
                await axios.post(`/tours/${tourId}/schedules`, form);
                toast.success('Thêm lịch trình mới thành công!');
            }

            onSuccess?.();
            onOpenChange(false);
        } catch (err: any) {
            console.error('Failed to save schedule', err);
            const serverMsg =
                err.response?.data?.message ||
                'Không thể lưu lịch trình! Vui lòng thử lại.';
            toast.error(serverMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {schedule
                            ? 'Chỉnh sửa lịch trình'
                            : 'Thêm lịch trình mới'}
                    </DialogTitle>
                    <DialogDescription>
                        {schedule
                            ? 'Cập nhật thông tin chi tiết cho hoạt động trong ngày này.'
                            : 'Điền thông tin chi tiết để tạo ra một lịch trình mới cho tour.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-3 space-y-4">
                    {/* NGÀY THỨ MẤY */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">
                            Ngày thứ mấy <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="number"
                            min={1}
                            value={form.date}
                            onChange={(e) => {
                                const value = e.target.value;
                                setForm({
                                    ...form,
                                    date: value === '' ? '' : Number(value),
                                });
                                clearError('date');
                            }}
                            className={
                                errors.date
                                    ? 'border-red-500 focus-visible:ring-red-500'
                                    : ''
                            }
                        />
                        {errors.date && (
                            <span className="text-xs text-red-500">
                                {errors.date}
                            </span>
                        )}
                    </div>

                    {/* TÊN HOẠT ĐỘNG */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">
                            Tên hoạt động{' '}
                            <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={form.name}
                            onChange={(e) => {
                                setForm({ ...form, name: e.target.value });
                                clearError('name');
                            }}
                            placeholder="Ví dụ: Tham quan chợ Đà Lạt"
                            className={
                                errors.name
                                    ? 'border-red-500 focus-visible:ring-red-500'
                                    : ''
                            }
                        />
                        {errors.name && (
                            <span className="text-xs text-red-500">
                                {errors.name}
                            </span>
                        )}
                    </div>

                    {/* --- SELECT ĐỊA ĐIỂM (CÙNG TỈNH) --- */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">
                            Địa điểm (Cùng tỉnh){' '}
                            <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={form.destination_id}
                            onValueChange={(value) => {
                                const selectedDest = availableLocations.find(
                                    (d) => String(d.id) === value,
                                );
                                setForm({
                                    ...form,
                                    destination_id: value,
                                    name: selectedDest
                                        ? `Tham quan ${selectedDest.name}`
                                        : form.name,
                                    description: selectedDest
                                        ? selectedDest.description ||
                                        `Khám phá ${selectedDest.name}`
                                        : form.description,
                                });
                                clearError('destination_id');
                            }}
                        >
                            <SelectTrigger
                                className={
                                    errors.destination_id
                                        ? 'border-red-500'
                                        : ''
                                }
                            >
                                <SelectValue placeholder="Chọn địa điểm..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableLocations.length > 0 ? (
                                    availableLocations.map((dest) => (
                                        <SelectItem
                                            key={dest.id}
                                            value={String(dest.id)}
                                        >
                                            {dest.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="p-2 text-center text-sm text-gray-500">
                                        Không tìm thấy địa điểm khác cùng tỉnh.
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                        {errors.destination_id && (
                            <span className="text-xs text-red-500">
                                {errors.destination_id}
                            </span>
                        )}
                    </div>

                    {/* MÔ TẢ */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">
                            Mô tả chi tiết
                        </label>
                        <Textarea
                            rows={4}
                            value={form.description}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Mô tả các hoạt động cụ thể..."
                        />
                    </div>

                    {/* BỮA ĂN */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Bữa ăn bao gồm
                        </label>
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="chk-breakfast"
                                    checked={form.breakfast}
                                    onCheckedChange={(v) =>
                                        setForm({ ...form, breakfast: !!v })
                                    }
                                />
                                <label
                                    htmlFor="chk-breakfast"
                                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Sáng
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="chk-lunch"
                                    checked={form.lunch}
                                    onCheckedChange={(v) =>
                                        setForm({ ...form, lunch: !!v })
                                    }
                                />
                                <label
                                    htmlFor="chk-lunch"
                                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Trưa
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="chk-dinner"
                                    checked={form.dinner}
                                    onCheckedChange={(v) =>
                                        setForm({ ...form, dinner: !!v })
                                    }
                                />
                                <label
                                    htmlFor="chk-dinner"
                                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Tối
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading
                            ? 'Đang lưu...'
                            : schedule
                                ? 'Lưu thay đổi'
                                : 'Thêm lịch trình'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
