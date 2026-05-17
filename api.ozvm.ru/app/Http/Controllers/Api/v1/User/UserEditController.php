<?php

namespace App\Http\Controllers\Api\v1\User;

use App\Http\Controllers\Controller;
use App\Services\UserService;
use Illuminate\Http\Request;

class UserEditController extends Controller
{
    public function __invoke(Request $request)
    {
        return (new UserService($request->user()))->edit($request);
    }
}