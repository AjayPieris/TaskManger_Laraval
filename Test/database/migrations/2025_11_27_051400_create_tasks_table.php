<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {    // Create a new table called "tasks"
            $table->id();                                        // Auto-increment primary key (id)
            $table->string('title');                             // Task title
            $table->string('description')->nullable();           // Task description (optional)
            $table->date('due_date')->nullable();                // Due date (optional)
            $table->boolean('is_completed')->default(false);     // Task status (false = not completed)

            $table->foreignId('list_id')                         // Foreign key column for TaskList
                  ->constrained()                                // Links to "lists" table (lists.id)
                  ->onDelete('cascade');                         // If list deleted → delete its tasks

            $table->timestamps();                                // created_at & updated_at columns
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');                           // Delete the "tasks" table if rollback
    }
};
