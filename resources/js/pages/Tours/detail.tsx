import { Service, TourDetailProps, TourSchedule, TourService } from "@/app";
import { useTourData } from "@/hooks/useTourData";
import AppLayout from "@/layouts/app-layout";
import tourUrl from "@/routes/tours";
import { BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import { useMemo, useState } from "react";
import  TourHeader  from "./Partials/TourHeader";
import  TourGallery  from "./Partials/TourGallery";
import  TourInfoCards  from "./Partials/TourInfoCards";
import  TourScheduleList  from "./Partials/TourScheduleList";
import { TourFormDialog } from "./dialog";
import { TourImageDialog } from "./tourImage";
import { FormTourScheduleDialog } from "./tourSchedule";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { TourServiceDialog } from "./tourService";
import TourServiceList from "./Partials/TourServiceList";


interface ExtendedProps extends TourDetailProps {
    availableServices: Service[]; // <--- Đây là Master Data (danh sách để chọn)
}
export default function TourDetail({ tour, categories, availableServices }: ExtendedProps) {
    // --- A. SỬ DỤNG CUSTOM HOOK ---
    // Lấy toàn bộ dữ liệu và hàm xử lý từ hook
    const {
        galleryImages,
        schedules,
        loading,
        tourServices,
        refreshData,
        deleteService,
        deleteImage,
        deleteSchedule,
        deleteTour,
    } = useTourData(tour.id);

    // --- B. UI STATE (Chỉ giữ lại state điều khiển Dialog) ---
    const [dialogs, setDialogs] = useState({
        editMain: false,
        deleteTour: false,
        addImage: false,
        addSchedule: false,
    });

    // State xác định đối tượng đang được chọn để sửa/xóa
    const [selectedSchedule, setSelectedSchedule] = useState<{
        data: TourSchedule | null;
        mode: 'edit' | 'delete';
    } | null>(null);

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
                        </div>

                        <div className="space-y-6 lg:col-span-2">
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
                    // Không cần onSuccess ở đây vì sửa main info thường reload trang hoặc Inertia tự update props
                />

                {/* Add Images */}
                <TourImageDialog
                    open={dialogs.addImage}
                    onOpenChange={(v) => toggleDialog('addImage', v)}
                    tourId={tour.id}
                    onSuccess={refreshData} // Gọi hàm refresh từ hook sau khi upload xong
                />

                {/* Add/Edit Schedule */}

                <TourServiceDialog
                    open={showServiceDialog}
                    onOpenChange={(val) => {
                        setShowServiceDialog(val);
                        if (!val) setEditingService(null);
                    }}
                    tourId={tour.id}
                    availableServices={availableServices} // Truyền danh sách gốc vào đây
                    editingTourService={editingService} // Truyền item đang sửa vào đây
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
                />

                {/* --- CONFIRM DIALOGS --- */}

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
