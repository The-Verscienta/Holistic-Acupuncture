# Astro Framework - Comprehensive Guide

## Table of Contents
1. [What is Astro?](#what-is-astro)
2. [Why Use Astro?](#why-use-astro)
3. [Islands Architecture](#islands-architecture)
4. [Installation & Setup](#installation--setup)
5. [Astro Components](#astro-components)
6. [Template Syntax & Expressions](#template-syntax--expressions)
7. [Content Collections](#content-collections)
8. [Integrations](#integrations)
9. [View Transitions](#view-transitions)
10. [CMS Integration](#cms-integration)
11. [Tutorial Overview](#tutorial-overview)

---

## What is Astro?

Astro is a modern web framework optimized for **content-driven websites** such as blogs, marketing sites, portfolios, and e-commerce platforms. It's a framework that prioritizes performance, developer experience, and flexibility.

### Core Characteristics

- **Zero JavaScript by Default**: Astro components render to static HTML with no client-side JavaScript unless explicitly added
- **Framework Agnostic**: Supports React, Vue, Svelte, Solid, Preact, and web components
- **Content-First Design**: Built specifically for publishing and content delivery
- **Server-Centric Architecture**: Leverages server-side rendering to minimize JavaScript sent to browsers

---

## Why Use Astro?

### Performance Excellence

Astro websites can **load 40% faster with 90% less JavaScript** compared to React-built sites. The framework prioritizes speed as a fundamental principle rather than an afterthought, making fast performance the default rather than requiring optimization effort.

### Content-First Design

While frameworks like Next.js and Nuxt emphasize complex browser-based applications, Astro excels at content delivery. It sensibly scales from static sites to dynamic applications while maintaining exceptional performance for content-heavy websites.

### Server-Centric Architecture

Astro leverages server-side rendering over client-side rendering, minimizing JavaScript sent to browsers. This approach mirrors decades-proven server frameworks (PHP, Laravel, Rails) but uses only HTML, CSS, and JavaScript—no additional languages required.

### Key Benefits

- **Islands Architecture**: Component-based structure optimized specifically for content sites
- **Framework Flexibility**: Mix and match multiple UI frameworks on the same page
- **Zero JavaScript Default**: Sends no unnecessary client-side code
- **Built-in Content Collections**: Organize Markdown with TypeScript type-safety
- **Hundreds of Integrations**: Extensive customization options available
- **Progressive Complexity**: Start simple with HTML and CSS, then incrementally add features as needed

---

## Islands Architecture

### Overview

Islands architecture is a frontend pattern that **Astro pioneered**, rendering most pages as static HTML with isolated "islands" of JavaScript for interactive components. This approach avoids the heavy JavaScript payloads common in traditional frameworks.

### Historical Context

The term "component island" originated with Etsy's Katie Sylor-Miller in 2019 and was expanded by Preact creator Jason Miller in 2020. Miller described it as: "render HTML pages on the server, and inject placeholders or slots around highly dynamic regions [that] can then be 'hydrated' on the client into small self-contained widgets."

This technique is also known as **partial or selective hydration**.

### Types of Islands

**Client Islands** - Interactive JavaScript components hydrated separately from the page. By default, Astro renders all components to HTML/CSS only, stripping client-side JavaScript. Developers must explicitly add `client:*` directives to make components interactive.

**Server Islands** - Dynamic server-rendered components that process independently using the `server:defer` directive, allowing expensive operations to run separately without blocking main page rendering.

### Key Benefits

1. **Performance**: JavaScript loads only for explicitly interactive components, reducing unnecessary payload weight
2. **Parallel Loading**: Multiple islands load independently in the browser, preventing slower components from blocking faster ones
3. **Selective Control**: Developers can specify loading strategies like `client:idle` or `client:visible` per component
4. **Framework Flexibility**: Multiple UI frameworks (React, Vue, Svelte, SolidJS, Preact) can coexist on the same page since islands operate in isolation

Server islands particularly benefit dynamic content like personalized user avatars or product reviews on e-commerce sites, allowing static content caching while dynamic elements render separately.

---

## Installation & Setup

### Prerequisites

To install Astro, you need:

- **Node.js**: version 18.20.8 or higher (v20.3.0, v22.0.0+)
  - Note: v19 and v21 are not supported
- **Text editor**: VS Code with the Official Astro extension is recommended
- **Terminal**: Astro operates through its command-line interface

### Browser Compatibility

Astro targets browsers with modern JavaScript support by default, leveraging Vite's build system.

### Installation Methods

#### Quick Start with CLI Wizard

The fastest approach uses the `create astro` command:

```bash
npm create astro@latest
# or
pnpm create astro@latest
# or
yarn create astro
```

The wizard will:
- Guide you through setup
- Offer official starter templates
- Create your project directory
- Install dependencies automatically

#### Adding Integrations During Setup

Install official integrations simultaneously using the `--add` flag:

```bash
npm create astro@latest -- --add react --add partytown
```

#### Using Themes or Templates

Start with an existing theme or GitHub repository using the `--template` flag:

```bash
npm create astro@latest -- --template <github-username>/<github-repo>
```

#### Manual Setup

For manual configuration:

1. Create a project directory and initialize `package.json`
2. Install Astro locally (never globally)
3. Create `src/pages/index.astro` with your first page
4. Create a `public/` directory for static assets
5. Set up `astro.config.mjs` for configuration
6. Add `tsconfig.json` for TypeScript support

### Project Structure

A complete setup includes:
- `node_modules/` - Dependencies directory
- `public/` - Static assets folder
- `src/pages/` - Directory containing your pages
- `astro.config.mjs` - Configuration file
- `tsconfig.json` - TypeScript configuration
- `package.json` - Package manifest

### Next Steps

After installation, start your development server to preview your project in real-time.

---

## Astro Components

### Overview

**Astro components are the foundational building blocks** of any Astro project. They use the `.astro` file extension and are HTML-only templating components with **no client-side runtime**.

A key distinction: these components render exclusively to HTML during build-time or on-demand, with **zero JavaScript footprint by default**. All code in the component's frontmatter is stripped before delivery to users' browsers.

### Component Structure

Astro components consist of two main sections:

#### 1. Component Script (Frontmatter)

The JavaScript section enclosed by code fences (`---`) functions like Markdown frontmatter:

```astro
---
// Component Script
import OtherComponent from './OtherComponent.astro';
import { fetchData } from '../api/data.js';

const data = await fetchData();
const greeting = "Hello, World!";
---
```

Valid uses include:
- Importing other Astro components
- Importing framework components (React, Vue, etc.)
- Fetching external data from APIs or databases
- Creating reusable variables

The code fence **guarantees that the JavaScript you write is "fenced in"** and won't be sent to the client.

#### 2. Component Template

Below the code fence, this section handles HTML output:

```astro
<div>
  <h1>{greeting}</h1>
  <OtherComponent />
</div>
```

Capabilities include:
- Standard HTML markup
- JavaScript expressions in curly braces
- Astro directives and special tags
- Imported component usage
- Conditional rendering

### Props and Reusability

Components accept **props** via destructuring from `Astro.props`:

```astro
---
const { greeting, name } = Astro.props;
---

<h1>{greeting}, {name}!</h1>
```

TypeScript support enables type safety through interface definitions:

```astro
---
interface Props {
  greeting: string;
  name?: string; // Optional with default
}

const { greeting, name = "World" } = Astro.props;
---
```

### Slots System

#### Basic Slots

The `<slot />` element acts as a placeholder for child content:

```astro
---
// Layout.astro
---
<div class="wrapper">
  <slot />
</div>
```

Usage:

```astro
<Layout>
  <p>This content will be placed in the slot</p>
</Layout>
```

#### Named Slots

Components can define multiple named slots for precise content distribution:

```astro
<header>
  <slot name="header" />
</header>
<main>
  <slot /> <!-- Default slot -->
</main>
<footer>
  <slot name="footer" />
</footer>
```

Child elements reference slots via `slot` attributes:

```astro
<Layout>
  <h1 slot="header">Page Title</h1>
  <p>Main content goes in default slot</p>
  <small slot="footer">Copyright 2026</small>
</Layout>
```

#### Fallback Content

Slots support placeholder content displayed when no children are provided:

```astro
<slot>
  <p>This is default content if no slot content provided</p>
</slot>
```

### HTML Components

Astro supports `.html` files as components with limitations:
- No frontmatter or dynamic expressions
- No server-side imports
- Scripts remain unbundled (`is:inline` behavior)
- Asset references limited to `public/` folder

### When to Add Interactivity

By default, Astro components are static. To add interactivity:

1. **Client Directives**: Use `client:*` directives for hydration
   ```astro
   <ReactComponent client:visible />
   ```

2. **Client Scripts**: Add `<script>` tags for client-side functionality
   ```astro
   <script>
     document.querySelector('button').addEventListener('click', () => {
       console.log('clicked!');
     });
   </script>
   ```

3. **Server Islands**: Use `server:defer` for deferred rendering without blocking page loads

---

## Template Syntax & Expressions

### Overview

Astro component syntax extends HTML with JSX-like capabilities. Components use a "frontmatter" pattern with code fences (`---`) separating JavaScript from HTML.

### Variables and Dynamic Content

Variables defined in the frontmatter can be injected into templates using curly braces:

```astro
---
const name = "Astro";
const items = ["Apple", "Banana", "Cherry"];
---

<h1>Hello {name}!</h1>
<ul>
  {items.map(item => <li>{item}</li>)}
</ul>
```

**Important distinction:** Values are **dynamic** (calculated at build time) but not **reactive** (won't update after rendering). Astro components render once during the build step.

### Dynamic Attributes

Variables can populate both HTML element attributes and component props:

```astro
---
const elementClass = "primary";
const href = "/about";
---

<button class={elementClass}>Click me</button>
<a href={href}>About</a>
```

**Caution:** Functions and objects cannot be passed to HTML elements. Event handlers must be added via client-side scripts instead.

### Conditional Rendering

Astro supports standard JavaScript operators:

```astro
---
const visible = true;
const condition = "admin";
---

{visible && <p>Shown conditionally</p>}
{condition === "admin" ? <p>Admin view</p> : <p>User view</p>}
```

### Lists and Iteration

Use JavaScript array methods to render lists:

```astro
---
const posts = await getCollection('blog');
---

<ul>
  {posts.map(post => (
    <li>
      <a href={`/blog/${post.slug}`}>{post.data.title}</a>
    </li>
  ))}
</ul>
```

### Dynamic Tags

Component or element types can be stored in capitalized variables:

```astro
---
const Element = 'div';
const Component = SomeComponent;
---

<Element>Content</Element>
<Component />
```

**Requirements:** Variable names must be capitalized; hydration directives (`client:*`) aren't supported with dynamic tags.

### Fragments

Both shorthand (`<> </>`) and the `<Fragment />` component prevent unnecessary wrapper elements:

```astro
---
import { Fragment } from 'astro:components';
---

<>
  <p>First paragraph</p>
  <p>Second paragraph</p>
</>
```

Especially useful with `set:*` directives.

### Key Differences from JSX

| Feature | Astro | JSX |
|---------|-------|-----|
| **Attributes** | `kebab-case` (`class`, `data-value`) | `camelCase` (`className`, `dataValue`) |
| **Root Elements** | Multiple elements allowed | Requires single wrapper |
| **Comments** | HTML (`<!-- -->`) and JS (`{/* */}`) both work | JS comments only |

### Component Utilities

#### Astro.slots

Provides utilities for managing component slot content:

```astro
---
const hasHeader = Astro.slots.has('header');
const headerContent = await Astro.slots.render('header');
---

{hasHeader && <div class="header-wrapper" set:html={headerContent} />}
```

- **`Astro.slots.has(name)`** – Returns boolean indicating if a slot contains content
- **`Astro.slots.render(name, args?)`** – Asynchronously renders slot contents to HTML string; optionally passes parameters to function children

#### Astro.self

Enables recursive component calls for nested data structures:

```astro
---
const { tree } = Astro.props;
---

<ul>
  {tree.map(node => (
    <li>
      {node.title}
      {node.children && <Astro.self tree={node.children} />}
    </li>
  ))}
</ul>
```

### Comments

- **HTML comments** (`<!-- -->`) are included in the browser DOM
- **JavaScript comments** (`{/* */}`) are excluded from output; preferred for development notes

---

## Content Collections

### What Are Content Collections?

**Content Collections are the best way to manage sets of content in any Astro project.** They represent Astro's structured approach to organizing related data—such as blog posts, product items, or author profiles—that share common properties.

Collections can contain:
- **Local files**: Markdown, MDX, Markdoc, YAML, TOML, JSON
- **Remote data**: External sources like CMSs or databases through custom loaders

### Key Benefits

1. **Type Safety & Validation**: Zod-based schemas enforce consistent data structures, preventing production errors
2. **Developer Experience**: Content-focused APIs designed to make querying intuitive, replacing manual glob imports
3. **Performance**: The Content Layer API handles caching between builds and scales to tens of thousands of entries
4. **Remote Content Support**: Custom loaders enable seamless integration with external data sources

### Core Setup

Collections require a `src/content.config.ts` file:

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { blog };
```

### Querying Collections

Use the `getCollection()` and `getEntry()` functions:

```astro
---
import { getCollection, getEntry } from 'astro:content';

// Get all blog posts
const allPosts = await getCollection('blog');

// Get a single post
const post = await getEntry('blog', 'my-first-post');

// Filter posts
const recentPosts = await getCollection('blog', ({ data }) => {
  return data.pubDate > new Date('2024-01-01');
});
---
```

### Rendering Content

For Markdown/MDX content, use the `render()` method:

```astro
---
const post = await getEntry('blog', Astro.params.slug);
const { Content } = await post.render();
---

<article>
  <h1>{post.data.title}</h1>
  <Content />
</article>
```

### When to Use Collections

**Use Collections when:**
- Managing multiple pieces of content that share the same properties
- Building blogs, portfolios, product catalogs
- Requiring consistent validation across content
- Handling large-scale datasets

**Don't use Collections for:**
- Single pages
- Static files (PDFs)
- Real-time data requiring live updates outside the build process

---

## Integrations

### What Are Astro Integrations?

**Astro integrations** extend project functionality with minimal code. They unlock UI frameworks, enable server-side rendering through adapters, and integrate tools. Integrations can add new features like automatic sitemap generation and hook into build processes.

### Official Integration Categories

#### Frontend Frameworks

Supported UI frameworks:
- **Alpine.js**
- **Preact**
- **React**
- **SolidJS**
- **Svelte**
- **Vue**

Usage:

```bash
npx astro add react
```

```astro
---
import ReactComponent from '../components/ReactComponent.jsx';
---

<ReactComponent client:load />
```

#### Adapters

Four deployment adapters maintained by Astro:
- **Cloudflare**
- **Netlify**
- **Node**
- **Vercel**

Enable server-side rendering:

```bash
npx astro add vercel
```

#### Other Official Tools

- **@astrojs/db** – Database integration
- **@astrojs/markdoc** – Markdoc support
- **@astrojs/mdx** – MDX content
- **@astrojs/partytown** – Web worker optimization
- **@astrojs/sitemap** – Automatic sitemap generation

### Installation Methods

#### Automatic Setup

Run `astro add [package-name]` for supported integrations:

```bash
npx astro add react sitemap partytown
```

This command:
1. Installs the npm package
2. Updates `astro.config.mjs`
3. Installs peer dependencies

#### Manual Installation

Three approaches exist:

1. **Install npm packages and update config**:

```bash
npm install @astrojs/react react react-dom
```

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
});
```

2. **Import local integrations** from project files
3. **Write inline integrations** directly in config

### Management Tasks

**Upgrading:** Use the upgrade command for all official integrations:

```bash
npx @astrojs/upgrade
```

Or manually update individual packages:

```bash
npm update @astrojs/react
```

**Removing:**

1. Uninstall the npm package:
```bash
npm uninstall @astrojs/react
```

2. Delete the integration reference from `astro.config.mjs`

### Finding & Building Integrations

- **[Astro Integrations Directory](https://astro.build/integrations/)** hosts hundreds of community-created extensions
- Developers can create custom integrations using the Integration API, which draws inspiration from Rollup and Vite plugin architecture

---

## View Transitions

### Overview

**View transitions are animated transitions between different website views**, providing visual continuity as visitors move between states. Astro's implementation leverages the View Transitions browser API with built-in animations, custom animation support, and client-side routing.

### Enabling View Transitions

Import and add the `<ClientRouter />` component to a shared layout:

```astro
---
import { ClientRouter } from "astro:transitions";
---

<html>
  <head>
    <ClientRouter />
  </head>
  <body>
    <slot />
  </body>
</html>
```

This enables default page animations without additional configuration.

### Transition Directives

Three main directives control transition behavior:

#### transition:name

Assigns a custom name to pair matching elements between pages:

```astro
<header transition:name="header">
  <h1>My Site</h1>
</header>
```

Elements with the same `transition:name` will morph between pages instead of fading in/out.

#### transition:animate

Overrides default animations with built-in or custom options:

```astro
<main transition:animate="slide">
  <!-- Content -->
</main>
```

#### transition:persist

Preserves components and elements across page navigations:

```astro
<video transition:persist controls>
  <source src="video.mp4" />
</video>
```

### Built-in Animations

Astro provides four default animation options:

- **`fade`** (default) - Crossfade animation
- **`initial`** - Browser's default styling
- **`slide`** - Content slides left/right based on direction
- **`none`** - Disables animations

Example:

```astro
<main transition:animate="slide">
  <slot />
</main>
```

### Customizing Animations

Import and configure built-in animations:

```astro
---
import { fade } from "astro:transitions";
---

<header transition:animate={fade({ duration: "0.4s" })}>
  <h1>My Site</h1>
</header>
```

Define custom animations by specifying keyframes:

```astro
---
const customSlide = {
  old: {
    name: 'slideOut',
    duration: '0.3s',
    easing: 'ease-in',
    fillMode: 'forwards',
  },
  new: {
    name: 'slideIn',
    duration: '0.3s',
    easing: 'ease-out',
    fillMode: 'backwards',
  }
};
---

<div transition:animate={customSlide}>
  <!-- Content -->
</div>

<style>
@keyframes slideOut {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
</style>
```

### Router Control

#### Preventing Client-Side Navigation

Add the `data-astro-reload` attribute to force full-page navigation:

```astro
<a href="/page" data-astro-reload>Full Page Load</a>
```

#### Triggering Navigation Programmatically

Use the `navigate()` function:

```astro
<script>
import { navigate } from "astro:transitions/client";

document.getElementById('myButton').addEventListener('click', () => {
  navigate('/target-page');
});
</script>
```

#### Managing Browser History

Control history entries using `data-astro-history`:

```astro
<a href="/page" data-astro-history="replace">Replace History</a>
```

Options:
- **`push`** (default) - Add new entry to history
- **`replace`** - Replace current history entry
- **`auto`** - Let browser decide

### Maintaining State

The `transition:persist` directive preserves component state across navigations:

```astro
---
import Counter from '../components/Counter.jsx';
---

<Counter client:load transition:persist initialCount={5} />
```

This maintains:
- Internal component state
- DOM properties
- Event listeners

### Lifecycle Events

Navigation fires events in sequence:

1. **`astro:before-preparation`** - Navigation begins; load new content
2. **`astro:after-preparation`** - New content loaded and parsed
3. **`astro:before-swap`** - Before DOM replacement occurs
4. **`astro:after-swap`** - New page replaces old page
5. **`astro:page-load`** - Page visible and scripts executed

Example listener:

```astro
<script>
document.addEventListener("astro:page-load", () => {
  setupEventListeners();
  initializeComponents();
});
</script>
```

### Script Behavior

- **Bundled module scripts** execute once and don't re-run
- **Inline scripts** may re-execute during navigation
- Use `data-astro-rerun` to force inline script re-execution

```astro
<script is:inline data-astro-rerun>
  console.log('This runs on every page navigation');
</script>
```

### Accessibility Features

The `<ClientRouter />` includes:

- **Route announcement** - Automatically announces page title changes to assistive technology
- **Reduced motion support** - Respects `prefers-reduced-motion` by disabling animations

### Fallback Behavior

For browsers without View Transition API support, configure fallback options:

```astro
<ClientRouter fallback="swap" />
```

Options:
- **`animate`** (default) - Use CSS animations as fallback
- **`swap`** - Instant page swap without animation
- **`none`** - Disable transitions entirely in unsupported browsers

---

## CMS Integration

### Overview

Astro works seamlessly with **headless Content Management Systems**, allowing you to manage content separately from your site's presentation layer.

### Why Use a CMS with Astro?

A CMS enables several key benefits:

1. **Separate content management**: Write content and manage assets outside of your Astro project
2. **Visual editing**: Most systems provide dashboard interfaces and WYSIWYG editors rather than requiring code
3. **Content structure**: CMSes enforce consistent data types and required fields
4. **Collaboration**: Multiple team members can manage content simultaneously

### Headless CMS Approach

Astro pairs specifically with **headless CMSes** because the framework handles presentation while the CMS manages content. You "fetch the content data and use in your Astro project" rather than using a CMS that generates its own website.

### Supported CMS Platforms

Astro integrates with **40+ headless systems**, including:

#### API-Driven
- **Contentful**
- **Sanity**
- **Hygraph**
- **Strapi**

#### Git-Based
- **Decap CMS**
- **Front Matter CMS**

#### Specialized
- **Storyblok** (with native Astro integration)
- **WordPress** (headless mode)
- **DatoCMS**

Many provide JavaScript SDKs or dedicated Astro integrations for content fetching.

### Integration Example

Using Contentful with Astro:

```astro
---
import { contentfulClient } from '../lib/contentful';

const entries = await contentfulClient.getEntries({
  content_type: 'blogPost',
  order: '-fields.publishDate',
});
---

<div>
  {entries.items.map(post => (
    <article>
      <h2>{post.fields.title}</h2>
      <p>{post.fields.excerpt}</p>
      <a href={`/blog/${post.fields.slug}`}>Read more</a>
    </article>
  ))}
</div>
```

### Alternative: Content Without a CMS

Astro includes **built-in Markdown support** and **Content Collections**, making it viable for projects without external content management systems. For smaller projects or when you want full control, local Markdown files with Content Collections provide type-safe content management without a separate CMS.

---

## Tutorial Overview

### Build Your First Astro Blog

The official Astro tutorial guides you through creating a fully functional blog from scratch.

### What You'll Learn

Core learning objectives include:

- **Development Setup**: Configuring your development environment properly
- **Page Creation**: Building pages and authoring blog posts
- **Component Development**: Creating reusable Astro components
- **Data Management**: Querying and working with local files
- **Interactivity**: Adding dynamic features to enhance user engagement
- **Deployment**: Launching your completed site to the web

### Tutorial Structure

The course is organized into **six units with 26 total lessons**:

- **Unit 0**: Introduction and orientation (2 lessons)
- **Unit 1**: Initial setup and first deployment (6 lessons)
- **Unit 2**: Page creation and styling (6 lessons)
- **Unit 3**: Component building (5 lessons)
- **Unit 4**: Layout system mastery (4 lessons)
- **Unit 5**: Advanced blog features (5 lessons)
- **Unit 6**: Interactivity and final touches (5 lessons)

### Getting Started Options

You can:
- Preview the completed project via GitHub
- Use an online coding environment like IDX or StackBlitz
- Visit [astro.new](https://astro.new) to explore pre-built starter templates

### Tutorial URL

Access the tutorial at: https://docs.astro.build/en/tutorial/0-introduction/

---

## Additional Resources

### Official Links

- **Documentation**: https://docs.astro.build/en/getting-started/
- **GitHub**: https://github.com/withastro/astro
- **Discord Community**: https://astro.build/chat
- **Themes Directory**: https://astro.build/themes/
- **Integrations Directory**: https://astro.build/integrations/

### Educational Partners

- **Scrimba Course**: Intro to Astro with James Q Quick
  - URL: https://scrimba.com/intro-to-astro-c00ar0fi5u?via=astro

### Support Astro

- **Open Collective**: https://opencollective.com/astrodotbuild

### Official Sponsors

- **Netlify** - Hosting and deployment platform
- **Webflow** - Visual development platform
- **Cloudflare** - Edge computing and CDN
- **Mux** - Video infrastructure

---

## Summary

Astro is a modern, performance-focused web framework that excels at building content-driven websites. Its **Islands Architecture** provides the perfect balance between static HTML performance and interactive JavaScript components. With built-in support for multiple UI frameworks, comprehensive Content Collections, smooth View Transitions, and extensive CMS integrations, Astro provides everything you need to build fast, modern websites while maintaining an excellent developer experience.

Key takeaways:
- **Zero JavaScript by default** with opt-in interactivity
- **40% faster load times** with 90% less JavaScript
- **Framework agnostic** - use React, Vue, Svelte, or mix them all
- **Content Collections** for type-safe content management
- **View Transitions** for smooth page navigation
- **40+ CMS integrations** for flexible content management
- **Progressive complexity** - start simple, scale as needed
