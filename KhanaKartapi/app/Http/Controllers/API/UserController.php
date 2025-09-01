<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;

class UserController extends Controller
{
    public function index()
    {
        // Return all users, or add filters if needed
        $users = User::select('id', 'name', 'email', 'role', 'created_at')->get();

        return response()->json($users);
    }
}
