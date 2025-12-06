import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CategoryFormDialog } from './category';

// --- Interfaces ---
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Danh sách Tour',
        href: tourUrl.index().url,
    },
];

interface TourInstance {
    id: number;
    tour_template_id: number;
    date_start: string;
    date_end: string;
    limit: number | null;
    booked_count: number;
    price_adult: number | null;
    price_children: number | null;
    status: number;
}

interface TourTemplate extends Tour {
    instances?: TourInstance[];
    category?: Category;
}

interface PaginatedTemplates {
    data: TourTemplate[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    current_page: number;
    from: number | null;
    to: number | null;
    total: number;
}

interface PageProps {
    flash: {
        message?: string;
    };
    tours: Tour[] | TourTemplate[]; // Backward compatibility
    templates?: PaginatedTemplates | TourTemplate[]; // Có thể là paginated hoặc array
    destinations: Destination[];
    categories: Category[];
    filters?: {
        search?: string;
        category_id?: string;
    };
}

export default function Index() {
    const { tours, templates, flash, categories, destinations, filters = {} } =
        usePage<PageProps>().props;
    
    // Xử lý templates: có thể là paginated hoặc array
    const templatesData = templates as PaginatedTemplates;
    const isPaginated = templatesData && 'data' in templatesData && 'links' in templatesData;
    const tourTemplates = isPaginated 
        ? templatesData.data 
        : ((templates || tours) as TourTemplate[]);

    // --- STATE ---
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState<Category | undefined>(undefined);
    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState<string>(
        filters.category_id || 'all'
    );
    const [statusFilter, setStatusFilter] = useState<string>(
        filters.status || 'all'
    );

    const { delete: destroy } = useForm();

    const handleDeleteTour = (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa tour "${name}" (ID: ${id})?`)) {
            destroy(tourUrl.destroy(id).url);
        }
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

    // --- SEARCH & FILTER HANDLERS ---
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            tourUrl.index().url,
            {
                search: search || undefined,
                category_id: categoryFilter !== 'all' ? categoryFilter : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleCategoryFilterChange = (value: string) => {
        setCategoryFilter(value);
        router.get(
            tourUrl.index().url,
            {
                search: search || undefined,
                category_id: value !== 'all' ? value : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        router.get(
            tourUrl.index().url,
            {
                search: search || undefined,
                category_id: categoryFilter !== 'all' ? categoryFilter : undefined,
                status: value !== 'all' ? value : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const getStatusColor = (status: number) => {
        switch (status) {
            case 0:
                return 'bg-red-100 text-red-800';
            case 1:
                return 'bg-yellow-100 text-yellow-800';
            case 2:
                return 'bg-blue-100 text-blue-800';
            case 3:
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Danh sách Tour" />

            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header với nút tạo mới */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Danh sách Tour
                        </h1>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={openCreateCategoryDialog}
                                variant="secondary"
                                className="border shadow-sm"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Thêm Danh Mục
                            </Button>
                            <Link href={tourUrl.create()}>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <Plus className="mr-2 h-4 w-4" /> Tạo Tour mới
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Search và Filter */}
                    <div className="rounded-lg border bg-white p-4 shadow-sm">
                        <form onSubmit={handleSearch} className="flex gap-3">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên tour..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select
                                value={categoryFilter}
                                onValueChange={handleCategoryFilterChange}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Tất cả danh mục" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả danh mục</SelectItem>
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
                            <Select
                                value={statusFilter}
                                onValueChange={handleStatusFilterChange}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Tất cả trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="0">Đã hủy</SelectItem>
                                    <SelectItem value="1">Sắp có</SelectItem>
                                    <SelectItem value="2">Đang diễn ra</SelectItem>
                                    <SelectItem value="3">Đã hoàn thành</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button type="submit" variant="outline">
                                <Search className="mr-2 h-4 w-4" /> Tìm kiếm
                            </Button>
                        </form>
                    </div>

                    {/* Bảng danh sách Tour */}
                    <div className="rounded-lg border bg-white shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="w-[60px] text-center">
                                        STT
                                    </TableHead>
                                    <TableHead>Tour</TableHead>
                                    <TableHead>Danh mục</TableHead>
                                    <TableHead>Thời gian</TableHead>
                                    <TableHead>Giá</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="w-[180px] text-center">
                                        Hành động
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tourTemplates.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="h-24 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center py-8">
                                                <p className="text-gray-500">
                                                    Không tìm thấy tour nào.
                                                </p>
                                                <Link href={tourUrl.create()}>
                                                    <Button
                                                        variant="link"
                                                        className="mt-2 text-blue-600"
                                                    >
                                                        Tạo tour mới
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tourTemplates.map((tour, index) => {
                                        const baseIndex = isPaginated && templatesData.from
                                            ? templatesData.from - 1
                                            : 0;
                                        return (
                                            <TableRow key={tour.id}>
                                                <TableCell className="text-center text-gray-500">
                                                    {baseIndex + index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <img
                                                            src={
                                                                tour.thumbnail
                                                                    ? `/storage/${tour.thumbnail}`
                                                                    : 'https://placehold.co/48x48?text=No+Img'
                                                            }
                                                            alt={tour.title}
                                                            className="h-12 w-12 rounded border object-cover"
                                                        />
                                                        <div>
                                                            <p className="font-medium text-gray-900">
                                                                {tour.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500 line-clamp-1">
                                                                {tour.short_description || 'Chưa có mô tả'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {tour.category?.title || 'Chưa phân loại'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm whitespace-nowrap">
                                                    {tour.day} ngày {tour.night} đêm
                                                    {tour.instances && tour.instances.length > 0 && (
                                                        <span className="ml-2 text-xs text-gray-500">
                                                            ({tour.instances.length} chuyến)
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm font-medium whitespace-nowrap">
                                                    {tour.instances && tour.instances.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {tour.instances.slice(0, 1).map((instance) => (
                                                                <div
                                                                    key={instance.id}
                                                                    className="text-green-600"
                                                                >
                                                                    {instance.price_adult
                                                                        ? new Intl.NumberFormat('vi-VN', {
                                                                              style: 'currency',
                                                                              currency: 'VND',
                                                                          }).format(instance.price_adult)
                                                                        : 'Chưa có giá'}
                                                                </div>
                                                            ))}
                                                            {tour.instances.length > 1 && (
                                                                <div className="text-xs text-gray-500">
                                                                    +{tour.instances.length - 1} chuyến khác
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">
                                                            Chưa có chuyến đi
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {tour.instances && tour.instances.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {tour.instances.slice(0, 1).map((instance) => (
                                                                <Badge
                                                                    key={instance.id}
                                                                    variant="secondary"
                                                                    className={`text-xs whitespace-nowrap ${getStatusColor(instance.status)}`}
                                                                >
                                                                    {instance.status === 0
                                                                        ? 'Đã hủy'
                                                                        : instance.status === 1
                                                                          ? 'Sắp có'
                                                                          : instance.status === 2
                                                                            ? 'Đang diễn ra'
                                                                            : 'Đã hoàn thành'}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <Badge variant="outline" className="text-xs">
                                                            Chưa có chuyến
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Link
                                                            href={tourUrl.show(tour.id).url}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 hover:text-blue-600"
                                                                title="Xem chi tiết"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link
                                                            href={tourUrl.edit(tour.id).url}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 hover:text-amber-600"
                                                                title="Chỉnh sửa"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        {(!tour.instances || tour.instances.length === 0) && (
                                                            <Link
                                                                href={`/tours/${tour.id}/instances/create`}
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 hover:text-green-600"
                                                                    title="Tạo chuyến đi"
                                                                >
                                                                    <Plus className="h-4 w-4" />
                                                                </Button>
                                                            </Link>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:text-red-600"
                                                            onClick={() =>
                                                                handleDeleteTour(
                                                                    tour.id,
                                                                    tour.title,
                                                                )
                                                            }
                                                            title="Xóa"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {isPaginated && templatesData.links && templatesData.links.length > 3 && (
                            <div className="flex items-center justify-between border-t bg-gray-50 px-4 py-3">
                                <div className="text-sm text-gray-700">
                                    Hiển thị {templatesData.from || 0} đến{' '}
                                    {templatesData.to || 0} trong tổng số{' '}
                                    {templatesData.total || 0} tour
                                </div>
                                <div className="flex gap-2">
                                    {templatesData.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`rounded-md px-3 py-2 text-sm font-medium ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : link.url
                                                      ? 'border bg-white text-gray-700 hover:bg-gray-50'
                                                      : 'cursor-not-allowed bg-gray-100 text-gray-400'
                                            }`}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Dialog */}
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
        </AppLayout>
    );
}
