import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import tourUrl from '@/routes/tours'; // SỬA: Dùng route tour (số ít)
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import {
    ArrowLeft,
    Clock,
    DollarSign,
    MapIcon,
    MapPin,
    Pencil,
    Plus,
    Trash2,
    Users,
} from 'lucide-react';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { TourFormDialog } from './dialog';
import { TourImageDialog } from './tourImage';

interface Category {
    id: number;
    title: string;
}

interface Tour {
    id: number;
    category_id: number;
    title: string;
    status: number;
    day: number;
    night: number;
    thumbnail: string;
    description: string;
    short_description: string;
    price_adult: number;
    price_children: number;
    highlights?: string[] | null;
    included?: string[] | null;
    start_date?: string;
    end_date?: string;
    destination?: string;
    capacity?: number;
}

interface TourImage {
    id: number;
    tour_id: number;
    img_url: string;
    alt: string;
    order: number;
}

interface TourDetailProps {
    tour: Tour;
    categories: Category[];
}

interface TourSchedule {
    id: number;
    tour_id: number;
    name: string;
    description: string;
    date: number;
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
}

export default function TourDetail({ tour, categories }: TourDetailProps) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const [galleryImages, setGalleryImages] = useState<TourImage[]>([]);
    const [addImageOpen, setAddImageOpen] = useState(false);
    const fetchImages = () => {
        if (tour.id) {
            axios
                .get(`/tours/${tour.id}/images`)
                .then((response) => {
                    setGalleryImages(response.data);
                })
                .catch((error) => {
                    console.error('Failed to fetch tour images:', error);
                });
        }
    };
    const [schedules, setSchedules] = useState<TourSchedule[]>([]);

    useEffect(() => {
        if (tour.id) {
            fetchImages();
            axios
                .get(`/tours/${tour.id}/schedules`)
                .then((response) => {
                    const sortedSchedules = response.data.sort(
                        (a: TourSchedule, b: TourSchedule) => a.date - b.date,
                    );
                    setSchedules(sortedSchedules);
                })
                .catch((error) =>
                    console.error('Failed to fetch schedules:', error),
                );
        }
    }, [tour.id]);

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            {
                title: 'Danh Sách Tour',
                href: tourUrl.index().url,
            },
            {
                title: `Chi tiết: ${tour.title}`,
                href: tourUrl.show(tour.id).url,
            },
        ],
        [tour.id, tour.title],
    );

    const onBack = () => {
        router.visit(tourUrl.index().url);
    };

    const onDelete = (id: number) => {
        router.delete(tourUrl.destroy(id).url);
    };

    const getStatusColor = (status: number) => {
        switch (status) {
            case 0:
                return 'bg-green-100 text-green-800 hover:bg-green-200';
            case 1:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
            case 2:
                return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: number) => {
        switch (status) {
            case 0:
                return 'Hoạt động';
            case 1:
                return 'Không hoạt động';
            case 2:
                return 'Sắp có';
            default:
                return 'Không xác định';
        }
    };

    const confirmDelete = () => {
        onDelete(tour.id);
        setDeleteDialogOpen(false);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen bg-gray-50 p-8">
                <Head title={`Chi tiết: ${tour.title}`} />

                <div className="mx-auto max-w-6xl">
                    <div className="mb-6">
                        <Button
                            variant="ghost"
                            onClick={onBack}
                            className="mb-4 pl-0 hover:bg-transparent hover:text-blue-600"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại danh sách
                        </Button>

                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                                <div className="mb-2 flex items-center gap-3">
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        {tour.title}
                                    </h2>
                                    <Badge
                                        className={getStatusColor(tour.status)}
                                    >
                                        {getStatusLabel(tour.status)}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setEditDialogOpen(true)}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Sửa
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => setDeleteDialogOpen(true)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Xóa
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Nội dung chi tiết tour */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Cột Chính */}
                        <div className="space-y-6 lg:col-span-2">
                            <Card className="overflow-hidden">
                                <CardContent className="p-0">
                                    {/* Ảnh Thumbnail Chính */}
                                    <img
                                        src={
                                            tour.thumbnail ||
                                            'https://placehold.co/600x400?text=No+Image'
                                        }
                                        alt={tour.title}
                                        className="block h-auto w-full"
                                    />

                                    {/* 5. Phần hiển thị Gallery Ảnh Phụ */}
                                    <div className="border-t bg-gray-50 p-4">
                                        {/* 3. Tiêu đề và nút thêm ảnh */}
                                        <div className="mb-3 flex items-center justify-between">
                                            <h4 className="text-sm font-semibold text-gray-700">
                                                Thư viện ảnh
                                            </h4>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-1 text-xs"
                                                onClick={() =>
                                                    setAddImageOpen(true)
                                                }
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Thêm ảnh
                                            </Button>
                                        </div>

                                        {galleryImages.length > 0 ? (
                                            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                                                {galleryImages.map(
                                                    (img, index) => (
                                                        <div
                                                            key={
                                                                img.id || index
                                                            }
                                                            className="group aspect-square cursor-pointer overflow-hidden rounded-md border border-gray-200"
                                                        >
                                                            <img
                                                                src={
                                                                    img.img_url.startsWith(
                                                                        'http',
                                                                    )
                                                                        ? img.img_url
                                                                        : `/storage/${img.img_url}`
                                                                }
                                                                alt={
                                                                    img.alt ||
                                                                    `Gallery ${index}`
                                                                }
                                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                            />
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        ) : (
                                            <div className="py-4 text-center text-sm text-gray-500">
                                                Chưa có ảnh phụ nào.
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6">
                                        <h3 className="mb-3 text-xl font-semibold text-gray-900">
                                            Mô tả chi tiết
                                        </h3>
                                        <p className="leading-relaxed whitespace-pre-line text-gray-600">
                                            {tour.description}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Cột Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Thông tin Tour</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <InfoItem
                                        icon={
                                            <DollarSign className="h-5 w-5 text-blue-600" />
                                        }
                                        bg="bg-blue-100"
                                        label="Giá vé"
                                        value={
                                            <div className="flex flex-col gap-1">
                                                <span>
                                                    Người lớn:{' '}
                                                    {new Intl.NumberFormat('en-US', {
                                                        style: 'currency',
                                                        currency: 'USD',
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }).format(tour.price_adult)}
                                                </span>
                                                <span>
                                                    Trẻ em:{' '}
                                                    {new Intl.NumberFormat('en-US', {
                                                        style: 'currency',
                                                        currency: 'USD',
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }).format(tour.price_children)}
                                                </span>
                                            </div>
                                        }
                                    />
                                    <InfoItem
                                        icon={
                                            <Clock className="h-5 w-5 text-purple-600" />
                                        }
                                        bg="bg-purple-100"
                                        label="Thời gian"
                                        value={`${tour.day} ngày / ${tour.night} đêm`}
                                    />
                                    <InfoItem
                                        icon={
                                            <Users className="h-5 w-5 text-green-600" />
                                        }
                                        bg="bg-green-100"
                                        label="Sức chứa"
                                        value={`${tour.capacity || 'N/A'} người`}
                                    />
                                    <InfoItem
                                        icon={
                                            <MapPin className="h-5 w-5 text-orange-600" />
                                        }
                                        bg="bg-orange-100"
                                        label="Địa điểm"
                                        value={
                                            tour.destination ||
                                            'Đang cập nhật...'
                                        }
                                    />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapIcon className="h-5 w-5 text-blue-600" />
                                        Lịch trình chi tiết
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {schedules.length > 0 ? (
                                        <div className="relative ml-3 space-y-8 border-l-2 border-blue-100 py-2">
                                            {schedules.map(
                                                (schedule, index) => (
                                                    <div
                                                        key={schedule.id}
                                                        className="relative pl-8"
                                                    >
                                                        {/* Dấu chấm tròn trên dòng kẻ */}
                                                        <div className="absolute top-1 -left-[9px] h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow-sm"></div>

                                                        <h4 className="mb-1 text-lg font-semibold text-gray-900">
                                                            Ngày {schedule.date}
                                                            : {schedule.name}
                                                        </h4>
                                                        <p className="leading-relaxed whitespace-pre-line text-gray-600">
                                                            {
                                                                schedule.description
                                                            }
                                                        </p>
                                                        <div className="mt-2 flex gap-3 text-sm text-gray-500">
                                                            <h4>Bữa ăn: </h4>
                                                            {schedule.breakfast ? (
                                                                <span className="flex items-center gap-1">
                                                                    ☕ Sáng
                                                                </span>
                                                            ) : (
                                                                ''
                                                            )}
                                                            {schedule.lunch ? (
                                                                <span className="flex items-center gap-1">
                                                                    🍽️ Trưa
                                                                </span>
                                                            ) : (
                                                                ''
                                                            )}
                                                            {schedule.dinner ? (
                                                                <span className="flex items-center gap-1">
                                                                    🌙 Tối
                                                                </span>
                                                            ) : (
                                                                ''
                                                            )}
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-gray-500 italic">
                                            Chưa có lịch trình chi tiết cho tour
                                            này.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Dialog Edit */}
                    <TourFormDialog
                        open={editDialogOpen}
                        onOpenChange={setEditDialogOpen}
                        initialData={tour}
                        title="Chỉnh sửa Tour"
                        categories={categories || []}
                    />

                    <TourImageDialog
                        open={addImageOpen}
                        onOpenChange={setAddImageOpen}
                        tourId={tour.id}
                    />

                    <AlertDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Xóa Tour</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Bạn có chắc chắn muốn xóa tour "{tour.title}
                                    "? Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={confirmDelete}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Xóa
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </AppLayout>
    );
}

function InfoItem({
    icon,
    bg,
    label,
    value,
}: {
    icon: any;
    bg: string;
    label: string;
    value: ReactNode;
}) {
    return (
        <div className="flex items-center gap-3">
            <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}
            >
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <div className="font-medium text-gray-900">{value}</div>
            </div>
        </div>
    );
}
