import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import provinceUrl from '@/routes/province';
import { BreadcrumbItem } from '@/types';

import { Head, useForm } from '@inertiajs/react';
import { CircleAlertIcon } from 'lucide-react';
import { useMemo } from 'react';

interface Province {
    id: number;
    name: string;
    country_id: string;
    description: string;
}

interface Props {
    province: Province;
}

export default function Edit({ province }: Props) {
    console.log(province);
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            {
                title: 'Tỉnh thành',
                href: provinceUrl.index().url,
            },
            {
                title: `Edit Tỉnh thành ${province.name} `,
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
        console.log(data);
        put(provinceUrl.update(province.id).url);
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sửa tỉnh thành" />
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
                        <Label htmlFor="province_name">Tên tỉnh thành</Label>
                        <Input
                            placeholder="Nhập tên tỉnh thành"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        ></Input>
                    </div>
                    <div className="gap-1.5">
                        <Label htmlFor="province_countryId">Tên Quốc gia</Label>
                        <Input
                            placeholder="Nhập tên Quốc gia"
                            value={data.country_id}
                            onChange={(e) =>
                                setData('country_id', e.target.value)
                            }
                        ></Input>
                    </div>
                    <div className="gap-1.5">
                        <Label htmlFor="province_description">Mô tả</Label>
                        <Textarea
                            placeholder="Nhập mô tả..."
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                        />
                    </div>
                    <Button disabled={processing} type="submit">
                        Sửa Quốc Gia
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
