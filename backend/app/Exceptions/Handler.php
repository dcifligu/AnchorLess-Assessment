<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Symfony\Component\HttpKernel\Exception\HttpException;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $exception)
    {
        // Handle 413 Payload Too Large as JSON response
        if ($exception instanceof HttpException && $exception->getStatusCode() === 413) {
            return response()->json([
                'error' => 'File is too large. Maximum allowed size is 4MB.'
            ], 413);
        }

        // Optionally, handle other errors as JSON for API routes
        if ($request->expectsJson()) {
            if ($exception instanceof HttpException) {
                return response()->json([
                    'error' => $exception->getMessage() ?: 'An error occurred.'
                ], $exception->getStatusCode());
            }
        }

        return parent::render($request, $exception);
    }
}
