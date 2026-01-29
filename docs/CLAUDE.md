# Claude Knowledge Base

This directory contains comprehensive documentation and resources for the Holistic Acupuncture website project - a modern wellness practice website built with Astro, Sanity CMS, and Astro DB.

## Quick Links

- **New to this project?** Start with [Getting Started](./GETTING-STARTED.md)
- **Want to know what's done?** Check [Implementation Status](./IMPLEMENTATION-STATUS.md)
- **Need to add content?** See [Sanity Quick Start](./SANITY-QUICKSTART.md)

---

## Documentation Index

### 1. Getting Started & Setup

- **[Getting Started Guide](./GETTING-STARTED.md)** - Complete setup instructions including tech stack overview, installation steps, project structure, environment configuration, and development commands. Start here if you're new to the project.

- **[Implementation Status](./IMPLEMENTATION-STATUS.md)** - Current project status tracking completed features, next steps, deployment checklist, and production readiness tasks. Updated regularly to reflect development progress.

### 2. Project Planning & Architecture

- **[Migration Plan](./MIGRATION-PLAN.md)** - Complete WordPress to Astro migration strategy including current state analysis, technology decisions, content migration plan, SEO preservation, and deployment strategy for holisticacupuncture.net.

- **[Design Modernization Plan 2026](./DESIGN-MODERNIZATION-2026.md)** - Comprehensive design refresh strategy transforming early-2000s WordPress aesthetics into modern wellness design. Includes color systems (sage greens, earth tones), typography (Sora, Inter, Crimson Pro), component patterns, and UX modernization.

- **[Sanity CMS + Astro DB Integration Guide](./SANITY-ASTRODB-GUIDE.md)** - Architecture guide explaining how Sanity CMS (editorial content) and Astro DB (application data) work together. Includes decision matrix for which system to use when, data flow diagrams, and integration patterns.

### 3. Design & UI System

- **[Component Library Documentation](./COMPONENTS.md)** - Complete reference for all reusable UI components including Button, Card, Badge, form components, ServiceCard, and TestimonialCard. Includes props documentation, usage examples, variants, accessibility guidelines, and best practices.

- **[Spacing Guide](./SPACING-GUIDE.md)** - Systematic spacing guide based on 8px grid system. Covers section padding patterns, responsive spacing, container spacing, component internal spacing, typography spacing, grid/flex gaps, and common layout patterns for consistency.

### 4. Content Management (Sanity CMS)

- **[Sanity Quick Start](./SANITY-QUICKSTART.md)** - 5-minute quick setup guide for getting Sanity CMS running. Perfect for quick reference when setting up on a new machine or for team members who need to manage content.

- **[Sanity CMS Integration Guide](./SANITY-CMS-GUIDE.md)** - Comprehensive Sanity documentation covering initial setup, content type schemas (blog posts, conditions, testimonials, team members, FAQs), content management workflows, GROQ querying, media management, and Sanity Studio deployment.

- **[WordPress to Sanity Migration](./WORDPRESS-SANITY-MIGRATION.md)** - Complete migration guide for transferring content from WordPress to Sanity CMS. Includes migration scripts, WordPress REST API integration, HTML to Portable Text conversion, image upload automation, error handling, and best practices for preserving SEO and content quality.

### 5. Database & Forms (Astro DB)

- **[Astro DB Setup Guide](./ASTRO-DB-SETUP.md)** - Setup instructions for Astro DB using Astro Studio (cloud-hosted) for Windows ARM64 compatibility. Includes account creation, project linking, schema pushing, and table documentation for contact forms, testimonials, and newsletter subscriptions.

- **[Astro DB Integration Complete](./ASTRO-DB-INTEGRATION-COMPLETE.md)** - Integration completion status document detailing database configuration, API endpoints created, contact form integration, admin dashboard implementation, and security considerations. Reference for what's been completed.

- **[Email Service Setup](./EMAIL-SERVICE-SETUP.md)** - Complete email notification setup guide using Resend API. Includes account creation, domain verification, email templates for contact forms and testimonials, confirmation emails, testing procedures, troubleshooting, and best practices for deliverability.

- **[Analytics Setup Guide](./ANALYTICS-SETUP.md)** - Google Analytics 4 integration guide covering account setup, measurement ID configuration, enhanced measurement, custom events, conversion tracking, privacy compliance (HIPAA/GDPR), Plausible Analytics alternative, and monitoring best practices.

### 6. Performance & Optimization

- **[Performance Optimization Guide](./PERFORMANCE-OPTIMIZATION.md)** - Comprehensive performance optimization documentation covering image optimization (responsive images, lazy loading, WebP conversion), code splitting strategies, asset minification, font optimization, build optimizations, and performance monitoring guidelines.

