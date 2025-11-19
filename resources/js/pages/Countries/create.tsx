import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import countries from '@/routes/countries';
import { BreadcrumbItem } from '@/types';

import { Head, Link, useForm } from '@inertiajs/react';
import { CircleAlertIcon, Terminal } from 'lucide-react';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Quốc Gia',
        href: countries.index().url,
    },
    {
        title: 'Tạo Một Quốc Gia Mới',
        href: countries.create().url
    }
];
export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(data);
        post(countries.store().url);

    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Countries" />
            <div className="m-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Hiển thị lỗi */}
                    {Object.keys(errors).length > 0 && (
                        <Alert variant="destructive">
                            <CircleAlertIcon />
                            <AlertTitle>Lỗi!</AlertTitle>
                            <AlertDescription>
                                <ul>
                                    {Object.entries(errors).map(([key, message]) =>
                                        <li key={key}>{message as string }</li>
                                    )}
                              </ul>
                            </AlertDescription>
                        </Alert>
                    )}
                    <div className="gap-1.5">
                        <Label htmlFor="country name">Name</Label>
                        <Input
                            placeholder="country name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        ></Input>
                    </div>
                    <div className="gap-1.5">
                        <Label htmlFor="country code">Code</Label>
                        <Input
                            placeholder="country code"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                        ></Input>
                    </div>
                    <div className="gap-1.5">
                        <Label htmlFor="country name">Description</Label>
                        <Textarea
                            placeholder="Country Description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                        />
                    </div>
                    <Button type="submit">Thêm Quốc Gia</Button>
                </form>
            </div>
        </AppLayout>
    );
}
