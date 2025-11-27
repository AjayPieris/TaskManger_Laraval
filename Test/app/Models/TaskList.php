<?php

namespace App\Models;  // Namespace of the model

use Illuminate\Database\Eloquent\Model;  // Base Eloquent model
use Illuminate\Database\Eloquent\Relations\BelongsTo;  // For belongsTo relationship
use Illuminate\Database\Eloquent\Relations\HasMany;    // For hasMany relationship

class TaskList extends Model
{
    // Columns in the database that can be filled using create() or update()
    protected $fillable = [
        'title',        // Name/title of the list
        'description',  // Description/details about the list (optional)
        'user_id'       // Foreign key: which user owns this list
    ];

    /**
     * Relationship: A TaskList has many tasks
     * Example: $taskList->tasks will give all tasks under this list
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'list_id'); // Connects tasks to this list
    }

    /**
     * Relationship: A TaskList belongs to a User
     * Example: $taskList->user will give the user who owns this list
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class); // Connects this list to its owner
    }
}
