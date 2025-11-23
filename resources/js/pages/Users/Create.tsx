import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import users from '@/routes/users';
import { BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { CircleAlertIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Quản lý người dùng',
        href: users.index().url,
    },
    {
        title: 'Tạo người dùng mới',
        href: users.create().url,
    },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 0,
        is_active: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(users.store().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tạo người dùng mới" />
            <div className="p-6">
                <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
                    <h2 className="text-2xl font-bold mb-4">Tạo người dùng mới</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Hiển thị lỗi */}
                        {Object.keys(errors).length > 0 && (
                            <Alert variant="destructive">
                                <CircleAlertIcon />
                                <AlertTitle>Lỗi!</AlertTitle>
                                <AlertDescription>
                                    <ul className="list-disc list-inside">
                                        {Object.entries(errors).map(
                                            ([key, message]) => (
                                                <li key={key}>
                                                    {message as string}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Tên */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Tên người dùng *</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Nhập tên người dùng"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="example@email.com"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        {/* Mật khẩu */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Mật khẩu *</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Tối thiểu 6 ký tự"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password}</p>
                            )}
                        </div>

                        {/* Xác nhận mật khẩu */}
                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Xác nhận mật khẩu *</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                placeholder="Nhập lại mật khẩu"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                        </div>

                        {/* Vai trò */}
                        <div className="space-y-2">
                            <Label htmlFor="role">Vai trò *</Label>
                            <Select
                                value={String(data.role)}
                                onValueChange={(val) => setData('role', parseInt(val))}
                            >
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Chọn vai trò" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">Khách hàng</SelectItem>
                                    <SelectItem value="1">Admin</SelectItem>
                                    <SelectItem value="2">Hướng dẫn viên</SelectItem>
                                    <SelectItem value="3">Nhân viên Sale</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-sm text-red-500">{errors.role}</p>
                            )}
                        </div>

                        {/* Trạng thái hoạt động */}
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

                        <div className="flex gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Đang tạo...' : 'Tạo người dùng'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}

