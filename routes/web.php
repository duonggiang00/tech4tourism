<?php

use App\Http\Controllers\Api\TourPolicyController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

// Import Controllers
use App\Http\Controllers\{
    AuthController,
    BookingController,
    CategoryController,
    CountryController,
    DashboardController,
    GuideController,
    ImageUploadController,
    NotificationController,
    PolicyController,
    ProvidersController,
    ServiceAttributesController,
    ServiceController,
    ServiceTypeController,
    TourController,
    UserController
};

use App\Http\Controllers\Api\{
    TourImagesController,
    TourScheduleController,
    TourServiceController,
    TripAssignmentController as ApiTripAssignmentController
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
| GUIDE ROUTES (Role: 2 - Hướng dẫn viên)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'role:2'])->prefix('guide')->name('guide.')->group(function () {
    Route::get('/schedule', [GuideController::class, 'schedule'])->name('schedule');
    Route::get('/trip/{id}', [GuideController::class, 'tripDetail'])->name('trip.detail');
    
    // Check-in
    Route::post('/trip/{assignmentId}/checkin', [GuideController::class, 'createCheckIn'])->name('checkin.create');
    Route::get('/checkin/{checkInId}', [GuideController::class, 'showCheckIn'])->name('checkin.show');
    Route::post('/checkin/{checkInId}/save', [GuideController::class, 'saveCheckIn'])->name('checkin.save');
    Route::delete('/checkin/{checkInId}', [GuideController::class, 'deleteCheckIn'])->name('checkin.delete');
    
    // Notes
    Route::get('/notes', [GuideController::class, 'notes'])->name('notes');
    Route::post('/trip/{assignmentId}/note', [GuideController::class, 'createNote'])->name('note.create');
    Route::put('/note/{noteId}', [GuideController::class, 'updateNote'])->name('note.update');
    Route::delete('/note/{noteId}', [GuideController::class, 'deleteNote'])->name('note.delete');
});


/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES (Role: Admin + Sale + Guide...)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Basic resources
    Route::resources([
        'countries'          => CountryController::class,
        'categories'         => CategoryController::class,
        'tours'              => TourController::class,
        'service-types'      => ServiceTypeController::class,
        'services'           => ServiceController::class,
        'providers'          => ProvidersController::class,
        'service-attributes' => ServiceAttributesController::class,
        'policies'           => PolicyController::class,
    ]);

    // Nested API Resources (Tour Images, Schedules, Service, Assignments)
    Route::prefix('tours/{tour}')->group(function () {
        Route::apiResource('schedules', TourScheduleController::class);
        Route::apiResource('images', TourImagesController::class);
        Route::apiResource('tourservices', TourServiceController::class);
        Route::apiResource('tourpolicies', TourPolicyController::class);
        Route::apiResource('assignments', ApiTripAssignmentController::class)->except(['show', 'create', 'edit']);
    });
    Route::post('/upload-image', [ImageUploadController::class, 'upload'])->name('image.upload');
    
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');
    Route::post('/assignments/{assignmentId}/confirm', [NotificationController::class, 'confirmAssignment'])->name('assignments.confirm');
});

// Import Settings Routes
require __DIR__ . '/settings.php';
