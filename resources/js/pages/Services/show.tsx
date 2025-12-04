import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Info,
    ListChecks,
    Pencil,
    Ruler,
    Tag,
} from 'lucide-react';
import { useState } from 'react';
import { ServiceFormDialog } from './dialog';

export default function Show({ service, serviceTypes, providers }) {
    const [isEditOpen, setIsEditOpen] = useState(false);

    return (
        <AppLayout>
            <Head title={`Chi tiết dịch vụ - ${service.name}`} />

            <div className="mx-auto mt-10 max-w-5xl space-y-10">
                {/* ===== Header Buttons ===== */}
                <div className="flex items-center justify-between">
                    <Link href="/services">
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" /> Quay lại
                        </Button>
                    </Link>

                    <Button
                        className="flex items-center gap-2 bg-amber-500 text-white hover:bg-amber-600"
                        onClick={() => setIsEditOpen(true)}
                    >
                        <Pencil className="h-4 w-4" />
                        Chỉnh sửa
                    </Button>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-gray-800">
                    Chi tiết Dịch vụ
                </h1>

                {/* ================== SERVICE INFO ================== */}
                <Card className="border shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Info className="h-5 w-5 text-blue-600" />
                            Thông tin Dịch vụ
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="font-semibold">Tên dịch vụ</p>
                            <p className="text-lg">{service.name}</p>
                        </div>

                        <div>
                            <p className="font-semibold">Loại dịch vụ</p>
                            <Badge className="flex gap-2 px-3 py-1 text-base">
                                <Tag className="h-4 w-4" />
                                {service.service_type?.name}
                            </Badge>
                        </div>

                        <div>
                            <p className="font-semibold">Đơn vị tính</p>
                            <p className="text-lg">{service.unit || '—'}</p>
                        </div>

                        <div>
                            <p className="font-semibold">Mã dịch vụ</p>
                            <p className="rounded bg-gray-100 px-3 py-1 font-mono text-lg">
                                #{service.id}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* ================== PROVIDER INFO ================== */}
                <Card className="border shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Building2 className="h-5 w-5 text-green-600" />
                            Nhà Cung Cấp
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="font-semibold">Tên nhà cung cấp</p>
                            <p className="text-lg">{service.provider?.name}</p>
                        </div>

                        <div>
                            <p className="font-semibold">Email</p>
                            <p>{service.provider?.email || '—'}</p>
                        </div>

                        <div>
                            <p className="font-semibold">Hotline</p>
                            <p>{service.provider?.hotline || '—'}</p>
                        </div>

                        <div>
                            <p className="font-semibold">Địa chỉ</p>
                            <p>{service.provider?.address || '—'}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* ================== DESCRIPTION ================== */}
                <Card className="border shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Ruler className="h-5 w-5 text-purple-600" />
                            Mô tả dịch vụ
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {service.description ? (
                            <p className="leading-relaxed whitespace-pre-line text-gray-700">
                                {service.description}
                            </p>
                        ) : (
                            <p className="text-gray-400 italic">
                                Không có mô tả.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* ================== TOUR USING THIS SERVICE ================== */}
                <Card className="border shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <ListChecks className="h-5 w-5 text-orange-600" />
                            Tour sử dụng dịch vụ này
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        {service.tour_services?.length > 0 ? (
                            <ul className="space-y-3">
                                {service.tour_services.map((ts, i) => (
                                    <li
                                        key={i}
                                        className="rounded-md border bg-gray-50 p-3 transition hover:bg-gray-100"
                                    >
                                        <p className="font-medium">
                                            {ts.tour?.name || 'Unnamed Tour'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Mã tour: #{ts.tour?.id}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-400 italic">
                                Chưa có tour nào sử dụng dịch vụ này.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ================== EDIT POPUP ================== */}
            <ServiceFormDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                initialData={service}
                title={`Chỉnh sửa dịch vụ: ${service.name}`}
                service_types={serviceTypes}
                providers={providers}
            />
        </AppLayout>
    );
}
