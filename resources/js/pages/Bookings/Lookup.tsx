import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, AlertCircle } from 'lucide-react';

interface Props {
    code?: string;
    error?: string;
}

export default function BookingLookup({ code, error }: Props) {
    const [searchCode, setSearchCode] = useState(code || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchCode.trim()) return;
        router.visit(`/booking/${searchCode.trim().toUpperCase()}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Head title="Tra cứu Booking" />
            
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Tra cứu Booking</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nhập mã booking</label>
                            <Input
                                type="text"
                                placeholder="VD: BK-XXXXXXXX"
                                value={searchCode}
                                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                                className="uppercase"
                                required
                            />
                            <p className="text-xs text-gray-500">
                                Mã booking thường có dạng BK-XXXXXXXX (8 ký tự)
                            </p>
                        </div>
                        <Button type="submit" className="w-full" size="lg">
                            <Search className="mr-2 h-4 w-4" />
                            Tra cứu
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

