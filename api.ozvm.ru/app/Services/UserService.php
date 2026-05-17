<?php

namespace App\Services;

use App\Mail\RegistrationRequestMail;
use App\Mail\RegistrationUserMail;
use App\Mail\ResetPasswordMail;
use App\Models\Shop\ShopPriceType;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UserService
{
    public bool $withToken = false;

    public int $priceId = 1;

    public function __construct(public ?User $user = null)
    {
        if($user?->external_price_id) {
            $priceType = ShopPriceType::query()->where('external_id', $user->external_price_id)->first();
            if($priceType) {
                $this->priceId = $priceType->id;
            }
        }
    }

    public static function resetPassword(Request $request)
    {
        $request->validate([
            'email' => ['email', 'required', 'exists:users']
        ]);

        $password = Str::password(12);

        $user                = User::query()->where('email', $request->get('email'))->first();
        $user->password      = Hash::make($password);
        $user->password_hash = strrev(base64_encode($password));
        $user->save();

        try {
            Mail::to($user->email)->send((new ResetPasswordMail($password)));
        } catch (\Exception $exception) {
            Log::info($exception);
        }

        return ['success' => time()];
    }

    public static function login(Request $request)
    {
        $request->validate([
            'email'    => ['email', 'required', 'exists:users'],
            'password' => ['required']
        ]);

        $user = User::query()->where('email', $request->get('email'))->first();

        if (!Hash::check($request->get('password'), $user->password)) {
            throw ValidationException::withMessages(['password' => 'Неправильный пароль']);
        }

        $service            = new self($user);
        $service->withToken = true;

        return $service->transform();
    }

    public static function registerRequest(Request $request)
    {
        $request->validate([
            'name'  => ['required', 'min:2'],
            'email' => ['email', 'required', Rule::unique('users')],
            'phone' => ['required']
        ]);

        Mail::to(env('MAIL_TO'))->send((new RegistrationRequestMail($request->name, $request->phone, $request->email)));
        Mail::to($request->email)->send((new RegistrationUserMail()));

        return ['success' => time()];
    }

    public static function register(Request $request)
    {
        $request->validate([
            'name'     => ['required', 'min:2'],
            'email'    => ['email', 'required', Rule::unique('users')],
            'password' => ['sometimes', 'required', 'confirmed']
        ]);

        $password = $request->has('password') ? $request->get('password') : Str::password(12);

        $user = User::query()->create([
            'external_id'   => Str::uuid(),
            'name'          => $request->get('name'),
            'phone'         => $request->get('phone'),
            'email'         => $request->get('email'),
            'password'      => Hash::make($password),
            'password_hash' => strrev(base64_encode($password))
        ]);

        $service            = new self($user);
        $service->withToken = true;

        return $service->transform();
    }

    public function edit(Request $request)
    {
        $request->validate([
            'name'  => ['required', 'min:2'],
            'email' => ['email', 'required', Rule::unique('users')->ignore($this->user->id)],
            ...($request->get('password') ? [
                'password'     => ['required', 'confirmed'],
                'password_old' => ['required']
            ] : [])
        ]);

        if ($request->get('password')) {
            if (!Hash::check($request->get('password_old'), $this->user->password)) {
                throw ValidationException::withMessages(['password_old' => 'Неправильный старый пароль']);
            }

            $this->user->password      = Hash::make($request->get('password'));
            $this->user->password_hash = strrev(base64_encode($request->get('password')));
        }

        if ($request->has('name')) $this->user->name = $request->get('name');
        if ($request->has('email')) $this->user->email = $request->get('email');
        if ($request->has('phone')) $this->user->phone = $request->get('phone');
        if ($request->has('address')) $this->user->address = $request->get('address');

        $this->user->save();
        $this->user->refresh();

        return $this->transform();
    }

    public function orders(Request $request)
    {
        $orders = $this->user->orders()
            ->with('items')
            ->limit($request->get(10))
            ->orderBy('id', 'desc')
            ->get();

        return $orders->transform(function ($order) {
            return [
                'id'         => $order->id,
                'total'      => $order->items->sum('total'),
                'created_at' => $order->created_at->format('d.m.Y'),
                'comment'    => $order->delivery_extra['comment'] ?? null,
                'items'      => $order->items->transform(function ($product) {
                    return [
                        'id'        => $product->id,
                        'title'     => $product->title,
                        'price'     => $product->price,
                        'quantity ' => $product->quantity,
                        'total'     => $product->total,
                        'image'     => $product->image ? asset($product->image) : null,
                    ];
                })
            ];
        });
    }

    public function transform()
    {
        return array_merge([
            'id'               => $this->user->id,
            'name'             => $this->user->name,
            'email'            => $this->user->email,
            'phone'            => $this->user->phone,
            'address'          => $this->user->address,
            'min_order_amount' => $this->user->min_order_amount,
        ],
            $this->withToken ? ['token' => $this->user->createToken('APP')->plainTextToken] : []
        );
    }
}