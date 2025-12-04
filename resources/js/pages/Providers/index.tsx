import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
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
import providersUrl from '@/routes/providers';
import { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { CircleCheck, Eye, Pencil, Plus, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Danh sách Nhà Cung Cấp',
        href: providersUrl.index().url,
    },
];

interface Provider {
    id: number;
    name: string;
    email?: string;
    hotline?: string;
    status: string;
}

interface PageProps {
    flash: { message?: string };
    providers: {
        data: Provider[];
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
    };
}

export default function Index() {
    const { providers, flash } = usePage<PageProps>().props;

    const { delete: destroy } = useForm();

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Bạn có chắc muốn xóa nhà cung cấp "${name}"?`)) {
            destroy(providersUrl.destroy(id).url);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case '0':
                return <Badge variant="outline">Không hoạt động</Badge>;
            case '1':
                return (
                    <Badge className="bg-green-100 text-green-700">
                        Hoạt động
                    </Badge>
                );
            case '2':
                return (
                    <Badge className="bg-yellow-100 text-yellow-700">
                        Tạm ngưng
                    </Badge>
                );
            default:
                return <Badge variant="outline">Không rõ</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Danh sách Nhà Cung Cấp" />

            {/* ------------ Thông báo ------------- */}
            <div className="m-4">
                {flash.message && (
                    <Alert className="border-green-200 bg-green-50">
                        <CircleCheck className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">
                            Thông báo
                        </AlertTitle>
                        <AlertDescription className="text-green-700">
                            {flash.message}
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {/* ------------- Nút Thêm --------------- */}
            <div className="m-4 flex justify-end">
                <Link href={providersUrl.create().url}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Thêm Nhà Cung Cấp
                    </Button>
                </Link>
            </div>

            {/* ------------- Bảng danh sách --------------- */}
            <div className="m-8 rounded-lg border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px] text-center">
                                STT
                            </TableHead>
                            <TableHead>Tên</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Hotline</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-center">
                                Hành động
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {providers.data.map((provider, index) => (
                            <TableRow key={provider.id}>
                                <TableCell className="text-center">
                                    {index + 1}
                                </TableCell>

                                <TableCell className="font-medium">
                                    {provider.name}
                                </TableCell>

                                <TableCell>{provider.email || '—'}</TableCell>
                                <TableCell>{provider.hotline || '—'}</TableCell>

                                <TableCell>
                                    {getStatusBadge(provider.status)}
                                </TableCell>

                                <TableCell>
                                    <div className="flex justify-center gap-2">
                                        <Link
                                            href={
                                                providersUrl.show(provider.id)
                                                    .url
                                            }
                                        >
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="hover:text-blue-600"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>

                                        <Link
                                            href={
                                                providersUrl.edit(provider.id)
                                                    .url
                                            }
                                        >
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="hover:text-amber-600"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleDelete(
                                                    provider.id,
                                                    provider.name,
                                                )
                                            }
                                            className="hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* -------- Pagination -------- */}
                <div className="flex justify-center gap-2 p-4">
                    {providers.links.map((link, index) => (
                        <Link
                            key={index}
                            href={link.url || '#'}
                            className={
                                `rounded border px-3 py-1 ` +
                                (link.active
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white hover:bg-gray-100')
                            }
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
