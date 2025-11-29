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
   
    const { flash } = usePage().props as any;

  
    useEffect(() => {
        if (flash?.message) {
            
            toast.success(flash.message);
        }
        if (flash?.error) {
          
            toast.error(flash.error);
        }
    }, [flash]);

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
