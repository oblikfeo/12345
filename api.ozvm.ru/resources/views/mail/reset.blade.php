<x-mail::message>
# Мы получили заявку на сброс пароля

Ваш новый пароль: <strong>{{ $password }}</strong><br/>

Спасибо,<br>
{{ config('app.name') }}
</x-mail::message>
