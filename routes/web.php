<?php



use App\Http\Controllers\Api\TourImagesController;
use App\Http\Controllers\Api\TourScheduleController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CountryController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EmployeesController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\TourController;

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BookingController;

// Chỉ Admin mới được vào group này
Route::middleware(['auth', 'role:1'])->group(function () {
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
});
// --- Public Routes (Cho khách hàng) ---
// Route nhận form POST đặt tour
Route::post('/booking', [BookingController::class, 'store'])->name('booking.store');

// Trang thông báo thành công (Tùy chọn)
Route::get('/booking/success/{code}', function ($code) {
    return Inertia::render('Bookings/Success', ['code' => $code]);
})->name('booking.success');


// --- Admin Routes (Cần đăng nhập & quyền Admin/Sale) ---
Route::middleware(['auth', 'role:1'])->group(function () { // role:1 hoặc role:3 (Sale)

    // Quản lý danh sách booking
    Route::get('/admin/bookings', [BookingController::class, 'index'])->name('admin.bookings.index');
    
    // Xem chi tiết booking
    Route::get('/admin/bookings/{booking}', [BookingController::class, 'show'])->name('admin.bookings.show');
    
    // Cập nhật trạng thái booking
    Route::put('/admin/bookings/{booking}', [BookingController::class, 'update'])->name('admin.bookings.update');
    
    // Xóa booking
    Route::delete('/admin/bookings/{booking}', [BookingController::class, 'destroy'])->name('admin.bookings.destroy');
});



// Routes cho khách (chưa đăng nhập)
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->name('register.store');
});

// Route logout - không cần middleware vì đang logout
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Routes cần bảo vệ (Yêu cầu phải có JWT Token hợp lệ)
// Sử dụng middleware chúng ta vừa tạo
Route::middleware(['jwt.inertia'])->group(function () {

    Route::get('/', function () {
        return Inertia::render('Home'); // Trang chủ đặt tour
    })->name('home');

    // Các route quản lý đặt tour ở đây...
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');  
    Route::resource('countries', CountryController::class);
    Route::resource('categories',CategoryController::class);
    Route::resource('tours', TourController::class);
    Route::resource('test', TestController::class);
    Route::apiResource('tours/{tour}/images', TourImagesController::class);
    Route::apiResource('tours/{tour}/schedules', TourScheduleController::class);
    // Route::apiResource('tour_images', TourImagesController::class);
});

require __DIR__ . '/settings.php';
