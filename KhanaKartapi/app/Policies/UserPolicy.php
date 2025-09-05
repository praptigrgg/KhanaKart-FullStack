<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function update(User $authUser, User $user)
{
    return $authUser->role === 'admin'; // Admins can update other users
}

public function delete(User $authUser, User $user)
{
    return $authUser->role === 'admin'; // Admins can delete other users
}

}
