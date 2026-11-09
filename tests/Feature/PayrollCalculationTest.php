<?php

namespace Tests\Feature;

use App\Models\Payroll;
use App\Models\PayrollItem;
use App\Models\PayrollPeriod;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PayrollCalculationTest extends TestCase
{
    use RefreshDatabase;

    private function createPeriod(): PayrollPeriod
    {
        return PayrollPeriod::create([
            'name' => 'Payroll November 2026',
            'start_date' => '2026-11-01',
            'end_date' => '2026-11-30',
            'payment_date' => '2026-11-28',
            'status' => 'PROCESSING',
        ]);
    }

    public function test_payroll_net_salary_calculation_formula(): void
    {
        $gm = $this->createGM();
        $period = $this->createPeriod();
        $empData = $this->createEmployee([], ['basic_salary' => 10000000]);
        $employee = $empData['employee'];

        // Initial payroll: Basic salary = 10,000,000, Allowances = 0, Bonus = 0, Deductions = 0, Net = 10,000,000
        $payroll = Payroll::create([
            'payroll_period_id' => $period->id,
            'employee_id' => $employee->id,
            'basic_salary' => 10000000,
            'total_allowance' => 0,
            'total_bonus' => 0,
            'total_deduction' => 0,
            'net_salary' => 10000000,
            'payment_status' => 'DRAFT',
        ]);

        // 1. Add Allowance of 1,500,000
        $this->actingAs($gm)->post("/gm/payrolls/{$payroll->id}/items", [
            'type' => 'ALLOWANCE',
            'name' => 'Tunjangan Transportasi & Makan',
            'amount' => 1500000,
            'note' => 'Bulan berjalan',
        ]);

        $payroll->refresh();
        $this->assertEquals(1500000, $payroll->total_allowance);
        // Formula: 10,000,000 + 1,500,000 = 11,500,000
        $this->assertEquals(11500000, $payroll->net_salary);

        // 2. Add Bonus of 2,000,000
        $this->actingAs($gm)->post("/gm/payrolls/{$payroll->id}/items", [
            'type' => 'BONUS',
            'name' => 'Bonus Performa Proyek Q4',
            'amount' => 2000000,
            'note' => 'Target tercapai',
        ]);

        $payroll->refresh();
        $this->assertEquals(2000000, $payroll->total_bonus);
        // Formula: 10,000,000 + 1,500,000 + 2,000,000 = 13,500,000
        $this->assertEquals(13500000, $payroll->net_salary);

        // 3. Add Deduction of 500,000
        $this->actingAs($gm)->post("/gm/payrolls/{$payroll->id}/items", [
            'type' => 'DEDUCTION',
            'name' => 'BPJS Kesehatan & Ketenagakerjaan',
            'amount' => 500000,
            'note' => 'Iuran wajib',
        ]);

        $payroll->refresh();
        $this->assertEquals(500000, $payroll->total_deduction);
        // Exact formula: GAJI BERSIH = GAJI POKOK + TOTAL TUNJANGAN + BONUS - TOTAL POTONGAN
        // 10,000,000 + 1,500,000 + 2,000,000 - 500,000 = 13,000,000
        $this->assertEquals(13000000, $payroll->net_salary);

        // 4. Delete Bonus item and verify net salary automatically decreases back to 11,000,000
        $bonusItem = PayrollItem::where('payroll_id', $payroll->id)->where('type', 'BONUS')->first();
        $this->actingAs($gm)->delete("/gm/payrolls/items/{$bonusItem->id}");

        $payroll->refresh();
        $this->assertEquals(0, $payroll->total_bonus);
        // 10,000,000 + 1,500,000 + 0 - 500,000 = 11,000,000
        $this->assertEquals(11000000, $payroll->net_salary);
    }

    public function test_gm_can_create_payroll_period_and_generates_drafts(): void
    {
        $gm = $this->createGM();
        // Create 2 active employees
        $this->createEmployee([], ['status' => 'active', 'basic_salary' => 8000000]);
        $this->createEmployee([], ['status' => 'active', 'basic_salary' => 9000000]);

        $response = $this->actingAs($gm)->post('/gm/payrolls/period', [
            'name' => 'Gaji Desember 2026',
            'start_date' => '2026-12-01',
            'end_date' => '2026-12-31',
            'payment_date' => '2026-12-28',
            'notes' => 'Periode tutup tahun',
        ]);

        $response->assertRedirect();
        $period = PayrollPeriod::where('name', 'Gaji Desember 2026')->first();
        $this->assertNotNull($period);

        // Should have generated 2 draft payrolls
        $this->assertEquals(2, Payroll::where('payroll_period_id', $period->id)->count());
    }

    public function test_gm_can_mark_payroll_as_paid(): void
    {
        $gm = $this->createGM();
        $period = $this->createPeriod();
        $empData = $this->createEmployee();
        $employee = $empData['employee'];

        $payroll = Payroll::create([
            'payroll_period_id' => $period->id,
            'employee_id' => $employee->id,
            'basic_salary' => 8000000,
            'total_allowance' => 1000000,
            'total_bonus' => 0,
            'total_deduction' => 200000,
            'net_salary' => 8800000,
            'payment_status' => 'DRAFT',
        ]);

        $response = $this->actingAs($gm)->post("/gm/payrolls/{$payroll->id}/pay", [
            'payment_method' => 'Bank Transfer (BCA)',
            'payment_date' => '2026-11-28',
            'notes' => 'Pembayaran via payroll transfer BCA.',
        ]);

        $response->assertRedirect();
        $payroll->refresh();

        $this->assertEquals('PAID', $payroll->payment_status);
        $this->assertEquals('Bank Transfer (BCA)', $payroll->payment_method);
        $this->assertNotNull($payroll->reference_number);
        $this->assertDatabaseHas('payroll_payments', [
            'payroll_id' => $payroll->id,
            'amount' => 8800000,
            'status' => 'SUCCESS',
        ]);
    }

    public function test_employee_can_view_own_payroll_and_cannot_view_others(): void
    {
        $period = $this->createPeriod();

        // Employee 1
        $emp1Data = $this->createEmployee();
        $payroll1 = Payroll::create([
            'payroll_period_id' => $period->id,
            'employee_id' => $emp1Data['employee']->id,
            'basic_salary' => 8000000,
            'net_salary' => 8000000,
            'payment_status' => 'PAID',
        ]);

        // Employee 2
        $emp2Data = $this->createEmployee();
        $payroll2 = Payroll::create([
            'payroll_period_id' => $period->id,
            'employee_id' => $emp2Data['employee']->id,
            'basic_salary' => 9000000,
            'net_salary' => 9000000,
            'payment_status' => 'PAID',
        ]);

        // Employee 1 accesses their own payroll: 200 OK
        $responseOwn = $this->actingAs($emp1Data['user'])->get("/employee/payrolls/{$payroll1->id}");
        $responseOwn->assertStatus(200);

        // Employee 1 accesses Employee 2's payroll: 403 Forbidden
        $responseOther = $this->actingAs($emp1Data['user'])->get("/employee/payrolls/{$payroll2->id}");
        $responseOther->assertStatus(403);
    }
}
