import { Tour, TourImage, TourPolicy, TourSchedule, TourService } from '@/app';
import tourUrl from '@/routes/tours';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Hook nhận vào object Tour đầy đủ từ Props
export const useTourData = (initialTourData: Tour) => {
    const [loading, setLoading] = useState(false);

    // 1. Khởi tạo State từ dữ liệu có sẵn (Eager Loaded)
    // Lưu ý: Laravel trả về JSON dạng snake_case (tour_services, tour_policies)
    // Cần map đúng key nếu interface của bạn dùng camelCase
    const [galleryImages, setGalleryImages] = useState<TourImage[]>(
        initialTourData.images || [],
    );
    const [schedules, setSchedules] = useState<TourSchedule[]>(
        initialTourData.schedules || [],
    );

    const [tourServices, setTourServices] = useState<TourService[]>(
        // @ts-ignore: Laravel trả về snake_case
        initialTourData.tour_services || initialTourData.tourServices || [],
    );

    const [tourPolicies, setTourPolicies] = useState<TourPolicy[]>(
        // @ts-ignore: Laravel trả về snake_case
        initialTourData.tour_policies || initialTourData.tourPolicies || [],
    );

    // 2. Đồng bộ State khi Props thay đổi (Ví dụ sau khi router.reload xong)
    useEffect(() => {
        setGalleryImages(initialTourData.images || []);
        setSchedules(initialTourData.schedules || []);

        // @ts-ignore
        setTourServices(
            initialTourData.tour_services ||
                initialTourData.tour_services ||
                [],
        );
        // @ts-ignore
        setTourPolicies(
            initialTourData.tour_policies ||
                initialTourData.tour_policies ||
                [],
        );
    }, [initialTourData]);

    // 3. Hàm làm mới dữ liệu (Dùng Inertia Reload thay vì gọi API)
    const refreshData = () => {
        router.reload({
            only: ['tour'], // Chỉ tải lại prop 'tour'
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false),
            preserveScroll: true, // Giữ vị trí cuộn trang
        });
    };

    // 4. Các hàm Delete (Vẫn gọi API để xóa, sau đó update state hoặc reload)

    // Xóa ảnh
    const deleteImage = async (imageId: number, onSuccess?: () => void) => {
        setLoading(true);
        try {
            await axios.delete(
                `/tours/${initialTourData.id}/images/${imageId}`,
            );

            // Optimistic Update (Cập nhật UI ngay)
            setGalleryImages((prev) =>
                prev.filter((img) => img.id !== imageId),
            );

            toast.success('Đã xóa ảnh thành công');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            toast.error('Xóa ảnh thất bại');
        } finally {
            setLoading(false);
        }
    };

    // Xóa chính sách
    const deletePolicy = async (id: number, onSuccess?: () => void) => {
        setLoading(true);
        try {
            await axios.delete(
                `/tours/${initialTourData.id}/tourpolicies/${id}`,
            );

            setTourPolicies((prev) => prev.filter((p) => p.id !== id));

            toast.success('Đã xóa chính sách thành công');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi xóa chính sách');
        } finally {
            setLoading(false);
        }
    };

    // Xóa dịch vụ
    const deleteService = async (serviceId: number, onSuccess?: () => void) => {
        setLoading(true);
        try {
            await axios.delete(
                `/tours/${initialTourData.id}/tourservices/${serviceId}`,
            );

            setTourServices((prev) => prev.filter((p) => p.id !== serviceId));

            toast.success('Đã xóa dịch vụ khỏi tour');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            toast.error('Lỗi khi xóa dịch vụ');
        } finally {
            setLoading(false);
        }
    };

    // Xóa lịch trình
    const deleteSchedule = async (
        scheduleId: number,
        onSuccess?: () => void,
    ) => {
        setLoading(true);
        try {
            await axios.delete(
                `/tours/${initialTourData.id}/schedules/${scheduleId}`,
            );

            setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));

            toast.success('Đã xóa lịch trình');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            toast.error('Xóa lịch trình thất bại');
        } finally {
            setLoading(false);
        }
    };

    // Xóa Tour
    const deleteTour = (onSuccess?: () => void) => {
        router.delete(tourUrl.destroy(initialTourData.id).url, {
            onSuccess: () => {
                toast.success('Đã xóa tour thành công');
                if (onSuccess) onSuccess();
            },
            onError: () => toast.error('Xóa tour thất bại'),
        });
    };

    return {
        galleryImages,
        schedules,
        tourServices,
        tourPolicies,
        loading,
        refreshData, // Trả về hàm reload của Inertia
        deleteImage,
        deleteSchedule,
        deleteService,
        deleteTour,
        deletePolicy,
    };
};
