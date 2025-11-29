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
import test from '@/routes/test';
import tour from '@/routes/tours';
import users from '@/routes/users';
import bookings from '@/routes/admin/bookings';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, PlaneIcon, Users, Calendar, ListIcon, BanIcon, User2Icon, BananaIcon, PlaneTakeoff } from 'lucide-react';
import AppLogo from './app-logo';
import serviceTypes from '@/routes/service-types';
import services from '@/routes/services';
import providers from '@/routes/providers';
import serviceAttributes from '@/routes/service-attributes';


const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Countries',
        href: countries.index(),
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

export function AppSidebar() {
    const page = usePage<SharedData>();
    const currentUser = page.props.auth?.user;
    const isAdmin = currentUser?.role === 1;
    const isHdv = currentUser?.role === 2;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Countries',
            href: countries.index(),
            icon: LayoutGrid,
        },
        // {
        //     title: 'Categories',
        //     href: categories.index(),
        //     icon: LayoutGrid,
        // },
        {
            title: 'Tour',
            href: tour.index(),
            icon: PlaneTakeoff,
        },
        // {
        //     title: 'Test',
        //     href: test.index(),
        //     icon: PlaneIcon,
        // },
        {
            title: 'Service_Types', //quản lý loại hình dịch vụ
            href: serviceTypes.index(),
            icon: ListIcon,
        },
        {
            title: 'Services', //quản lý dịch vụ
            href: services.index(),
            icon: BanIcon,
        },
        {
            title: 'Provider', //quản lý nhà cung cấp
            href: providers.index(),
            icon: User2Icon,
        },
        {
            title: 'Service_attributes',
            href: serviceAttributes.index(),
            icon: BananaIcon,
        },

        // Chỉ hiển thị menu Users cho Admin
        ...(isAdmin
            ? [
                  {
                      title: 'User Management',
                      href: users.index(),
                      icon: Users,
                  },
              ]
            : []),
        ...(isAdmin
            ? [
                  {
                      title: 'Bookings Management',
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
