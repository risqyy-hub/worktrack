<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('task_code', 30)->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignId('category_id')->nullable()->constrained('task_categories')->nullOnDelete();
            $table->string('priority', 20)->default('MEDIUM')->index(); // LOW, MEDIUM, HIGH, URGENT
            $table->string('status', 30)->default('TODO')->index(); // UPCOMING, TODO, IN_PROGRESS, IN_REVIEW, REVISION, COMPLETED, CANCELLED
            $table->date('start_date');
            $table->date('due_date')->index();
            $table->foreignId('created_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->text('additional_instructions')->nullable();
            $table->unsignedTinyInteger('progress_percent')->default(0);
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'due_date']);
            $table->index(['created_by_user_id', 'status']);
        });

        Schema::create('task_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('status', 30)->default('TODO')->index();
            $table->unsignedTinyInteger('progress_percent')->default(0);
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['task_id', 'employee_id']);
            $table->index(['employee_id', 'status']);
        });

        Schema::create('task_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignId('task_assignment_id')->constrained('task_assignments')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->unsignedTinyInteger('progress_percent');
            $table->text('note');
            $table->timestamps();

            $table->index(['task_id', 'created_at']);
        });

        Schema::create('task_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('file_name');
            $table->string('file_path');
            $table->unsignedBigInteger('file_size'); // in bytes
            $table->string('file_type', 50)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_attachments');
        Schema::dropIfExists('task_progress');
        Schema::dropIfExists('task_assignments');
        Schema::dropIfExists('tasks');
    }
};
