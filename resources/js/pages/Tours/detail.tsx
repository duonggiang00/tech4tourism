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
import {
    ArrowLeft,
    Calendar,
    Clock,
    DollarSign,
    MapPin,
    Pencil,
    Trash2,
    Users,
} from 'lucide-react';
import { ReactNode, useMemo, useState } from 'react';
import { TourFormDialog } from './dialog';

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

interface TourDetailProps {
    tour: Tour;
    categories: Category[];
}

export default function TourDetail({ tour, categories }: TourDetailProps) {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
                                    <img
                                        src={
                                            tour.thumbnail ||
                                            'https://placehold.co/600x400?text=No+Image'
                                        }
                                        alt={tour.title}
                                        className="h-64 w-full rounded-lg object-cover"
                                    />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent>
                                    <div className="">
                                        <h3 className="mb-3 text-xl font-semibold text-gray-900">
                                            Mô tả chi tiết
                                        </h3>
                                        <p className="leading-relaxed whitespace-pre-line text-gray-600">
                                            {tour.description}
                                        </p>
                                    </div>
                                </CardContent>
                                <CardContent>
                                    <h3 className="mb-3 text-xl font-semibold text-gray-900">
                                        Mô tả ngắn
                                    </h3>
                                    <p className="leading-relaxed whitespace-pre-line text-gray-600">
                                        {tour.short_description}
                                    </p>
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
                                    <CardTitle>Lịch trình</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <InfoItem
                                        icon={
                                            <Calendar className="h-5 w-5 text-blue-600" />
                                        }
                                        bg="bg-blue-50"
                                        label="Ngày bắt đầu"
                                        value={formatDate(tour.start_date)}
                                    />
                                    <InfoItem
                                        icon={
                                            <Calendar className="h-5 w-5 text-orange-600" />
                                        }
                                        bg="bg-orange-50"
                                        label="Ngày kết thúc"
                                        value={formatDate(tour.end_date)}
                                    />
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
