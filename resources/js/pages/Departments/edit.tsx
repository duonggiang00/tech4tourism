import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import categories from '@/routes/categories';
import departmentUrl from '@/routes/departments';
import { BreadcrumbItem } from '@/types';

import { Head, useForm } from '@inertiajs/react';
import { CircleAlertIcon } from 'lucide-react';
import { useMemo } from 'react';

interface Department {
    id: number;
    name: string;
    description: string;
}

interface Props {
    department: Department;
}

export default function Edit({ department }: Props) {
    // console.log(category);
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            {
                title: 'Danh Mục',
                href: categories.index().url,
            },
            {
                title: `Edit Danh mục ${department.name} `,
                href: categories.edit(department.id).url,
            },
        ],
        [department.id, department.name],
    );

    const { data, setData, put, processing, errors } = useForm({
        name: department.name,
        description: department.description,
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(data);
        put(departmentUrl.update(department.id).url);
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Danh Mục" />
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
                        <Label htmlFor="category title">Title</Label>
                        <Input
                            placeholder="category title"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        ></Input>
                    </div>
                    <div className="gap-1.5">
                        <Label htmlFor="category description">
                            Description
                        </Label>
                        <Textarea
                            placeholder="category Description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                        />
                    </div>
                    <Button disabled={processing} type="submit">
                        Sửa Department
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
