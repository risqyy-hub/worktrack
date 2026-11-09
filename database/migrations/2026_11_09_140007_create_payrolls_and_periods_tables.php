<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_periods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->date('start_date');
            $table->date('end_date');
            $table->date('payment_date');
            $table->string('status', 30)->default('DRAFT')->index(); // DRAFT, PROCESSING, COMPLETED, CANCELLED
            $table->decimal('total_amount', 14, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_period_id')->constrained('payroll_periods')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->decimal('basic_salary', 14, 2)->default(0);
            $table->decimal('total_allowance', 14, 2)->default(0);
            $table->decimal('total_bonus', 14, 2)->default(0);
            $table->decimal('total_deduction', 14, 2)->default(0);
            $table->decimal('net_salary', 14, 2)->default(0); // net = basic + allowance + bonus - deduction
            $table->string('payment_status', 30)->default('DRAFT')->index(); // DRAFT, PENDING, PAID, FAILED, CANCELLED
            $table->string('payment_method', 50)->nullable();
            $table->string('reference_number', 50)->nullable()->unique();
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['payroll_period_id', 'employee_id']);
            $table->index(['employee_id', 'payment_status']);
        });

        Schema::create('payroll_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_id')->constrained('payrolls')->cascadeOnDelete();
            $table->string('type', 20)->index(); // ALLOWANCE, BONUS, DEDUCTION
            $table->string('name');
            $table->decimal('amount', 14, 2)->default(0);
            $table->string('note')->nullable();
            $table->timestamps();
        });

        Schema::create('payroll_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_id')->constrained('payrolls')->cascadeOnDelete();
            $table->string('reference_number', 50)->unique();
            $table->string('payment_method', 50);
            $table->date('payment_date');
            $table->decimal('amount', 14, 2);
            $table->string('status', 30)->default('SUCCESS');
            $table->text('notes')->nullable();
            $table->foreignId('recorded_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_payments');
        Schema::dropIfExists('payroll_items');
        Schema::dropIfExists('payrolls');
        Schema::dropIfExists('payroll_periods');
    }
};
