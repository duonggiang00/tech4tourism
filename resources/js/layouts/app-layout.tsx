import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, type ReactNode } from 'react';
import { Toaster, toast } from 'sonner'; // 1. Import thêm toast

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({
    children,
    breadcrumbs,
    ...props
}: AppLayoutProps) {
    const { flash, errors } = usePage().props as any;

    useEffect(() => {
        // 1. Xử lý Flash message (như cũ)
        if (flash?.message) toast.success(flash.message);
        if (flash?.error) toast.error(flash.error);

        // 2. Xử lý Validation Errors (MỚI)
        // Nếu object errors có dữ liệu (tức là có lỗi validation)
        if (errors && Object.keys(errors).length > 0) {
            // Cách A: Chỉ hiện thông báo chung
            // toast.error("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");

            // Cách B: Hiện lỗi đầu tiên tìm thấy (để user biết sai gì ngay lập tức)
            const firstErrorKey = Object.keys(errors)[0];
            const firstErrorMessage = errors[firstErrorKey];
            toast.error(firstErrorMessage);

            // Nếu muốn hiện tất cả lỗi (không khuyến khích nếu form dài):
            // Object.values(errors).forEach((err: any) => toast.error(err));
        }
    }, [flash, errors]); // <--- Nhớ thêm 'errors' vào dependency array

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
            {children}

            {/* Toaster đặt ở đây sẽ nhận tín hiệu từ mọi nơi trong App.
                richColors: Tự động đổi màu Xanh (Success) / Đỏ (Error).
            */}
            <Toaster richColors position="top-right" />
        </AppLayoutTemplate>
    );
}
