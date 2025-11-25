import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import serviceAttributes from '@/routes/service-attributes';
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

interface Service {
    id: number;
    name: string;
}

interface Attribute {
    id: number;
    id_service: number;
    name: string;
    value: string;
    type: string;
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

            <div className="m-8 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-2xl font-semibold text-gray-800">
                    Chi tiết thuộc tính dịch vụ
                </h2>

                <div className="space-y-4">
                    <div>
                        <strong className="text-gray-600">
                            Tên thuộc tính:
                        </strong>
                        <p className="text-lg">{attribute.name}</p>
                    </div>

                    <div>
                        <strong className="text-gray-600">Giá trị:</strong>
                        <p className="text-lg">{attribute.value || '—'}</p>
                    </div>

                    <div>
                        <strong className="text-gray-600">Loại:</strong>
                        <p className="text-lg">{attribute.type || '—'}</p>
                    </div>

                    <div>
                        <strong className="text-gray-600">Dịch vụ:</strong>
                        <p className="text-lg">
                            {attribute.service?.name || '—'}
                        </p>
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

                <div className="mt-8 flex gap-4">
                    <Link href={serviceAttributes.edit(attribute.id).url}>
                        <Button>Chỉnh sửa</Button>
                    </Link>
                    <Link href={serviceAttributes.index().url}>
                        <Button variant="outline">Quay lại</Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
