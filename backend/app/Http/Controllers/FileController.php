<?php

namespace App\Http\Controllers;

use App\Services\FileService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\FileUploadRequest;
use Illuminate\Support\Facades\Log;

class FileController extends Controller
{
    public function __construct(
        private FileService $fileService
    ) {}

    public function store(FileUploadRequest $request): JsonResponse
    {
        try {
            $file = $this->fileService->uploadFile($request->file('file'));

            Log::info('File uploaded successfully', [
                'file_id' => $file->id,
                'original_name' => $file->original_name
            ]);

            
            return response()->json($file, 201);
        } catch (\InvalidArgumentException $e) {
            Log::warning('File upload validation failed', [
                'error' => $e->getMessage(),
                'file_name' => $request->file('file')?->getClientOriginalName()
            ]);

            return response()->json([
                'error' => $e->getMessage()
            ], 422);
        } catch (\Exception $e) {
            Log::error('File upload failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Upload failed. Please try again.'
            ], 500);
        }
    }

    public function index(): JsonResponse
    {
        try {
            $files = $this->fileService->getGroupedFiles();

            return response()->json($files);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve files', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to retrieve files'
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->fileService->deleteFile($id);

            Log::info('File deleted successfully', ['file_id' => $id]);

            return response()->json([
                'message' => 'File deleted successfully'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'error' => 'File not found'
            ], 404);
        } catch (\Exception $e) {
            Log::error('File deletion failed', [
                'file_id' => $id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Failed to delete file'
            ], 500);
        }
    }
}
