<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        // Giữ nguyên phần random quote nếu bạn muốn
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],

            // --- SỬA PHẦN NÀY ---
            'flash' => [
                // Hứng message 'success' từ Controller (dùng cho đăng ký/đăng nhập thành công)
                'success' => fn() => $request->session()->get('success'),

                // Hứng message 'error' nếu có (dùng cho lỗi logic)
                'error' => fn() => $request->session()->get('error'),

                // Giữ lại 'message' nếu hệ thống cũ của bạn có dùng
                'message' => fn() => $request->session()->get('message'),

                // Custom data for success modal
                'success_instance_id' => fn() => $request->session()->get('success_instance_id'),
            ],
            // --------------------

            'sidebarOpen' => !$request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
