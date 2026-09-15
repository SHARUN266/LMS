// Interactive In-Memory SQL Sandbox Runner

export interface SQLQueryResult {
  columns: string[];
  rows: (string | number | null)[][];
  rowCount: number;
  executionTimeMs: number;
  error?: string;
}

export const SAMPLE_DATASETS_SQL = `
-- Drop existing tables
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS employees;

-- Customers table
CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  city TEXT,
  country TEXT,
  segment TEXT,
  signup_date TEXT
);

INSERT INTO customers VALUES
(1, 'Aarav Sharma', 'aarav@example.com', 'Bengaluru', 'India', 'Enterprise', '2023-01-15'),
(2, 'Diya Patel', 'diya@example.com', 'Mumbai', 'India', 'Mid-Market', '2023-02-20'),
(3, 'Rohan Mehta', 'rohan@example.com', 'Delhi', 'India', 'SMB', '2023-03-10'),
(4, 'Ananya Iyer', 'ananya@example.com', 'Chennai', 'India', 'Enterprise', '2023-04-05'),
(5, 'Vikram Singh', 'vikram@example.com', 'Hyderabad', 'India', 'SMB', '2023-05-18'),
(6, 'Pooja Reddy', 'pooja@example.com', 'Bengaluru', 'India', 'Enterprise', '2023-06-22'),
(7, 'Kabir Nair', 'kabir@example.com', 'Kochi', 'India', 'SMB', '2023-07-30');

-- Products table
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price REAL NOT NULL,
  cost REAL NOT NULL,
  stock_quantity INTEGER
);

INSERT INTO products VALUES
(101, 'Cloud Data Lakehouse Pro', 'SaaS', 1200.00, 300.00, 999),
(102, 'BI Dashboard Accelerator', 'SaaS', 450.00, 100.00, 999),
(103, 'Automated ETL Pipeline Tool', 'Software', 800.00, 250.00, 500),
(104, 'Data Warehouse Connector', 'Hardware', 250.00, 120.00, 150),
(105, 'AI Semantic Model Engine', 'SaaS', 1500.00, 400.00, 999),
(106, 'Realtime Analytics Streamer', 'Software', 950.00, 280.00, 350);

-- Orders table
CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  order_date TEXT NOT NULL,
  total_amount REAL NOT NULL,
  status TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

INSERT INTO orders VALUES
(1001, 1, '2023-08-01', 2400.00, 'COMPLETED'),
(1002, 2, '2023-08-05', 450.00, 'COMPLETED'),
(1003, 3, '2023-08-10', 800.00, 'PENDING'),
(1004, 1, '2023-09-02', 1500.00, 'COMPLETED'),
(1005, 4, '2023-09-15', 3600.00, 'COMPLETED'),
(1006, 5, '2023-09-20', 250.00, 'CANCELLED'),
(1007, 6, '2023-10-01', 1950.00, 'COMPLETED'),
(1008, 2, '2023-10-12', 1200.00, 'COMPLETED'),
(1009, 1, '2023-11-04', 3000.00, 'COMPLETED');

-- Order Items table
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER,
  product_id INTEGER,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO order_items VALUES
(501, 1001, 101, 2, 1200.00),
(502, 1002, 102, 1, 450.00),
(503, 1003, 103, 1, 800.00),
(504, 1004, 105, 1, 1500.00),
(505, 1005, 101, 3, 1200.00),
(506, 1007, 102, 1, 450.00),
(507, 1007, 105, 1, 1500.00),
(508, 1008, 101, 1, 1200.00),
(509, 1009, 105, 2, 1500.00);

-- Employees table
CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT NOT NULL,
  salary REAL NOT NULL,
  manager_id INTEGER,
  hire_date TEXT
);

INSERT INTO employees VALUES
(201, 'Rajesh Khanna', 'Executive', 180000.00, NULL, '2020-01-10'),
(202, 'Sneha Kapoor', 'Engineering', 135000.00, 201, '2020-06-15'),
(203, 'Amit Verma', 'Engineering', 110000.00, 202, '2021-03-01'),
(204, 'Kavita Sen', 'Analytics', 125000.00, 201, '2021-04-12'),
(205, 'Manish Paul', 'Analytics', 95000.00, 204, '2022-02-20'),
(206, 'Priya Das', 'Marketing', 90000.00, 201, '2022-05-18');
`;
