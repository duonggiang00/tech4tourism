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
import categoriesUrl from '@/routes/categories';
import tourUrl from '@/routes/tours';
import { BreadcrumbItem, Category, Destination, Tour } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ChevronDown, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CategoryFormDialog } from './category';
import { TourFormDialog } from './dialog';

// --- Interfaces ---
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Danh sách Tour theo Danh mục',
        href: tourUrl.index().url,
    },
];

interface PageProps {
    flash: {
        message?: string;
    };
    tours: Tour[];
    destinations: Destination[];
    categories: Category[];
}

export default function Index() {
    const { tours, flash, categories, destinations } =
        usePage<PageProps>().props;

    // --- STATE QUẢN LÝ DIALOG TOUR ---
    const [isTourDialogOpen, setIsTourDialogOpen] = useState(false);
    const [currentTour, setCurrentTour] = useState<Tour | undefined>(undefined);

    // --- STATE QUẢN LÝ DIALOG CATEGORY ---
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<
        Category | undefined
    >(undefined);

    // --- STATE QUẢN LÝ EXPAND ROW ---
    const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

    const { delete: destroy } = useForm();

    // --- TOUR HANDLERS ---
    const handleDeleteTour = (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa tour "${name}" (ID: ${id})?`)) {
            destroy(tourUrl.destroy(id).url);
        }
    };

    const openCreateTourDialog = () => {
        setCurrentTour(undefined);
        setIsTourDialogOpen(true);
    };

    const openEditTourDialog = (tour: Tour) => {
        setCurrentTour(tour);
        setIsTourDialogOpen(true);
    };

    // --- CATEGORY HANDLERS ---
    const handleDeleteCategory = (id: number, name: string) => {
        if (
            confirm(
                `CẢNH BÁO: Bạn có chắc muốn xóa danh mục "${name}"?\nTất cả các tour thuộc danh mục này có thể bị ảnh hưởng!`,
            )
        ) {
            destroy(categoriesUrl.destroy(id).url);
        }
    };

    const openCreateCategoryDialog = () => {
        setCurrentCategory(undefined);
        setIsCategoryDialogOpen(true);
    };

    const openEditCategoryDialog = (category: Category) => {
        setCurrentCategory(category);
        setIsCategoryDialogOpen(true);
    };

    const toggleCategory = (categoryId: number) => {
        setExpandedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId],
        );
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

            {/* Nút tạo mới & Dialogs */}
            <div className="m-4 flex justify-between">
                <div>
                    <Button
                        onClick={openCreateCategoryDialog}
                        variant="secondary"
                        className="border shadow-sm"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Thêm Danh Mục
                    </Button>
                    <Link href={tourUrl.create()}>
                        <Button>Tạo một Tour mới</Button>
                    </Link>

                    <CategoryFormDialog
                        open={isCategoryDialogOpen}
                        onOpenChange={setIsCategoryDialogOpen}
                        initialData={currentCategory}
                        title={
                            currentCategory
                                ? 'Chỉnh sửa Danh Mục'
                                : 'Tạo Danh Mục Mới'
                        }
                    />
                </div>

                <div>
                    <Button onClick={openCreateTourDialog}>
                        <Plus className="mr-2 h-4 w-4" /> Create Tour
                    </Button>
                    <TourFormDialog
                        categories={categories}
                        open={isTourDialogOpen}
                        onOpenChange={setIsTourDialogOpen}
                        initialData={currentTour}
                        title={
                            currentTour
                                ? `Edit Tour: ${currentTour.title}`
                                : 'Create New Tour'
                        }
                        destinations={destinations}
                    />
                </div>
            </div>

            {/* PHẦN CHÍNH: Bảng Danh mục lồng Bảng Tour */}
            <div className="m-8 overflow-hidden rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-100 hover:bg-gray-100">
                            <TableHead className="w-[80px] text-center">
                                STT
                            </TableHead>
                            <TableHead>Tên Danh Mục</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead className="text-center">
                                Số lượng Tour
                            </TableHead>
                            {/* Thêm cột Action */}
                            <TableHead className="w-[100px] text-center">
                                Hành động
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.length === 0 ? (
                            <TableRow>
                                {/* Update colSpan thành 4 vì có thêm 1 cột */}
                                <TableCell
                                    colSpan={4}
                                    className="h-24 text-center"
                                >
                                    Chưa có danh mục nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category, catIndex) => {
                                const categoryTours = tours.filter(
                                    (t) => t.category_id === category.id,
                                );
                                const isExpanded = expandedCategories.includes(
                                    category.id,
                                );

                                return (
                                    <>
                                        {/* Row 1: Category Header */}
                                        <TableRow
                                            key={`cat-${category.id}`}
                                            className="cursor-pointer transition-colors hover:bg-gray-50"
                                            onClick={() =>
                                                toggleCategory(category.id)
                                            }
                                        >
                                            <TableCell className="text-center font-medium">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div
                                                        className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                                                    >
                                                        <ChevronDown className="h-4 w-4 text-gray-500" />
                                                    </div>
                                                    <span>{catIndex + 1}</span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="font-bold text-gray-700">
                                                {category.title}
                                            </TableCell>
                                            <TableCell className="font-bold text-gray-700">
                                                {category.description}
                                            </TableCell>

                                            <TableCell className="text-center">
                                                <Badge variant="outline">
                                                    {categoryTours.length} tours
                                                </Badge>
                                            </TableCell>

                                            {/* Cột Action riêng biệt */}
                                            <TableCell>
                                                <div className="flex items-center justify-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-400 hover:text-amber-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openEditCategoryDialog(
                                                                category,
                                                            );
                                                        }}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-400 hover:text-red-600"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteCategory(
                                                                category.id,
                                                                category.title,
                                                            );
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>

                                        {/* Row 2: Detail Body */}
                                        <TableRow
                                            key={`detail-${category.id}`}
                                            className={`hover:bg-transparent ${isExpanded ? 'border-b' : 'border-b-0'}`}
                                        >
                                            {/* Update colSpan thành 4 */}
                                            <TableCell
                                                colSpan={4}
                                                className="border-0 p-0"
                                            >
                                                <div
                                                    className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
                                                        isExpanded
                                                            ? 'grid-rows-[1fr]'
                                                            : 'grid-rows-[0fr]'
                                                    }`}
                                                >
                                                    <div className="overflow-hidden">
                                                        <div className="bg-gray-50/50 p-4 shadow-inner sm:p-6">
                                                            <div className="rounded-md border bg-white">
                                                                {categoryTours.length >
                                                                0 ? (
                                                                    <Table>
                                                                        <TableHeader>
                                                                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                                                                <TableHead className="w-[50px] text-center">
                                                                                    STT
                                                                                </TableHead>
                                                                                <TableHead>
                                                                                    Tour
                                                                                </TableHead>
                                                                                <TableHead>
                                                                                    Thời
                                                                                    gian
                                                                                </TableHead>
                                                                                <TableHead>
                                                                                    Giá
                                                                                </TableHead>
                                                                                <TableHead>
                                                                                    Trạng
                                                                                    thái
                                                                                </TableHead>
                                                                                <TableHead className="text-center">
                                                                                    Hành
                                                                                    động
                                                                                </TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {categoryTours.map(
                                                                                (
                                                                                    tour,
                                                                                    index,
                                                                                ) => (
                                                                                    <TableRow
                                                                                        key={
                                                                                            tour.id
                                                                                        }
                                                                                    >
                                                                                        <TableCell className="text-center text-gray-500">
                                                                                            {index +
                                                                                                1}
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            <div className="flex items-center gap-3">
                                                                                                <img
                                                                                                    src={
                                                                                                        tour.thumbnail ||
                                                                                                        'https://placehold.co/48x48?text=No+Img'
                                                                                                    }
                                                                                                    alt={
                                                                                                        tour.title
                                                                                                    }
                                                                                                    className="h-10 w-10 rounded border object-cover"
                                                                                                />
                                                                                                <span className="line-clamp-1 text-sm font-medium">
                                                                                                    {
                                                                                                        tour.title
                                                                                                    }
                                                                                                </span>
                                                                                            </div>
                                                                                        </TableCell>
                                                                                        <TableCell className="text-sm whitespace-nowrap">
                                                                                            {
                                                                                                tour.day
                                                                                            }{' '}
                                                                                            ngày{' '}
                                                                                            {
                                                                                                tour.night
                                                                                            }{' '}
                                                                                            đêm
                                                                                        </TableCell>
                                                                                        <TableCell className="text-sm font-medium whitespace-nowrap text-green-600">
                                                                                            {new Intl.NumberFormat(
                                                                                                'en-US',
                                                                                                {
                                                                                                    style: 'currency',
                                                                                                    currency:
                                                                                                        'USD',
                                                                                                },
                                                                                            ).format(
                                                                                                tour.price_adult,
                                                                                            )}
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            <Badge
                                                                                                variant="secondary"
                                                                                                className={`text-xs whitespace-nowrap ${getStatusColor(tour.status)}`}
                                                                                            >
                                                                                                {tour.status ===
                                                                                                0
                                                                                                    ? 'Hoạt động'
                                                                                                    : tour.status ===
                                                                                                        1
                                                                                                      ? 'Không Hoạt động'
                                                                                                      : 'Sắp có'}
                                                                                            </Badge>
                                                                                        </TableCell>
                                                                                        <TableCell>
                                                                                            <div className="flex justify-center gap-1">
                                                                                                <Link
                                                                                                    href={
                                                                                                        tourUrl.show(
                                                                                                            tour.id,
                                                                                                        )
                                                                                                            .url
                                                                                                    }
                                                                                                >
                                                                                                    <Button
                                                                                                        variant="ghost"
                                                                                                        size="icon"
                                                                                                        className="h-8 w-8 hover:text-blue-600"
                                                                                                    >
                                                                                                        <Eye className="h-4 w-4" />
                                                                                                    </Button>
                                                                                                </Link>
                                                                                                <Link
                                                                                                    href={
                                                                                                        tourUrl.edit(
                                                                                                            tour.id,
                                                                                                        )
                                                                                                            .url
                                                                                                    }
                                                                                                >
                                                                                                    <Button
                                                                                                        variant="ghost"
                                                                                                        size="icon"
                                                                                                        className="h-8 w-8 hover:text-amber-600"
                                                                                                    >
                                                                                                        <Pencil className="h-4 w-4" />
                                                                                                    </Button>
                                                                                                </Link>
                                                                                                <Button
                                                                                                    variant="ghost"
                                                                                                    size="icon"
                                                                                                    className="h-8 w-8 hover:text-red-600"
                                                                                                    onClick={(
                                                                                                        e,
                                                                                                    ) => {
                                                                                                        e.stopPropagation();
                                                                                                        handleDeleteTour(
                                                                                                            tour.id,
                                                                                                            tour.title,
                                                                                                        );
                                                                                                    }}
                                                                                                >
                                                                                                    <Trash2 className="h-4 w-4" />
                                                                                                </Button>
                                                                                            </div>
                                                                                        </TableCell>
                                                                                    </TableRow>
                                                                                ),
                                                                            )}
                                                                        </TableBody>
                                                                    </Table>
                                                                ) : (
                                                                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                                                                        <p className="text-sm">
                                                                            Chưa
                                                                            có
                                                                            tour
                                                                            nào
                                                                            trong
                                                                            danh
                                                                            mục
                                                                            này.
                                                                        </p>
                                                                        <Button
                                                                            variant="link"
                                                                            onClick={(
                                                                                e,
                                                                            ) => {
                                                                                e.stopPropagation();
                                                                                openCreateTourDialog();
                                                                            }}
                                                                            className="mt-1 h-auto p-0 text-blue-600"
                                                                        >
                                                                            Tạo
                                                                            ngay
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    </>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
