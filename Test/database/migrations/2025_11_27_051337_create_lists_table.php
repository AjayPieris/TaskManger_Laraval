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
        Schema::create('lists', function (Blueprint $table) { // Create a new table called "lists"
            $table->id();                                    // Auto-increment primary key (id)
            $table->string('name');                          // List name (text)
            $table->string('description')->nullable();       // Description (optional, can be empty)
            $table->foreignId('user_id')                     // Foreign key column for user
                  ->constrained()                            // Links to "users" table (users.id)
                  ->onDelete('cascade');                     // If user deleted → delete their lists
            $table->timestamps();                            // created_at & updated_at columns
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lists');                       // Delete the "lists" table if rollback
    }
};
