import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

function HelloWorld() {
    return <AppLayout>
        Hello World
       <Head title='Hello world' />
    </AppLayout>;
}

export default HelloWorld;
