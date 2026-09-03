// components/hero.tsx
"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { FaGithub } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/config";

export function Hero() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8 lg:py-36">
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl"
      >
        {siteConfig.description}
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
      >
        <Button size="lg">
          <Link href={siteConfig.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
            <FaGithub />
            GitHub
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}