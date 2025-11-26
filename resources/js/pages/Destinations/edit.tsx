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
import { useMemo } from 'react';

interface Destination {
    id: number;
    name: string;
    province_id: string;
    address: string;
    status: string;
    description: string;
}
interface Props {
    destination: Destination;
}

export default function Edit({ destination }: Props) {
    console.log(destination);
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            {
                title: 'Điểm đến',
                href: destinationUrl.index().url,
            },
            {
                title: `Edit Điểm đến ${destination.name} `,
                href: destinationUrl.edit(destination.id).url,
            },
        ],
        [destination.id, destination.name],
    );

    const { data, setData, put, processing, errors } = useForm({
        name: destination.name,
        province_id: destination.province_id,
        address: destination.address,
        status: destination.status,
        description: destination.description,
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(data);
        put(destinationUrl.update(destination.id).url);
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Countries" />
            <div className="m-4">
                <form onSubmit={handleUpdate} className="space-y-4">
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
                    <Button type="submit">Sửa điểm đến</Button>
                </form>
            </div>
        </AppLayout>
    );
}
