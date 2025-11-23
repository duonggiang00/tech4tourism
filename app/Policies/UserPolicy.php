<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        // Chỉ Admin mới được xem danh sách user
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        // Admin có thể xem tất cả, user có thể xem chính mình
        return $user->isAdmin() || $user->id === $model->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        // Chỉ Admin mới được tạo user mới
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        // Admin có thể sửa tất cả (trừ chính mình - để tránh tự khóa)
        // User có thể sửa thông tin của chính mình (nhưng không được đổi role)
        if ($user->id === $model->id) {
            // Không cho phép tự sửa role của chính mình
            return true; // Có thể sửa thông tin cá nhân
        }
        
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        // Chỉ Admin mới được xóa user, và không được xóa chính mình
        return $user->isAdmin() && $user->id !== $model->id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, User $model): bool
    {
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, User $model): bool
    {
        // Chỉ Admin mới được xóa vĩnh viễn, và không được xóa chính mình
        return $user->isAdmin() && $user->id !== $model->id;
    }

    /**
     * Determine whether the user can update role of the model.
     */
    public function updateRole(User $user, User $model): bool
    {
        // Chỉ Admin mới được đổi role, và không được đổi role của chính mình
        return $user->isAdmin() && $user->id !== $model->id;
    }

    /**
     * Determine whether the user can update status (is_active) of the model.
     */
    public function updateStatus(User $user, User $model): bool
    {
        // Chỉ Admin mới được khóa/mở khóa user, và không được khóa chính mình
        return $user->isAdmin() && $user->id !== $model->id;
    }
}
