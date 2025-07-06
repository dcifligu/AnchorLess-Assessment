<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FileController;

Route::post('/files', [FileController::class, 'store']);
Route::get('/files', [FileController::class, 'index']);
Route::delete('/files/{id}', [FileController::class, 'destroy']);

