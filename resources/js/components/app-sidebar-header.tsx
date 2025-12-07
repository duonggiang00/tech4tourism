import { Breadcrumbs } from '@/components/breadcrumbs';
import { NotificationDropdown } from '@/components/notification-dropdown';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const page = usePage<SharedData>();
    const currentUser = page.props.auth?.user;
    const isHdv = currentUser?.role === 2;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 bg-white px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:sticky md:top-0 md:left-auto md:right-auto md:w-auto md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            {/* Thông báo - Chỉ hiển thị cho HDV, đặt ở góc phải */}
            {isHdv && (
                <div className="flex items-center">
                    <NotificationDropdown />
                </div>
            )}
        </header>
    );
}
