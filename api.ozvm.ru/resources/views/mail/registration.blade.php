<x-mail::message>
# Вы получили новую заявку на регистрацию

Имя: <strong>{{ $name }}</strong><br/>
Телефон: <strong>{{ $phone }}</strong><br/>
E-mail: <strong>{{ $email }}</strong><br/>

Спасибо,<br>
{{ config('app.name') }}
</x-mail::message>
