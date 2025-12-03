import { Policy } from '@/app';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import policyUrl from '@/routes/policies';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ArrowLeft, Edit, FileText } from 'lucide-react';
import { useState } from 'react';
import { PolicyFormDialog } from './dialog';

interface Props {
    policy: Policy;
}

export default function Show({ policy }: Props) {
    // State quản lý dialog sửa ngay tại trang chi tiết
    const [isEditOpen, setIsEditOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Quản lý Chính sách',
            href: policyUrl.index().url,
        },
        {
            title: 'Chi tiết',
            href: policyUrl.show(policy.id).url,
        },
    ];

    // Format ngày tháng
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Chi tiết: ${policy.title}`} />

            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-4xl space-y-6">
                    {/* Navigation & Actions */}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            className="pl-0 hover:bg-transparent hover:text-blue-600 hover:underline"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại
                        </Button>

                        <Button
                            onClick={() => setIsEditOpen(true)}
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa bài viết
                        </Button>
                    </div>

                    {/* Main Content Card */}
                    <Card className="overflow-hidden shadow-sm">
                        <CardHeader className="bg-white pb-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 rounded-full bg-blue-100 p-2 text-blue-600">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl font-bold text-gray-900">
                                        {policy.title}
                                    </CardTitle>
                                </div>
                            </div>
                        </CardHeader>

                        <Separator />

                        <CardContent className="bg-white p-6 sm:p-8">
                            <div className="prose max-w-none text-gray-700">
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: policy.content,
                                    }}
                                ></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Dialog Edit */}
                <PolicyFormDialog
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                    policy={policy}
                />
            </div>
        </AppLayout>
    );
}
