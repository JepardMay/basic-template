# Basic Template
A basic template for web development using Gulp, Sass, Pug, Webpack, and BrowserSync.

## Introduction
This project is a basic template for web development that automates tasks such as compiling Sass to CSS, compiling Pug to HTML, bundling JavaScript with Webpack, and live-reloading with BrowserSync.

## Features
- Gulp: Task automation

- Sass: CSS preprocessor

- Pug: HTML template engine

- Webpack: JavaScript module bundler

- BrowserSync: Live-reloading during development

- Del: Clean build directories

- Plumber: Error handling

- Cache: Caching to speed up tasks

- SVG Sprite: Generate SVG sprites

## Prerequisites
Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (version 14.x or higher)

- [npm](https://www.npmjs.com/) (version 6.x or higher)

## Installation
Clone the repository and install the dependencies:

```
git clone https://github.com/your-username/basic-template.git
cd basic-template
npm install
```

## Usage
### Development Server
Start the development server with live reloading:

```
npm run dev
```

### Production Build
Create a production-ready build:

```
npm run build
```

## Folder Structure

```
basic-template/
│
├── dist/                    # Compiled files
│
├── src/
│   ├── favicon/             # Favicons
│   ├── fonts/               # Fonts
│   ├── img/                 # Images
│   │   ├── sprite/          # SVG for sprite.svg
│   │   └── svg/             # SVG outside of sprite
│   ├── js/                  # JavaScript files
│   │   └── modules/         # JavaScript modules
│   ├── pug/                 # Pug templates
│   │   ├── components/      # Pug components
│   │   └── pages/           # Pug pages
│   └── sass/                # Sass files
│   │   ├── components/      # Sass components
│   │   ├── global/          # Sass global styles
│       └── vendor/          # Styles from other sources
│
├── gulpfile.mjs             # Gulp configuration
├── package.json             # npm configuration
└── README.md                # Project documentation
```
