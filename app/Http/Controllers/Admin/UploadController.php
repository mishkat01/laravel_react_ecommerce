<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UploadImageRequest;
use Illuminate\Http\JsonResponse;

/**
 * Stores images uploaded from admin forms and returns their public URL. Forms then
 * submit the URL as a plain string, which keeps every admin form JSON-only.
 */
class UploadController extends Controller
{
    /**
     * Store an uploaded image on the public disk.
     */
    public function store(UploadImageRequest $request): JsonResponse
    {
        $path = $request->file('image')->store('uploads/'.now()->format('Y/m'), 'public');

        return response()->json(['url' => '/storage/'.$path], 201);
    }
}
