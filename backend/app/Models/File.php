<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class File extends Model
{
    use HasFactory;

    protected $fillable = [
        'filename',
        'original_name',
        'type',
        'size',
        'path',
    ];

    protected $casts = [
        'size' => 'integer',
    ];

    protected $appends = ['category', 'formatted_size', 'url'];

    public function category(): Attribute
    {
        return Attribute::make(
            get: fn () => match (true) {
                str_contains($this->type, 'image') => 'images',
                $this->type === 'application/pdf' => 'pdfs',
                default => 'others'
            }
        );
    }

    public function formattedSize(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->formatBytes($this->size)
        );
    }

    public function url(): Attribute
    {
        return Attribute::make(
            get: fn () => asset('storage/' . $this->path)
        );
    }

    private function formatBytes(int $size): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $unitIndex = 0;

        while ($size >= 1024 && $unitIndex < count($units) - 1) {
            $size /= 1024;
            $unitIndex++;
        }

        return round($size, 2) . ' ' . $units[$unitIndex];
    }
}
