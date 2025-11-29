import { Category, Tour } from '@/app';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import tourUrl from '@/routes/tours';
import { useForm } from '@inertiajs/react';
import { UploadCloud, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type TourFormData = Omit<
    Tour,
    | 'id'
    | 'thumbnail'
    | 'category_id'
    | 'day'
    | 'night'
    | 'price_adult'
    | 'price_children'
> & {
    category_id: string | number;
    day: string | number;
    night: string | number;
    price_adult: string | number;
    price_children: string | number;
    thumbnail: File | string | null;
    _method?: string;
};

interface TourFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Tour;
    title: string;
    categories: Category[];
}

export function TourFormDialog({
    open,
    onOpenChange,
    initialData,
    title,
    categories = [],
}: TourFormDialogProps) {
    // 1. Thêm 'setError' vào destructuring để set lỗi thủ công
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
        setError,
    } = useForm<TourFormData>({
        category_id: '',
        title: '',
        status: 0,
        day: '',
        night: '',
        thumbnail: null,
        description: '',
        short_description: '',
        price_adult: '',
        price_children: '',
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            clearErrors();
            if (initialData) {
                // Fill dữ liệu khi Edit
                setData({
                    category_id: initialData.category_id,
                    title: initialData.title,
                    status: initialData.status,
                    day: initialData.day,
                    night: initialData.night,
                    thumbnail: null,
                    description: initialData.description,
                    short_description: initialData.short_description,
                    price_adult: initialData.price_adult,
                    price_children: initialData.price_children,
                });
                setImagePreview(initialData.thumbnail);
            } else {
                // Reset khi Create
                reset();
                setImagePreview(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    }, [initialData, open]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImagePreview(url);
            setData('thumbnail', file);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview(null);
        setData('thumbnail', null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleNumberChange = (field: keyof TourFormData, value: string) => {
        if (value === '') {
            setData(field, '');
        } else {
            setData(field, Number(value));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 2. Kiểm tra logic ngày đêm trước khi submit
        const days = Number(data.day);
        const nights = Number(data.night);

        if (Math.abs(days - nights) > 1) {
            const message =
                'Số ngày và đêm chỉ được chênh lệch tối đa 1 (VD: 3N2Đ hoặc 2N3Đ).';
            setError('day', message);
            setError('night', message);
            return; // Dừng submit
        }

        if (initialData) {
            // --- LOGIC UPDATE ---
            data._method = 'PUT'; // Giả lập PUT để upload file được
            post(tourUrl.update(initialData.id).url, {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
                forceFormData: true,
            });
        } else {
            // --- LOGIC CREATE ---
            post(tourUrl.store().url, {
                onSuccess: () => {
                    onOpenChange(false);
                    reset();
                },
                forceFormData: true,
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <Label htmlFor="category_id">Category</Label>
                            <Select
                                onValueChange={(value) =>
                                    setData('category_id', Number(value))
                                }
                                value={
                                    data.category_id
                                        ? String(data.category_id)
                                        : undefined
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={String(category.id)}
                                        >
                                            {category.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category_id && (
                                <span className="text-sm text-red-500">
                                    {errors.category_id}
                                </span>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="status">Trạng thái</Label>
                            <Select
                                onValueChange={(value) =>
                                    setData('status', Number(value))
                                }
                                value={String(data.status)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={'0'}>
                                        Hoạt động
                                    </SelectItem>
                                    <SelectItem value={'1'}>
                                        Không hoạt động
                                    </SelectItem>
                                    <SelectItem value={'2'}>Sắp có</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && (
                                <span className="text-sm text-red-500">
                                    {errors.status}
                                </span>
                            )}
                        </div>

                        <div className="col-span-2">
                            <Label htmlFor="title">Tour Name</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) =>
                                    setData('title', e.target.value)
                                }
                                required
                            />
                            {errors.title && (
                                <span className="text-sm text-red-500">
                                    {errors.title}
                                </span>
                            )}
                        </div>

                        <div className="col-span-2">
                            <Label>Thumbnail</Label>
                            <div className="mt-2">
                                {imagePreview ? (
                                    <div className="relative h-48 w-full overflow-hidden rounded-md border border-gray-200">
                                        <img
                                            src={imagePreview}
                                            alt="Thumbnail preview"
                                            className="h-full w-full object-cover"
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
                                                SVG, PNG, JPG or GIF
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
                                {errors.thumbnail && (
                                    <span className="text-sm text-red-500">
                                        {errors.thumbnail}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="col-span-2">
                            <Label htmlFor="description">Mô tả dài</Label>
                            <Textarea
                                id="description"
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

                        <div className="col-span-2">
                            <Label htmlFor="short_description">
                                Mô tả ngắn
                            </Label>
                            <Input
                                id="short_description"
                                value={data.short_description}
                                onChange={(e) =>
                                    setData('short_description', e.target.value)
                                }
                            />
                            {errors.short_description && (
                                <span className="text-sm text-red-500">
                                    {errors.short_description}
                                </span>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="day">Số ngày</Label>
                            <Input
                                id="day"
                                type="number"
                                value={data.day}
                                onChange={(e) =>
                                    handleNumberChange('day', e.target.value)
                                }
                                required
                                min="0"
                                step="0.5"
                            />
                            {errors.day && (
                                <span className="text-sm text-red-500">
                                    {errors.day}
                                </span>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="night">Số đêm</Label>
                            <Input
                                id="night"
                                type="number"
                                value={data.night}
                                onChange={(e) =>
                                    handleNumberChange('night', e.target.value)
                                }
                                required
                                min="0"
                                step="0.5"
                            />
                            {errors.night && (
                                <span className="text-sm text-red-500">
                                    {errors.night}
                                </span>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="price_adult">
                                Giá người lớn ($)
                            </Label>
                            <Input
                                id="price_adult"
                                type="number"
                                step="0.01"
                                value={data.price_adult}
                                onChange={(e) =>
                                    handleNumberChange(
                                        'price_adult',
                                        e.target.value,
                                    )
                                }
                                min="0"
                                required
                            />
                            {errors.price_adult && (
                                <span className="text-sm text-red-500">
                                    {errors.price_adult}
                                </span>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="price_children">
                                Giá trẻ em ($)
                            </Label>
                            <Input
                                id="price_children"
                                type="number"
                                step="0.01"
                                value={data.price_children}
                                onChange={(e) =>
                                    handleNumberChange(
                                        'price_children',
                                        e.target.value,
                                    )
                                }
                                min="0"
                                required
                            />
                            {errors.price_children && (
                                <span className="text-sm text-red-500">
                                    {errors.price_children}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? 'Saving...'
                                : initialData
                                  ? 'Update'
                                  : 'Create'}{' '}
                            Tour
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
