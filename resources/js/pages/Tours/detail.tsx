
import { ConfirmDeleteDialog } from '@/components/common/ConfirmDeleteDialog';
import { useTourData } from '@/hooks/useTourData';
import AppLayout from '@/layouts/app-layout';
import tourUrl from '@/routes/tours';
import { BreadcrumbItem, Destination, Policy, Service, TourDetailProps, TourPolicy, TourSchedule, TourService, User } from '@/types';
import { Head } from '@inertiajs/react';
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

interface ExtendedProps extends TourDetailProps {
    availableServices: Service[];
    availablePolicies: Policy[];
    destinations: Destination[];
    guides: User[];
}
export default function TourDetail({
    tour,
    categories,
    availableServices,
    availablePolicies,
    destinations,
    guides
}: ExtendedProps) {
    // --- A. SỬ DỤNG CUSTOM HOOK (SỬA LẠI) ---
    // Truyền cả object tour vào hook để làm dữ liệu khởi tạo
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
    } = useTourData(tour);

    // --- B. UI STATE (Chỉ giữ lại state điều khiển Dialog) ---
    const [dialogs, setDialogs] = useState({
        editMain: false,
        deleteTour: false,
        addImage: false,
        addSchedule: false,
        addPolicy: false,
        addGuide: false,
    });

    console.log(tour);

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
        () => categories.find((c) => c.id === tour.category_id),
        [categories, tour.category_id],
    );

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
            <Head title={`Chi tiết: ${tour.title}`} />

            {/* Lưu ý: <Toaster /> của Sonner nên được đặt ở AppLayout.tsx để dùng chung */}

            <div className="min-h-screen bg-gray-50 p-8">
                <div className="mx-auto max-w-6xl">
                    {/* 1. Header Section */}
                    <TourHeader
                        tour={tour}
                        categoryName={currentCategory?.title}
                        onEdit={() => toggleDialog('editMain', true)}
                        onDelete={() => toggleDialog('deleteTour', true)}
                    />

                    {/* 2. Main Grid */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Left Column */}
                        <div className="space-y-6 lg:col-span-2">
                            <TourGallery
                                tour={tour}
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
                            <TourInfoCards tour={tour} />

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
                        </div>
                    </div>
                </div>

                {/* --- DIALOGS AREA --- */}

                {/* Edit Main Info */}
                <TourFormDialog
                    open={dialogs.editMain}
                    onOpenChange={(v) => toggleDialog('editMain', v)}
                    initialData={tour}
                    title="Chỉnh sửa Tour"
                    categories={categories}
                    destinations={destinations}
                />

                {/* Add Images */}
                <TourImageDialog
                    open={dialogs.addImage}
                    onOpenChange={(v) => toggleDialog('addImage', v)}
                    tourId={tour.id}
                    onSuccess={refreshData}
                />

                {/* Add/Edit Schedule */}

                <TourServiceDialog
                    open={showServiceDialog}
                    onOpenChange={(val) => {
                        setShowServiceDialog(val);
                        if (!val) setEditingService(null);
                    }}
                    tourId={tour.id}
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
                    tourId={tour.id}
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
                    tourId={tour.id}
                    schedule={
                        selectedSchedule?.mode === 'edit'
                            ? selectedSchedule.data
                            : undefined
                    }
                    onSuccess={refreshData} // Refresh lại list sau khi thêm/sửa
                    existingSchedules={schedules}
                    tour={tour}
                    allDestinations={destinations}
                />
                {/* Dialog thêm Guide */}
                <GuideAssignmentDialog
                    open={dialogs.addGuide}
                    onOpenChange={(v) => toggleDialog('addGuide', v)}
                    tourId={tour.id}
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
