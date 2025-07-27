# 🗄️ DISEÑO DE BASE DE DATOS - E-COMMERCE SENSACIÓN

## 📊 ESQUEMA COMPLETO

### 1. USUARIOS Y AUTENTICACIÓN

```sql
-- Tabla de usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say', 'other')),
    role VARCHAR(20) CHECK (role IN ('customer', 'admin', 'staff')) DEFAULT 'customer',
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Direcciones de usuarios (múltiples por usuario)
CREATE TABLE user_addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'Colombia',
    is_default BOOLEAN DEFAULT FALSE,
    address_type VARCHAR(20) CHECK (address_type IN ('home', 'work', 'other')) DEFAULT 'home',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tokens para reset de password y verificación
CREATE TABLE user_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    token_type VARCHAR(30) CHECK (token_type IN ('email_verification', 'password_reset')) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. CATÁLOGO DE PRODUCTOS

```sql
-- Categorías de productos
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Marcas
CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Productos principales
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    short_description VARCHAR(500),
    category_id INTEGER REFERENCES categories(id),
    brand_id INTEGER REFERENCES brands(id),
    sku VARCHAR(100) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    
    -- Precios
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2), -- Precio antes del descuento
    cost_price DECIMAL(10,2), -- Precio de costo
    
    -- Físico
    weight DECIMAL(8,2), -- en gramos
    length DECIMAL(8,2), -- en cm
    width DECIMAL(8,2),  -- en cm
    height DECIMAL(8,2), -- en cm
    
    -- SEO y metadata
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Estado
    status VARCHAR(20) CHECK (status IN ('draft', 'active', 'inactive', 'archived')) DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL
);

-- Imágenes de productos
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Variantes de productos (tallas, colores, etc.)
CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    variant_name VARCHAR(100) NOT NULL, -- "Talla L", "Color Azul"
    sku VARCHAR(100) UNIQUE NOT NULL,
    price DECIMAL(10,2), -- NULL hereda del producto padre
    compare_price DECIMAL(10,2),
    weight DECIMAL(8,2),
    barcode VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Atributos de productos (flexibles)
CREATE TABLE product_attributes (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    attribute_name VARCHAR(100) NOT NULL, -- "Ingredientes", "Modo de uso"
    attribute_value TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
);
```

### 3. INVENTARIO Y STOCK

```sql
-- Inventario principal
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE CASCADE,
    
    -- Stock
    quantity INTEGER NOT NULL DEFAULT 0,
    reserved_quantity INTEGER NOT NULL DEFAULT 0, -- Reservado en carritos
    minimum_stock INTEGER DEFAULT 5, -- Alerta de stock bajo
    
    -- Ubicación física
    warehouse_location VARCHAR(100),
    shelf_location VARCHAR(100),
    
    -- Auditoría
    last_stock_check TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE(product_id, variant_id)
);

-- Movimientos de inventario (auditoría)
CREATE TABLE inventory_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    variant_id INTEGER REFERENCES product_variants(id),
    movement_type VARCHAR(20) CHECK (movement_type IN ('purchase', 'sale', 'adjustment', 'return', 'damage')) NOT NULL,
    quantity_change INTEGER NOT NULL, -- Positivo entrada, negativo salida
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    reference_id INTEGER, -- ID de orden, compra, etc.
    reference_type VARCHAR(50), -- 'order', 'purchase', 'adjustment'
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. CARRITO DE COMPRAS

```sql
-- Carritos (persistentes)
CREATE TABLE shopping_carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(255), -- Para usuarios no registrados
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX(user_id),
    INDEX(session_id)
);

-- Items del carrito
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES shopping_carts(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    variant_id INTEGER REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_when_added DECIMAL(10,2) NOT NULL, -- Precio al momento de agregar
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE(cart_id, product_id, variant_id)
);
```

### 5. ÓRDENES Y VENTAS

