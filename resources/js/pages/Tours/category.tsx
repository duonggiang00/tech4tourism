import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import categoriesUrl from '@/routes/categories'; // Đảm bảo bạn đã import đúng route
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';


export interface Category {
    id: number;
    title: string;
    description: string;
}

interface CategoryFormData {
    title: string;
    description: string;
}

interface CategoryFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Category; // Nếu có cái này thì là Edit, không có là Create
    title: string;
}

export function CategoryFormDialog({
    open,
    onOpenChange,
    initialData,
    title,
}: CategoryFormDialogProps) {
    // Khởi tạo useForm
    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<CategoryFormData>({
            title: '',
            description: '',
        });

    // Reset form hoặc điền dữ liệu cũ khi mở Dialog
    useEffect(() => {
        if (open) {
            clearErrors();
            if (initialData) {
                // Logic cho Edit: Fill data
                setData({
                    title: initialData.title,
                    description: initialData.description || '',
                });
            } else {
                // Logic cho Create: Reset form
                reset();
            }
        }
    }, [open, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (initialData) {
            // --- LOGIC UPDATE (PUT) ---
            // Giả định route update là categories.update(id)
            put(categoriesUrl.update(initialData.id).url, {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        } else {
            // --- LOGIC CREATE (POST) ---
            post(categoriesUrl.store().url, {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Field: Title */}
                    <div className="space-y-1.5">
                        <Label htmlFor="title">Tên Danh Mục</Label>
                        <Input
                            id="title"
                            placeholder="Nhập tên danh mục..."
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            required
                        />
                        {errors.title && (
                            <span className="text-sm text-red-500">
                                {errors.title}
                            </span>
                        )}
                    </div>

                    {/* Field: Description */}
                    <div className="space-y-1.5">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                            id="description"
                            placeholder="Nhập mô tả..."
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            rows={4}
                        />
                        {errors.description && (
                            <span className="text-sm text-red-500">
                                {errors.description}
                            </span>
                        )}
                    </div>

                    {/* Footer Buttons */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? 'Đang lưu...'
                                : initialData
                                  ? 'Cập nhật'
                                  : 'Thêm mới'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
