<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CompanyController;

Route::apiResource('companies', CompanyController::class);

Route::get('/hello', function () {
    return response()->json([
        'message' => 'Hello JobHunt API',
    ]);
});
