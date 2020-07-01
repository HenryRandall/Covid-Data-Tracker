-- Create tables for raw data to be loaded into
DROP TABLE IF EXISTS cases;
DROP TABLE IF EXISTS deaths;
DROP TABLE IF EXISTS orders;

CREATE TABLE cases (
State Text PRIMARY KEY,
First_Case_Date date,
Current_Case_Total bigint
);

CREATE TABLE deaths (
State Text PRIMARY KEY,
First_Death_Date date,
Current_Death_Total bigint
);

CREATE TABLE orders (
State Text PRIMARY KEY,
Order_Date date,
Order_Expiration_Date date,
Population bigint
);

-- Joins tables
SELECT orders.state, orders.order_date, orders.order_expiration_date, orders.population, cases.first_case_date, cases.current_case_total
FROM orders
JOIN cases
ON orders.state = cases.state;

SELECT orders.state, orders.order_date, orders.order_expiration_date, orders.population, deaths.first_death_date, deaths.current_death_total
FROM orders
JOIN deaths
ON orders.state = deaths.state;