```sql
-- Órdenes principales
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL, -- SEN-20240101-001
    user_id INTEGER REFERENCES users(id),
    
    -- Información de contacto (copiada al momento de la orden)
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    customer_first_name VARCHAR(100) NOT NULL,
    customer_last_name VARCHAR(100) NOT NULL,
    
    -- Dirección de envío
    shipping_address_line_1 VARCHAR(255) NOT NULL,
    shipping_address_line_2 VARCHAR(255),
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NOT NULL,
    shipping_postal_code VARCHAR(20) NOT NULL,
    shipping_country VARCHAR(100) DEFAULT 'Colombia',
    
    -- Dirección de facturación (puede ser diferente)
    billing_address_line_1 VARCHAR(255),
    billing_address_line_2 VARCHAR(255),
    billing_city VARCHAR(100),
    billing_state VARCHAR(100),
    billing_postal_code VARCHAR(20),
    billing_country VARCHAR(100),
    same_as_shipping BOOLEAN DEFAULT TRUE,
    
    -- Montos
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Estado y timestamps
    status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')) DEFAULT 'pending',
    payment_status VARCHAR(30) CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')) DEFAULT 'pending',
    fulfillment_status VARCHAR(20) CHECK (fulfillment_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
    
    -- Metadatos
    notes TEXT,
    internal_notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL
);

-- Items de órdenes
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    variant_id INTEGER REFERENCES product_variants(id),
    
    -- Información del producto al momento de la compra
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100) NOT NULL,
    variant_name VARCHAR(100),
    
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6. PAGOS

```sql
-- Transacciones de pago
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Detalles del pago
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'COP',
    payment_method VARCHAR(20) CHECK (payment_method IN ('credit_card', 'debit_card', 'pse', 'nequi', 'cash', 'bank_transfer')) NOT NULL,
    
    -- Información del procesador
    processor VARCHAR(20) CHECK (processor IN ('mercadopago', 'nequi', 'manual')) NOT NULL,
    processor_transaction_id VARCHAR(255),
    processor_reference VARCHAR(255),
    
    -- Estados
    status VARCHAR(20) CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')) DEFAULT 'pending',
    
    -- Metadatos
    processor_response JSON,
    failure_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    INDEX(order_id),
    INDEX(processor_transaction_id),
    INDEX(status)
);

-- Reembolsos
CREATE TABLE refunds (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id),
    
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    
    processor_refund_id VARCHAR(255),
    processor_response JSON,
    
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL
);
```

### 7. ENVÍOS Y LOGÍSTICA

```sql
-- Transportadoras
CREATE TABLE shipping_carriers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL, -- 'servientrega', 'interrapidisimo'
    api_endpoint VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    logo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Métodos de envío
CREATE TABLE shipping_methods (
    id SERIAL PRIMARY KEY,
    carrier_id INTEGER REFERENCES shipping_carriers(id),
    name VARCHAR(100) NOT NULL, -- "Envío estándar", "Envío express"
    description TEXT,
    estimated_days_min INTEGER,
    estimated_days_max INTEGER,
    base_cost DECIMAL(10,2) NOT NULL,
    cost_per_kg DECIMAL(10,2) DEFAULT 0,
    free_shipping_threshold DECIMAL(10,2), -- Envío gratis sobre este monto
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0
);

-- Zonas de envío
CREATE TABLE shipping_zones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    states JSON NOT NULL, -- ["Valle del Cauca", "Cauca"]
    cities JSON, -- Ciudades específicas si aplica
    is_active BOOLEAN DEFAULT TRUE
);

-- Costos por zona
CREATE TABLE shipping_zone_rates (
    id SERIAL PRIMARY KEY,
    shipping_method_id INTEGER REFERENCES shipping_methods(id) ON DELETE CASCADE,
    shipping_zone_id INTEGER REFERENCES shipping_zones(id) ON DELETE CASCADE,
    base_cost DECIMAL(10,2) NOT NULL,
    cost_per_kg DECIMAL(10,2) DEFAULT 0,
    free_shipping_threshold DECIMAL(10,2),
    
    UNIQUE(shipping_method_id, shipping_zone_id)
);

