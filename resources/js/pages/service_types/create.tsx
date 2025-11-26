import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import serviceTypesUrl from '@/routes/service-types';
import { BreadcrumbItem } from '@/types';

import { Head, useForm } from '@inertiajs/react';
import { CircleAlertIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Service Types',
        href: serviceTypesUrl.index().url,
    },
    {
        title: 'Create Service Type',
        href: serviceTypesUrl.create().url,
    },
];

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        icon: '',
        description: '',
        order: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(serviceTypesUrl.store().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Service Type" />
            <div className="m-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Hiển thị lỗi */}
                    {Object.keys(errors).length > 0 && (
                        <Alert variant="destructive">
                            <CircleAlertIcon />
                            <AlertTitle>Lỗi!</AlertTitle>
                            <AlertDescription>
                                <ul>
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

                    <div className="gap-1.5">
                        <Label htmlFor="name">Tên loại dịch vụ</Label>
                        <Input
                            id="name"
                            placeholder="Nhập tên loại dịch vụ"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                    </div>

                    <div className="gap-1.5">
                        <Label htmlFor="icon">Icon URL</Label>
                        <Input
                            id="icon"
                            placeholder="https://example.com/icon.png"
                            value={data.icon}
                            onChange={(e) => setData('icon', e.target.value)}
                        />
                    </div>

                    <div className="gap-1.5">
                        <Label htmlFor="order">Thứ tự hiển thị</Label>
                        <Input
                            id="order"
                            type="number"
                            placeholder="0"
                            value={data.order}
                            onChange={(e) =>
                                setData('order', parseInt(e.target.value))
                            }
                        />
                    </div>

                    <div className="gap-1.5">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                            id="description"
                            placeholder="Mô tả ngắn gọn về loại dịch vụ"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                        />
                    </div>

                    <Button type="submit" disabled={processing}>
                        {processing ? 'Đang thêm...' : 'Thêm Loại Dịch Vụ'}
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
