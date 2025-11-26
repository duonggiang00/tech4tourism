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
}

interface PageProps {
    provider: Provider;
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

            <div className="mx-auto mt-8 max-w-3xl">
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Thông tin chi tiết Nhà Cung Cấp</CardTitle>
                        <Link href={providersUrl.index().url}>
                            <Button
                                variant="ghost"
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" /> Quay lại
                            </Button>
                        </Link>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div>
                            <p className="font-semibold">Tên:</p>
                            <p>{provider.name}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Email:</p>
                            <p>{provider.email || '—'}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Hotline:</p>
                            <p>{provider.hotline || '—'}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Địa chỉ:</p>
                            <p>{provider.address || '—'}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Website:</p>
                            <a
                                href={provider.website}
                                target="_blank"
                                className="text-blue-600 underline"
                            >
                                {provider.website || '—'}
                            </a>
                        </div>
                        <div>
                            <p className="font-semibold">Trạng thái:</p>
                            {getStatusBadge(provider.status)}
                        </div>
                        <div>
                            <p className="font-semibold">Mô tả:</p>
                            <p>{provider.description || '—'}</p>
                        </div>
                        <div>
                            <p className="font-semibold">Ghi chú:</p>
                            <p>{provider.notes || '—'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
