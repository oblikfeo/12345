<?php

namespace App\Enums;

enum ShopOrderDeliveryType: string
{
    case DELIVERY = 'delivery';
    case PICKUP = 'pickup';
}