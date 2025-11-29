import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { ImagePlus, UploadCloud, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface TourImageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tourId: number;
    onSuccess?: () => void;
}

// Thay đổi interface data để chứa mảng file
interface MultiImageFormData {
    images: File[];
}

export function TourImageDialog({
    open,
    onOpenChange,
    tourId,
    onSuccess,
}: TourImageDialogProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State quản lý danh sách preview URLs
    const [previews, setPreviews] = useState<string[]>([]);

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<MultiImageFormData>({
            images: [],
        });

    // Cleanup URL object khi component unmount hoặc previews thay đổi
    useEffect(() => {
        return () => {
            previews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [previews]);

    // Reset form khi đóng/mở dialog
    useEffect(() => {
        if (!open) {
            reset();
            setPreviews([]);
            clearErrors();
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [open]);

    // Xử lý khi chọn NHIỀU file
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);

            // 1. Validate (chỉ lấy ảnh và < 5MB)
            const validFiles: File[] = [];
            const newPreviews: string[] = [];

            newFiles.forEach((file) => {
                if (!file.type.startsWith('image/')) return;
                if (file.size > 5 * 1024 * 1024) return; // Skip file > 5MB

                validFiles.push(file);
                newPreviews.push(URL.createObjectURL(file));
            });

            if (validFiles.length === 0) {
                toast.error('Vui lòng chọn file ảnh hợp lệ và nhỏ hơn 5MB');
                return;
            }

            // Gộp file mới vào danh sách cũ (nếu muốn cho chọn thêm nhiều lần)
            // Hoặc thay thế hoàn toàn: setData('images', validFiles);
            // Ở đây tôi làm logic gộp thêm file:
            setData('images', [...data.images, ...validFiles]);
            setPreviews([...previews, ...newPreviews]);

            // Clear input value để cho phép chọn lại file trùng tên nếu cần
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Xóa một ảnh khỏi danh sách chờ upload
    const handleRemoveImage = (index: number) => {
        const newImages = [...data.images];
        const newPreviews = [...previews];

        // Revoke URL để tránh memory leak
        URL.revokeObjectURL(newPreviews[index]);

        newImages.splice(index, 1);
        newPreviews.splice(index, 1);

        setData('images', newImages);
        setPreviews(newPreviews);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.images.length === 0) {
            toast.error('Vui lòng chọn ít nhất một hình ảnh.');
            return;
        }

        post(`/tours/${tourId}/images`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                onOpenChange(false);
                toast.success('Thêm hình ảnh thành công!');
                if (onSuccess) onSuccess();
            },
            onError: (err) => {
                console.error('Upload error:', err);
                toast.error('Có lỗi xảy ra khi tải ảnh lên.');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ImagePlus className="h-5 w-5 text-blue-600" />
                        Thêm hình ảnh Tour (Nhiều ảnh)
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Khu vực Upload */}
                    <div>
                        <Label>
                            Hình ảnh <span className="text-red-500">*</span>
                        </Label>

                        {/* Nút bấm chọn file */}
                        <div
                            className="mt-2 flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <UploadCloud className="mb-2 h-8 w-8 text-gray-400" />
                            <p className="text-sm font-semibold text-gray-500">
                                Click để chọn nhiều ảnh
                            </p>
                            <p className="text-xs text-gray-400">
                                (Giữ Ctrl/Shift để chọn nhiều file)
                            </p>
                        </div>

                        {/* Input ẩn có thuộc tính multiple */}
                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />

                        {/* Hiển thị lỗi chung nếu có */}
                        {errors.images && (
                            <span className="mt-1 block text-sm text-red-500">
                                {errors.images}
                            </span>
                        )}
                    </div>

                    {/* Danh sách Preview (Grid) */}
                    {previews.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {previews.map((src, index) => (
                                <div
                                    key={index}
                                    className="group relative aspect-video overflow-hidden rounded-md border"
                                >
                                    <img
                                        src={src}
                                        alt={`Preview ${index}`}
                                        className="h-full w-full object-cover"
                                    />
                                    {/* Nút xóa từng ảnh */}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white opacity-90 shadow-sm transition-all hover:bg-red-600"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                    <div className="absolute right-0 bottom-0 left-0 truncate bg-black/50 px-2 py-1 text-[10px] text-white">
                                        {data.images[index]?.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer Buttons */}
                    <div className="mt-4 flex justify-end gap-2 border-t pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || data.images.length === 0}
                        >
                            {processing
                                ? 'Đang tải lên...'
                                : `Lưu ${data.images.length} hình ảnh`}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
