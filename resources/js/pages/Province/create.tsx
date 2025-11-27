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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tỉnh thành',
        href: provinceUrl.index().url,
    },
    {
        title: 'Tạo Một tỉnh thành mới',
        href: provinceUrl.create().url,
    },
];
export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        country_id: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(data);
        post(provinceUrl.store().url);
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Thêm tỉnh thành mới" />
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
                        <Label htmlFor="province_name">Tên tỉnh thành</Label>
                        <Input
                            placeholder="Nhập tên tỉnh thành..."
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        ></Input>
                    </div>
                    <div className="gap-1.5">
                        <Label htmlFor="province_countryId">Tên Quốc gia</Label>
                        <Input
                            placeholder="Nhập tên quốc gia"
                            value={data.country_id}
                            onChange={(e) =>
                                setData('country_id', e.target.value)
                            }
                        ></Input>
                    </div>
                    <div className="gap-1.5">
                        <Label htmlFor="province_description">Mô tả</Label>
                        <Textarea
                            placeholder="Nhập mổ tả"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                        />
                    </div>
                    <Button type="submit">Thêm Tỉnh thành</Button>
                </form>
            </div>
        </AppLayout>
    );
}
