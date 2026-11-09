<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_reports', function (Blueprint $table) {
            $table->id();
            $table->string('report_code', 30)->unique();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignId('task_assignment_id')->constrained('task_assignments')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->string('title');
            $table->text('work_description');
            $table->text('result_summary')->nullable();
            $table->text('obstacles')->nullable();
            $table->unsignedTinyInteger('progress_percent')->default(100);
            $table->string('status', 30)->default('SUBMITTED')->index(); // SUBMITTED, APPROVED, REVISION_REQUESTED, REJECTED
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['employee_id', 'status']);
            $table->index(['task_id', 'status']);
        });

        Schema::create('report_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_report_id')->constrained('task_reports')->cascadeOnDelete();
            $table->string('file_name');
            $table->string('file_path');
            $table->unsignedBigInteger('file_size');
            $table->string('file_type', 50)->nullable();
            $table->timestamps();
        });

        Schema::create('report_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_report_id')->constrained('task_reports')->cascadeOnDelete();
            $table->foreignId('reviewer_id')->constrained('users')->cascadeOnDelete();
            $table->string('status', 30); // APPROVED, REVISION_REQUESTED, REJECTED
            $table->text('notes');
            $table->timestamp('reviewed_at')->useCurrent();
            $table->timestamps();

            $table->index(['task_report_id', 'status']);
        });

        Schema::create('report_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_report_id')->constrained('task_reports')->cascadeOnDelete();
            $table->unsignedInteger('revision_number')->default(1);
            $table->text('feedback_notes');
            $table->text('employee_response')->nullable();
            $table->string('status', 20)->default('OPEN'); // OPEN, RESOLVED
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_revisions');
        Schema::dropIfExists('report_reviews');
        Schema::dropIfExists('report_attachments');
        Schema::dropIfExists('task_reports');
    }
};
