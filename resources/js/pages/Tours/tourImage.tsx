import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { ImagePlus, UploadCloud, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface TourImageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tourId: number;
    onSuccess?: () => void; // Prop này nhận hàm fetchImages từ cha
}

interface ImageFormData {
    image: File | null;
    alt: string;
    order: number | string;
}

export function TourImageDialog({
    open,
    onOpenChange,
    tourId,
    onSuccess,
}: TourImageDialogProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');

    const { data, setData, post, processing, errors, reset, clearErrors } =
        useForm<ImageFormData>({
            image: null,
            alt: '',
            order: 0,
        });
    
    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // Reset form mỗi khi mở/đóng Dialog
    useEffect(() => {
        if (!open) {
            reset();
            setImagePreview(null);
            clearErrors();
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [open]);

    // Xử lý khi chọn file
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            // 1. Validate loại file
            if (!file.type.startsWith('image/')) {
                setError('image', 'Vui lòng chọn file định dạng hình ảnh.');
                return;
            }

            // 2. Validate kích thước (Ví dụ: 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('image', 'Kích thước ảnh không được vượt quá 5MB.');
                return;
            }

            // 3. Tạo preview và set data
            clearErrors('image');
            const url = URL.createObjectURL(file);
            setImagePreview(url);
            setFileName(file.name);
            setData('image', file);

            // Tự động điền Alt text bằng tên file nếu Alt đang trống (Optional UX)
            if (!data.alt) {
                const nameWithoutExt = file.name
                    .split('.')
                    .slice(0, -1)
                    .join('.');
                setData('alt', nameWithoutExt);
            }
        }
    };

    // Xử lý khi xóa ảnh đã chọn
    const handleRemoveImage = () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview); // Clean up ngay lập tức
        setImagePreview(null);
        setFileName('');
        setData('image', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

   const handleSubmit = (e: React.FormEvent) => {
       e.preventDefault();

       post(`/tours/${tourId}/images`, {
           forceFormData: true,
           preserveScroll: true, // Giữ vị trí cuộn trang
           onSuccess: () => {
               onOpenChange(false);
               if (onSuccess) onSuccess();
           },
           onError: (err) => {
               console.error('Upload error:', err);
           },
       });
   };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ImagePlus className="h-5 w-5 text-blue-600" />
                        Thêm hình ảnh Tour
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* 1. Khu vực Upload Ảnh */}
                    <div>
                        <Label>
                            Hình ảnh <span className="text-red-500">*</span>
                        </Label>
                        <div className="mt-2">
                            {imagePreview ? (
                                <div className="relative h-48 w-full overflow-hidden rounded-md border border-gray-200">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="h-full w-full bg-gray-50 object-contain"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white shadow-sm transition-colors hover:bg-red-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:bg-gray-100"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="mb-2 h-8 w-8 text-gray-400" />
                                        <p className="mb-2 text-sm text-gray-500">
                                            <span className="font-semibold">
                                                Click to upload
                                            </span>
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            PNG, JPG, GIF (Max 5MB)
                                        </p>
                                    </div>
                                </div>
                            )}

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            {errors.image && (
                                <span className="mt-1 block text-sm text-red-500">
                                    {errors.image}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {/* 2. Alt Text */}
                        <div className="col-span-2">
                            <Label htmlFor="alt">Mô tả ảnh (Alt)</Label>
                            <Input
                                id="alt"
                                placeholder="Ví dụ: Cảnh đẹp..."
                                value={data.alt}
                                onChange={(e) => setData('alt', e.target.value)}
                            />
                            {errors.alt && (
                                <span className="text-sm text-red-500">
                                    {errors.alt}
                                </span>
                            )}
                        </div>

                        {/* 3. Order */}
                        <div className="col-span-1">
                            <Label htmlFor="order">Thứ tự</Label>
                            <Input
                                id="order"
                                type="number"
                                min="0"
                                value={data.order}
                                onChange={(e) =>
                                    setData(
                                        'order',
                                        e.target.value === ''
                                            ? ''
                                            : Number(e.target.value),
                                    )
                                }
                            />
                            {errors.order && (
                                <span className="text-sm text-red-500">
                                    {errors.order}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Đang tải lên...' : 'Lưu hình ảnh'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
