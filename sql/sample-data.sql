-- Create Database if not exists (optional)
-- CREATE DATABASE library_db;
-- GO

-- USE library_db;
-- GO

-- Create Books Table
CREATE TABLE books (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    title NVARCHAR(255) NOT NULL,
    author NVARCHAR(255) NOT NULL,
    published_year INT NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    isbn NVARCHAR(13) UNIQUE NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Create Members Table
CREATE TABLE members (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) UNIQUE NOT NULL,
    phone NVARCHAR(15) NOT NULL,
    address TEXT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
GO

-- Create Borrowings Table
CREATE TABLE borrowings (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    book_id UNIQUEIDENTIFIER NOT NULL,
    member_id UNIQUEIDENTIFIER NOT NULL,
    borrow_date DATE NOT NULL,
    return_date DATE NULL,
    status NVARCHAR(10) NOT NULL DEFAULT 'BORROWED',
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);
GO

-- Create indexes for better performance
CREATE INDEX idx_borrowings_book_id ON borrowings(book_id);
CREATE INDEX idx_borrowings_member_id ON borrowings(member_id);
CREATE INDEX idx_borrowings_status ON borrowings(status);
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_members_email ON members(email);
GO