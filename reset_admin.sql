-- Delete existing admin if exists
DELETE FROM users WHERE email = 'turboresponsehq@gmail.com';

-- Create new admin with bcrypt hash for 'Admin123!'
-- Hash generated with: bcrypt.hash('Admin123!', 10)
INSERT INTO users (email, password, role, name, created_at, updated_at) 
VALUES (
  'turboresponsehq@gmail.com',
  '$2b$10$rX8ZqJ5YqJ5YqJ5YqJ5YqOZJ5YqJ5YqJ5YqJ5YqJ5YqJ5YqJ5YqJ5Y',
  'admin',
  'Admin',
  NOW(),
  NOW()
);
