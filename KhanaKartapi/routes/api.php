<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\InvoiceController;
use App\Http\Controllers\API\ItemController;
use App\Http\Controllers\API\MenuItemController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\OrderItemController;
use App\Http\Controllers\API\PaymentController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\PurchaseController;
use App\Http\Controllers\API\RoleController;
use App\Http\Controllers\API\SupplierController;
use App\Http\Controllers\API\TableController;
use App\Http\Controllers\API\UserController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// Public routes
// Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->name('forgotPassword');
Route::get('/reset-password/{token}', function ($token) {
    $email = request()->query('email');
    return redirect("http://localhost:5173/reset-password?token=$token&email=$email");
})->name('password.reset');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('resetPassword');

Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ProfileController::class, 'me']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/upload-picture', [ProfileController::class, 'uploadPicture']);
});

// Admin - manage any user's profile
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/profiles/{id}', [ProfileController::class, 'show']);
    Route::put('/profiles/{id}', [ProfileController::class, 'updateUser']);
});

// Authenticated routes (require Sanctum token)
Route::middleware(['auth:sanctum'])->group(function () {

    // Common authenticated routes (all roles)
    Route::get('/menu-items', [MenuItemController::class, 'index']);
    Route::get('/menu-items/{id}', [MenuItemController::class, 'show']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);


    // Admin-only routes
    Route::middleware(['role:admin'])->group(function () {
        Route::post('/menu-items', [MenuItemController::class, 'store']);
        Route::put('/menu-items/{id}', [MenuItemController::class, 'update']);
        Route::delete('/menu-items/{id}', [MenuItemController::class, 'destroy']);

        Route::apiResource('roles', RoleController::class);
    });

    // Admin only
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/tables', [TableController::class, 'index']);
        Route::post('/tables/bulk-create', [TableController::class, 'bulkCreate']);
        Route::delete('/tables/{id}', [TableController::class, 'destroy']);
    });

    // Admin + Waiter can update status
    Route::middleware(['role:admin,waiter'])->group(function () {
        Route::put('/tables/{id}', [TableController::class, 'update']);
    });



    // Waiter-only routes
    Route::middleware(['role:waiter'])->group(function () {
        Route::post('/orders', [OrderController::class, 'store']);
        Route::put('/orders/{id}/add-items', [OrderController::class, 'addItems']);
    });

    // Admin or Kitchen staff routes
    Route::middleware(['role:admin,kitchen,waiter'])->group(function () {
        Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
    });


    Route::put('/orders/{id}/pay', [OrderController::class, 'markPaid']);

    Route::put('/orders/{orderId}/items/{menuItemId}/status', [OrderItemController::class, 'updateItemStatus']);
    Route::put('/order-items/{id}/status', [OrderItemController::class, 'updateStatus']);
    Route::middleware(['role:admin,waiter'])->group(function () {
        Route::delete('/orders/{id}', [OrderController::class, 'destroy']);
    });

    Route::post('/payment/create', [PaymentController::class, 'createPaymentRequest']);
    Route::get('/payment/callback', [PaymentController::class, 'paymentCallback'])->name('payment.callback');

    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::get('/invoices/{id}', [InvoiceController::class, 'show']);

    Route::get('/dashboard', [AuthController::class, 'dashboard']);

    // Items Routes
    Route::apiResource('items', ItemController::class);

    // Suppliers Routes
    Route::apiResource('suppliers', SupplierController::class);

    // Purchase Routes (for adding stock or decreasing stock)
    Route::post('purchases', [PurchaseController::class, 'store']);
    Route::get('purchases', [PurchaseController::class, 'index']);

    // Logout (all authenticated users)
    Route::post('/logout', [AuthController::class, 'logout']);
});
