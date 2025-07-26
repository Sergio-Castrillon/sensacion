# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static e-commerce website for "Sensación", a personal care brand. The site is built with vanilla HTML, CSS, and JavaScript - no build process or dependencies.

## Running the Project

Since this is a static website, there are no build commands. To run locally:

```bash
# Option 1: Python HTTP server
python3 -m http.server
# Then visit http://localhost:8000

# Option 2: VS Code Live Server extension
# Right-click on index.html and select "Open with Live Server"

# Option 3: Simply open index.html in a browser
```

## Architecture

### File Structure
- `index.html` - Homepage with featured products and hero section
- `pages/` - Contains all other HTML pages:
  - `products.html` - Product catalog with filtering
  - `product-details.html` - Dynamic product detail page
  - `contact.html` - Contact form using Formspree
- `js/` - JavaScript functionality:
  - `main.js` - Cart interactions and product filtering
  - `product-details.js` - Populates product details based on URL params
- `style/styles.css` - All styling for the site
- `images/` - Logo and icons

### Key Technical Details

1. **Product Details System**: Uses URL parameters (`?product=product-name`) to dynamically load product information from a JavaScript object in `product-details.js`

2. **Contact Form**: Integrated with Formspree service (form ID: `mgvzkdqg`). Requires updating this ID for production use.

3. **Responsive Design**: Uses CSS media queries for mobile/tablet/desktop layouts

4. **No Framework**: Pure vanilla JavaScript - DOM manipulation via `querySelector` and event listeners

### External Dependencies
- Google Fonts (Poppins)
- Font Awesome 6.5.1 (icons)
- Formspree (contact form submission)
- Placeholder images from placehold.co

## Common Tasks

### Adding a New Product
1. Add product card HTML in `index.html` or `pages/products.html`
2. Add product details to the `products` object in `js/product-details.js`
3. Ensure the product link uses the correct URL parameter

### Modifying Contact Form
Update the Formspree form ID in `pages/contact.html:53`

### Updating Navigation
Navigation is duplicated across all HTML files - update header and footer in each file when making changes

## Documentation and Development Resources

### Real-time Documentation Access
This project uses **context7 MCP** for accessing real-time documentation. Use these commands to get up-to-date information:

#### Backend Development
```bash
# Node.js and Express documentation
/context7 nodejs express latest
/context7 express middleware authentication

# Database and ORM
/context7 postgresql prisma orm
/context7 prisma schema migrations

# Authentication and Security
/context7 jwt bcrypt nodejs security
/context7 express security helmet cors
```

#### Payment Integrations
```bash
# MercadoPago integration
/context7 mercadopago nodejs api integration
/context7 mercadopago checkout webhook colombia

# Nequi integration  
/context7 nequi api nodejs integration colombia
/context7 nequi payments push notifications
```

#### Shipping and Logistics
```bash
# Colombian shipping providers
/context7 servientrega api integration colombia
/context7 interrapidisimo api shipping colombia
/context7 shipping calculation weight colombia
```

#### Frontend Development
```bash
# React and modern JavaScript
/context7 react hooks useState useEffect
/context7 zustand state management react
/context7 javascript fetch api async await

# CSS and Styling
/context7 css custom properties variables
/context7 responsive design mobile first
/context7 css grid flexbox layout
```

#### E-commerce Specific
```bash
# E-commerce patterns and best practices
/context7 ecommerce cart checkout flow
/context7 inventory management real time
/context7 product catalog filtering search
/context7 order management workflow
```

#### Testing and Deployment
```bash
# Testing frameworks
/context7 jest testing nodejs api
/context7 playwright e2e testing
/context7 supertest api testing express

# Deployment and DevOps
/context7 railway deployment nodejs
/context7 vercel deployment frontend
/context7 postgresql hosting supabase
/context7 cloudinary image upload nodejs
```

#### Performance and SEO
```bash
# Performance optimization
/context7 nodejs performance optimization
/context7 postgresql query optimization
/context7 image optimization webp lazy loading

# SEO for e-commerce
/context7 ecommerce seo best practices
/context7 structured data schema org products
/context7 meta tags dynamic nodejs
```

### Usage Guidelines
1. **Always check real-time docs** before implementing new features
2. **Use specific queries** for better results (include technology stack)
3. **Focus on latest versions** and Colombia-specific information when applicable
4. **Cross-reference** multiple sources for critical integrations (payments, shipping)

### Common Documentation Queries for This Project
- `/context7 nodejs express ecommerce setup 2024`
- `/context7 postgresql ecommerce database design`
- `/context7 mercadopago nodejs integration colombia 2024`
- `/context7 react shopping cart component best practices`
- `/context7 nodejs authentication jwt security 2024`