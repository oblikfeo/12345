<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Intervention\Image\Drivers\Imagick\Driver;
use Intervention\Image\ImageManager;

/**
 * Уменьшенные копии фото товаров для каталога.
 *
 * Каталог показывает фото квадратом 200px (в списке — 60px), а отдавал
 * оригиналы из 1С, в среднем ~300 КБ. Копия 400px — с запасом под экраны
 * с двойной плотностью — весит в разы меньше.
 *
 * Копии создаются заранее: командой shop:thumbs и при импорте для новых фото.
 * В запросе каталога ничего не генерируется — нет копии, отдаём оригинал.
 * Формат копии тот же, что у оригинала: PNG остаётся PNG, чтобы не потерять
 * прозрачность.
 */
class ProductThumbService
{
    public const SIZE = 400;

    private const QUALITY = 80;

    /** Адрес копии или null, если её ещё нет. */
    public static function url(?string $image): ?string
    {
        $relative = self::relative($image);
        if (!$relative) {
            return null;
        }

        $thumb = self::thumbRelative($relative);

        return is_file(storage_path('app/public/' . $thumb)) ? asset('storage/' . $thumb) : null;
    }

    /** Создать копию, если её нет. true — копия есть (создана сейчас или уже была). */
    public static function make(?string $image): bool
    {
        $relative = self::relative($image);
        if (!$relative) {
            return false;
        }

        $target = storage_path('app/public/' . self::thumbRelative($relative));
        if (is_file($target)) {
            return true;
        }

        $source = storage_path('app/public/' . $relative);
        if (!is_file($source)) {
            return false;
        }

        File::ensureDirectoryExists(dirname($target));

        (new ImageManager(new Driver()))
            ->read($source)
            ->scaleDown(self::SIZE, self::SIZE)
            ->save($target, quality: self::QUALITY);

        return true;
    }

    /** "/storage/images/import_files/ab/x.jpg" → "images/import_files/ab/x.jpg" */
    private static function relative(?string $image): ?string
    {
        if (!$image || !str_starts_with($image, '/storage/images/')) {
            return null;
        }

        return substr($image, strlen('/storage/'));
    }

    /** "images/import_files/ab/x.jpg" → "thumbs/400/import_files/ab/x.jpg" */
    private static function thumbRelative(string $relative): string
    {
        return 'thumbs/' . self::SIZE . '/' . substr($relative, strlen('images/'));
    }
}
