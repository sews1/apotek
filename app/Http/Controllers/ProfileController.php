<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Jika role = owner, ambil daftar user
        $users = [];
        if ($user->role === 'owner') {
            $users = User::where('id', '!=', $user->id)
                ->select('id', 'name', 'email', 'role', 'created_at')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($u) {
                    return [
                        'id' => $u->id,
                        'name' => $u->name,
                        'email' => $u->email,
                        'role' => $u->role,
                        'created_at' => $u->created_at->format('d M Y'),
                    ];
                });
        }

        return Inertia::render('Profile/Edit', [
            'status' => session('status'),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
            'users' => $users, // Hanya ada data jika owner
            'auth' => [
                'user' => $user,
                'canManageUsers' => $user->role === 'owner', // Flag untuk frontend
            ],
        ]);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        try {
            $user = $request->user();

            $user->name = $request->name;
            $user->email = $request->email;

            if ($user->isDirty('email')) {
                $user->email_verified_at = null;
            }

            $user->save();

            return Redirect::route('profile.index')
                ->with('success', 'Profil berhasil diperbarui!')
                ->with('status', 'profile-updated');

        } catch (\Exception $e) {
            \Log::error('Profile update failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return Redirect::route('profile.index')
                ->with('error', 'Terjadi kesalahan saat memperbarui profil.');
        }
    }

    /**
     * Update user password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $request->validate([
            'current_password' => ['required'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        try {
            $user = $request->user();

            if (!Hash::check($request->current_password, $user->password)) {
                return Redirect::route('profile.index')
                    ->with('error', 'Password lama tidak sesuai.');
            }

            $user->password = Hash::make($request->password);
            $user->save();

            return Redirect::route('profile.index')
                ->with('success', 'Password berhasil diperbarui!');

        } catch (\Exception $e) {
            \Log::error('Password update failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return Redirect::route('profile.index')
                ->with('error', 'Terjadi kesalahan saat memperbarui password.');
        }
    }

    /**
     * Create new user (owner only).
     */
    public function storeUser(Request $request): RedirectResponse
    {
        if ($request->user()->role !== 'owner') {
            return Redirect::route('profile.index')
                ->with('error', 'Anda tidak memiliki izin untuk membuat pengguna baru.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:admin,warehouse,owner',
        ]);

        try {
            User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
            ]);

            return Redirect::route('profile.index')
                ->with('success', 'Pengguna berhasil ditambahkan!');

        } catch (\Exception $e) {
            \Log::error('User creation failed', [
                'error' => $e->getMessage()
            ]);

            return Redirect::route('profile.index')
                ->with('error', 'Terjadi kesalahan saat menambahkan pengguna.');
        }
    }

    /**
     * Update user data (owner only).
     */
    public function updateUser(Request $request, $id): RedirectResponse
    {
        if ($request->user()->role !== 'owner') {
            return Redirect::route('profile.index')
                ->with('error', 'Anda tidak memiliki izin untuk mengupdate pengguna.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => "required|string|email|max:255|unique:users,email,{$id}",
            'role' => 'required|in:admin,warehouse,owner',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        try {
            $user = User::findOrFail($id);
            $user->name = $request->name;
            $user->email = $request->email;
            $user->role = $request->role;

            if ($request->filled('password')) {
                $user->password = Hash::make($request->password);
            }

            $user->save();

            return Redirect::route('profile.index')
                ->with('success', 'Pengguna berhasil diperbarui!');

        } catch (\Exception $e) {
            \Log::error('User update failed', [
                'user_id' => $id,
                'error' => $e->getMessage()
            ]);

            return Redirect::route('profile.index')
                ->with('error', 'Terjadi kesalahan saat mengupdate pengguna.');
        }
    }

    /**
     * Delete a user (owner only).
     */
    public function destroyUser(Request $request, $id): RedirectResponse
    {
        if ($request->user()->role !== 'owner') {
            return Redirect::route('profile.index')
                ->with('error', 'Anda tidak memiliki izin untuk menghapus pengguna.');
        }

        if ($request->user()->id == $id) {
            return Redirect::route('profile.index')
                ->with('error', 'Anda tidak dapat menghapus akun sendiri.');
        }

        try {
            $user = User::findOrFail($id);
            $user->delete();

            return Redirect::route('profile.index')
                ->with('success', 'Pengguna berhasil dihapus!');

        } catch (\Exception $e) {
            \Log::error('User deletion failed', [
                'user_id' => $id,
                'error' => $e->getMessage()
            ]);

            return Redirect::route('profile.index')
                ->with('error', 'Terjadi kesalahan saat menghapus pengguna.');
        }
    }
}
