<?php

namespace App\Http\Controllers\Api\v1\User;

use App\Http\Controllers\Controller;
use App\Services\UserService;
use Illuminate\Http\Request;

class UserRegistrationController extends Controller
{
    public function __invoke(Request $request)
    {
        return UserService::registerRequest($request);
    }
}