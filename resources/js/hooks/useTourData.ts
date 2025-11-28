import { TourImage, TourSchedule, TourService } from '@/app'; 
import tourUrl from '@/routes/tours';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
export const useTourData = (tourId: number) => {
    const [loading, setLoading] = useState(false);
    // 1. State lưu trữ dữ liệu
    const [galleryImages, setGalleryImages] = useState<TourImage[]>([]);
    const [schedules, setSchedules] = useState<TourSchedule[]>([]);
    const [tourServices, setTourServices] = useState<TourService[]>([]);

    // 2. Hàm lấy dữ liệu (Sử dụng useCallback để tránh tạo lại hàm không cần thiết)
    const fetchData = useCallback(async () => {
        if (!tourId) return;
        try {
            const [imgRes, schRes, svcRes] = await Promise.all([
                axios.get(`/tours/${tourId}/images`),
                axios.get(`/tours/${tourId}/schedules`),
                axios.get(`/tours/${tourId}/tourservices`),
            ]);
            setGalleryImages(imgRes.data);
            setSchedules(schRes.data);
            setTourServices(svcRes.data);
        } catch (error) {
            console.error(error);
            toast.error('Không thể tải dữ liệu chi tiết');
        } finally {
            setLoading(false);
        }
    }, [tourId]);

    // 3. Tự động gọi khi mount
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // 4. Các hàm xử lý hành động (Action Handlers)

    // Xóa ảnh
    const deleteImage = async (imageId: number, onSuccess?: () => void) => {
        setLoading(true);
        try {
            await axios.delete(`/tours/${tourId}/images/${imageId}`);

            // Cập nhật UI ngay lập tức (Optimistic UI)
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

    //Xóa dịch vụ
    const deleteService = async (serviceId: number, onSuccess?: () => void) => {
        try {
            setLoading(true);
            await axios.delete(`/tours/${tourId}/tourservices/${serviceId}`);
            toast.success('Đã xóa dịch vụ khỏi tour');
            onSuccess?.();
            fetchData();
        } catch (error) {
            console.log(error);
            toast.error('Lỗi khi xóa dịch vụ');
        } finally {
            setLoading(false);
        }
    }

    // Xóa lịch trình
    const deleteSchedule = async (
        scheduleId: number,
        onSuccess?: () => void,
    ) => {
        setLoading(true);
        try {
            await axios.delete(`/tours/${tourId}/schedules/${scheduleId}`);

            // Cập nhật UI ngay lập tức
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

    // Xóa Tour (Dùng Inertia Router để redirect)
    const deleteTour = (onSuccess?: () => void) => {
        router.delete(tourUrl.destroy(tourId).url, {
            onSuccess: () => {
                toast.success('Đã xóa tour thành công');
                if (onSuccess) onSuccess();
            },
            onError: () => toast.error('Xóa tour thất bại'),
        });
    };

    // 5. Trả về data và functions
    return {
        galleryImages,
        schedules,
        tourServices,
        loading,
        refreshData: fetchData, // Đổi tên function cho rõ nghĩa khi dùng ở ngoài
        deleteImage,
        deleteSchedule,
        deleteService,
        deleteTour,
    };
};
