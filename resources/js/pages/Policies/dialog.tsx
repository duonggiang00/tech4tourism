import { Policy } from '@/app';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import policyUrl from '@/routes/policies';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    policy?: Policy | null; // Nếu có policy -> Chế độ Sửa, ngược lại -> Thêm mới
}

export function PolicyFormDialog({ open, onOpenChange, policy }: Props) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm({
            title: '',
            content: '',
        });

    // Reset form khi đóng mở hoặc thay đổi policy
    useEffect(() => {
        if (open) {
            clearErrors();
            if (policy) {
                // Fill dữ liệu khi sửa
                setData({
                    title: policy.title,
                    content: policy.content,
                });
            } else {
                // Reset khi thêm mới
                reset();
            }
        }
    }, [open, policy]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(data);
        if (policy) {
            // --- UPDATE ---
            put(policyUrl.update(policy.id).url, {
                onSuccess: () => {
                    toast.success('Cập nhật chính sách thành công');
                    onOpenChange(false);
                    reset();
                },
                onError: () => {
                    toast.error('Có lỗi xảy ra khi cập nhật');
                },
            });
        } else {
            // --- CREATE ---
            post(policyUrl.store().url, {
                onSuccess: () => {
                    toast.success('Thêm chính sách mới thành công');
                    onOpenChange(false);
                    reset();
                },
                onError: () => {
                    toast.error('Có lỗi xảy ra khi thêm mới');
                },
            });
        }
    };

    // Hàm xử lý tự động dãn chiều cao
    const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        e.target.style.height = 'auto'; // Reset height để tính toán lại scrollHeight khi xóa bớt text
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {policy
                            ? 'Chỉnh sửa Chính sách'
                            : 'Thêm Chính sách mới'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">
                            Tiêu đề <span className="text-red-500">*</span>
                        </Label>
                        {/* Sử dụng Textarea thay cho Input để hỗ trợ xuống dòng tự động */}
                        <Textarea
                            id="title"
                            rows={1}
                            value={data.title}
                            onChange={(e) => {
                                setData('title', e.target.value);
                                handleAutoResize(e);
                            }}
                            onInput={(e: any) => handleAutoResize(e)}
                            placeholder="Nhập tiêu đề chính sách..."
                            className={`min-h-[40px] w-full resize-none overflow-hidden ${
                                errors.title ? 'border-red-500' : ''
                            }`}
                        />
                        {errors.title && (
                            <p className="text-sm text-red-500">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="content">
                            Nội dung <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="content"
                            rows={5}
                            value={data.content}
                            onChange={(e) => {
                                setData('content', e.target.value);
                                handleAutoResize(e);
                            }}
                            onInput={(e: any) => handleAutoResize(e)}
                            placeholder="Nhập nội dung chi tiết..."
                            className={`w-full resize-none overflow-hidden ${
                                errors.content ? 'border-red-500' : ''
                            }`}
                        />
                        {errors.content && (
                            <p className="text-sm text-red-500">
                                {errors.content}
                            </p>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                        >
                            Hủy bỏ
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? 'Đang lưu...'
                                : policy
                                  ? 'Cập nhật'
                                  : 'Lưu lại'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
