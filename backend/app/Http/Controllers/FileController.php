<?php

namespace App\Http\Controllers;

use App\Services\FileService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\FileUploadRequest;
use App\Models\File;
use Illuminate\Support\Facades\Log;

class FileController extends Controller
{
    public function __construct(
        private FileService $fileService
    ) {}


    public function storeSingle(Request $request): JsonResponse
    {
        try {

            $request->validate([
                'file' => 'required|file|mimes:pdf,png,jpg,jpeg|max:4096',
                'upload_type' => 'required|in:financial,travel,education',
                'upload_session_id' => 'required|string',
                'step_index' => 'required|integer|min:0',
                'file_index' => 'required|integer|min:0',
            ]);

            $file = $this->fileService->uploadSingleFile(
                $request->file('file'),
                $request->input('upload_type'),
                $request->input('upload_session_id'),
                $request->input('step_index'),
                $request->input('file_index')
            );

            Log::info('Single file uploaded successfully', [
                'file_id' => $file->id,
                'upload_type' => $request->input('upload_type'),
                'session_id' => $request->input('upload_session_id'),
                'step_index' => $request->input('step_index'),
                'file_index' => $request->input('file_index')
            ]);

            return response()->json($file, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Single file upload failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Upload failed. Please try again.'
            ], 500);
        }
    }

    public function getUploadRequirements(): JsonResponse
    {
        return response()->json(File::getUploadRequirements());
    }

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
