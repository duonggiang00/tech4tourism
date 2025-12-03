import { TripAssignment, User } from '@/app';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import axios from 'axios';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tourId: number;
    allUsers: User[]; // Danh sách tất cả user để chọn
    currentAssignments: TripAssignment[]; // Danh sách đã gán để loại trừ
    onSuccess: () => void;
}

export function GuideAssignmentDialog({
    open,
    onOpenChange,
    tourId,
    allUsers,
    currentAssignments,
    onSuccess,
}: Props) {
    const [userId, setUserId] = useState<string>('');
    const [status, setStatus] = useState<string>('1'); // Mặc định 1: Đang hoạt động
    const [loading, setLoading] = useState(false);

    // Lọc ra những user chưa được gán vào tour này
    const availableUsers = useMemo(() => {
        const assignedIds = currentAssignments.map((a) => a.user_id);
        return allUsers.filter((u) => !assignedIds.includes(u.id));
    }, [allUsers, currentAssignments]);

    const handleSubmit = async () => {
        if (!userId) {
            toast.error('Vui lòng chọn hướng dẫn viên.');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`/tours/${tourId}/assignments`, {
                user_id: userId,
                status: status,
            });
            toast.success('Đã thêm hướng dẫn viên!');
            onSuccess();
            onOpenChange(false);
            setUserId(''); // Reset form
        } catch (error) {
            toast.error('Có lỗi xảy ra khi thêm hướng dẫn viên.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Phân công Hướng dẫn viên</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Chọn Hướng dẫn viên</Label>
                        <Select onValueChange={setUserId} value={userId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn nhân viên..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableUsers.length > 0 ? (
                                    availableUsers.map((u) => (
                                        <SelectItem
                                            key={u.id}
                                            value={String(u.id)}
                                        >
                                            {u.name} ({u.email})
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="p-2 text-center text-sm text-gray-500">
                                        Hết nhân viên khả dụng.
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Trạng thái</Label>
                        <Select onValueChange={setStatus} value={status}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Chờ xác nhận</SelectItem>
                                <SelectItem value="1">
                                    Đang hoạt động
                                </SelectItem>
                                <SelectItem value="2">Hoàn thành</SelectItem>
                                <SelectItem value="3">Đã hủy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Lưu'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
