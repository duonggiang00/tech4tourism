import { Policy } from '@/app';
import { ConfirmDeleteDialog } from '@/components/common/ConfirmDeleteDialog';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import policyUrl from '@/routes/policies';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Edit, Eye, FileText, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PolicyFormDialog } from './dialog';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Quản lý Chính sách',
        href: policyUrl.index().url,
    },
];

interface Props {
    policies: Policy[];
}

export default function Index({ policies }: Props) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
    const [deletePolicyId, setDeletePolicyId] = useState<number | null>(null);

    const { delete: destroy, processing: deleting } = useForm();

    const openCreateDialog = () => {
        setEditingPolicy(null);
        setIsDialogOpen(true);
    };

    const openEditDialog = (policy: Policy) => {
        setEditingPolicy(policy);
        setIsDialogOpen(true);
    };

    const handleDelete = () => {
        if (deletePolicyId) {
            destroy(policyUrl.destroy(deletePolicyId).url, {
                onSuccess: () => {
                    toast.success('Đã xóa chính sách thành công');
                    setDeletePolicyId(null);
                },
                onError: () => {
                    toast.error('Lỗi khi xóa chính sách');
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Quản lý Chính sách" />

            <div className="min-h-screen bg-gray-50 p-6">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Header Section */}
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Danh sách Chính sách
                            </h1>
                            <p className="text-sm text-gray-500">
                                Quản lý các điều khoản và quy định chung.
                            </p>
                        </div>
                        <Button onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" /> Thêm mới
                        </Button>
                    </div>

                    {/* Table Section */}
                    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                        {/* Desktop View */}
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                                        <TableHead className="w-[50px] text-center">
                                            STT
                                        </TableHead>
                                        <TableHead className="min-w-[200px]">
                                            Tiêu đề
                                        </TableHead>

                                        <TableHead className="w-[150px] text-center">
                                            Hành động
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {policies.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={3}
                                                className="h-32 text-center text-gray-500"
                                            >
                                                Chưa có chính sách nào. Hãy thêm
                                                mới!
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        policies.map((policy, index) => (
                                            <TableRow key={policy.id}>
                                                <TableCell className="text-center font-medium text-gray-500">
                                                    {index + 1}
                                                </TableCell>

                                                <TableCell className="font-semibold text-gray-800">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 shrink-0 text-blue-500" />
                                                        <Link
                                                            href={policyUrl.show(
                                                                policy.id,
                                                            )}
                                                            className="hover:text-blue-600 hover:underline"
                                                        >
                                                            {policy.title}
                                                        </Link>
                                                    </div>
                                                </TableCell>

                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Link href={policyUrl.show(policy.id)}>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>

                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-gray-500 hover:bg-amber-50 hover:text-amber-600"
                                                            onClick={() => openEditDialog(policy)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>

                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                                            onClick={() => setDeletePolicyId(policy.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden">
                            {policies.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    Chưa có chính sách nào. Hãy thêm mới!
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {policies.map((policy, index) => (
                                        <div key={policy.id} className="p-4 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <span className="text-gray-400 font-mono text-sm pt-0.5">#{index + 1}</span>
                                                <FileText className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                                <Link
                                                    href={policyUrl.show(policy.id)}
                                                    className="font-semibold text-gray-900 leading-tight hover:text-blue-600 flex-1"
                                                >
                                                    {policy.title}
                                                </Link>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 pt-2">
                                                <Link href={policyUrl.show(policy.id)} className="w-full">
                                                    <Button variant="outline" size="sm" className="w-full text-blue-600">
                                                        <Eye className="h-4 w-4 mr-1" /> Xem
                                                    </Button>
                                                </Link>
                                                <Button variant="outline" size="sm" onClick={() => openEditDialog(policy)} className="w-full text-amber-600">
                                                    <Edit className="h-4 w-4 mr-1" /> Sửa
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => setDeletePolicyId(policy.id)} className="w-full text-red-600">
                                                    <Trash2 className="h-4 w-4 mr-1" /> Xóa
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <PolicyFormDialog
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    policy={editingPolicy}
                />

                {deletePolicyId && (
                    <ConfirmDeleteDialog
                        open={!!deletePolicyId}
                        onOpenChange={(open) =>
                            !open && setDeletePolicyId(null)
                        }
                        onConfirm={handleDelete}
                        title="Xóa chính sách?"
                        description="Bạn có chắc chắn muốn xóa chính sách này không? Hành động này không thể hoàn tác."
                        loading={deleting}
                        isDestructive
                    />
                )}
            </div>
        </AppLayout>
    );
}
