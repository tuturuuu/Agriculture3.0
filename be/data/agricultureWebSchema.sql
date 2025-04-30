create database if not exists innovation;
use innovation;

drop table transactions;
drop table shoppingCart;
drop table favorites;
drop table products;
drop table category;
drop table users;


CREATE TABLE IF NOT EXISTS category (
    categoryId INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    productId BIGINT UNIQUE,  -- New column for batch identification
    name VARCHAR(255) NOT NULL,
    categoryId INT,
    harvestDate DATETIME,
    expirationDate DATETIME,
    currentStatus ENUM('Fresh', 'Expired') DEFAULT 'Fresh',
    ownerAddress VARCHAR(255) NOT NULL,
    region VARCHAR(255),
    imageSrc VARCHAR(255),
    isForSale BOOLEAN DEFAULT TRUE,
    quantity INT NOT NULL CHECK (quantity >= 0),
    price BIGINT,
    description TEXT,
    FOREIGN KEY (categoryId) REFERENCES Category(categoryId)
);


CREATE TABLE IF NOT EXISTS users (
    userId BIGINT PRIMARY KEY AUTO_INCREMENT,
    walletAddress VARCHAR(255) UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    nonce VARCHAR(10) NOT NULL
);


CREATE TABLE IF NOT EXISTS favorites (
    favoriteId BIGINT PRIMARY KEY AUTO_INCREMENT,
    userId BIGINT,
    productId BIGINT,
    addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS shoppingCart (
    cartId BIGINT PRIMARY KEY AUTO_INCREMENT,
    userId BIGINT,
    productId BIGINT,
    quantity INT DEFAULT 1 CHECK (quantity > 0),
    addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
    transactionId BIGINT PRIMARY KEY AUTO_INCREMENT,
    productId BIGINT,
    buyerId BIGINT,
    sellerId BIGINT,
    destination VARCHAR(255) NOT NULL,
    timestamp DATETIME NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (productId) REFERENCES products(productId) ON DELETE CASCADE
);

INSERT INTO users (walletAddress, nonce)
VALUES ("0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199", "12331");

select * from users;
SELECT * FROM Products ORDER by productId DESC;
SELECT * FROM Category;
SELECT * FROM shoppingCart;
SELECT * FROM favorites;
select * from transactions;

SELECT products.productId, products.name, harvestDate, expirationDate, currentStatus, imageSrc, price, category.name as categoryName, description, quantity, region
FROM products 
INNER JOIN category ON products.categoryId = category.categoryId 
WHERE products.productId = 1


