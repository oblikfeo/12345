<?php

namespace App\Jobs;

use App\Services\ExchangeService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

/**
 * Разбор архива от 1С в фоне: 1С сразу получает ответ, а не ждёт
 * весь импорт (раньше запрос обрывался по таймауту на 120 с).
 */
class ProcessExchange implements ShouldQueue
{
    use Queueable;

    public int $timeout = 1800;

    public int $tries = 1;

    public function __construct(public string $zip)
    {
    }

    public function handle(): void
    {
        ExchangeService::run($this->zip);
    }

    public function failed(\Throwable $e): void
    {
        Log::channel('exchange')->error('import failed', [
            'zip'   => basename(dirname($this->zip)),
            'error' => $e->getMessage(),
        ]);

        File::deleteDirectory(dirname($this->zip));
    }
}
