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
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tourId: number;
    schedule?: any;
    onSuccess?: () => void;
}

interface ScheduleFormState {
    name: string;
    description: string;
    date: number | string;
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
}

// Định nghĩa kiểu cho object chứa lỗi
type FormErrors = Partial<Record<keyof ScheduleFormState, string>>;

export function FormTourScheduleDialog({
    open,
    onOpenChange,
    tourId,
    schedule,
    onSuccess,
}: Props) {
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState<ScheduleFormState>({
        name: '',
        description: '',
        date: 1,
        breakfast: false,
        lunch: true,
        dinner: true,
    });

    // State lưu lỗi validation
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (open) {
            // Reset lỗi khi mở dialog
            setErrors({});

            if (schedule) {
                setForm({
                    name: schedule.name,
                    description: schedule.description || '',
                    date: schedule.date,
                    breakfast: Boolean(schedule.breakfast),
                    lunch: Boolean(schedule.lunch),
                    dinner: Boolean(schedule.dinner),
                });
            } else {
                setForm({
                    name: '',
                    description: '',
                    date: 1,
                    breakfast: false,
                    lunch: true,
                    dinner: true,
                });
            }
        }
    }, [schedule, open]);

    // Hàm validate dữ liệu
    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        if (!form.name.trim()) {
            newErrors.name = 'Tên lịch trình không được để trống.';
            isValid = false;
        } else if (form.name.length > 200) {
            newErrors.name = 'Tên lịch trình không quá 200 ký tự.';
            isValid = false;
        }

        if (form.date === '' || Number(form.date) < 1) {
            newErrors.date = 'Ngày phải là số nguyên lớn hơn 0.';
            isValid = false;
        }

        // Validate mô tả nếu cần (ví dụ không quá dài)
        // if (form.description.length > 1000) { ... }

        setErrors(newErrors);
        return isValid;
    };

    // Hàm helper để xóa lỗi khi người dùng nhập lại
    const clearError = (field: keyof ScheduleFormState) => {
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = async () => {
        // 1. Gọi hàm validate trước khi xử lý
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
            // Hiển thị lỗi từ server nếu có
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
                    {/* TÊN LỊCH TRÌNH */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">
                            Tên lịch trình{' '}
                            <span className="text-red-500">*</span>
                        </label>
                        <Input
                            value={form.name}
                            onChange={(e) => {
                                setForm({ ...form, name: e.target.value });
                                clearError('name');
                            }}
                            placeholder="Ví dụ: Khởi hành - Tham quan Đà Lạt"
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

                    {/* MÔ TẢ */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Mô tả</label>
                        <Textarea
                            rows={4}
                            value={form.description}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    description: e.target.value,
                                })
                            }
                            placeholder="Mô tả chi tiết hành trình..."
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
