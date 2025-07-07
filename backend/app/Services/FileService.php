<?php

namespace App\Services;

use App\Models\File;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class FileService
{
    private const ALLOWED_TYPES = ['pdf', 'png', 'jpg', 'jpeg'];
    private const MAX_SIZE = 4096; // 4MB in KB

    // Add this new method for single file uploads
    public function uploadSingleFile(
        UploadedFile $file,
        string $uploadType,
        string $sessionId,
        int $stepIndex,
        int $fileIndex
    ): File {
        $this->validateFile($file);

        return DB::transaction(function () use ($file, $uploadType, $sessionId, $stepIndex, $fileIndex) {
            $path = $file->store('uploads');

            return File::create([
                'filename' => basename($path),
                'original_name' => $file->getClientOriginalName(),
                'type' => $file->getClientMimeType(),
                'size' => $file->getSize(),
                'path' => $path,
                'upload_type' => $uploadType,
                'upload_session_id' => $sessionId,
                'step_index' => $stepIndex,
                'file_index' => $fileIndex,
            ]);
        });
    }

    public function uploadFile(UploadedFile $file): File
    {
        $this->validateFile($file);

        return DB::transaction(function () use ($file) {
            $path = $file->store('uploads');

            return File::create([
                'filename' => basename($path),
                'original_name' => $file->getClientOriginalName(),
                'type' => $file->getClientMimeType(),
                'size' => $file->getSize(),
                'path' => $path,
            ]);
        });
    }

    public function getGroupedFiles(): array
    {
        $files = File::orderBy('created_at', 'desc')->get();

        $grouped = [
            'financial' => [],
            'travel' => [],
            'education' => [],
            'images' => [],
            'pdfs' => [],
            'others' => []
        ];

        foreach ($files as $file) {
            // Group by upload type if available
            if ($file->upload_type) {
                $type = $file->upload_type;
                if (!isset($grouped[$type])) {
                    $grouped[$type] = [];
                }
                $grouped[$type][] = $file;
            } else {
                // Legacy grouping by file type
                if (str_contains($file->type, 'image')) {
                    $grouped['images'][] = $file;
                } elseif ($file->type === 'application/pdf') {
                    $grouped['pdfs'][] = $file;
                } else {
                    $grouped['others'][] = $file;
                }
            }
        }

        return $grouped;
    }

    public function deleteFile(int $id): void
    {
        $file = File::findOrFail($id);

        if (Storage::exists($file->path)) {
            Storage::delete($file->path);
        }

        $file->delete();
    }

    private function validateFile(UploadedFile $file): void
    {
        $extension = strtolower($file->getClientOriginalExtension());

        if (!in_array($extension, self::ALLOWED_TYPES)) {
            throw new \InvalidArgumentException('File type not allowed. Only PDF, PNG, JPG, and JPEG files are accepted.');
        }

        if ($file->getSize() > self::MAX_SIZE * 1024) {
            throw new \InvalidArgumentException('File is too large. Maximum size allowed is ' . self::MAX_SIZE / 1024 . 'MB.');
        }
    }
}
