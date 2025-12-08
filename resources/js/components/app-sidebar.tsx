import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import categories from '@/routes/categories';
import countries from '@/routes/countries';
import tour from '@/routes/tours';
import users from '@/routes/users';
import bookings from '@/routes/admin/bookings';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, PlaneIcon, Users, Calendar, ListIcon, BanIcon, User2Icon, BananaIcon, PlaneTakeoff, ScrollText, FileText, BarChart3, Briefcase } from 'lucide-react';
import AppLogo from './app-logo';
import serviceTypes from '@/routes/service-types';
import services from '@/routes/services';
import providers from '@/routes/providers';
import serviceAttributes from '@/routes/service-attributes';
import policies from '@/routes/policies';
import guide from '@/routes/guide';



const mainNavItems: NavItem[] = [
    {
        title: 'Tổng quan',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Quốc gia',
        href: countries.index(),
        icon: LayoutGrid,
    },
    {
        title: 'Danh mục',
        href: categories.index(),
        icon: LayoutGrid,
    },
    {
        title: 'Tour du lịch',
        href: tour.index(),
        icon: LayoutGrid,
    },


];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Mã nguồn',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Tài liệu',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    const page = usePage<SharedData>();
    const currentUser = page.props.auth?.user;
    const isAdmin = currentUser?.role === 1;
    const isHdv = currentUser?.role === 2;

    // Menu theo role
    const getNavItems = (): NavItem[] => {
        // Menu cho Admin (role = 1)
        if (isAdmin) {
            return [
                {
                    title: 'Tổng quan',
                    href: dashboard(),
                    icon: LayoutGrid,
                },
                {
                    title: 'Quản lý Tour & Booking',
                    href: '#',
                    icon: PlaneTakeoff,
                    items: [
                        {
                            title: 'Tour du lịch',
                            href: tour.index(),
                        },
                        {
                            title: 'Quản lý Booking',
                            href: bookings.index(),
                        },
                    ]
                },
                {
                    title: 'Quản lý Dịch vụ',
                    href: '#',
                    icon: Briefcase,
                    items: [
                        {
                            title: 'Dịch vụ',
                            href: services.index(),
                        },
                        {
                            title: 'Loại dịch vụ',
                            href: serviceTypes.index(),
                        },
                        {
                            title: 'Nhà cung cấp',
                            href: providers.index(),
                        },
                        {
                            title: 'Thuộc tính dịch vụ',
                            href: serviceAttributes.index(),
                        },
                        {
                            title: 'Chính sách',
                            href: policies.index(),
                        },
                    ]
                },
                {
                    title: 'Quốc gia',
                    href: countries.index(),
                    icon: LayoutGrid, // Or Globe if available, but staying with LayoutGrid as per previous context or whatever icon was used.
                },
                {
                    title: 'Quản lý người dùng',
                    href: users.index(),
                    icon: Users,
                },
                {
                    title: 'Báo cáo doanh thu',
                    href: '/admin/reports/revenue',
                    icon: BarChart3,
                },
            ];
        }

        // Menu cho Hướng dẫn viên (role = 2)
        if (isHdv) {
            return [
                {
                    title: 'Lịch trình của tôi',
                    href: guide.schedule(),
                    icon: Calendar,
                },
                {
                    title: 'Nhật ký chuyến đi',
                    href: guide.notes(),
                    icon: FileText,
                },
            ];
        }

        // Các role khác: không có menu
        return [];
    };

    const mainNavItems = getNavItems();

    const footerNavItems: NavItem[] = [
        // {
        //     title: 'Mã nguồn',
        //     href: 'https://github.com/laravel/react-starter-kit',
        //     icon: Folder,
        // },
        // {
        //     title: 'Tài liệu',
        //     href: 'https://laravel.com/docs/starter-kits#react',
        //     icon: BookOpen,
        // },
    ];
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
