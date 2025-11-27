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
import { useMemo } from 'react';

interface Country {
    id: number;
    name: string;
    code: string;
    description: string;
}

interface Props {
    country: Country;
}

export default function Edit({ country }: Props) {
    console.log(country);
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            {
                title: 'Quốc Gia',
                href: countries.index().url,
            },
            {
                title: `Edit Quốc Gia ${country.name} `,
                href: countries.edit(country.id).url,
            },
        ],
        [country.id, country.name],
    );

    const { data, setData, put, processing, errors } = useForm({
        name: country.name,
        code: country.code,
        description: country.description,
    });

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(data);
        put(countries.update(country.id).url);
    };
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sửa Quốc gia" />
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
                    <Button disabled={processing} type="submit">
                        Sửa Quốc Gia
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
