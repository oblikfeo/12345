<?php

namespace App\Models\Traits;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
//use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Drivers\Imagick\Driver;
use Intervention\Image\ImageManager;

trait HasImage
{
    public function thumbnail($width, $height, $method = 'cover', $field = 'image')
    {
        return $this->thumbnailPath($this->{$field}, $width, $height, $method);
    }

    public function thumbnailImages($width, $height, $method = 'cover', $field = 'images')
    {
        return array_map(fn($image) => asset($this->thumbnailPath($image, $width, $height, $method)), $this->{$field});
    }

    public function thumbnailPath($path, $width, $height, $method = 'cover', $aspectRatio = true)
    {
        $storage = Storage::disk('public');

        $imagePath = preg_replace('/\/storage/', '', $path);

        if(!$imagePath || !file_exists($storage->path($imagePath))) return null;

        $file = File::basename($path);

        $dirPath = "thumb/$method";
        $fullPath = "$dirPath/$width" . "x" . "$height" . ($aspectRatio ? "_ratio" : "") . "_" . "$file";

        if(file_exists($storage->path($fullPath))) {
            return "/storage/" . $fullPath;
        }

        $manager = new ImageManager(Driver::class);

        if (!$storage->exists($dirPath)) {
            $storage->makeDirectory($dirPath);
        }

        if (!$storage->exists($storage->path($fullPath))) {
            $image = $manager->read($storage->path($imagePath));

            $size = Str::of($width . "x" . $height);

            if ($size->contains('x')) {
                $image->{$method}(
                    $size->before('x')->toString(),
                    $size->after('x')->toString()
                );
            } else {
                $image->{$method}($size->toString(), null);
            }

            $image->save($storage->path($fullPath), quality: 100);
        }

        return "/storage/" . $fullPath;
    }
}