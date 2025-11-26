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
import bookings from '@/routes/admin/bookings';
import categories from '@/routes/categories';
import countries from '@/routes/countries';
import destinationUrl from '@/routes/destination';
import provinceUrl from '@/routes/province';
import test from '@/routes/test';
import tour from '@/routes/tours';
import users from '@/routes/users';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    ChartBarIcon,
    Folder,
    LayoutGrid,
    LoaderCircle,
    LocateIcon,
    PlaneIcon,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const page = usePage<SharedData>();
    const currentUser = page.props.auth?.user;
    const isAdmin = currentUser?.role === 1;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Categories',
            href: categories.index(),
            icon: LayoutGrid,
        },
        {
            title: 'Tour',
            href: tour.index(),
            icon: LayoutGrid,
        },
        {
            title: 'Test',
            href: test.index(),
            icon: PlaneIcon,
        },
        {
            title: 'Quản lý quốc gia',
            href: countries.index(),
            icon: ChartBarIcon,
        },
        {
            title: 'Quản lý tỉnh thành',
            href: provinceUrl.index(),
            icon: LocateIcon,
        },
        {
            title: 'Quản lý điểm đến',
            href: destinationUrl.index(),
            icon: LoaderCircle,
        },

        // Chỉ hiển thị menu Users cho Admin
        ...(isAdmin
            ? [
                  {
                      title: 'Quản lý người dùng',
                      href: users.index(),
                      icon: Users,
                  },
              ]
            : []),
        ...(isAdmin
            ? [
                  {
                      title: 'Quản lý Bookings',
                      href: bookings.index(),
                      icon: Calendar,
                  },
              ]
            : []),
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: Folder,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
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
