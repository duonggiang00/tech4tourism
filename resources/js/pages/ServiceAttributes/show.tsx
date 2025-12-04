import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import serviceAttributes from '@/routes/service-attributes';
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

interface Service {
    id: number;
    name: string;
}

interface Attribute {
    id: number;
    service_id: number;
    name: string;
    value: string;
    created_at: string;
    updated_at: string;
    service?: Service;
}

interface PageProps {
    attribute: Attribute;
}

export default function Show() {
    const { attribute } = usePage<PageProps>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Thuộc tính dịch vụ',
            href: serviceAttributes.index().url,
        },
        {
            title: attribute.name,
            href: serviceAttributes.show(attribute.id).url,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Chi tiết thuộc tính: ${attribute.name}`} />

            <div className="relative m-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
                {/* NÚT SỬA TRÊN GÓC PHẢI */}
                <Link
                    href={serviceAttributes.edit(attribute.id).url}
                    className="absolute top-6 right-6"
                >
                    <Button className="flex items-center gap-2">
                        <Pencil className="h-4 w-4" />
                        Sửa
                    </Button>
                </Link>

                <h2 className="mb-6 text-2xl font-semibold text-gray-800">
                    Chi tiết thuộc tính dịch vụ
                </h2>

                <div className="space-y-4 text-lg">
                    <div>
                        <strong className="text-gray-600">
                            Tên thuộc tính:
                        </strong>
                        <p>{attribute.name}</p>
                    </div>

                    <div>
                        <strong className="text-gray-600">Giá trị:</strong>
                        <p>{attribute.value || '—'}</p>
                    </div>

                    <div>
                        <strong className="text-gray-600">Dịch vụ:</strong>
                        <p>{attribute.service?.name || '—'}</p>
                    </div>

                    <div>
                        <strong className="text-gray-600">Ngày tạo:</strong>
                        <p>{new Date(attribute.created_at).toLocaleString()}</p>
                    </div>

                    <div>
                        <strong className="text-gray-600">
                            Cập nhật lần cuối:
                        </strong>
                        <p>{new Date(attribute.updated_at).toLocaleString()}</p>
                    </div>
                </div>

                {/* Nút quay lại */}
                <div className="mt-10">
                    <Link href={serviceAttributes.index().url}>
                        <Button variant="outline">Quay lại</Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
