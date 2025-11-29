import { Category } from '@/app';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
import AppLayout from '@/layouts/app-layout';
import tourUrl from '@/routes/tours';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { CircleAlertIcon, UploadCloud, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface CreateProps {
    categories: Category[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Danh sách Tour',
        href: tourUrl.index().url,
    },
    {
        title: 'Tạo Tour Mới',
        href: tourUrl.create().url,
    },
];

export default function Create({ categories }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        category_id: '',
        title: '',
        status: 0,
        day: '',
        night: '',
        thumbnail: null as File | null,
        description: '',
        short_description: '',
        price_adult: '',
        price_children: '',
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handleNumberChange = (field: keyof typeof data, value: string) => {
        if (value === '') {
            setData(field, '');
        } else {
            setData(field, value); // Keep as string for input, converted by backend validation or cast before submit if needed
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(tourUrl.store().url, {
            forceFormData: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tạo Tour Mới" />
            <div className="m-4">
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-6 text-xl font-semibold text-gray-800">
                        Thông tin Tour
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Hiển thị lỗi chung nếu có */}
                        {Object.keys(errors).length > 0 && (
                            <Alert variant="destructive">
                                <CircleAlertIcon className="h-4 w-4" />
                                <AlertTitle>Lỗi!</AlertTitle>
                                <AlertDescription>
                                    Vui lòng kiểm tra lại thông tin bên dưới.
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Cột 1 */}
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="category_id">
                                        Danh mục <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        onValueChange={(value) =>
                                            setData('category_id', value)
                                        }
                                        value={data.category_id}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn danh mục" />
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
                                    <Label htmlFor="title">
                                        Tên Tour <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) =>
                                            setData('title', e.target.value)
                                        }
                                        placeholder="Nhập tên tour..."
                                    />
                                    {errors.title && (
                                        <span className="text-sm text-red-500">
                                            {errors.title}
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
                                            <SelectItem value={'2'}>
                                                Sắp có
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && (
                                        <span className="text-sm text-red-500">
                                            {errors.status}
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="day">
                                            Số ngày <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="day"
                                            type="number"
                                            value={data.day}
                                            onChange={(e) =>
                                                handleNumberChange(
                                                    'day',
                                                    e.target.value,
                                                )
                                            }
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
                                        <Label htmlFor="night">
                                            Số đêm <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="night"
                                            type="number"
                                            value={data.night}
                                            onChange={(e) =>
                                                handleNumberChange(
                                                    'night',
                                                    e.target.value,
                                                )
                                            }
                                            min="0"
                                            step="0.5"
                                        />
                                        {errors.night && (
                                            <span className="text-sm text-red-500">
                                                {errors.night}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Cột 2 */}
                            <div className="space-y-4">
                                <div>
                                    <Label>Ảnh đại diện</Label>
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
                                                            Click để tải lên
                                                        </span>
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        SVG, PNG, JPG hoặc GIF
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

                                <div className="grid grid-cols-2 gap-4">
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
                                        />
                                        {errors.price_children && (
                                            <span className="text-sm text-red-500">
                                                {errors.price_children}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Full width fields */}
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="short_description">
                                    Mô tả ngắn
                                </Label>
                                <Input
                                    id="short_description"
                                    value={data.short_description}
                                    onChange={(e) =>
                                        setData('short_description', e.target.value)
                                    }
                                    placeholder="Mô tả ngắn gọn về tour..."
                                />
                                {errors.short_description && (
                                    <span className="text-sm text-red-500">
                                        {errors.short_description}
                                    </span>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="description">
                                    Mô tả chi tiết
                                </Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Mô tả chi tiết về lịch trình, điểm đến..."
                                    rows={5}
                                />
                                {errors.description && (
                                    <span className="text-sm text-red-500">
                                        {errors.description}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Đang xử lý...' : 'Tạo Tour Mới'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
