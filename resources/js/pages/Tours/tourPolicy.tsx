import { Policy, TourPolicy } from '@/app';
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
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tourId: number;
    availablePolicies: Policy[]; // Master Data
    editingTourPolicy?: TourPolicy | null;
    onSuccess?: () => void;
}

export function TourPolicyDialog({
    open,
    onOpenChange,
    tourId,
    availablePolicies = [],
    editingTourPolicy,
    onSuccess,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        policy_id: '',
    
    });

    // Reset hoặc Fill form
    useEffect(() => {
        if (open) {
            if (editingTourPolicy) {
                // Mode Edit
                setForm({
                    policy_id: String(editingTourPolicy.policy_id),
                  
                });
            } else {
                // Mode Create
                setForm({ policy_id: ''});
            }
        }
    }, [open, editingTourPolicy]);

    // Khi chọn Policy từ dropdown -> Tự động điền nội dung gốc vào ô Content
    const handlePolicyChange = (policyId: string) => {
        const selected = availablePolicies.find(
            (p) => p.id === Number(policyId),
        );
        if (selected) {
            setForm({
                policy_id: policyId,
               
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.policy_id) return toast.error('Vui lòng chọn chính sách');
   

        setLoading(true);
        try {
            const payload = {
                policy_id: Number(form.policy_id),
    
            };

            if (editingTourPolicy) {
                await axios.put(
                    `tours/${tourId}/tourpolicies/${editingTourPolicy.id}`,
                    payload,
                );
                toast.success('Cập nhật chính sách thành công');
            } else {
                await axios.post(`/tours/${tourId}/tourpolicies`, payload);
                toast.success('Thêm chính sách thành công');
            }

            onSuccess?.();
            onOpenChange(false);
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || 'Có lỗi xảy ra';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý textarea tự co dãn (tùy chọn)
    const handleAutoResize = (e: any) => {
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {editingTourPolicy
                            ? 'Cập nhật chính sách'
                            : 'Thêm chính sách cho Tour'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Chọn loại chính sách */}
                    <div className="space-y-1">
                        <Label>
                            Loại chính sách{' '}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={form.policy_id}
                            onValueChange={handlePolicyChange}
                            // Nếu muốn cho phép đổi loại khi edit thì bỏ disabled
                            // disabled={!!editingTourPolicy}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="-- Chọn chính sách --" />
                            </SelectTrigger>
                            <SelectContent>
                                {availablePolicies.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>
                                        {p.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading}>
                            Lưu lại
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
