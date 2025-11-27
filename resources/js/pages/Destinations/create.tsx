import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import destinationUrl from '@/routes/destination';
import { BreadcrumbItem } from '@/types';

import { Head, useForm } from '@inertiajs/react';
import { CircleAlertIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Điểm đến',
        href: destinationUrl.index().url,
    },
    {
        title: 'Tạo Một điểm đến mới',
        href: destinationUrl.create().url,
    },
];
export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        province_id: '',
        address: '',
        status: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(data);
        post(destinationUrl.store().url);
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Thêm điếm đến mới" />
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
                        <Label htmlFor="name">Tên tỉnh thành</Label>
                        <Input
                            placeholder="Nhập tên tỉnh thành..."
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        ></Input>
                    </div>
                    <div className="gap-1.5">
                        <Label htmlFor="province">Tên Quốc gia</Label>
                        <Input
                            placeholder="Nhập tên quốc gia"
                            value={data.province_id}
                            onChange={(e) =>
                                setData('province_id', e.target.value)
                            }
                        ></Input>
                    </div>
                    <div className="gap-1.5">
                        <Label htmlFor="address">Địa chỉ</Label>
                        <Input
                            placeholder="Nhập tên địa chỉ"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                        ></Input>
                    </div>
                    <div className="gap-1.5">
                        <Label htmlFor="status">Trạng thái</Label>
                        <select
                            id="status"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="rounded border p-2"
                        >
                            <option value="" hidden>
                                Chọn trạng thái
                            </option>
                            <option value="1">Có</option>
                            <option value="2">Không</option>
                        </select>
                    </div>

                    <div className="gap-1.5">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                            placeholder="Nhập mổ tả"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                        />
                    </div>
                    <Button type="submit">Thêm điểm đến</Button>
                </form>
            </div>
        </AppLayout>
    );
}