- **[Accessibility Audit](./ACCESSIBILITY-AUDIT.md)** - Complete WCAG 2.1 AA accessibility audit with implementation guide. Includes skip navigation, keyboard navigation, screen reader support, ARIA landmarks, color contrast verification, focus management, and testing procedures with automated tools.

### 7. Deployment

- **[Deployment Guide](./DEPLOYMENT-GUIDE.md)** - Complete deployment instructions for Netlify, Vercel, and Cloudflare Pages. Includes pre-deployment checklist, environment variable configuration, custom domain setup, SSL certificates, continuous deployment workflows, troubleshooting, security best practices, and maintenance schedules.

### 8. Framework Documentation

- **[Astro Framework Guide](./astro.md)** - Complete guide to Astro framework fundamentals including Islands Architecture, component syntax, template expressions, content collections, integrations, view transitions, and CMS integration patterns. Reference for Astro-specific development patterns.

---

## Documentation Organization

### By Role

**For Developers:**
1. [Getting Started](./GETTING-STARTED.md) - Setup and tech stack
2. [Astro Framework Guide](./astro.md) - Framework fundamentals
3. [Component Library](./COMPONENTS.md) - UI components reference
4. [Spacing Guide](./SPACING-GUIDE.md) - Layout consistency
5. [Performance Optimization](./PERFORMANCE-OPTIMIZATION.md) - Speed and efficiency
6. [Deployment Guide](./DEPLOYMENT-GUIDE.md) - Deploy to production

**For Content Managers:**
1. [Sanity Quick Start](./SANITY-QUICKSTART.md) - Get started in 5 minutes
2. [Sanity CMS Guide](./SANITY-CMS-GUIDE.md) - Full content management guide
3. [WordPress to Sanity Migration](./WORDPRESS-SANITY-MIGRATION.md) - Migrate existing WordPress content

**For Project Managers:**
1. [Implementation Status](./IMPLEMENTATION-STATUS.md) - Current progress
2. [Migration Plan](./MIGRATION-PLAN.md) - Overall strategy
3. [Design Modernization Plan](./DESIGN-MODERNIZATION-2026.md) - Design vision

### By Task

**Setting Up Development Environment:**
1. [Getting Started](./GETTING-STARTED.md)
2. [Astro DB Setup](./ASTRO-DB-SETUP.md)
3. [Sanity Quick Start](./SANITY-QUICKSTART.md)

**Building New Features:**
1. [Component Library](./COMPONENTS.md) - Reusable components
2. [Spacing Guide](./SPACING-GUIDE.md) - Layout patterns
3. [Design Modernization Plan](./DESIGN-MODERNIZATION-2026.md) - Design system

**Managing Content:**
1. [Sanity Quick Start](./SANITY-QUICKSTART.md) - Quick setup
2. [Sanity CMS Guide](./SANITY-CMS-GUIDE.md) - Detailed workflows
3. [WordPress to Sanity Migration](./WORDPRESS-SANITY-MIGRATION.md) - Migrate existing content
4. [Sanity + Astro DB Guide](./SANITY-ASTRODB-GUIDE.md) - When to use which system

**Optimizing Performance:**
1. [Performance Optimization](./PERFORMANCE-OPTIMIZATION.md) - Optimization strategies
2. [Astro Framework Guide](./astro.md) - Framework best practices

---

## Project Overview

**Project Name:** Holistic Acupuncture Website
**Current Version:** 1.0 (MVP Complete)
**Tech Stack:** Astro 5.16.7, Tailwind CSS v4, Sanity CMS, Astro DB
**Repository:** holistic-acupuncture
**Status:** Development (Production-ready features complete, content migration pending)

### Key Features

- ✅ Modern design system with sage green color palette
- ✅ Responsive component library (buttons, cards, forms)
- ✅ 14+ pages including homepage, about, conditions, blog, reviews, contact
- ✅ Sanity CMS integration for blog posts, testimonials, conditions, FAQs
- ✅ Astro DB integration for contact forms, newsletter, testimonials
- ✅ Admin dashboard for viewing form submissions
- ✅ SEO optimization with Schema.org structured data
- ✅ Performance optimizations (lazy loading, image optimization, code splitting)

### Documentation Standards

All documentation in this directory follows these principles:

1. **Practical & Actionable** - Real code examples and clear instructions
2. **Up-to-Date** - Last updated dates and version information included
3. **Comprehensive** - Covers setup, usage, troubleshooting, and best practices
4. **Cross-Referenced** - Links to related documentation for deeper dives
5. **Role-Aware** - Clear audience targeting (developers, content managers, etc.)

---

## About This Knowledge Base

This knowledge base is designed to provide quick reference and comprehensive information about the Holistic Acupuncture website project. Each document is thoroughly researched and synthesized from official documentation sources, tailored specifically for this project's needs.

All documentation is maintained in the `docs/` directory and version-controlled with the codebase to ensure documentation stays in sync with implementation.

---

*Last updated: 2026-01-10*
