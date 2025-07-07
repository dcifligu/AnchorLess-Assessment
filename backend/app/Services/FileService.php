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
        return File::all()->groupBy(function($file) {
            if (str_contains($file->type, 'image')) return 'images';
            if ($file->type === 'application/pdf') return 'pdfs';
            return 'others';
        })->toArray();
    }

    public function deleteFile(int $id): void
    {
        DB::transaction(function () use ($id) {
            $file = File::findOrFail($id);
            Storage::delete($file->path);
            $file->delete();
        });
    }

    private function validateFile(UploadedFile $file): void
    {
        $extension = strtolower($file->getClientOriginalExtension());

        if (!in_array($extension, self::ALLOWED_TYPES)) {
            throw new \InvalidArgumentException('Invalid file type');
        }

        if ($file->getSize() > self::MAX_SIZE * 1024) {
            throw new \InvalidArgumentException('File too large');
        }
    }
}
