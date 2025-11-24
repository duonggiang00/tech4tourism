<?php
// app/Http/Controllers/AuthController.php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthController extends Controller
{
    // Hiển thị form đăng ký
    public function showRegister() {
        return Inertia::render('auth/register');
    }

    // Xử lý đăng ký
    public function register(Request $request) {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password, // Model sẽ tự động hash nhờ cast 'hashed'
            'role' => 0, // Mặc định là Khách hàng/User thường
            'is_active' => true, // Mặc định là hoạt động
        ]);

        return redirect()->route('login')->with('success', 'Đăng ký thành công, vui lòng đăng nhập!');
    }

    // Hiển thị form đăng nhập
    public function showLogin() {
        return Inertia::render('auth/login');
    }

    // Xử lý đăng nhập & Tạo JWT Token
    public function login(Request $request) {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Kiểm tra user có tồn tại và đang hoạt động không
        $user = User::where('email', $credentials['email'])->first();
        
        if (!$user) {
            return back()->withErrors(['email' => 'Thông tin đăng nhập không chính xác.']);
        }

        // Kiểm tra user có bị khóa không
        if (!$user->is_active) {
            return back()->withErrors(['email' => 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.']);
        }

        // Thử đăng nhập và lấy token
        if (! $token = auth('api')->attempt($credentials)) {
             // Trả về lỗi cho Inertia hiển thị
            return back()->withErrors(['email' => 'Thông tin đăng nhập không chính xác.']);
        }

        // --- MẤU CHỐT: Lưu JWT vào Cookie ---
        // Token sẽ tồn tại 60 phút (tùy chỉnh theo config)
        $cookie = cookie('jwt_token', $token, 60); 

        return redirect()->route('dashboard')->withCookie($cookie);
    }

    // Đăng xuất
    public function logout(Request $request) {
        // Đăng xuất khỏi session nếu có
        Auth::logout();
        
        // Xóa cookie JWT token
        $cookie = cookie()->forget('jwt_token');
        
        // Invalidate session
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return redirect()->route('login')->withCookie($cookie);
    }
}