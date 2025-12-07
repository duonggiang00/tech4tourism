import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import providersUrl from '@/routes/providers';
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface Provider {
    id: number;
    name: string;
    description?: string;
    email?: string;
    hotline?: string;
    address?: string;
    website?: string;
    status: string;
    notes?: string;
    services?: {
        id: number;
        name: string;
        price: number;
        service_type?: {
            id: number;
            name: string;
        };
    }[];
}

interface PageProps {
    provider: Provider;
    [key: string]: unknown;
}

export default function Show() {
    const { provider } = usePage<PageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Nhà Cung Cấp', href: providersUrl.index().url },
        { title: provider.name, href: '#' },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case '0':
                return <Badge variant="outline">Không hoạt động</Badge>;
            case '1':
                return (
                    <Badge className="bg-green-100 text-green-700">
                        Hoạt động
                    </Badge>
                );
            case '2':
                return (
                    <Badge className="bg-yellow-100 text-yellow-700">
                        Tạm ngưng
                    </Badge>
                );
            default:
                return <Badge variant="outline">Không rõ</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Chi tiết - ${provider.name}`} />

            <div className="rounded-lg bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800">Thông tin chi tiết Nhà Cung Cấp</h2>
                    <Link href={providersUrl.index().url}>
                        <Button variant="outline" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-medium text-gray-500">Thông tin cơ bản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Tên nhà cung cấp</label>
                                <p className="text-lg font-semibold text-gray-900">{provider.name}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                                    <div className="mt-1">{getStatusBadge(provider.status)}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Hotline</label>
                                    <p className="text-gray-900">{provider.hotline || '—'}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Email</label>
                                <p className="text-gray-900">{provider.email || '—'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Website</label>
                                {provider.website ? (
                                    <a href={provider.website} target="_blank" className="block text-blue-600 hover:underline truncate">
                                        {provider.website}
                                    </a>
                                ) : (
                                    <p className="text-gray-900">—</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-medium text-gray-500">Thông tin bổ sung</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
                                <p className="text-gray-900">{provider.address || '—'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Mô tả</label>
                                <p className="text-gray-900 whitespace-pre-wrap">{provider.description || '—'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Ghi chú</label>
                                <p className="text-gray-900 whitespace-pre-wrap">{provider.notes || '—'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mt-6 border-t shadow-none">
                    <CardHeader className="px-0">
                        <CardTitle className="text-lg">Danh sách Dịch vụ cung cấp</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0">
                        {provider.services && provider.services.length > 0 ? (
                            <div className="overflow-hidden rounded-md border">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Tên dịch vụ</th>
                                            <th className="px-4 py-3 font-medium">Loại dịch vụ</th>
                                            <th className="px-4 py-3 text-right font-medium">Đơn giá</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {provider.services.map((service) => (
                                            <tr key={service.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {service.name}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    {service.service_type?.name || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-gray-900">
                                                    {new Intl.NumberFormat('vi-VN', {
                                                        style: 'currency',
                                                        currency: 'VND',
                                                    }).format(service.price)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500 bg-gray-50 rounded-md border border-dashed">
                                <p>Chưa có dịch vụ nào được gán cho nhà cung cấp này.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
