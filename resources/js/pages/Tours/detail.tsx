import { Category, Tour, TourImage, TourSchedule } from '@/app';
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
import tourUrl from '@/routes/tours';
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
    X,
} from 'lucide-react';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { TourFormDialog } from './dialog';
import { TourImageDialog } from './tourImage';
import { FormTourScheduleDialog } from './tourSchedule';

interface TourDetailProps {
    tour: Tour;
    categories: Category[];
}

export default function TourDetail({ tour, categories }: TourDetailProps) {
    // --- State: Dialogs Visibility ---
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteTourDialogOpen, setDeleteTourDialogOpen] = useState(false);
    const [addImageOpen, setAddImageOpen] = useState(false);
    const [addScheduleOpen, setAddScheduleOpen] = useState(false);

    // --- State: Data ---
    const [galleryImages, setGalleryImages] = useState<TourImage[]>([]);
    const [schedules, setSchedules] = useState<TourSchedule[]>([]);

    // --- State: Selection for Actions ---
    const [editSchedule, setEditSchedule] = useState<TourSchedule | null>(null);
    const [deleteSchedule, setDeleteSchedule] = useState<TourSchedule | null>(
        null,
    );
    const [deleteImageId, setDeleteImageId] = useState<number | null>(null); // New: State để xóa ảnh bằng Dialog

    const currentCategory = categories.find((c) => c.id === tour.category_id);

    // --- Fetch Data ---
    const fetchImages = () => {
        if (!tour.id) return;
        axios
            .get(`/tours/${tour.id}/images`)
            .then((response) => setGalleryImages(response.data))
            .catch((error) =>
                console.error('Failed to fetch tour images:', error),
            );
    };

    const fetchSchedules = () => {
        if (!tour.id) return;
        axios
            .get(`/tours/${tour.id}/schedules`)
            .then((response) => setSchedules(response.data))
            .catch((error) =>
                console.error('Failed to fetch schedules:', error),
            );
    };

    useEffect(() => {
        if (tour.id) {
            fetchImages();
            fetchSchedules();
        }
    }, [tour.id]);

    // --- Handlers ---
    const onConfirmDeleteImage = () => {
        if (!deleteImageId) return;
        axios
            .delete(`/tours/${tour.id}/images/${deleteImageId}`)
            .then(() => {
                setGalleryImages((prev) =>
                    prev.filter((img) => img.id !== deleteImageId),
                );
                setDeleteImageId(null);
            })
            .catch((error) => {
                console.error(error);
                alert('Xóa ảnh thất bại!'); // Có thể thay bằng Toast notification
                setDeleteImageId(null);
            });
    };

    const onConfirmDeleteSchedule = () => {
        if (!deleteSchedule) return;
        axios
            .delete(`/tours/${tour.id}/schedules/${deleteSchedule.id}`)
            .then(() => {
                setSchedules((prev) =>
                    prev.filter((s) => s.id !== deleteSchedule.id),
                );
                setDeleteSchedule(null);
            })
            .catch(() => alert('Xoá lịch trình thất bại'));
    };

    const onConfirmDeleteTour = () => {
        router.delete(tourUrl.destroy(tour.id).url);
        setDeleteTourDialogOpen(false);
    };

    // --- Utilities ---
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: 'Danh Sách Tour', href: tourUrl.index().url },
            {
                title: `Chi tiết: ${tour.title}`,
                href: tourUrl.show(tour.id).url,
            },
        ],
        [tour.id, tour.title],
    );

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="min-h-screen bg-gray-50 p-8">
                <Head title={`Chi tiết: ${tour.title}`} />

                <div className="mx-auto max-w-6xl">
                    {/* Header Section */}
                    <div className="mb-6">
                        <Button
                            variant="ghost"
                            onClick={() => router.visit(tourUrl.index().url)}
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
                                <h4 className="text-gray-400">
                                    {currentCategory
                                        ? currentCategory.title
                                        : 'Chưa phân loại'}
                                </h4>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setEditDialogOpen(true)}
                                >
                                    <Pencil className="mr-2 h-4 w-4" /> Sửa
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() =>
                                        setDeleteTourDialogOpen(true)
                                    }
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Xóa
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* LEFT COLUMN: Images & Description */}
                        <div className="space-y-6 lg:col-span-2">
                            <Card className="overflow-hidden">
                                <CardContent className="p-0">
                                    {/* Main Thumbnail */}
                                    <img
                                        src={
                                            tour.thumbnail ||
                                            'https://placehold.co/600x400?text=No+Image'
                                        }
                                        alt={tour.title}
                                        className="block h-auto max-h-[400px] w-full object-cover"
                                    />

                                    {/* Gallery Section */}
                                    <div className="border-t bg-gray-50 p-4">
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
                                                <Plus className="h-3.5 w-3.5" />{' '}
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
                                                            className="group relative aspect-square cursor-pointer overflow-hidden rounded-md border border-gray-200"
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
                                                            {/* Delete Image Button */}
                                                            <button
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    setDeleteImageId(
                                                                        img.id,
                                                                    );
                                                                }}
                                                                className="absolute top-1 right-1 hidden h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md group-hover:flex hover:bg-red-600"
                                                                title="Xóa ảnh"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
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

                                    {/* Description */}
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

                        {/* RIGHT COLUMN: Info & Schedules */}
                        <div className="space-y-6">
                            {/* Tour Info Card */}
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
                                                    {tour.price_adult?.toLocaleString()}{' '}
                                                    đ
                                                </span>
                                                <span>
                                                    Trẻ em:{' '}
                                                    {tour.price_children?.toLocaleString()}{' '}
                                                    đ
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

                            {/* Schedule Card */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <MapIcon className="h-5 w-5 text-blue-600" />
                                        Lịch trình
                                    </CardTitle>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 gap-1 text-xs"
                                        onClick={() => setAddScheduleOpen(true)}
                                    >
                                        <Plus className="h-3.5 w-3.5" /> Thêm
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {schedules.length > 0 ? (
                                        <div className="relative ml-3 space-y-8 border-l-2 border-blue-100 py-2">
                                            {schedules.map((schedule) => (
                                                <div
                                                    key={schedule.id}
                                                    className="group relative pl-6"
                                                >
                                                    {/* Dot */}
                                                    <div className="absolute top-1 -left-[9px] h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow-sm"></div>

                                                    {/* Actions */}
                                                    <div className="absolute top-0 right-0 hidden gap-2 rounded-md bg-white/80 p-1 backdrop-blur-sm group-hover:flex">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-6 w-6"
                                                            onClick={() =>
                                                                setEditSchedule(
                                                                    schedule,
                                                                )
                                                            }
                                                        >
                                                            <Pencil className="h-3.5 w-3.5 text-blue-600" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-6 w-6"
                                                            onClick={() =>
                                                                setDeleteSchedule(
                                                                    schedule,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                                        </Button>
                                                    </div>

                                                    <h4 className="mb-1 text-sm font-bold text-gray-900">
                                                        Ngày {schedule.date}:{' '}
                                                        {schedule.name}
                                                    </h4>
                                                    <p className="line-clamp-3 text-sm leading-relaxed whitespace-pre-line text-gray-600">
                                                        {schedule.description}
                                                    </p>

                                                    {/* Meals Badges */}
                                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                                                        {schedule.breakfast && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="px-1 py-0 font-normal"
                                                            >
                                                                ☕ Sáng
                                                            </Badge>
                                                        )}
                                                        {schedule.lunch && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="px-1 py-0 font-normal"
                                                            >
                                                                🍽️ Trưa
                                                            </Badge>
                                                        )}
                                                        {schedule.dinner && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="px-1 py-0 font-normal"
                                                            >
                                                                🌙 Tối
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-sm text-gray-500 italic">
                                            Chưa có lịch trình nào.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* --- DIALOGS AREA --- */}

                    {/* 1. Edit Tour Main Info */}
                    <TourFormDialog
                        open={editDialogOpen}
                        onOpenChange={setEditDialogOpen}
                        initialData={tour}
                        title="Chỉnh sửa Tour"
                        categories={categories || []}
                    />

                    {/* 2. Add Images */}
                    <TourImageDialog
                        open={addImageOpen}
                        onOpenChange={setAddImageOpen}
                        tourId={tour.id}
                        onSuccess={fetchImages}
                    />

                    {/* 3. Delete Image Alert */}
                    <AlertDialog
                        open={!!deleteImageId}
                        onOpenChange={(val) => !val && setDeleteImageId(null)}
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Xóa ảnh?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Bạn có chắc chắn muốn xóa ảnh này khỏi thư
                                    viện?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={onConfirmDeleteImage}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Xóa ảnh
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* 4. Add Schedule */}
                    <FormTourScheduleDialog
                        open={addScheduleOpen}
                        onOpenChange={setAddScheduleOpen}
                        tourId={tour.id}
                        onSuccess={fetchSchedules}
                    />

                    {/* 5. Edit Schedule */}
                    <FormTourScheduleDialog
                        open={!!editSchedule}
                        onOpenChange={(v) => !v && setEditSchedule(null)}
                        tourId={tour.id}
                        schedule={editSchedule}
                        onSuccess={fetchSchedules}
                    />

                    {/* 6. Delete Schedule Alert */}
                    <AlertDialog
                        open={!!deleteSchedule}
                        onOpenChange={(v) => !v && setDeleteSchedule(null)}
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Xoá lịch trình Ngày {deleteSchedule?.date}?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    Bạn có chắc chắn muốn xoá "
                                    {deleteSchedule?.name}"?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={onConfirmDeleteSchedule}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Xoá
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* 7. Delete Tour Alert */}
                    <AlertDialog
                        open={deleteTourDialogOpen}
                        onOpenChange={setDeleteTourDialogOpen}
                    >
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Xóa Tour?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Bạn có chắc chắn muốn xóa tour "{tour.title}
                                    "? Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={onConfirmDeleteTour}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Xóa Tour
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </AppLayout>
    );
}

// Sub-component được làm gọn
function InfoItem({
    icon,
    bg,
    label,
    value,
}: {
    icon: ReactNode;
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
                <div className="text-sm font-medium text-gray-900">{value}</div>
            </div>
        </div>
    );
}
