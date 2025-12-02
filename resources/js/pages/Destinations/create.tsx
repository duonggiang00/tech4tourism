import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import destinationUrl from '@/routes/destination';
import { BreadcrumbItem } from '@/types';

import { Head, useForm, usePage } from '@inertiajs/react';
import { CircleAlertIcon } from 'lucide-react';

interface Country {
    id: number;
    name: string;
}
interface Province {
    id: number;
    name: string;
    country_id: number;
}

interface PageProps {
    countries: Country[];
    provinces: Province[];
    flash: { message?: string };
}

export default function Create() {
    const { countries, provinces, flash } = usePage().props as PageProps;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        country_id: '',
        province_id: '',
        address: '',
        status: '',
        description: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Điểm đến', href: destinationUrl.index().url },
        { title: 'Tạo điểm đến mới', href: destinationUrl.create().url },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(destinationUrl.store().url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tạo điểm đến mới" />
            <div className="m-4 max-w-3xl rounded-lg bg-white p-6 shadow-md">
                {/* Flash message */}
                {flash.message && (
                    <Alert variant="default" className="mb-4">
                        <CircleAlertIcon />
                        <AlertTitle>Thông báo!</AlertTitle>
                        <AlertDescription>{flash.message}</AlertDescription>
                    </Alert>
                )}

                {/* Validation errors */}
                {Object.keys(errors).length > 0 && (
                    <Alert variant="destructive" className="mb-4">
                        <CircleAlertIcon />
                        <AlertTitle>Lỗi!</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc pl-5">
                                {Object.entries(errors).map(([k, msg]) => (
                                    <li key={k}>{msg as string}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="w-[500px] space-y-4">
                    {/* Tên điểm đến */}
                    <div className="flex flex-col">
                        <Label htmlFor="name">Tên điểm đến</Label>
                        <Input
                            id="name"
                            placeholder="Nhập tên điểm đến"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                    </div>

                    {/* Quốc gia */}
                    <div className="flex flex-col">
                        <Label htmlFor="country_id">Quốc gia</Label>
                        <Select
                            value={data.country_id}
                            onValueChange={(val) => setData('country_id', val)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Chọn quốc gia" />
                            </SelectTrigger>
                            <SelectContent>
                                {countries.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tỉnh thành */}
                    <div className="flex flex-col">
                        <Label htmlFor="province_id">Tỉnh thành</Label>
                        <Select
                            value={data.province_id}
                            onValueChange={(val) => setData('province_id', val)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Chọn tỉnh thành" />
                            </SelectTrigger>
                            <SelectContent>
                                {provinces
                                    .filter(
                                        (p) =>
                                            p.country_id ==
                                            Number(data.country_id),
                                    )
                                    .map((p) => (
                                        <SelectItem
                                            key={p.id}
                                            value={String(p.id)}
                                        >
                                            {p.name}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Địa chỉ */}
                    <div className="flex flex-col">
                        <Label htmlFor="address">Địa chỉ</Label>
                        <Input
                            id="address"
                            placeholder="Nhập địa chỉ"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                        />
                    </div>

                    {/* Trạng thái */}
                    <div className="flex flex-col">
                        <Label htmlFor="status">Trạng thái</Label>
                        <select
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="rounded border p-2"
                        >
                            <option value="" hidden>
                                Chọn trạng thái
                            </option>
                            <option value="1">Hoạt động</option>
                            <option value="0">Không hoạt động</option>
                        </select>
                    </div>

                    {/* Mô tả */}
                    <div className="flex flex-col">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                            id="description"
                            placeholder="Nhập mô tả"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                        />
                    </div>

                    {/* Submit button */}
                    <Button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600"
                        disabled={processing}
                    >
                        Thêm điểm đến
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
