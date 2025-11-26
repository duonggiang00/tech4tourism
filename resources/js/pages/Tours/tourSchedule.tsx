import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tourId: number;
    schedule?: any; // dùng khi edit
    onSuccess?: () => void;
}

export function FormTourScheduleDialog({
    open,
    onOpenChange,
    tourId,
    schedule,
    onSuccess,
}: Props) {
    const [form, setForm] = useState({
        name: '',
        description: '',
        date: 1,
        breakfast: false,
        lunch: true,
        dinner: true,
    });

    useEffect(() => {
        if (schedule) {
            // EDIT MODE
            setForm({
                name: schedule.name,
                description: schedule.description,
                date: schedule.date,
                breakfast: schedule.breakfast,
                lunch: schedule.lunch,
                dinner: schedule.dinner,
            });
        } else {
            // CREATE MODE
            setForm({
                name: '',
                description: '',
                date: 1,
                breakfast: false,
                lunch: true,
                dinner: true,
            });
        }
    }, [schedule, open]);

    /**
     * handleSubmit: tự động detect Create hoặc Update
     */
    const handleSubmit = async () => {
        try {
            if (schedule) {
                // 🟦 UPDATE MODE
                await axios.put(
                    `/tours/${tourId}/schedules/${schedule.id}`,
                    {
                        ...form,
                    },
                );
            } else {
                // 🟩 CREATE MODE
                await axios.post(`/tours/${tourId}/schedules`, {
                    ...form,
                });
            }

            onSuccess && onSuccess();
            onOpenChange(false);
        } catch (err) {
            console.error('Failed to save schedule', err);
            alert('Không thể lưu lịch trình!');
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
                </DialogHeader>

                <div className="mt-3 space-y-4">
                    <div>
                        <label className="text-sm font-medium">
                            Tên lịch trình
                        </label>
                        <Input
                            value={form.name}
                            onChange={(e) =>
                                setForm({ ...form, name: e.target.value })
                            }
                            placeholder="Ví dụ: Khởi hành - Tham quan Đà Lạt"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">
                            Ngày thứ mấy
                        </label>
                        <Input
                            type="number"
                            min={1}
                            value={form.date}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    date: Number(e.target.value),
                                })
                            }
                        />
                    </div>

                    <div>
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

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Bữa ăn</label>

                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={form.breakfast}
                                    onCheckedChange={(v) =>
                                        setForm({ ...form, breakfast: !!v })
                                    }
                                />
                                <span>Bữa sáng</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={form.lunch}
                                    onCheckedChange={(v) =>
                                        setForm({ ...form, lunch: !!v })
                                    }
                                />
                                <span>Bữa trưa</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={form.dinner}
                                    onCheckedChange={(v) =>
                                        setForm({ ...form, dinner: !!v })
                                    }
                                />
                                <span>Bữa tối</span>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit}>
                        {schedule ? 'Lưu thay đổi' : 'Thêm lịch trình'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
