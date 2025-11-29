<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// Import Controllers
use App\Http\Controllers\{
    AuthController,
    BookingController,
    CategoryController,
    CountryController,
    ProvidersController,
    ServiceAttributesController,
    ServiceController,
    ServiceTypeController,
    TestController,
    TourController,
    UserController
};

use App\Http\Controllers\Api\{
    TourImagesController,
    TourScheduleController,
    TourServiceController
};

/*
|--------------------------------------------------------------------------
| GUEST ROUTES
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register'])->name('register.store');
});

// Logout
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

/*
|--------------------------------------------------------------------------
| PUBLIC CLIENT ROUTES
|--------------------------------------------------------------------------
*/
Route::get('/booking/create', [BookingController::class, 'create'])->name('booking.create');
Route::post('/booking', [BookingController::class, 'store'])->name('booking.store');

Route::get('/booking/success/{code}', fn ($code) => 
    Inertia::render('Bookings/Success', ['code' => $code])
)->name('booking.success');

Route::get('/', fn () => Inertia::render('Home'))->name('home');


/*
|--------------------------------------------------------------------------
| ADMIN ROUTES (Role: 1)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:1'])->group(function () {

    Route::resource('users', UserController::class)->except(['show', 'edit']);

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('bookings', BookingController::class)->only([
            'index', 'show', 'update', 'destroy', 'create', 'store'
        ]);
    });
});


/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES (Role: Admin + Sale + Guide...)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', fn () => Inertia::render('dashboard'))->name('dashboard');

    // Basic resources
    Route::resources([
        'countries'          => CountryController::class,
        'categories'         => CategoryController::class,
        'tours'              => TourController::class,
        'test'               => TestController::class,
        'service-types'      => ServiceTypeController::class,
        'services'           => ServiceController::class,
        'providers'          => ProvidersController::class,
        'service-attributes' => ServiceAttributesController::class,
    ]);

    // Nested API Resources (Tour Images, Schedules, Service)
    Route::prefix('tours/{tour}')->group(function () {
        Route::apiResource('schedules', TourScheduleController::class);
        Route::apiResource('images', TourImagesController::class);
        Route::apiResource('tourservices', TourServiceController::class);
    });
});

// Import Settings Routes
require __DIR__ . '/settings.php';
