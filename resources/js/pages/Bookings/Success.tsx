import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CircleCheck, Home, CheckCircle2 } from 'lucide-react';
import booking from '@/routes/booking';
import { home } from '@/routes';

interface Props {
    code: string;
    flash?: {
        success?: string;
    };
}

export default function BookingSuccess({ code, flash }: Props) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Head title="Đặt tour thành công" />

            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-green-100 p-4">
                            <CheckCircle2 className="h-16 w-16 text-green-600" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold text-gray-900">
                        Đặt tour thành công!
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {flash?.success && (
                        <Alert variant="default" className="bg-green-50 border-green-200">
                            <CircleCheck className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">Thành công!</AlertTitle>
                            <AlertDescription className="text-green-700">
                                {flash.success}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="text-center space-y-4">
                        <div>
                            <p className="text-gray-600 mb-2">Mã booking của bạn:</p>
                            <p className="text-2xl font-bold text-blue-600 bg-blue-50 px-6 py-3 rounded-lg inline-block">
                                {code}
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
                            <p className="text-sm text-gray-600">
                                <strong>Lưu ý:</strong>
                            </p>
                            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                                <li>Vui lòng lưu lại mã booking để tra cứu thông tin đặt tour</li>
                                <li>Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận</li>
                                <li>Bạn sẽ nhận được email xác nhận tại địa chỉ email đã đăng ký</li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Link href={home()}>
                                <Button size="lg" className="w-full sm:w-auto">
                                    <Home className="mr-2 h-4 w-4" />
                                    Về trang chủ
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => window.print()}
                                className="w-full sm:w-auto"
                            >
                                In trang này
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

