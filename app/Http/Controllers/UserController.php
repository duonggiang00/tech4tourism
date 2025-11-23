<?php
// app/Http/Controllers/UserController.php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    // 1. Lấy danh sách user (có phân trang & search)
    public function index(Request $request)
    {
        $users = User::with('detail') // Eager load bảng phụ
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
            })
            ->orderBy('created_at', 'desc') // Sắp xếp mới nhất trước
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search']),
        ]);
    }

    // 2. Hiển thị form tạo user mới
    public function create()
    {
        return Inertia::render('Users/Create');
    }

    // 3. Lưu user mới
    public function store(StoreUserRequest $request)
    {
        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password, // Model sẽ tự động hash
            'role' => $request->role,
            'is_active' => $request->is_active ?? true,
        ]);

        return redirect()->route('users.index')->with('success', 'Tạo người dùng thành công.');
    }

    // 4. Cập nhật Role và Trạng thái (Lock/Unlock)
    public function update(Request $request, User $user)
    {
        // Chặn không cho tự sửa chính mình (để tránh admin tự khóa mình)
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Bạn không thể tự thay đổi quyền hạn của chính mình.');
        }

        $validated = $request->validate([
            'role' => ['required', 'integer', Rule::in([0, 1, 2, 3])], // 0:User, 1:Admin, 2:Guide, 3:Sale
            'is_active' => ['required', 'boolean'],
        ]);

        $user->update($validated);

        return back()->with('success', 'Cập nhật người dùng thành công.');
    }

    // 5. Xóa user
    public function destroy(User $user)
    {
        // Chặn không cho tự xóa chính mình
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Bạn không thể xóa chính mình.');
        }

        $user->delete();

        return redirect()->route('users.index')->with('success', 'Xóa người dùng thành công.');
    }
}