-- Envíos de órdenes
CREATE TABLE shipments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    carrier_id INTEGER REFERENCES shipping_carriers(id),
    shipping_method_id INTEGER REFERENCES shipping_methods(id),
    
    tracking_number VARCHAR(255) UNIQUE,
    tracking_url VARCHAR(500),
    
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    
    shipping_cost DECIMAL(10,2) NOT NULL,
    weight DECIMAL(8,2),
    
    status VARCHAR(20) CHECK (status IN ('pending', 'processing', 'shipped', 'in_transit', 'delivered', 'failed', 'returned')) DEFAULT 'pending',
    
    -- Metadatos de la transportadora
    carrier_response JSON,
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL
);
```

### 8. CUPONES Y DESCUENTOS

```sql
-- Cupones de descuento
CREATE TABLE coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Tipo de descuento
    discount_type VARCHAR(20) CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')) NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    
    -- Restricciones
    minimum_amount DECIMAL(10,2), -- Monto mínimo de compra
    maximum_discount DECIMAL(10,2), -- Descuento máximo (para porcentajes)
    usage_limit INTEGER, -- Límite total de usos
    usage_limit_per_customer INTEGER DEFAULT 1,
    
    -- Vigencia
    starts_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP,
    
    -- Estado
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Uso de cupones
CREATE TABLE coupon_uses (
    id SERIAL PRIMARY KEY,
    coupon_id INTEGER REFERENCES coupons(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(coupon_id, order_id)
);
```

### 9. REVIEWS Y CALIFICACIONES

```sql
-- Reviews de productos
CREATE TABLE product_reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE(product_id, user_id, order_id)
);
```

### 10. CONFIGURACIÓN DEL SISTEMA

```sql

-- Configuraciones generales
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) CHECK (setting_type IN ('string', 'number', 'boolean', 'json')) DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Logs de actividad
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50), -- 'product', 'order', 'user'
    resource_id INTEGER,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX(user_id),
    INDEX(resource_type, resource_id),
    INDEX(created_at)
);
```

## 📋 ÍNDICES RECOMENDADOS

```sql
-- Índices para performance
CREATE INDEX idx_products_category_status ON products(category_id, status);
CREATE INDEX idx_products_featured ON products(is_featured, status);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_date_status ON orders(created_at, status);
CREATE INDEX idx_inventory_product_variant ON inventory(product_id, variant_id);
CREATE INDEX idx_payments_order_status ON payments(order_id, status);
CREATE INDEX idx_product_reviews_product_approved ON product_reviews(product_id, is_approved);

-- Índices de texto completo para búsqueda
CREATE FULLTEXT INDEX idx_products_search ON products(name, description, short_description);
CREATE FULLTEXT INDEX idx_categories_search ON categories(name, description);
```

## 🔒 SEGURIDAD BÁSICA PARA MVP

### Consideraciones de Seguridad Esenciales

#### 1. Contraseñas y Autenticación
```javascript
// En el backend Node.js - NO en la base de datos
const bcrypt = require('bcryptjs');

// Política simple de contraseñas
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireNumbers: true,
  requireUppercase: true,
  // Validar en el backend con Joi
};

// Hash seguro de contraseñas
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

#### 2. Validaciones Críticas en BD
```sql
-- Prevenir stock negativo
ALTER TABLE inventory ADD CONSTRAINT check_positive_stock 
CHECK (quantity >= 0 AND reserved_quantity >= 0);

-- Evitar precios negativos
ALTER TABLE products ADD CONSTRAINT check_positive_price 
CHECK (price >= 0);

-- Validar emails básico
ALTER TABLE users ADD CONSTRAINT check_email_format 
CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$');
```

#### 3. Variables de Entorno (Producción)
```bash
# Básicas y suficientes para MVP
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require
BCRYPT_ROUNDS=12

# APIs
MERCADOPAGO_ACCESS_TOKEN=your-mp-token
NEQUI_API_KEY=your-nequi-key
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

#### 4. Headers de Seguridad (Express.js)
```javascript
// Usar helmet.js - simple y efectivo
const helmet = require('helmet');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Solo para desarrollo
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"]
    }
  }
}));
```

### Lo que NO implementamos en MVP

❌ **Encriptación compleja de BD** - HTTPS + bcrypt es suficiente  
❌ **Auditoría detallada** - Logs básicos de Express  
❌ **Row Level Security** - Validación en backend  
❌ **Políticas de retención GDPR** - Para versión 2.0  

### Lo que SÍ es crítico para MVP

✅ **HTTPS obligatorio** en producción  
✅ **Bcrypt para contraseñas** (salt rounds 12+)  
✅ **JWT con secret fuerte** (32+ caracteres)  
✅ **Validación de inputs** con Joi  
✅ **Rate limiting** para login y APIs  
✅ **Headers seguros** con Helmet  

¿Te parece mejor este enfoque simplificado para el MVP?