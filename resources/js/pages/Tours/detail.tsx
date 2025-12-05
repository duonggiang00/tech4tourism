
import { ConfirmDeleteDialog } from '@/components/common/ConfirmDeleteDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTourData } from '@/hooks/useTourData';
import AppLayout from '@/layouts/app-layout';
import tourUrl from '@/routes/tours';
import { BreadcrumbItem, Destination, Policy, Service, TourDetailProps, TourPolicy, TourSchedule, TourService, User } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Plus, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import TourGallery from './Partials/TourGallery';
import GuideList from './Partials/TourGuideList';
import TourHeader from './Partials/TourHeader';
import TourInfoCards from './Partials/TourInfoCards';
import TourPolicyList from './Partials/TourPolicyList';
import TourScheduleList from './Partials/TourScheduleList';
import TourServiceList from './Partials/TourServiceList';
import { TourFormDialog } from './dialog';
import { TourImageDialog } from './tourImage';
import { TourPolicyDialog } from './tourPolicy';
import { FormTourScheduleDialog } from './tourSchedule';
import { TourServiceDialog } from './tourService';
import { GuideAssignmentDialog } from './tripAssignment';

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
    const rawInstances = (template as any)?.instances || [];
    const instances = rawInstances.sort((a: TourInstance, b: TourInstance) => {
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
        loading,
        refreshData, // Hàm này giờ gọi router.reload()
        deleteService,
        deleteImage,
        deleteSchedule,
        deleteTour,
        deletePolicy,
        deleteAssignment,
    } = useTourData(tourDataWithAssignments);

    // --- B. UI STATE (Chỉ giữ lại state điều khiển Dialog) ---
    const [dialogs, setDialogs] = useState({
        editMain: false,
        deleteTour: false,
        addImage: false,
        addSchedule: false,
        addPolicy: false,
        addGuide: false,
    });

    // State item đang chọn để sửa/xóa
    const [selectedPolicy, setSelectedPolicy] = useState<{
        data: TourPolicy | null;
        mode: 'edit' | 'delete';
    } | null>(null);

    // State xác định đối tượng đang được chọn để sửa/xóa
    const [selectedSchedule, setSelectedSchedule] = useState<{
        data: TourSchedule | null;
        mode: 'edit' | 'delete';
    } | null>(null);

    const [deletingAssignmentId, setDeletingAssignmentId] = useState<
        number | null
    >(null);
    // State quản lý Dialog Service
    const [showServiceDialog, setShowServiceDialog] = useState(false);
    const [editingService, setEditingService] = useState<TourService | null>(
        null,
    );
    const [deletingService, setDeletingService] = useState<TourService | null>(
        null,
    );

    const [deleteImageId, setDeleteImageId] = useState<number | null>(null);

    // --- C. HELPERS ---
    const toggleDialog = (key: keyof typeof dialogs, value: boolean) => {
        setDialogs((prev) => ({ ...prev, [key]: value }));
    };

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

    const onConfirmDeleteImage = () => {
        if (deleteImageId) {
            // Gọi hàm từ hook, sau đó đóng dialog
            deleteImage(deleteImageId, () => setDeleteImageId(null));
        }
    };

    const onConfirmDeleteSchedule = () => {
        if (selectedSchedule?.data) {
            deleteSchedule(selectedSchedule.data.id, () =>
                setSelectedSchedule(null),
            );
        }
    };

    const onConfirmDeleteTour = () => {
        deleteTour(() => toggleDialog('deleteTour', false));
    };

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
                        onEdit={() => toggleDialog('editMain', true)}
                        onDelete={() => toggleDialog('deleteTour', true)}
                    />

                    {/* 2. Main Grid */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left Column */}
                        <div className="space-y-6 lg:col-span-2">
                            <TourGallery
                                tour={tourData}
                                images={galleryImages} // Data từ hook
                                onAddImage={() =>
                                    toggleDialog('addImage', true)
                                }
                                onDeleteImage={setDeleteImageId}
                            />
                            <TourServiceList
                                tourServices={tourServices}
                                onAdd={() => {
                                    setEditingService(null);
                                    setShowServiceDialog(true);
                                }}
                                onEdit={(item) => {
                                    setEditingService(item);
                                    setShowServiceDialog(true);
                                }}
                                onDelete={(item) => setDeletingService(item)}
                            />
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <TourInfoCards tour={tourData} instances={instances} />

                            <TourScheduleList
                                schedules={schedules} // Data từ hook
                                onAdd={() => toggleDialog('addSchedule', true)}
                                onEdit={(item) =>
                                    setSelectedSchedule({
                                        data: item,
                                        mode: 'edit',
                                    })
                                }
                                onDelete={(item) =>
                                    setSelectedSchedule({
                                        data: item,
                                        mode: 'delete',
                                    })
                                }
                            />

                            <GuideList
                                assignments={assignments}
                                onAdd={() => toggleDialog('addGuide', true)}
                                onDelete={(id) => setDeletingAssignmentId(id)}
                            />

                            <TourPolicyList
                                tourPolicies={tourPolicies}
                                onAdd={() => toggleDialog('addPolicy', true)}
                                onDelete={(item) =>
                                    setSelectedPolicy({
                                        data: item,
                                        mode: 'delete',
                                    })
                                }
                            />

                            {/* Tour Instances */}
                            {instances.length > 0 && (
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Calendar className="h-5 w-5 text-blue-600" /> Chuyến Đi
                                        </CardTitle>
                                        <Link href={`/tours/${tourData.id}/instances/create`}>
                                            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                                                <Plus className="h-3.5 w-3.5" /> Tạo mới
                                            </Button>
                                        </Link>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {instances.map((instance) => (
                                                <div
                                                    key={instance.id}
                                                    className="rounded-lg border p-3 hover:bg-gray-50"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="font-medium text-sm">
                                                                    {new Date(instance.date_start).toLocaleDateString('vi-VN')}
                                                                </span>
                                                                <Badge
                                                                    variant="secondary"
                                                                    className={`text-xs ${
                                                                        instance.status === 0 ? 'bg-red-100 text-red-800' :
                                                                        instance.status === 1 ? 'bg-yellow-100 text-yellow-800' :
                                                                        instance.status === 2 ? 'bg-blue-100 text-blue-800' :
                                                                        'bg-green-100 text-green-800'
                                                                    }`}
                                                                >
                                                                    {instance.status === 0 ? 'Đã hủy' :
                                                                     instance.status === 1 ? 'Sắp có' :
                                                                     instance.status === 2 ? 'Đang diễn ra' : 'Đã hoàn thành'}
                                                                </Badge>
                                                            </div>
                                                            <div className="text-xs text-gray-600 space-y-1">
                                                                {instance.price_adult && (
                                                                    <div>
                                                                        Giá: {new Intl.NumberFormat('vi-VN', {
                                                                            style: 'currency',
                                                                            currency: 'VND'
                                                                        }).format(instance.price_adult)}
                                                                    </div>
                                                                )}
                                                                {instance.limit && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Users className="h-3 w-3" />
                                                                        {instance.booked_count}/{instance.limit} chỗ đã đặt
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Nút tạo instance nếu chưa có */}
                            {instances.length === 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Calendar className="h-5 w-5 text-blue-600" /> Chuyến Đi
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Chưa có chuyến đi nào cho tour này.
                                        </p>
                                        <Link href={`/tours/${tourData.id}/instances/create`}>
                                            <Button variant="outline" className="w-full">
                                                <Plus className="mr-2 h-4 w-4" /> Tạo Chuyến Đi Đầu Tiên
                                            </Button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- DIALOGS AREA --- */}

                {/* Edit Main Info */}
                <TourFormDialog
                    open={dialogs.editMain}
                    onOpenChange={(v) => toggleDialog('editMain', v)}
                    initialData={tourData}
                    title="Chỉnh sửa Tour"
                    categories={categories}
                    destinations={destinations}
                />

                {/* Add Images */}
                <TourImageDialog
                    open={dialogs.addImage}
                    onOpenChange={(v) => toggleDialog('addImage', v)}
                    tourId={tourData.id}
                    onSuccess={refreshData}
                />

                {/* Add/Edit Schedule */}

                <TourServiceDialog
                    open={showServiceDialog}
                    onOpenChange={(val) => {
                        setShowServiceDialog(val);
                        if (!val) setEditingService(null);
                    }}
                    tourId={tourData.id}
                    availableServices={availableServices}
                    editingTourService={editingService}
                    onSuccess={refreshData}
                />

                <TourPolicyDialog
                    open={
                        dialogs.addPolicy ||
                        (!!selectedPolicy?.data &&
                            selectedPolicy.mode === 'edit')
                    }
                    onOpenChange={(v) => {
                        if (!v) {
                            toggleDialog('addPolicy', false);
                            setSelectedPolicy(null);
                        }
                    }}
                    tourId={tourData.id}
                    availablePolicies={availablePolicies}
                    editingTourPolicy={
                        selectedPolicy?.mode === 'edit'
                            ? selectedPolicy.data
                            : null
                    }
                    onSuccess={refreshData}
                />

                <FormTourScheduleDialog
                    open={
                        dialogs.addSchedule ||
                        (!!selectedSchedule?.data &&
                            selectedSchedule.mode === 'edit')
                    }
                    onOpenChange={(v) => {
                        if (!v) {
                            toggleDialog('addSchedule', false);
                            setSelectedSchedule(null);
                        }
                    }}
                    tourId={tourData.id}
                    schedule={
                        selectedSchedule?.mode === 'edit'
                            ? selectedSchedule.data
                            : undefined
                    }
                    onSuccess={refreshData} // Refresh lại list sau khi thêm/sửa
                    existingSchedules={schedules}
                    tour={tourData}
                    allDestinations={destinations}
                />
                {/* Dialog thêm Guide */}
                <GuideAssignmentDialog
                    open={dialogs.addGuide}
                    onOpenChange={(v) => toggleDialog('addGuide', v)}
                    tourId={tourData.id}
                    allUsers={guides} // Truyền danh sách user vào
                    currentAssignments={assignments}
                    onSuccess={refreshData}
                />

                {/* --- CONFIRM DIALOGS --- */}

                <ConfirmDeleteDialog
                    open={!!deletingAssignmentId}
                    onOpenChange={(v) => !v && setDeletingAssignmentId(null)}
                    onConfirm={() => {
                        if (deletingAssignmentId) {
                            deleteAssignment(deletingAssignmentId, () =>
                                setDeletingAssignmentId(null),
                            );
                        }
                    }}
                    title="Xóa hướng dẫn viên?"
                    description="Bạn có chắc chắn muốn gỡ hướng dẫn viên này khỏi tour?"
                    loading={loading}
                />

                {/* Confirm Delete Policy */}
                <ConfirmDeleteDialog
                    open={!!(selectedPolicy?.mode === 'delete')}
                    onOpenChange={(v) => !v && setSelectedPolicy(null)}
                    onConfirm={() => {
                        if (selectedPolicy?.data) {
                            deletePolicy(selectedPolicy.data.id, () =>
                                setSelectedPolicy(null),
                            );
                        }
                    }}
                    title="Xóa chính sách?"
                    description="Bạn có chắc chắn muốn xóa chính sách này khỏi tour?"
                    loading={loading}
                />

                {/* 1. Delete Image */}
                <ConfirmDeleteDialog
                    open={!!deleteImageId}
                    onOpenChange={(v) => !v && setDeleteImageId(null)}
                    onConfirm={onConfirmDeleteImage}
                    title="Xóa ảnh?"
                    description="Bạn có chắc chắn muốn xóa ảnh này khỏi thư viện?"
                    loading={loading} // Loading state từ hook
                />

                {/* 2. Delete Schedule */}
                <ConfirmDeleteDialog
                    open={!!(selectedSchedule?.mode === 'delete')}
                    onOpenChange={(v) => !v && setSelectedSchedule(null)}
                    onConfirm={onConfirmDeleteSchedule}
                    title="Xoá lịch trình?"
                    description={`Bạn có muốn xoá "${selectedSchedule?.data?.name}"?`}
                    loading={loading}
                />

                {/* 3. Delete Tour */}
                <ConfirmDeleteDialog
                    open={dialogs.deleteTour}
                    onOpenChange={(v) => toggleDialog('deleteTour', v)}
                    onConfirm={onConfirmDeleteTour}
                    title="Xóa Tour?"
                    description="Hành động này không thể hoàn tác."
                    isDestructive={true}
                />

                <ConfirmDeleteDialog
                    open={!!deletingService}
                    onOpenChange={(val) => !val && setDeletingService(null)}
                    onConfirm={() => {
                        if (deletingService) {
                            deleteService(deletingService.id, () =>
                                setDeletingService(null),
                            );
                        }
                    }}
                    title="Xóa dịch vụ?"
                    description="Bạn có chắc chắn muốn gỡ dịch vụ này khỏi tour?"
                />
            </div>
        </AppLayout>
    );
}
