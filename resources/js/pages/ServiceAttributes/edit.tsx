import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import serviceAttributes from '@/routes/service-attributes';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface Service {
    id: number;
    name: string;
}

interface Attribute {
    id: number;
    service_id: number;
    name: string;
    value: string;
    type?: string;
    service?: Service;
}

interface PageProps {
    attribute: Attribute;
    services: Service[];
}

export default function Edit() {
    const { attribute, services } = usePage<PageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Thuộc tính dịch vụ', href: serviceAttributes.index().url },
        {
            title: attribute.name,
            href: serviceAttributes.show(attribute.id).url,
        },
        { title: 'Chỉnh sửa', href: '#' },
    ];

    const { data, setData, put, processing, errors } = useForm({
        service_id: attribute.service_id,
        name: attribute.name,
        value: attribute.value || '',
        type: attribute.type || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(serviceAttributes.update(attribute.id).url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Chỉnh sửa thuộc tính: ${attribute.name}`} />

            <div className="mx-auto mt-10 max-w-3xl">
                <Card className="shadow-md">
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle className="text-xl font-semibold">
                            Chỉnh sửa Thuộc Tính Dịch Vụ
                        </CardTitle>

                        <Link href={serviceAttributes.show(attribute.id).url}>
                            <Button variant="ghost">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Quay lại
                            </Button>
                        </Link>
                    </CardHeader>

                    <CardContent>
                        <form
                            onSubmit={handleSubmit}
                            className="mt-2 space-y-6"
                        >
                            {/* Dịch vụ */}
                            <div>
                                <label className="text-sm font-medium">
                                    Dịch vụ
                                </label>
                                <Select
                                    value={data.service_id.toString()}
                                    onValueChange={(value) =>
                                        setData('service_id', Number(value))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn dịch vụ" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {services.map((s) => (
                                            <SelectItem
                                                key={s.id}
                                                value={s.id.toString()}
                                            >
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.service_id && (
                                    <p className="text-sm text-red-500">
                                        {errors.service_id}
                                    </p>
                                )}
                            </div>

                            {/* Tên thuộc tính */}
                            <div>
                                <label className="text-sm font-medium">
                                    Tên thuộc tính
                                </label>
                                <Input
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Giá trị */}
                            <div>
                                <label className="text-sm font-medium">
                                    Giá trị
                                </label>
                                <Textarea
                                    value={data.value}
                                    onChange={(e) =>
                                        setData('value', e.target.value)
                                    }
                                />
                                {errors.value && (
                                    <p className="text-sm text-red-500">
                                        {errors.value}
                                    </p>
                                )}
                            </div>

                            {/* Loại (nếu dùng) */}
                            <div>
                                <label className="text-sm font-medium">
                                    Loại
                                </label>
                                <Input
                                    value={data.type}
                                    onChange={(e) =>
                                        setData('type', e.target.value)
                                    }
                                />
                                {errors.type && (
                                    <p className="text-sm text-red-500">
                                        {errors.type}
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end pt-4">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6"
                                >
                                    Lưu thay đổi
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
