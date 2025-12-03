<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ImageUploadController extends Controller
{
    public function upload(Request $request)
    {
        // Validate the image
        $request->validate([
            'file' => 'required|image|max:2048', // Max 2MB
        ]);

        if ($request->hasFile('file')) {
            // Store the file in 'public/uploads'
            $path = $request->file('file')->store('uploads', 'public');

            // Return the URL to the editor
            return response()->json(['location' => Storage::url($path)]);
        }

        return response()->json(['error' => 'Upload failed'], 500);
    }
}