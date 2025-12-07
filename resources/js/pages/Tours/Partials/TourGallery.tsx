import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TourGalleryProps } from '@/types';
import { Plus, X } from 'lucide-react';

interface LocalProps {
    tour: TourGalleryProps['tour'];
    images: TourGalleryProps['images'];
    onAddImage?: () => void;
    onDeleteImage?: (id: number) => void;
}

export default function TourGallery({
    tour,
    images,
    onAddImage,
    onDeleteImage,
}: LocalProps) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <img
                    src={
                        tour.thumbnail ||
                        'https://placehold.co/600x400?text=No+Image'
                    }
                    alt={tour.title}
                    className="block h-auto max-h-[400px] w-full object-cover"
                />
                <div className="border-t bg-gray-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-700">
                            Thư viện ảnh
                        </h4>
                        {onAddImage && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 text-xs"
                                onClick={onAddImage}
                            >
                                <Plus className="h-3.5 w-3.5" /> Thêm ảnh
                            </Button>
                        )}
                    </div>
                    {images.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                            {images.map((img, index) => (
                                <div
                                    key={img.id || index}
                                    className="group relative aspect-square cursor-pointer overflow-hidden rounded-md border border-gray-200"
                                >
                                    <img
                                        src={
                                            img.img_url.startsWith('http')
                                                ? img.img_url
                                                : `/storage/${img.img_url}`
                                        }
                                        alt={img.alt || `Gallery ${index}`}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    {onDeleteImage && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteImage(img.id);
                                            }}
                                            className="absolute top-1 right-1 hidden h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md group-hover:flex hover:bg-red-600"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-4 text-center text-sm text-gray-500">
                            Chưa có ảnh phụ nào.
                        </div>
                    )}
                </div>
                <div className="p-6">
                    <h3 className="mb-3 text-xl font-semibold text-gray-900">
                        Mô tả ngắn
                    </h3>
                    <p className="leading-relaxed whitespace-pre-line text-gray-600">
                        {tour.short_description}
                    </p>
                </div>
                <div className="p-6">
                    <h3 className="mb-3 text-xl font-semibold text-gray-900">
                        Mô tả chi tiết
                    </h3>
                    <div
                        className="prose max-w-none text-gray-600" // Thêm class 'prose' nếu đã cài tailwind typography
                        dangerouslySetInnerHTML={{ __html: tour.description }}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
