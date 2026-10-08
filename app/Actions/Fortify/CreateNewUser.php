<?php

namespace App\Actions\Fortify;

use App\Actions\Teams\CreateTeam;
use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

/**
 * CreateNewUser Action
 *
 * Implements Fortify's `CreatesNewUsers` contract.
 * When a user submits the React registration form (`resources/js/pages/auth/register.tsx`),
 * Fortify delegates creation to this action.
 *
 * Architecture highlights:
 * 1. Form Validation: Combines `profileRules()` and `passwordRules()` traits.
 * 2. Atomic Provisioning: Creates both the User and their default Personal Team in a single DB transaction.
 * 3. Dependency Injection: Receives `CreateTeam` action via constructor promotion.
 */
class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * @param  CreateTeam  $createTeam  Domain action to provision the user's initial team.
     */
    public function __construct(private CreateTeam $createTeam)
    {
        //
    }

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input  Raw input data submitted from the React registration form.
     * @return User The newly registered and provisioned User instance.
     */
    public function create(array $input): User
    {
        // Validate request data; throws ValidationException on error which Inertia maps to form errors
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        // Perform creation in an atomic transaction to guarantee user and team stay in sync
        return DB::transaction(function () use ($input) {
            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => $input['password'],
            ]);

            // Automatically create a personal team for this user (e.g. "Jane Doe's Team")
            $this->createTeam->handle($user, $user->name."'s Team", isPersonal: true);

            return $user;
        });
    }
}
