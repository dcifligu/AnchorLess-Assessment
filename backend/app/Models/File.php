<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class File extends Model
{
    use HasFactory;

    protected $fillable = [
        'filename',
        'original_name',
        'type',
        'size',
        'path',
        'upload_type',
        'upload_session_id',
        'step_index',
        'file_index'
    ];

    protected $appends = ['formatted_size'];

    public function getFormattedSizeAttribute()
    {
        $bytes = $this->size;
        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return round($bytes / 1024, 2) . ' KB';
        }
        return $bytes . ' B';
    }

    // Add this method to get upload requirements for each type
    public static function getUploadRequirements()
    {
        return [
            'financial' => [
                'label' => 'Financial Documents',
                'description' => 'Bank statements, tax documents, etc.',
                'requirements' => [
                    ['type' => 'pdf', 'count' => 1, 'label' => '1 PDF document'],
                    ['type' => 'image', 'count' => 2, 'label' => '2 PNG/JPG images']
                ]
            ],
            'travel' => [
                'label' => 'Travel Documents',
                'description' => 'Passport, itinerary, hotel bookings, etc.',
                'requirements' => [
                    ['type' => 'pdf', 'count' => 2, 'label' => '2 PDF documents'],
                    ['type' => 'image', 'count' => 1, 'label' => '1 PNG/JPG image']
                ]
            ],
            'education' => [
                'label' => 'Education Documents',
                'description' => 'Transcripts, certificates, etc.',
                'requirements' => [
                    ['type' => 'pdf', 'count' => 2, 'label' => '2 PDF documents'],
                    ['type' => 'png', 'count' => 1, 'label' => '1 PNG image']
                ]
            ]
        ];
    }

    public function scopeByUploadType($query, $type)
    {
        return $query->where('upload_type', $type);
    }

    public function scopeBySession($query, $sessionId)
    {
        return $query->where('upload_session_id', $sessionId);
    }
}
