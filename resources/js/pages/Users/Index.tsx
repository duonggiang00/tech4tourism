import React, { useState } from 'react';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { User, PaginatedUsers, BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CircleCheck, CircleX, Plus, Trash2 } from 'lucide-react';
import users from '@/routes/users';

interface Props {
    users: PaginatedUsers;
    filters?: {
        search?: string;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

const ROLES = {
    0: { label: 'Khách hàng', color: 'bg-gray-500' },
    1: { label: 'Admin', color: 'bg-red-500' },
    2: { label: 'HDV', color: 'bg-blue-500' },
    3: { label: 'Sale', color: 'bg-green-500' },
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Quản lý người dùng',
        href: '/users',
    },
];

export default function UserIndex({ users: usersData, filters = {}, flash }: Props) {
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [search, setSearch] = useState(filters.search || '');

    // Form xử lý update
    const { data, setData, put, processing, reset, errors } = useForm({
        role: 0,
        is_active: true,
    });

    // Form xử lý delete
    const { delete: destroy, processing: deleting } = useForm();

    // Khi bấm nút "Sửa"
    const openEditModal = (user: User) => {
        setEditingUser(user);
        setData({
            role: user.role,
            is_active: user.is_active ?? true,
        });
    };

    // Khi bấm "Lưu"
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        put(users.update(editingUser.id).url, {
            onSuccess: () => {
                setEditingUser(null);
                reset();
            },
        });
    };

    // Xử lý search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(users.index().url, { search }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Xử lý xóa user
    const handleDelete = () => {
        if (!deletingUser) return;
        destroy(users.destroy(deletingUser.id).url, {
            onSuccess: () => {
                setDeletingUser(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Quản lý người dùng" />

            <div className="p-6 space-y-4">
                {/* Flash Messages */}
                {flash?.success && (
                    <Alert variant="default" className="bg-green-50 border-green-200">
                        <CircleCheck className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Thành công!</AlertTitle>
                        <AlertDescription className="text-green-700">{flash.success}</AlertDescription>
                    </Alert>
                )}
                {flash?.error && (
                    <Alert variant="destructive">
                        <CircleX className="h-4 w-4" />
                        <AlertTitle>Lỗi!</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Danh sách người dùng</h2>
                        <Link href={users.create().url}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Tạo người dùng mới
                            </Button>
                        </Link>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearch} className="mb-4">
                        <div className="flex gap-2">
                            <Input
                                type="text"
                                placeholder="Tìm kiếm theo tên hoặc email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="max-w-md"
                            />
                            <Button type="submit">Tìm kiếm</Button>
                            {search && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setSearch('');
                                        router.get(users.index().url);
                                    }}
                                >
                                    Xóa
                                </Button>
                            )}
                        </div>
                    </form>

                    {/* Table */}
                    {usersData.data && usersData.data.length > 0 ? (
                        <>
                            {/* Mobile View: Card Layout */}
                            <div className="grid grid-cols-1 gap-4 sm:hidden">
                                {usersData.data.map((user) => (
                                    <div key={user.id} className="bg-gray-50 p-4 rounded-lg border shadow-sm space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                                                    <p className="text-sm text-gray-500">ID: {user.id}</p>
                                                </div>
                                            </div>
                                            <Badge className={ROLES[user.role as keyof typeof ROLES]?.color || 'bg-gray-500'}>
                                                {ROLES[user.role as keyof typeof ROLES]?.label || 'Unknown'}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-gray-500 block">Email:</span>
                                                <span className="font-medium text-gray-900 break-all">{user.email}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block">Trạng thái:</span>
                                                {user.is_active ? (
                                                    <span className="text-green-600 font-medium">Hoạt động</span>
                                                ) : (
                                                    <span className="text-red-600 font-medium">Đã khóa</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditModal(user)}
                                                className="flex-1"
                                            >
                                                Cập nhật
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => setDeletingUser(user)}
                                                className="w-10 px-0"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop View: Table Layout */}
                            <div className="hidden sm:block overflow-x-auto">
                                <Table className="min-w-full">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="whitespace-nowrap">ID</TableHead>
                                            <TableHead className="whitespace-nowrap">Tên</TableHead>
                                            <TableHead className="whitespace-nowrap">Email</TableHead>
                                            <TableHead className="whitespace-nowrap">Vai trò</TableHead>
                                            <TableHead className="whitespace-nowrap">Trạng thái</TableHead>
                                            <TableHead className="text-right whitespace-nowrap">Hành động</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {usersData.data.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.id}</TableCell>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {user.avatar && (
                                                            <img
                                                                src={user.avatar}
                                                                alt={user.name}
                                                                className="w-8 h-8 rounded-full"
                                                            />
                                                        )}
                                                        <span>{user.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge className={ROLES[user.role as keyof typeof ROLES]?.color || 'bg-gray-500'}>
                                                        {ROLES[user.role as keyof typeof ROLES]?.label || 'Unknown'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {user.is_active ? (
                                                        <Badge variant="outline" className="text-green-600 border-green-600">
                                                            Hoạt động
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive">Đã khóa</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openEditModal(user)}
                                                        >
                                                            Cập nhật
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => setDeletingUser(user)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {usersData.links && usersData.links.length > 3 && (
                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-sm text-gray-700">
                                        Hiển thị {usersData.from || 0} đến {usersData.to || 0} trong tổng số {usersData.total || 0} người dùng
                                    </div>
                                    <div className="flex gap-2">
                                        {usersData.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 rounded-md text-sm font-medium ${link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : link.url
                                                        ? 'bg-white text-gray-700 hover:bg-gray-50 border'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            Không tìm thấy người dùng nào.
                        </div>
                    )}
                </div>
            </div>

            {/* Dialog Edit User */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cập nhật: {editingUser?.name}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Chọn Role */}
                        <div className="space-y-2">
                            <Label>Vai trò hệ thống</Label>
                            <Select
                                value={String(data.role)}
                                onValueChange={(val) => setData('role', parseInt(val))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn vai trò" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Khách hàng</SelectItem>
                                    <SelectItem value="1">Admin</SelectItem>
                                    <SelectItem value="2">Hướng dẫn viên</SelectItem>
                                    <SelectItem value="3">Nhân viên Sale</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && <div className="text-red-500 text-sm">{errors.role}</div>}
                        </div>

                        {/* Switch Khóa/Mở */}
                        <div className="flex items-center justify-between border p-3 rounded">
                            <div className="space-y-0.5">
                                <Label>Trạng thái hoạt động</Label>
                                <div className="text-sm text-gray-500">
                                    {data.is_active ? 'Người dùng được phép đăng nhập' : 'Chặn truy cập hệ thống'}
                                </div>
                            </div>
                            <Switch
                                checked={data.is_active}
                                onCheckedChange={(checked) => setData('is_active', checked)}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setEditingUser(null)}>
                                Hủy
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Alert Dialog Xác nhận xóa */}
            <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa người dùng <strong>{deletingUser?.name}</strong> ({deletingUser?.email})?
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleting ? 'Đang xóa...' : 'Xóa'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
