import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';
import FlashMessage from '../Components/FlashMessage';

export default function AppLayout({ title, subtitle, children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { company } = usePage().props;

    const pageTitle = title ? `${title} | ${company?.name || 'WorkTrack'}` : (company?.name || 'WorkTrack');

    return (
        <div className="min-h-screen bg-[#F3F6FC] text-[#142B49] flex flex-col antialiased">
            <Head title={pageTitle} />

            {/* Global Toast Messages */}
            <FlashMessage />

            {/* Sidebar (Drawer on mobile, fixed on desktop) */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:pl-64 sm:lg:pl-72 min-w-0 transition-all">
                {/* Header Navbar */}
                <Header
                    onOpenSidebar={() => setSidebarOpen(true)}
                    title={title}
                    subtitle={subtitle}
                />

                {/* Page Content Body with Safe Area */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-safe">
                    <div className="max-w-7xl mx-auto w-full space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
