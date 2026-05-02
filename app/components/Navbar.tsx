"use client";
import Link from "next/link";
import { useState, useEffect  } from "react";   
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/app/components/ThemeToggle";

export function Navbar() {
    const [activeSection, setActiveSection] = useState("");
    useEffect(() => {
    const sectionIds = ["features", "how", "demo"];

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        },
        { threshold: 0.6 }
    );

    sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
    });

    return () => observer.disconnect();
}, []);
    return (
        <header className="sticky top-0 z-50 border-b bg-background/70 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                {/* Logo */}
                <Link href="/" className="text-xl font-bold">
                    Link<span className="text-primary">ID</span>
                </Link>

                {/* Center nav */}
                <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
                    <a href="#features" className={activeSection === "features" ? "text-foreground font-medium border-b-2 border-primary pb-0.5" : "text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-primary hover:pb-0.5"}>
                        Features
                    </a>
                    <a href="#how" className={activeSection === "how" ? "text-foreground font-medium border-b-2 border-primary pb-0.5" : "text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-primary hover:pb-0.5"}>
                        How it works
                    </a>
                    <a href="#demo" className={activeSection === "demo" ? "text-foreground font-medium border-b-2 border-primary pb-0.5" : "text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-primary hover:pb-0.5"}>
                        Demo
                    </a>
                </nav>

                {/* Right actions */}
                <div className="flex items-center gap-4">
                    <ThemeToggle />

                    <Button asChild>
                        <Link href="/login">Get Started</Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}