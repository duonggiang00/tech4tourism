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
import provinceUrl from '@/routes/province';
import { BreadcrumbItem } from '@/types';

import { Head, useForm } from '@inertiajs/react';
import { CircleAlertIcon } from 'lucide-react';
import { useMemo } from 'react';
import { Country } from '../Countries';

interface Province {
    id: number;
    name: string;
    country_id: number;
    description: string;
}

interface Props {
    province: Province;
    countries: Country[];
}

export default function Edit({ province, countries }: Props) {
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            { title: 'Tỉnh thành', href: provinceUrl.index().url },
            {
                title: `Sửa: ${province.name}`,
                href: provinceUrl.edit(province.id).url,
            },
        ],
        [province.id, province.name],
    );

    const { data, setData, put, processing, errors } = useForm({
        name: province.name,
        country_id: province.country_id,
        description: province.description,
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        put(provinceUrl.update(province.id).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sửa tỉnh thành" />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="overflow-hidden rounded-2xl border bg-white p-6 shadow-xl">
                    {/* Hiển thị lỗi */}
                    {Object.keys(errors).length > 0 && (
                        <Alert
                            className="mb-4 rounded-xl p-4"
                            variant="destructive"
                        >
                            <CircleAlertIcon className="mr-2" />
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

                    <form onSubmit={handleUpdate} className="space-y-6">
                        {/* Tên tỉnh thành */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="province_name">
                                Tên tỉnh thành
                            </Label>
                            <Input
                                placeholder="Nhập tên tỉnh thành"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                            />
                        </div>

                        {/* Quốc gia */}
                        <div className="flex flex-col gap-2">
                            <Label>Quốc gia</Label>
                            <Select
                                value={String(data.country_id || '')}
                                onValueChange={(val) =>
                                    setData('country_id', Number(val))
                                }
                            >
                                <SelectTrigger className="w-[240px]">
                                    <SelectValue placeholder="Chọn quốc gia" />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map((country) => (
                                        <SelectItem
                                            key={country.id}
                                            value={String(country.id)}
                                        >
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Mô tả */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="province_description">Mô tả</Label>
                            <Textarea
                                placeholder="Nhập mô tả..."
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                            />
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-yellow-500 px-5 py-2 text-white shadow-lg transition-all duration-200 hover:bg-yellow-600"
                        >
                            ✏️ Sửa Tỉnh thành
                        </Button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
