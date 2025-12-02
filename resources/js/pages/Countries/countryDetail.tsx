import AppLayout from '@/layouts/app-layout';
import countries from '@/routes/countries';
import { BreadcrumbItem } from '@/types';
import { useMemo } from 'react';
import { Province } from '../Province';
import { Country } from './index';

type Props = {
    country: Country;
    province: Province;
};

const countryDetail = ({ country, province }: Props) => {
    const breadcrumbs: BreadcrumbItem[] = useMemo(
        () => [
            {
                title: 'Quốc Gia',
                href: countries.index().url,
            },
            {
                title: `Chi tiết Quốc Gia ${country.name} `,
                href: countries.show(country.id).url,
            },
        ],
        [country.id, country.name],
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="m-5 flex flex-col gap-10 rounded-2xl p-5 shadow-lg">
                <h2 className="text-center text-2xl font-bold">
                    Trang chi tiết Quốc gia
                </h2>
                <div className="rounded-2xl p-5 shadow-md">
                    <p className="flex gap-5 font-bold">
                        <span className="text-gray-600">Tên Quốc gia:</span>{' '}
                        {country.name}
                    </p>
                    <p className="flex gap-5 font-bold">
                        <span className="text-gray-600">Mã Quốc gia:</span> Quốc
                        gia: {country.code}
                    </p>
                    <p className="flex gap-5 font-bold">
                        <span className="text-gray-600">Mô tả:</span>{' '}
                        {country.description}
                    </p>
                </div>
                <div className="rounded-2xl p-5 shadow-md">
                    <p className="p-5 font-bold">
                        {' '}
                        Các tỉnh thành thuộc {country.name}
                    </p>
                    {country.id == province.id ? (
                        <ul>
                            <li>{province.name}</li>
                        </ul>
                    ) : (
                        <p className="text-center text-gray-600">
                            Không có tỉnh thành nào
                        </p>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default countryDetail;
