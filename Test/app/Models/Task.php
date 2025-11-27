<?php

namespace App\Models;  // This is the namespace of the model (where it lives in the app)

use Illuminate\Database\Eloquent\Model;  // Base model class provided by Laravel
use Illuminate\Database\Eloquent\Relations\BelongsTo;  // For defining belongsTo relationship

class Task extends Model
{
    // Columns in the database that we can fill using create() or update()
    protected $fillable = [  
        'title',         // Name/title of the task
        'description',   // Details about the task (optional)
        'is_completed',  // Status: true if done, false if not
        'due_date',      // Deadline for completing the task (optional)
        'list_id'        // Foreign key: which task list this task belongs to
    ];

    /**
     * Relationship: A task belongs to a TaskList
     * This allows you to access the parent list of a task easily
     * Example: $task->list will give the TaskList this task belongs to
     */
    public function list(): BelongsTo
    {
        return $this->belongsTo(TaskList::class, 'list_id'); 
    }
}
