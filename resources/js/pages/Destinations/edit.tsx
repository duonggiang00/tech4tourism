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

interface Destination {
    id: number;
    name: string;
    country_id: number;
    province_id: number;
    address: string;
    status: string;
    description: string;
}

interface PageProps {
    countries: Country[];
    provinces: Province[];
    destination: Destination;
    flash: { message?: string };
}

export default function Edit() {
    const { countries, provinces, destination, flash } = usePage()
        .props as PageProps;

    const { data, setData, put, processing, errors } = useForm({
        name: destination.name,
        country_id: String(destination.country_id),
        province_id: String(destination.province_id),
        address: destination.address,
        status: String(destination.status),
        description: destination.description || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Điểm đến', href: destinationUrl.index().url },
        {
            title: 'Sửa điểm đến',
            href: destinationUrl.edit(destination.id).url,
        },
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(destinationUrl.update(destination.id).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sửa điểm đến" />
            <div className="m-4 max-w-2xl space-y-6 rounded-lg bg-white p-6 shadow-md">
                {flash.message && (
                    <Alert variant="default">
                        <CircleAlertIcon />
                        <AlertTitle>Thông báo!</AlertTitle>
                        <AlertDescription>{flash.message}</AlertDescription>
                    </Alert>
                )}

                {Object.keys(errors).length > 0 && (
                    <Alert variant="destructive">
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

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Tên điểm đến */}
                    <div className="flex flex-col space-y-1">
                        <Label htmlFor="name">Tên điểm đến</Label>
                        <Input
                            id="name"
                            placeholder="Nhập tên điểm đến"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                    </div>

                    {/* Quốc gia */}
                    <div className="flex flex-col space-y-1">
                        <Label htmlFor="country_id">Quốc gia</Label>
                        <Select
                            value={data.country_id}
                            onValueChange={(val) => {
                                setData('country_id', val);
                                setData('province_id', ''); // reset tỉnh khi đổi quốc gia
                            }}
                        >
                            <SelectTrigger className="w-full rounded border p-2">
                                <SelectValue placeholder="Chọn quốc gia" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 w-full overflow-auto">
                                {countries.map((c) => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tỉnh thành */}
                    <div className="flex flex-col space-y-1">
                        <Label htmlFor="province_id">Tỉnh thành</Label>
                        <Select
                            value={data.province_id}
                            onValueChange={(val) => setData('province_id', val)}
                            disabled={!data.country_id}
                        >
                            <SelectTrigger className="w-full rounded border p-2">
                                <SelectValue placeholder="Chọn tỉnh thành" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60 w-full overflow-auto">
                                {provinces
                                    .filter(
                                        (p) =>
                                            p.country_id ===
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
                    <div className="flex flex-col space-y-1">
                        <Label htmlFor="address">Địa chỉ</Label>
                        <Input
                            id="address"
                            placeholder="Nhập địa chỉ"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                        />
                    </div>

                    {/* Trạng thái */}
                    <div className="flex flex-col space-y-1">
                        <Label htmlFor="status">Trạng thái</Label>
                        <select
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="w-full rounded border p-2"
                        >
                            <option value="" hidden>
                                Chọn trạng thái
                            </option>
                            <option value="1">Hoạt động</option>
                            <option value="0">Không hoạt động</option>
                        </select>
                    </div>

                    {/* Mô tả */}
                    <div className="flex flex-col space-y-1">
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

                    {/* Submit */}
                    <Button
                        type="submit"
                        className="w-full bg-yellow-500 hover:bg-yellow-600"
                        disabled={processing}
                    >
                        Cập nhật điểm đến
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
