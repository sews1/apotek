<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'last_login_at' => $user->last_login_at ?? now(),
                'two_factor_enabled' => $user->two_factor_secret ? true : false,
            ],
            'statistics' => [
                'security_score' => $this->calculateSecurityScore($user),
                'active_sessions' => $this->getActiveSessionsCount($user),
                'last_login' => $this->getLastLoginInfo($user),
            ],
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        try {
            $user = $request->user();
            $validated = $request->validated();

            // Handle profile picture upload if exists
            if ($request->hasFile('avatar')) {
                $this->handleAvatarUpload($request, $user);
            }

            // Fill validated data
            $user->fill($validated);

            // If email is being changed, reset email verification
            if ($user->isDirty('email')) {
                $user->email_verified_at = null;
                
                // Send email verification notification
                if ($user instanceof MustVerifyEmail) {
                    $user->sendEmailVerificationNotification();
                }
            }

            $user->save();

            // Log profile update activity
            activity()
                ->causedBy($user)
                ->performedOn($user)
                ->withProperties([
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'changes' => $user->getChanges(),
                ])
                ->log('Profile information updated');

            return Redirect::route('profile.edit')
                ->with('success', 'Profile berhasil diperbarui!')
                ->with('status', 'profile-updated');

        } catch (\Exception $e) {
            \Log::error('Profile update failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return Redirect::route('profile.edit')
                ->with('error', 'Terjadi kesalahan saat memperbarui profile: ' . $e->getMessage());
        }
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ], [
            'current_password.required' => 'Password saat ini wajib diisi.',
            'current_password.current_password' => 'Password saat ini tidak benar.',
            'password.required' => 'Password baru wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        try {
            $user = $request->user();
            $user->update([
                'password' => Hash::make($validated['password']),
                'password_changed_at' => now(),
            ]);

            // Invalidate all other sessions except current
            Auth::logoutOtherDevices($validated['password']);

            // Log password change activity
            activity()
                ->causedBy($user)
                ->performedOn($user)
                ->withProperties([
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ])
                ->log('Password changed');

            // Send security notification email
            $this->sendSecurityNotification($user, 'Password berhasil diubah');

            return Redirect::route('profile.edit')
                ->with('success', 'Password berhasil diperbarui!')
                ->with('status', 'password-updated');

        } catch (\Exception $e) {
            \Log::error('Password update failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);

            return Redirect::route('profile.edit')
                ->with('error', 'Terjadi kesalahan saat memperbarui password: ' . $e->getMessage());
        }
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ], [
            'password.required' => 'Password wajib diisi untuk menghapus akun.',
            'password.current_password' => 'Password tidak benar.',
        ]);

        try {
            $user = $request->user();

            // Log account deletion activity before deleting
            activity()
                ->causedBy($user)
                ->performedOn($user)
                ->withProperties([
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'user_data' => $user->toArray(),
                ])
                ->log('Account deleted');

            // Delete user's files/avatar if exists
            if ($user->avatar && Storage::exists($user->avatar)) {
                Storage::delete($user->avatar);
            }

            // Send account deletion confirmation email
            $this->sendSecurityNotification($user, 'Akun Anda telah dihapus');

            // Logout user
            Auth::logout();

            // Delete user account
            $user->delete();

            // Invalidate session
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return Redirect::to('/')
                ->with('success', 'Akun berhasil dihapus.');

        } catch (\Exception $e) {
            \Log::error('Account deletion failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage()
            ]);

            return Redirect::route('profile.edit')
                ->with('error', 'Terjadi kesalahan saat menghapus akun: ' . $e->getMessage());
        }
    }

    /**
     * Show user profile (public view).
     */
    public function show(Request $request, $id = null)
    {
        $user = $id ? User::findOrFail($id) : $request->user();
        
        return Inertia::render('Profile/Show', [
            'user' => $user->only(['id', 'name', 'email', 'avatar', 'created_at']),
            'isOwnProfile' => $request->user()->id === $user->id,
        ]);
    }

    /**
     * Handle avatar upload.
     */
    private function handleAvatarUpload(Request $request, $user): void
    {
        $request->validate([
            'avatar' => ['image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
        ], [
            'avatar.image' => 'File harus berupa gambar.',
            'avatar.mimes' => 'Format gambar harus jpeg, png, jpg, atau gif.',
            'avatar.max' => 'Ukuran gambar maksimal 2MB.',
        ]);

        // Delete old avatar if exists
        if ($user->avatar && Storage::exists($user->avatar)) {
            Storage::delete($user->avatar);
        }

        // Store new avatar with optimized filename
        $filename = 'avatar_' . $user->id . '_' . time() . '.' . $request->file('avatar')->getClientOriginalExtension();
        $avatarPath = $request->file('avatar')->storeAs('avatars', $filename, 'public');
        
        $user->avatar = $avatarPath;
    }

    /**
     * Remove user avatar.
     */
    public function removeAvatar(Request $request): RedirectResponse
    {
        try {
            $user = $request->user();

            if ($user->avatar && Storage::exists($user->avatar)) {
                Storage::delete($user->avatar);
            }

            $user->update(['avatar' => null]);

            // Log avatar removal
            activity()
                ->causedBy($user)
                ->performedOn($user)
                ->log('Avatar removed');

            return Redirect::route('profile.edit')
                ->with('success', 'Foto profil berhasil dihapus!');

        } catch (\Exception $e) {
            return Redirect::route('profile.edit')
                ->with('error', 'Terjadi kesalahan saat menghapus foto profil.');
        }
    }

    /**
     * Resend email verification.
     */
    public function resendVerification(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return Redirect::route('profile.edit')
                ->with('error', 'Email sudah terverifikasi.');
        }

        $user->sendEmailVerificationNotification();

        // Log verification resend
        activity()
            ->causedBy($user)
            ->performedOn($user)
            ->log('Email verification resent');

        return Redirect::route('profile.edit')
            ->with('success', 'Link verifikasi email telah dikirim!');
    }

    /**
     * Download user data (GDPR compliance).
     */
    public function downloadData(Request $request)
    {
        $user = $request->user();
        
        $userData = [
            'profile' => $user->toArray(),
            'created_at' => $user->created_at->toISOString(),
            'updated_at' => $user->updated_at->toISOString(),
            'activities' => activity()
                ->causedBy($user)
                ->get()
                ->map(function ($activity) {
                    return [
                        'description' => $activity->description,
                        'created_at' => $activity->created_at->toISOString(),
                        'properties' => $activity->properties,
                    ];
                }),
            'export_date' => now()->toISOString(),
        ];

        $fileName = 'user_data_' . $user->id . '_' . now()->format('Y-m-d') . '.json';

        // Log data download
        activity()
            ->causedBy($user)
            ->performedOn($user)
            ->log('User data downloaded');

        return response()->json($userData)
            ->header('Content-Disposition', 'attachment; filename="' . $fileName . '"')
            ->header('Content-Type', 'application/json');
    }

    /**
     * Update notification preferences.
     */
    public function updateNotifications(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email_notifications' => 'boolean',
            'security_alerts' => 'boolean',
            'marketing' => 'boolean',
            'newsletter' => 'boolean',
        ]);

        try {
            $user = $request->user();
            $user->update([
                'notification_preferences' => json_encode($validated)
            ]);

            activity()
                ->causedBy($user)
                ->performedOn($user)
                ->withProperties(['preferences' => $validated])
                ->log('Notification preferences updated');

            return Redirect::route('profile.edit')
                ->with('success', 'Preferensi notifikasi berhasil diperbarui!');

        } catch (\Exception $e) {
            return Redirect::route('profile.edit')
                ->with('error', 'Terjadi kesalahan saat memperbarui preferensi.');
        }
    }

    /**
     * Update privacy settings.
     */
    public function updatePrivacy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'profile_visibility' => 'required|in:public,friends,private',
            'email_visibility' => 'required|in:public,friends,private',
            'activity_status' => 'required|in:active,inactive',
        ]);

        try {
            $user = $request->user();
            $user->update([
                'privacy_settings' => json_encode($validated)
            ]);

            activity()
                ->causedBy($user)
                ->performedOn($user)
                ->withProperties(['settings' => $validated])
                ->log('Privacy settings updated');

            return Redirect::route('profile.edit')
                ->with('success', 'Pengaturan privasi berhasil diperbarui!');

        } catch (\Exception $e) {
            return Redirect::route('profile.edit')
                ->with('error', 'Terjadi kesalahan saat memperbarui pengaturan privasi.');
        }
    }

    /**
     * Logout from all other devices.
     */
    public function logoutOtherDevices(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        Auth::logoutOtherDevices($request->password);

        activity()
            ->causedBy($request->user())
            ->performedOn($request->user())
            ->log('Logged out from all other devices');

        return Redirect::route('profile.edit')
            ->with('success', 'Berhasil logout dari semua perangkat lain.');
    }

    /**
     * Get user's security score.
     */
    private function calculateSecurityScore($user): int
    {
        $score = 0;
        
        // Base score
        $score += 20;
        
        // Email verified
        if ($user->email_verified_at) {
            $score += 20;
        }
        
        // Has avatar
        if ($user->avatar) {
            $score += 10;
        }
        
        // Password strength (assume strong if changed recently)
        if ($user->password_changed_at && $user->password_changed_at->gt(now()->subMonths(3))) {
            $score += 25;
        } else {
            $score += 15;
        }
        
        // Two factor authentication
        if ($user->two_factor_secret) {
            $score += 25;
        }
        
        return min($score, 100);
    }

    /**
     * Get active sessions count.
     */
    private function getActiveSessionsCount($user): int
    {
        // This would typically query a sessions table
        // For now, return 1 as current session
        return 1;
    }

    /**
     * Get last login information.
     */
    private function getLastLoginInfo($user): array
    {
        return [
            'datetime' => $user->last_login_at ?? now(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'location' => 'Indonesia', // This would be determined by IP geolocation
        ];
    }

    /**
     * Send security notification email.
     */
    private function sendSecurityNotification($user, $message): void
    {
        // This would typically send an email notification
        // You can implement this based on your mail system
        \Log::info('Security notification sent', [
            'user_id' => $user->id,
            'message' => $message,
        ]);
    }
}