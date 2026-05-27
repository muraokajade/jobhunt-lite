<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CompanyController;






Route::patch('/companies/{company}/favorite', [CompanyController::class, 'toggleFavorite']);

Route::apiResource('companies', CompanyController::class);

Route::get('/hello', function () {
    return response()->json([
        'message' => 'Hello JobHunt API',
    ]);
});
