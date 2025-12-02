import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import countries from '@/routes/countries';
import { BreadcrumbItem } from '@/types';

import { Head, useForm } from '@inertiajs/react';
import { CircleAlertIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Quốc Gia',
        href: countries.index().url,
    },
    {
        title: 'Tạo Một Quốc Gia Mới',
        href: countries.create().url,
    },
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
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Thêm Quốc gia" />
            <div className="mx-auto mt-15 w-[500px] max-w-3xl rounded-xl bg-white p-6 shadow-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Hiển thị lỗi */}
                    {Object.keys(errors).length > 0 && (
                        <Alert
                            variant="destructive"
                            className="flex items-start space-x-3"
                        >
                            <CircleAlertIcon className="mt-1 h-5 w-5 text-red-600" />
                            <div>
                                <AlertTitle className="font-semibold text-red-700">
                                    Lỗi!
                                </AlertTitle>
                                <AlertDescription>
                                    <ul className="list-inside list-disc text-sm text-red-600">
                                        {Object.entries(errors).map(
                                            ([key, message]) => (
                                                <li key={key}>
                                                    {message as string}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </AlertDescription>
                            </div>
                        </Alert>
                    )}

                    <div className="flex flex-col">
                        <Label
                            htmlFor="country-name"
                            className="mb-1 font-medium text-gray-700"
                        >
                            Name
                        </Label>
                        <Input
                            id="country-name"
                            placeholder="Country name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="rounded-lg border border-gray-300 px-4 py-2 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col">
                        <Label
                            htmlFor="country-code"
                            className="mb-1 font-medium text-gray-700"
                        >
                            Code
                        </Label>
                        <Input
                            id="country-code"
                            placeholder="Country code"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            className="rounded-lg border border-gray-300 px-4 py-2 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col">
                        <Label
                            htmlFor="country-description"
                            className="mb-1 font-medium text-gray-700"
                        >
                            Description
                        </Label>
                        <Textarea
                            id="country-description"
                            placeholder="Country Description"
                            value={data.description}
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            className="h-24 resize-none rounded-lg border border-gray-300 px-4 py-2 shadow-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition hover:bg-blue-700"
                    >
                        Thêm Quốc Gia
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
