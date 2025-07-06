<?php

namespace App\Http\Controllers;


use Illuminate\Http\Request;

class FileController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:pdf,png,jpg,jpeg|max:4096', // 4MB
        ]);

        $uploadedFile = $request->file('file');
        $path = $uploadedFile->store('uploads');

        $file = \App\Models\File::create([
            'filename' => basename($path),
            'original_name' => $uploadedFile->getClientOriginalName(),
            'type' => $uploadedFile->getClientMimeType(),
            'size' => $uploadedFile->getSize(),
            'path' => $path,
        ]);

        return response()->json($file, 201);
    }

    public function index()
    {
        $files = \App\Models\File::all()->groupBy(function($file) {
            if (str_contains($file->type, 'image')) return 'images';
            if ($file->type === 'application/pdf') return 'pdfs';
            return 'others';
        });
        return response()->json($files);
    }

    public function destroy($id)
    {
        $file = \App\Models\File::findOrFail($id);
        \Storage::delete($file->path);
        $file->delete();
        return response()->json(['message' => 'File deleted']);
    }
}
