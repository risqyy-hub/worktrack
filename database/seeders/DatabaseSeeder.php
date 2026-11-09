<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\CompanySetting;
use App\Models\Department;
use App\Models\Employee;
use App\Models\Payroll;
use App\Models\PayrollItem;
use App\Models\PayrollPayment;
use App\Models\PayrollPeriod;
use App\Models\PersonalNote;
use App\Models\Position;
use App\Models\ReportReview;
use App\Models\Task;
use App\Models\TaskAssignment;
use App\Models\TaskCategory;
use App\Models\TaskProgress;
use App\Models\TaskReport;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Company Settings
        CompanySetting::set('company_name', 'PT WorkTrack Solusi Nusantara');
        CompanySetting::set('company_tagline', 'Operational Management Excellence');
        CompanySetting::set('company_email', 'contact@worktrack.co.id');
        CompanySetting::set('company_phone', '+62 21 5567 8899');
        CompanySetting::set('company_address', 'Jl. Jenderal Sudirman Kav. 52-53, Jakarta Selatan');
        CompanySetting::set('currency_code', 'IDR');
        CompanySetting::set('currency_symbol', 'Rp');
        CompanySetting::set('date_format', 'd/m/Y');
        CompanySetting::set('timezone', 'Asia/Jakarta');

        // 2. Departments
        $deptIT = Department::create([
            'name' => 'Teknologi Informasi',
            'code' => 'IT',
            'description' => 'Pengembangan perangkat lunak, infrastruktur server, dan keamanan digital.',
            'is_active' => true,
        ]);

        $deptOPS = Department::create([
            'name' => 'Operasional & Logistik',
            'code' => 'OPS',
            'description' => 'Manajemen alur kerja operasional, pengadaan, dan logistik harian.',
            'is_active' => true,
        ]);

        $deptMKT = Department::create([
            'name' => 'Pemasaran & Penjualan',
            'code' => 'MKT',
            'description' => 'Strategi akuisisi pelanggan, digital marketing, dan branding produk.',
            'is_active' => true,
        ]);

        $deptFIN = Department::create([
            'name' => 'Keuangan & Akuntansi',
            'code' => 'FIN',
            'description' => 'Pencatatan keuangan, kepatuhan pajak, audit, dan penggajian karyawan.',
            'is_active' => true,
        ]);

        $deptHR = Department::create([
            'name' => 'Sumber Daya Manusia',
            'code' => 'HR',
            'description' => 'Rekrutmen, pelatihan tim, pengembangan budaya, dan hubungan karyawan.',
            'is_active' => true,
        ]);

        // 3. Positions
        $posDev = Position::create([
            'department_id' => $deptIT->id,
            'name' => 'Senior Fullstack Developer',
            'description' => 'Bertanggung jawab atas arsitektur backend Laravel dan frontend React.',
            'base_salary' => 12500000,
            'is_active' => true,
        ]);

        $posUI = Position::create([
            'department_id' => $deptIT->id,
            'name' => 'UI/UX Designer & Frontend Specialist',
            'description' => 'Mendesain antarmuka pengguna responsif dan pengalaman interaktif sistem.',
            'base_salary' => 9500000,
            'is_active' => true,
        ]);

        $posOps = Position::create([
            'department_id' => $deptOPS->id,
            'name' => 'Operations Lead',
            'description' => 'Mengawasi efisiensi operasional harian dan SOP perusahaan.',
            'base_salary' => 8500000,
            'is_active' => true,
        ]);

        $posMkt = Position::create([
            'department_id' => $deptMKT->id,
            'name' => 'Digital Marketing Strategist',
            'description' => 'Mengelola kampanye periklanan digital, SEO, dan konversi pemasaran.',
            'base_salary' => 8000000,
            'is_active' => true,
        ]);

        $posFin = Position::create([
            'department_id' => $deptFIN->id,
            'name' => 'Finance & Payroll Specialist',
            'description' => 'Menangani pembukuan, invoice, dan siklus penggajian bulanan.',
            'base_salary' => 8500000,
            'is_active' => true,
        ]);

        // 4. Task Categories
        $catSystem = TaskCategory::create([
            'name' => 'Pengembangan Sistem',
            'color' => '#1769E8',
            'description' => 'Tugas terkait fitur baru, perbaikan bug, dan optimasi backend/frontend.',
        ]);

        $catDesign = TaskCategory::create([
            'name' => 'UI/UX & Branding',
            'color' => '#7950E8',
            'description' => 'Desain komponen antarmuka, aset visual, dan materi promosi.',
        ]);

        $catMarketing = TaskCategory::create([
            'name' => 'Pemasaran & Kampanye',
            'color' => '#F59E0B',
            'description' => 'Pembuatan konten, riset pasar, dan evaluasi performa campaign.',
        ]);

        $catOps = TaskCategory::create([
            'name' => 'Operasional & SOP',
            'color' => '#10B981',
            'description' => 'Implementasi SOP, audit kelayakan fasilitas, dan logistik.',
        ]);

        $catFinance = TaskCategory::create([
            'name' => 'Laporan & Keuangan',
            'color' => '#06B6D4',
            'description' => 'Rekonsiliasi rekening koran, laporan laba rugi, dan kalkulasi pajak.',
        ]);

        // 5. Users and Employees
        // GM User
        $gmUser = User::create([
            'name' => 'Budi Santoso, M.M.',
            'email' => 'gm@worktrack.com',
            'password' => Hash::make('password'),
            'role' => 'gm',
            'phone' => '081234567890',
            'status' => 'active',
            'email_verified_at' => now(),
            'last_login_at' => now(),
        ]);

        // Employee 1
        $u1 = User::create([
            'name' => 'Ahmad Fauzi',
            'email' => 'fauzi@worktrack.com',
            'password' => Hash::make('password'),
            'role' => 'employee',
            'phone' => '081298765431',
            'status' => 'active',
            'email_verified_at' => now(),
            'last_login_at' => now()->subHours(2),
        ]);
        $emp1 = Employee::create([
            'user_id' => $u1->id,
            'employee_code' => 'EMP-2026-001',
            'department_id' => $deptIT->id,
            'position_id' => $posDev->id,
            'phone' => '081298765431',
            'gender' => 'male',
            'address' => 'Jl. Tebet Barat Dalam No. 14, Jakarta Selatan',
            'join_date' => Carbon::parse('2024-01-15'),
            'employment_status' => 'permanent',
            'basic_salary' => 12500000,
            'bank_name' => 'Bank Central Asia (BCA)',
            'bank_account_number' => '8801928374',
            'bank_account_holder' => 'Ahmad Fauzi',
            'status' => 'active',
        ]);

        // Employee 2
        $u2 = User::create([
            'name' => 'Siti Rahmawati',
            'email' => 'siti@worktrack.com',
            'password' => Hash::make('password'),
            'role' => 'employee',
            'phone' => '081298765432',
            'status' => 'active',
            'email_verified_at' => now(),
            'last_login_at' => now()->subHours(5),
        ]);
        $emp2 = Employee::create([
            'user_id' => $u2->id,
            'employee_code' => 'EMP-2026-002',
            'department_id' => $deptIT->id,
            'position_id' => $posUI->id,
            'phone' => '081298765432',
            'gender' => 'female',
            'address' => 'Jl. Kemang Raya No. 45, Jakarta Selatan',
            'join_date' => Carbon::parse('2024-03-01'),
            'employment_status' => 'permanent',
            'basic_salary' => 9500000,
            'bank_name' => 'Bank Mandiri',
            'bank_account_number' => '1370019283745',
            'bank_account_holder' => 'Siti Rahmawati',
            'status' => 'active',
        ]);

        // Employee 3
        $u3 = User::create([
            'name' => 'Rizky Pratama',
            'email' => 'rizky@worktrack.com',
            'password' => Hash::make('password'),
            'role' => 'employee',
            'phone' => '081298765433',
            'status' => 'active',
            'email_verified_at' => now(),
            'last_login_at' => now()->subDay(),
        ]);
        $emp3 = Employee::create([
            'user_id' => $u3->id,
            'employee_code' => 'EMP-2026-003',
            'department_id' => $deptOPS->id,
            'position_id' => $posOps->id,
            'phone' => '081298765433',
            'gender' => 'male',
            'address' => 'Jl. Margonda Raya No. 88, Depok',
            'join_date' => Carbon::parse('2024-06-10'),
            'employment_status' => 'permanent',
            'basic_salary' => 8500000,
            'bank_name' => 'Bank Negara Indonesia (BNI)',
            'bank_account_number' => '0293847561',
            'bank_account_holder' => 'Rizky Pratama',
            'status' => 'active',
        ]);

        // Employee 4
        $u4 = User::create([
            'name' => 'Dewi Lestari',
            'email' => 'dewi@worktrack.com',
            'password' => Hash::make('password'),
            'role' => 'employee',
            'phone' => '081298765434',
            'status' => 'active',
            'email_verified_at' => now(),
            'last_login_at' => now()->subDays(2),
        ]);
        $emp4 = Employee::create([
            'user_id' => $u4->id,
            'employee_code' => 'EMP-2026-004',
            'department_id' => $deptMKT->id,
            'position_id' => $posMkt->id,
            'phone' => '081298765434',
            'gender' => 'female',
            'address' => 'Jl. Bintaro Utama Sektor 3A, Tangerang Selatan',
            'join_date' => Carbon::parse('2024-09-01'),
            'employment_status' => 'contract',
            'basic_salary' => 8000000,
            'bank_name' => 'Bank Central Asia (BCA)',
            'bank_account_number' => '5401928371',
            'bank_account_holder' => 'Dewi Lestari',
            'status' => 'active',
        ]);

        // Employee 5
        $u5 = User::create([
            'name' => 'Eko Prasetyo',
            'email' => 'eko@worktrack.com',
            'password' => Hash::make('password'),
            'role' => 'employee',
            'phone' => '081298765435',
            'status' => 'active',
            'email_verified_at' => now(),
            'last_login_at' => now()->subDays(3),
        ]);
        $emp5 = Employee::create([
            'user_id' => $u5->id,
            'employee_code' => 'EMP-2026-005',
            'department_id' => $deptFIN->id,
            'position_id' => $posFin->id,
            'phone' => '081298765435',
            'gender' => 'male',
            'address' => 'Jl. Kalimalang Indah No. 22, Bekasi Barat',
            'join_date' => Carbon::parse('2024-11-01'),
            'employment_status' => 'permanent',
            'basic_salary' => 8500000,
            'bank_name' => 'Bank Rakyat Indonesia (BRI)',
            'bank_account_number' => '1029384756102',
            'bank_account_holder' => 'Eko Prasetyo',
            'status' => 'active',
        ]);

        // 6. Tasks & Assignments
        // Task 1: In Progress
        $t1 = Task::create([
            'task_code' => 'TSK-2026-001',
            'title' => 'Optimasi Performa Query & Database Indexing ERP',
            'description' => 'Lakukan profiling pada endpoint lambat dan tambahkan composite index untuk query reporting serta task assignments.',
            'category_id' => $catSystem->id,
            'priority' => 'HIGH',
            'status' => 'IN_PROGRESS',
            'start_date' => Carbon::now()->subDays(4)->toDateString(),
            'due_date' => Carbon::now()->addDays(3)->toDateString(),
            'created_by_user_id' => $gmUser->id,
            'additional_instructions' => 'Pastikan response time di bawah 150ms pada dataset 100.000 records.',
            'progress_percent' => 70,
        ]);
        $a1 = TaskAssignment::create([
            'task_id' => $t1->id,
            'employee_id' => $emp1->id,
            'status' => 'IN_PROGRESS',
            'progress_percent' => 70,
            'assigned_at' => Carbon::now()->subDays(4),
            'started_at' => Carbon::now()->subDays(3),
            'notes' => 'Sedang menguji performa indeks pada tabel task_reports.',
        ]);
        TaskProgress::create([
            'task_id' => $t1->id,
            'task_assignment_id' => $a1->id,
            'employee_id' => $emp1->id,
            'progress_percent' => 40,
            'note' => 'Analisis query lambat dengan EXPLAIN selesai dilakukan.',
        ]);
        TaskProgress::create([
            'task_id' => $t1->id,
            'task_assignment_id' => $a1->id,
            'employee_id' => $emp1->id,
            'progress_percent' => 70,
            'note' => 'Composite indexes pada MySQL sudah diimplementasikan di migration staging.',
        ]);

        // Task 2: In Review (Report Submitted)
        $t2 = Task::create([
            'task_code' => 'TSK-2026-002',
            'title' => 'Redesain Universal Responsif Mobile UI & Navigasi',
            'description' => 'Terapkan Tailwind CSS 4 mobile-first layout, drawer sidebar di smartphone 320px-430px, dan safe-area iOS.',
            'category_id' => $catDesign->id,
            'priority' => 'URGENT',
            'status' => 'IN_REVIEW',
            'start_date' => Carbon::now()->subDays(6)->toDateString(),
            'due_date' => Carbon::now()->addDays(1)->toDateString(),
            'created_by_user_id' => $gmUser->id,
            'additional_instructions' => 'Uji pada layar 320px, 375px, 390px, 430px, tablet 768px, dan desktop.',
            'progress_percent' => 95,
        ]);
        $a2 = TaskAssignment::create([
            'task_id' => $t2->id,
            'employee_id' => $emp2->id,
            'status' => 'IN_REVIEW',
            'progress_percent' => 95,
            'assigned_at' => Carbon::now()->subDays(6),
            'started_at' => Carbon::now()->subDays(5),
            'notes' => 'Laporan pekerjaan sudah diajukan untuk review General Manager.',
        ]);
        $rep2 = TaskReport::create([
            'report_code' => 'RPT-2026-001',
            'task_id' => $t2->id,
            'task_assignment_id' => $a2->id,
            'employee_id' => $emp2->id,
            'title' => 'Laporan Selesai: Mobile Responsive Layout System',
            'work_description' => 'Telah menyelesaikan pengujian tampilan di viewport smartphone 320px hingga 430px, tablet 768px, serta safe-area notch iOS.',
            'result_summary' => 'Sidebar otomatis menjadi drawer dengan backdrop, card list menggantikan tabel pada layar kecil, font input di-lock minimal 16px.',
            'obstacles' => 'Perlu penyesuaian sedikit pada touch target tombol pagination di resolusi 320px.',
            'progress_percent' => 95,
            'status' => 'SUBMITTED',
            'submitted_at' => Carbon::now()->subHours(4),
        ]);

        // Task 3: Completed
        $t3 = Task::create([
            'task_code' => 'TSK-2026-003',
            'title' => 'Audit Keselamatan Kerja & Logistik Gudang Triwulan IV',
            'description' => 'Melakukan inspeksi kelengkapan APD, jalur evakuasi gudang, dan sinkronisasi stok pengiriman logistik.',
            'category_id' => $catOps->id,
            'priority' => 'MEDIUM',
            'status' => 'COMPLETED',
            'start_date' => Carbon::now()->subDays(12)->toDateString(),
            'due_date' => Carbon::now()->subDays(2)->toDateString(),
            'created_by_user_id' => $gmUser->id,
            'additional_instructions' => 'Lampirkan checklist formulir audit K3 dan rekap kartu stok gudang.',
            'progress_percent' => 100,
            'completed_at' => Carbon::now()->subDays(1),
        ]);
        $a3 = TaskAssignment::create([
            'task_id' => $t3->id,
            'employee_id' => $emp3->id,
            'status' => 'COMPLETED',
            'progress_percent' => 100,
            'assigned_at' => Carbon::now()->subDays(12),
            'started_at' => Carbon::now()->subDays(11),
            'completed_at' => Carbon::now()->subDays(1),
            'notes' => 'Audit K3 rampung dan telah disetujui GM.',
        ]);
        $rep3 = TaskReport::create([
            'report_code' => 'RPT-2026-002',
            'task_id' => $t3->id,
            'task_assignment_id' => $a3->id,
            'employee_id' => $emp3->id,
            'title' => 'Laporan Akhir: Audit K3 & Logistik Q4',
            'work_description' => 'Inspeksi menyeluruh 3 titik gudang distribusi di Cikarang dan Jakarta Barat.',
            'result_summary' => '100% jalur evakuasi memenuhi regulasi, APD lengkap terdistribusi, dan selisih stok gudang 0%.',
            'obstacles' => 'Tidak ada hambatan signifikan.',
            'progress_percent' => 100,
            'status' => 'APPROVED',
            'submitted_at' => Carbon::now()->subDays(2),
        ]);
        ReportReview::create([
            'task_report_id' => $rep3->id,
            'reviewer_id' => $gmUser->id,
            'status' => 'APPROVED',
            'notes' => 'Laporan sangat komprehensif dan terdokumentasi dengan baik. Pertahankan kedisiplinan logistik!',
            'reviewed_at' => Carbon::now()->subDays(1),
        ]);

        // Task 4: Upcoming
        $t4 = Task::create([
            'task_code' => 'TSK-2026-004',
            'title' => 'Peluncuran Kampanye Digital Akhir Tahun 2026',
            'description' => 'Persiapan materi promosi sosial media, landing page seasonal promo, dan penayangan iklan berbayar.',
            'category_id' => $catMarketing->id,
            'priority' => 'HIGH',
            'status' => 'UPCOMING',
            'start_date' => Carbon::now()->addDays(5)->toDateString(),
            'due_date' => Carbon::now()->addDays(20)->toDateString(),
            'created_by_user_id' => $gmUser->id,
            'additional_instructions' => 'Target ROAS minimal 4.5x untuk kampanye platform Meta dan Google Ads.',
            'progress_percent' => 0,
        ]);
        TaskAssignment::create([
            'task_id' => $t4->id,
            'employee_id' => $emp4->id,
            'status' => 'UPCOMING',
            'progress_percent' => 0,
            'assigned_at' => Carbon::now()->subDays(1),
            'notes' => 'Menunggu jadwal kickoff minggu depan.',
        ]);

        // Task 5: Overdue
        $t5 = Task::create([
            'task_code' => 'TSK-2026-005',
            'title' => 'Rekapitulasi Faktur Pajak Masukan & Keluaran Masa Oktober',
            'description' => 'Sinkronisasi e-Faktur dengan laporan mutasi bank perusahaan sebelum jatuh tempo pelaporan pajak.',
            'category_id' => $catFinance->id,
            'priority' => 'URGENT',
            'status' => 'IN_PROGRESS',
            'start_date' => Carbon::now()->subDays(10)->toDateString(),
            'due_date' => Carbon::now()->subDays(1)->toDateString(), // Overdue
            'created_by_user_id' => $gmUser->id,
            'additional_instructions' => 'Segera selesaikan dan submit sebelum terkena denda keterlambatan administrasi.',
            'progress_percent' => 50,
        ]);
        TaskAssignment::create([
            'task_id' => $t5->id,
            'employee_id' => $emp5->id,
            'status' => 'IN_PROGRESS',
            'progress_percent' => 50,
            'assigned_at' => Carbon::now()->subDays(10),
            'started_at' => Carbon::now()->subDays(8),
            'notes' => 'Menunggu konfirmasi beberapa faktur vendor luar kota.',
        ]);

        // 7. Payroll Period & Payroll Records
        $period = PayrollPeriod::create([
            'name' => 'Gaji Periode November 2026',
            'start_date' => Carbon::parse('2026-11-01'),
            'end_date' => Carbon::parse('2026-11-30'),
            'payment_date' => Carbon::parse('2026-11-28'),
            'status' => 'PROCESSING',
            'total_amount' => 49500000,
            'notes' => 'Penggajian rutin bulanan seluruh divisi WorkTrack.',
        ]);

        $employeesList = [$emp1, $emp2, $emp3, $emp4, $emp5];
        $paymentStatuses = ['PAID', 'PAID', 'PENDING', 'PENDING', 'DRAFT'];

        foreach ($employeesList as $idx => $emp) {
            $base = (float) $emp->basic_salary;
            $allowance = 1000000;
            $bonus = ($idx === 0 || $idx === 1) ? 750000 : 0;
            $deduction = 250000; // PPh21 / BPJS
            $net = $base + $allowance + $bonus - $deduction;
            $pStatus = $paymentStatuses[$idx];

            $pay = Payroll::create([
                'payroll_period_id' => $period->id,
                'employee_id' => $emp->id,
                'basic_salary' => $base,
                'total_allowance' => $allowance,
                'total_bonus' => $bonus,
                'total_deduction' => $deduction,
                'net_salary' => $net,
                'payment_status' => $pStatus,
                'payment_method' => 'Bank Transfer',
                'reference_number' => 'PAY-202611-00'.($idx + 1),
                'paid_at' => ($pStatus === 'PAID') ? Carbon::now()->subDays(1) : null,
                'notes' => 'Slip gaji reguler bulan November 2026.',
            ]);

            PayrollItem::create([
                'payroll_id' => $pay->id,
                'type' => 'ALLOWANCE',
                'name' => 'Tunjangan Transport & Makan',
                'amount' => $allowance,
            ]);

            if ($bonus > 0) {
                PayrollItem::create([
                    'payroll_id' => $pay->id,
                    'type' => 'BONUS',
                    'name' => 'Bonus Produktivitas Kerja',
                    'amount' => $bonus,
                ]);
            }

            PayrollItem::create([
                'payroll_id' => $pay->id,
                'type' => 'DEDUCTION',
                'name' => 'Potongan BPJS Ketenagakerjaan & PPh 21',
                'amount' => $deduction,
            ]);

            if ($pStatus === 'PAID') {
                PayrollPayment::create([
                    'payroll_id' => $pay->id,
                    'reference_number' => 'TRX-PAY-202611-00'.($idx + 1),
                    'payment_method' => $emp->bank_name ?: 'Bank Transfer (BCA)',
                    'payment_date' => Carbon::now()->subDays(1)->toDateString(),
                    'amount' => $net,
                    'status' => 'SUCCESS',
                    'notes' => 'Disetujui dan ditransfer via CMS Corporate Banking.',
                    'recorded_by_user_id' => $gmUser->id,
                ]);
            }
        }

        // 8. Personal Notes
        PersonalNote::create([
            'user_id' => $gmUser->id,
            'title' => 'Rencana Strategis Ekspansi Q1 2027',
            'content' => "Poin Utama:\n1. Perekrutan 3 staf tech dan 2 sales enterprise.\n2. Peninjauan skema KPI berbasis deliverable tugas.\n3. Integrasi modul pembayaran otomatis perbankan.",
            'color' => '#EAF2FF',
            'is_favorite' => true,
        ]);

        PersonalNote::create([
            'user_id' => $gmUser->id,
            'title' => 'Catatan Evaluasi Vendor Cloud Hosting',
            'content' => 'Bandingkan latency AWS Jakarta vs Google Cloud Jakarta untuk peningkatan performa sistem operasional.',
            'color' => '#FFFFFF',
            'is_favorite' => false,
        ]);

        PersonalNote::create([
            'user_id' => $u1->id,
            'title' => 'Checklist Deployment Laravel 13 & Vite',
            'content' => "- Pastikan php artisan config:cache dan route:cache berjalan.\n- Jalankan npm run build untuk minify file CSS & JS.\n- Cek indexing pada query delegasi tugas.",
            'color' => '#F1ECFF',
            'is_favorite' => true,
        ]);

        PersonalNote::create([
            'user_id' => $u2->id,
            'title' => 'Pedoman Desain Responsif WorkTrack',
            'content' => "Standar Breakpoint Mobile First:\n- 320px: Touch target min 44px, compact table card.\n- 768px: Adaptive grid 2 kolom.\n- 1280px+: Desktop widescreen layout dengan full data tables.",
            'color' => '#F1ECFF',
            'is_favorite' => true,
        ]);

        // 9. Activity Logs
        ActivityLog::record('AUTH', 'LOGIN', 'General Manager Budi Santoso berhasil masuk ke dalam sistem', null, ['role' => 'gm'], $gmUser->id);
        ActivityLog::record('TASK', 'CREATE', 'GM membuat tugas baru: Optimasi Performa Query & Database Indexing ERP (TSK-2026-001)', $t1->id, null, $gmUser->id);
        ActivityLog::record('TASK', 'CREATE', 'GM membuat tugas baru: Redesain Universal Responsif Mobile UI (TSK-2026-002)', $t2->id, null, $gmUser->id);
        ActivityLog::record('REPORT', 'SUBMIT', 'Siti Rahmawati mengirimkan laporan pekerjaan RPT-2026-001', $rep2->id, null, $u2->id);
        ActivityLog::record('PAYROLL', 'PAY', 'GM mengonfirmasi pembayaran gaji untuk Ahmad Fauzi (Rp 13.950.000)', null, null, $gmUser->id);
    }
}
