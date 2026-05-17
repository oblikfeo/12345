<x-mail::message>
# Новый заказ с сайта

# Покупатель
Имя: <strong>{{ $order?->user?->name }}</strong><br/>
Телефон: <strong>{{ $order?->user?->phone }}</strong><br/>
Email: <strong>{{ $order?->user?->phone }}</strong><br/>

# Получатель
Имя: <strong>{{ $order->customer_extra['recipient']['name'] }}</strong><br/>
Телефон: <strong>{{ $order->customer_extra['recipient']['phone'] }}</strong><br/>

# Доставка
Способ доставки: <strong>{{ $order->delivery_type == 'pickup' ? 'Самовывоз' : 'Доставка' }}</strong><br/>
@if($order->delivery_extra['address'] ?? false)
Адрес: {{ $order->delivery_extra['address'] }}<br/>
@endif
@if($order->delivery_extra['entrance'] ?? false)
Подъезд: {{ $order->delivery_extra['entrance'] }}<br/>
@endif
@if($order->delivery_extra['floor'] ?? false)
Этаж: {{ $order->delivery_extra['floor'] }}<br/>
@endif
@if($order->delivery_extra['apartment'] ?? false)
Квартира: {{ $order->delivery_extra['apartment'] }}<br/>
@endif
@if($order->delivery_extra['comment'] ?? false)
Комментарий: {{ $order->delivery_extra['comment'] }}<br/>
@endif
@php
$total = 0;
foreach ($order->items as $item) {
    $total += $item->total;
}
@endphp

# Товары

<x-mail::table>
| Название      | Цена          | Кол‑во        | Итого         |
| ------------- | :-----------: | ------------: | ------------: |
@foreach($order->items as $item)
|{{ $item->title }}|{{ $item->price }}₽|{{ number_format($item->quantity) }} шт|{{ $item->total }}₽|
@endforeach
</x-mail::table>

# Сумму заказа {{ number_format($total) }} ₽

Спасибо,<br>
{{ config('app.name') }}
</x-mail::message>
