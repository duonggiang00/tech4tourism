import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import tourUrl from '@/routes/tours';
import { BreadcrumbItem } from '@/types';

import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CircleCheck, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { TourFormDialog } from './dialog'; // Đảm bảo đường dẫn đúng

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Danh sách Tour',
        href: tourUrl.index().url,
    },
];

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
    price_children: number; // Đã sửa lỗi chính tả (chilren -> children)
}

interface PageProps {
    flash: {
        message?: string;
    };
    tours: Tour[];
    categories: Category[];
}

export default function Index() {
    const { tours, flash, categories } = usePage<PageProps>().props;

    // State quản lý việc mở Dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    // State lưu tour đang được chỉnh sửa (undefined = tạo mới)
    const [currentTour, setCurrentTour] = useState<Tour | undefined>(undefined);

    const { delete: destroy } = useForm();

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa tour "${name}" (ID: ${id})?`)) {
            destroy(tourUrl.destroy(id).url);
        }
    };

    // Mở Dialog để tạo mới
    const openCreateDialog = () => {
        setCurrentTour(undefined); // Xóa dữ liệu cũ nếu có
        setIsDialogOpen(true);
    };

    // Mở Dialog để chỉnh sửa
    const openEditDialog = (tour: Tour) => {
        setCurrentTour(tour); // Gán dữ liệu tour cần sửa
        setIsDialogOpen(true);
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Danh sách Tour" />
            <div className="m-4">
                <div>
                    {flash.message && (
                        <Alert
                            variant="default"
                            className="border-green-200 bg-green-50"
                        >
                            <CircleCheck className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">
                                Thông báo!
                            </AlertTitle>
                            <AlertDescription className="text-green-700">
                                {flash.message}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>

            <div className="m-4 flex justify-end">
                {/* Nút Create gọi hàm openCreateDialog */}
                <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Tour
                </Button>

                {/* Dialog dùng chung cho cả Create và Edit */}
                <TourFormDialog
                    categories={categories}
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    initialData={currentTour} // Truyền dữ liệu edit vào đây
                    title={
                        currentTour
                            ? `Edit Tour: ${currentTour.title}`
                            : 'Create New Tour'
                    }
                />
            </div>

            <div className="m-8 rounded-lg border border-gray-200 bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px] text-center">
                                STT
                            </TableHead>
                            <TableHead>Tour</TableHead>
                            <TableHead>Thời gian</TableHead>
                            <TableHead>Giá</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-center">
                                Hành động
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tours.map((tour, index) => (
                            <TableRow key={tour.id}>
                                <TableCell className="text-center">
                                    {index + 1}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={
                                                tour.thumbnail ||
                                                'https://placehold.co/48x48?text=No+Img'
                                            }
                                            alt={tour.title}
                                            className="h-12 w-12 rounded-lg border border-gray-100 object-cover"
                                        />
                                        <span className="font-medium">
                                            {tour.title}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    {tour.day} ngày {tour.night} đêm
                                </TableCell>
                                <TableCell className="font-medium text-green-600">
                                    ${tour.price_adult}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant="secondary"
                                        className={getStatusColor(tour.status)}
                                    >
                                        {tour.status == 0
                                            ? 'Hoạt động'
                                            : tour.status == 1
                                              ? 'Không Hoạt động'
                                              : 'Sắp có'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-center gap-2">
                                        <Link href={tourUrl.show(tour.id).url}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>

                                        {/* Nút Edit gọi hàm openEditDialog */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditDialog(tour)}
                                            className="hover:bg-amber-50 hover:text-amber-600"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleDelete(
                                                    tour.id,
                                                    tour.title,
                                                )
                                            }
                                            className="hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {tours.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        Chưa có tour nào. Hãy tạo mới!
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
