IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='orders' AND xtype='U')
CREATE TABLE orders (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  order_code NVARCHAR(30) NOT NULL,
  user_id UNIQUEIDENTIFIER NOT NULL,
  status NVARCHAR(30) NOT NULL DEFAULT 'PENDING',
  subtotal DECIMAL(18,2) NOT NULL,
  discount_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(18,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(18,2) NOT NULL,
  currency NVARCHAR(10) NOT NULL DEFAULT 'VND',
  customer_name NVARCHAR(255) NOT NULL,
  customer_email NVARCHAR(255) NOT NULL,
  customer_phone NVARCHAR(20) NOT NULL,
  note NVARCHAR(MAX) NULL,
  created_date DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  modified_date DATETIME2 NULL,
  deleted_date DATETIME2 NULL,
  CONSTRAINT UQ_orders_order_code UNIQUE (order_code),
  CONSTRAINT FK_orders_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT CK_orders_status CHECK (status IN
    ('PENDING','AWAITING_PAYMENT','PAID','PROCESSING','COMPLETED','CANCELLED','FAILED','REFUNDED'))
);

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='order_items' AND xtype='U')
CREATE TABLE order_items (
  id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
  order_id UNIQUEIDENTIFIER NOT NULL,
  product_id UNIQUEIDENTIFIER NOT NULL,
  product_name NVARCHAR(MAX) NOT NULL,
  product_type NVARCHAR(50) NOT NULL,
  package_id NVARCHAR(100) NULL,
  package_name NVARCHAR(MAX) NULL,
  unit_price DECIMAL(18,2) NOT NULL,
  quantity INT NOT NULL,
  total_price DECIMAL(18,2) NOT NULL,
  created_date DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT FK_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id),
  CONSTRAINT FK_order_items_product FOREIGN KEY (product_id) REFERENCES products(id)
);
