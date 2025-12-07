
import { ConfirmDeleteDialog } from '@/components/common/ConfirmDeleteDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTourData } from '@/hooks/useTourData';
import AppLayout from '@/layouts/app-layout';
import tourUrl from '@/routes/tours';
import { BreadcrumbItem, Destination, Policy, Service, Tour, TourDetailProps, TourPolicy, TourSchedule, TourService, User } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Edit, Plus, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import TourGallery from './Partials/TourGallery';
import GuideList from './Partials/TourGuideList';
import TourHeader from './Partials/TourHeader';
import TourInfoCards from './Partials/TourInfoCards';
import TourPolicyList from './Partials/TourPolicyList';
import TourScheduleList from './Partials/TourScheduleList';
import TourServiceList from './Partials/TourServiceList';

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

interface ExtendedProps extends TourDetailProps {
    availableServices: Service[];
    availablePolicies: Policy[];
    destinations: Destination[];
    guides: User[];
    template?: Tour & { instances?: TourInstance[] };
}
export default function TourDetail({
    tour,
    template,
    categories,
    availableServices,
    availablePolicies,
    destinations,
    guides
}: ExtendedProps) {
    // Sử dụng template nếu có (có instances), nếu không dùng tour
    const tourData = template || tour;
    // Sắp xếp instances: ưu tiên instance có giá, sau đó sắp xếp theo date_start mới nhất
    const rawInstances = ((template as any)?.instances || []) as TourInstance[];
    const instances = rawInstances.sort((a, b) => {
        // Ưu tiên instance có giá
        const aHasPrice = a.price_adult !== null;
        const bHasPrice = b.price_adult !== null;
        if (aHasPrice && !bHasPrice) return -1;
        if (!aHasPrice && bHasPrice) return 1;
        // Nếu cùng có giá hoặc cùng không có giá, sắp xếp theo date_start mới nhất
        return new Date(b.date_start).getTime() - new Date(a.date_start).getTime();
    });

    // Debug: Log dữ liệu nhận được
    console.log('Tour data:', tour);
    console.log('Template data:', template);
    console.log('TourData (final):', tourData);

    // Kiểm tra nếu không có dữ liệu tour
    if (!tourData || !tourData.id) {
        return (
            <AppLayout breadcrumbs={[]}>
                <Head title="Lỗi" />
                <div className="min-h-screen bg-gray-50 p-8">
                    <div className="mx-auto max-w-6xl">
                        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                            <h2 className="text-lg font-semibold text-red-800">Không tìm thấy tour</h2>
                            <p className="mt-2 text-sm text-red-600">
                                Tour bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
                            </p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    // --- A. SỬ DỤNG CUSTOM HOOK (SỬA LẠI) ---
    // Truyền cả object tour vào hook để làm dữ liệu khởi tạo
    // Đảm bảo trip_assignments được truyền vào từ template nếu có
    const tourDataWithAssignments = useMemo(() => {
        if (template && (template as any).trip_assignments) {
            return {
                ...tourData,
                trip_assignments: (template as any).trip_assignments,
            };
        }
        return tourData;
    }, [tourData, template]);

    const {
        galleryImages,
        schedules,
        assignments,
        tourServices,
        tourPolicies,
    } = useTourData(tourDataWithAssignments);

    // --- B. UI STATE (Removed for Read-Only) ---

    // --- C. HELPERS ---

    const currentCategory = useMemo(
        () => categories.find((c) => c.id === tourData.category_id),
        [categories, tourData.category_id],
    );

    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: 'Danh Sách Tour', href: tourUrl.index().url },
            {
                title: `Chi tiết: ${tourData.title}`,
                href: tourData.id ? tourUrl.show(tourData.id).url : '#',
            },
        ],
        [tourData.id, tourData.title],
    );

    // --- D. EVENT HANDLERS (Cầu nối giữa UI và Hook) ---



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Chi tiết: ${tourData.title}`} />

            {/* Lưu ý: <Toaster /> của Sonner nên được đặt ở AppLayout.tsx để dùng chung */}

            <div className="min-h-screen bg-gray-50 p-8">
                <div className="mx-auto max-w-6xl">
                    {/* 1. Header Section */}
                    <TourHeader
                        tour={tourData}
                        categoryName={currentCategory?.title}
                    />

                    {/* 2. Tabs Interface */}
                    <div className="mt-6">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1 bg-white rounded-lg border">
                                <TabsTrigger value="overview" className="flex-1 min-w-[100px] whitespace-nowrap">Tổng quan</TabsTrigger>
                                <TabsTrigger value="schedule" className="flex-1 min-w-[100px] whitespace-nowrap">Lịch trình</TabsTrigger>
                                <TabsTrigger value="services" className="flex-1 min-w-[150px] whitespace-nowrap">Dịch vụ & Chính sách</TabsTrigger>
                                <TabsTrigger value="departures" className="flex-1 min-w-[120px] whitespace-nowrap">Lịch khởi hành</TabsTrigger>
                                <TabsTrigger value="guides" className="flex-1 min-w-[120px] whitespace-nowrap">Hướng dẫn viên</TabsTrigger>
                            </TabsList>

                            {/* TAB 1: TỔNG QUAN */}
                            <TabsContent value="overview" className="mt-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 space-y-6">
                                        <TourGallery
                                            tour={tourData}
                                            images={galleryImages}
                                        />
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Mô tả chi tiết</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="prose max-w-none text-gray-700">
                                                    {tourData.description ? (
                                                        <div dangerouslySetInnerHTML={{ __html: tourData.description }} />
                                                    ) : (
                                                        <p className="text-gray-500 italic">Chưa có mô tả chi tiết cho tour này.</p>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                    <div className="space-y-6">
                                        <TourInfoCards tour={tourData} instances={instances} />
                                    </div>
                                </div>
                            </TabsContent>

                            {/* TAB 2: LỊCH TRÌNH */}
                            <TabsContent value="schedule" className="mt-6">
                                <TourScheduleList
                                    schedules={schedules}
                                />
                            </TabsContent>

                            {/* TAB 3: DỊCH VỤ & CHÍNH SÁCH */}
                            <TabsContent value="services" className="mt-6 space-y-6">
                                <TourServiceList
                                    tourServices={tourServices}
                                />
                                <TourPolicyList
                                    tourPolicies={tourPolicies}
                                />
                            </TabsContent>

                            {/* TAB 4: LỊCH KHỞI HÀNH (INSTANCES) */}
                            <TabsContent value="departures" className="mt-6">
                                <div className="space-y-6">
                                    {instances.length > 0 ? (
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <CardTitle className="flex items-center gap-2 text-base">
                                                    <Calendar className="h-5 w-5 text-blue-600" /> Danh sách Chuyến Đi
                                                </CardTitle>
                                                <Link href={`/tours/${tourData.id}/instances/create`}>
                                                    <Button variant="outline" size="sm" className="gap-1">
                                                        <Plus className="h-4 w-4" /> Tạo chuyến đi mới
                                                    </Button>
                                                </Link>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {instances.map((instance) => (
                                                        <div
                                                            key={instance.id}
                                                            className="rounded-lg border p-4 hover:bg-gray-50 bg-white shadow-sm flex flex-col justify-between"
                                                        >
                                                            <div>
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <Badge
                                                                        variant="secondary"
                                                                        className={`${instance.status === 0 ? 'bg-red-100 text-red-800' :
                                                                            instance.status === 1 ? 'bg-yellow-100 text-yellow-800' :
                                                                                instance.status === 2 ? 'bg-blue-100 text-blue-800' :
                                                                                    'bg-green-100 text-green-800'
                                                                            }`}
                                                                    >
                                                                        {instance.status === 0 ? 'Đã hủy' :
                                                                            instance.status === 1 ? 'Sắp có' :
                                                                                instance.status === 2 ? 'Đang diễn ra' : 'Đã hoàn thành'}
                                                                    </Badge>
                                                                    <Link href={`/tour-instances/${instance.id}/edit`}>
                                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-blue-600">
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                                <h3 className="font-semibold text-lg text-blue-700 mb-1">
                                                                    {new Date(instance.date_start).toLocaleDateString('vi-VN')}
                                                                </h3>
                                                                <p className="text-sm text-gray-500 mb-3">
                                                                    đến {new Date(instance.date_end).toLocaleDateString('vi-VN')}
                                                                </p>

                                                                <div className="space-y-2 text-sm">
                                                                    <div className="flex justify-between border-b pb-1">
                                                                        <span className="text-gray-600">Giá người lớn:</span>
                                                                        <span className="font-medium">
                                                                            {instance.price_adult ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(instance.price_adult) : 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between border-b pb-1">
                                                                        <span className="text-gray-600">Trẻ em:</span>
                                                                        <span className="font-medium">
                                                                            {instance.price_children ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(instance.price_children) : 'N/A'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="mt-4 pt-3 border-t flex items-center justify-between text-sm">
                                                                <span className="flex items-center gap-1 text-gray-600">
                                                                    <Users className="h-4 w-4" />
                                                                    Chỗ:
                                                                </span>
                                                                <span className="font-medium">
                                                                    {instance.booked_count} / {instance.limit || '∞'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ) : (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-base">
                                                    <Calendar className="h-5 w-5 text-blue-600" /> Chuyến Đi
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-center py-8">
                                                <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                                <p className="text-gray-500 mb-4">Chưa có chuyến đi nào được tạo cho tour này.</p>
                                                <Link href={`/tours/${tourData.id}/instances/create`}>
                                                    <Button>
                                                        <Plus className="mr-2 h-4 w-4" /> Tạo chuyến đi đầu tiên
                                                    </Button>
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </TabsContent>

                            {/* TAB 5: HƯỚNG DẪN VIÊN */}
                            <TabsContent value="guides" className="mt-6">
                                <GuideList
                                    assignments={assignments}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* --- DIALOGS AREA --- */}

            </div>
        </AppLayout>
    );
}
