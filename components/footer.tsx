"use client"

import Link from "next/link"
import { Github, Twitter, Globe, Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md mt-auto">
      <div className="container mx-auto px-4 max-w-6xl py-6 sm:py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col space-y-6 sm:space-y-8">
          {/* Top Section - Brand & Links */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                A
              </div>
              <div className="text-center sm:text-left">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">AllSwap</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Decentralized Exchange</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-6 sm:gap-8 text-sm">
              <Link 
                href="/docs" 
                className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors font-medium"
              >
                Docs
              </Link>
              <Link 
                href="/terms" 
                className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors font-medium"
              >
                Terms
              </Link>
              <Link 
                href="/privacy" 
                className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors font-medium"
              >
                Privacy
              </Link>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-800">
            {/* Social Links */}
            <div className="flex items-center gap-3">
              <a 
                href="#" 
                className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-primary transition-all duration-200"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-primary transition-all duration-200"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-primary transition-all duration-200"
                aria-label="Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>

            {/* Status & Copyright */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-xs text-gray-500 dark:text-gray-400">
              {/* Status */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-medium">All systems operational</span>
              </div>
              
              {/* Separator - Hidden on mobile */}
              <span className="hidden sm:inline">•</span>
              
              {/* Copyright */}
              <div className="flex items-center gap-1">
                <span>© 2024 AllSwap</span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  Made with <Heart className="w-3 h-3 text-red-500" fill="currentColor" /> for DeFi
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}