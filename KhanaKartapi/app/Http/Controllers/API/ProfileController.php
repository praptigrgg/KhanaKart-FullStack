<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    // ✏️ Update own profile
    public function update(Request $request)
{
    $user = $request->user();

    if (!$user) {
        return response()->json(['error' => 'Unauthenticated'], 401);
    }

    $data = $request->validate([
        'name' => 'required|string|max:255',
        'email' => "required|email|unique:users,email,{$user->id}",
        'age' => 'nullable|integer|min:0|max:150',
        'temporary_address' => 'nullable|string|max:255',
        'permanent_address' => 'nullable|string|max:255',
        'contact_number' => 'nullable|string|max:20',
    ]);

    $user->update($data);

    return response()->json([
        'message' => 'Profile updated successfully',
        'user' => $user
    ]);
}
public function uploadPicture(Request $request)
{
    $request->validate([
        'profile_picture' => 'required|image|max:2048',
    ]);

    $user = $request->user();

    $path = $request->file('profile_picture')->store('profile-pictures', 'public');
    $url = Storage::url($path);

$user->profile_picture = $url;
    $user->save();

    return response()->json(['url' => $url]);
}


    // 🔍 Admin: View any user's profile
 public function show($id)
{
    $currentUser = request()->user(); // Get the currently logged-in user
    Log::info('Current user in show(): ', [
        'user_id' => $currentUser->id,
        'role' => $currentUser->role,  // Assuming 'role' is a column in the 'users' table
        'requested_user_id' => $id,   // The profile being requested
    ]);

    // Fetch the user profile
    $user = User::findOrFail($id);
    return response()->json($user);
}


    // 🛠️ Admin: Update any user's profile
    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => "required|email|unique:users,email,{$user->id}",
            'age' => 'nullable|integer|min:0|max:150',
            'temporary_address' => 'nullable|string|max:255',
            'permanent_address' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:20',
        ]);

        $user->update($data);

        return response()->json([
            'message' => 'User profile updated successfully',
            'user' => $user
        ]);
    }
}
