<?php

// app/Http/Middleware/JwtInertiaAuth.php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Auth;

class JwtInertiaAuth
{
    public function handle(Request $request, Closure $next)
    {
        // Lấy token từ Cookie
        $token = $request->cookie('jwt_token');

        if ($token) {
            try {
                // Thiết lập token và lấy user
                JWTAuth::setToken($token);
                $user = JWTAuth::toUser();

                // Đăng nhập user vào guard mặc định (web) để Inertia nhận diện
                Auth::login($user); 
            } catch (\Exception $e) {
                // Nếu token lỗi hoặc hết hạn, xóa cookie và redirect login
                return redirect()->route('login')->withCookie(cookie()->forget('jwt_token'));
            }
        } else {
            // Không có token -> Redirect login
            return redirect()->route('login');
        }

        return $next($request);
    }
}