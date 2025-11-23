<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CountryController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\TourController;
use App\Http\Controllers\TourImagesController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;

// Chỉ Admin mới được vào group này
Route::middleware(['auth', 'role:1'])->group(function () {
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
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

    Route::get('countries', [CountryController::class, 'index'])->name('countries.index');
    Route::get('/countries/create', [CountryController::class, 'create'])->name('countries.create');
    Route::post('/countries', [CountryController::class, 'store'])->name('countries.store');
    Route::get('/countries/{country}/edit', [CountryController::class, 'edit'])->name('countries.edit');
    Route::put('/countries/{country}/update', [CountryController::class, 'update'])->name('countries.update');
    Route::delete('/countries/{country}', [CountryController::class, 'destroy'])->name('countries.destroy');
    Route::resource('categories',CategoryController::class);
    Route::resource('tours', TourController::class);
    Route::resource('test', TestController::class);
    Route::resource('tour-images', TourImagesController::class);
});

require __DIR__ . '/settings.php';
