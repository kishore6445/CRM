-- Insert sample data for testing (run after schema creation)

-- Sample companies
INSERT INTO public.companies (name, website, industry, size, phone, email, address, city, state, country, created_by) VALUES
('Acme Corporation', 'https://acme.com', 'Technology', '51-200', '+1-555-0101', 'info@acme.com', '123 Tech Street', 'San Francisco', 'CA', 'us', (SELECT id FROM auth.users LIMIT 1)),
('Global Solutions Inc', 'https://globalsolutions.com', 'Consulting', '201-500', '+1-555-0102', 'contact@globalsolutions.com', '456 Business Ave', 'New York', 'NY', 'us', (SELECT id FROM auth.users LIMIT 1)),
('Innovation Labs', 'https://innovationlabs.com', 'Research', '11-50', '+1-555-0103', 'hello@innovationlabs.com', '789 Innovation Blvd', 'Austin', 'TX', 'us', (SELECT id FROM auth.users LIMIT 1));

-- Sample leads
INSERT INTO public.leads (first_name, last_name, company, title, email, phone, source, status, estimated_value, created_by) VALUES
('John', 'Smith', 'Tech Startup', 'CTO', 'john.smith@techstartup.com', '+1-555-1001', 'website', 'new', 25000.00, (SELECT id FROM auth.users LIMIT 1)),
('Sarah', 'Johnson', 'Marketing Agency', 'Director', 'sarah.j@marketingagency.com', '+1-555-1002', 'linkedin', 'contacted', 15000.00, (SELECT id FROM auth.users LIMIT 1)),
('Mike', 'Davis', 'E-commerce Co', 'VP Sales', 'mike.davis@ecommerce.com', '+1-555-1003', 'referral', 'qualified', 50000.00, (SELECT id FROM auth.users LIMIT 1));

-- Sample contacts
INSERT INTO public.contacts (first_name, last_name, company, title, email, phone, mobile, is_vip, created_by) VALUES
('Alice', 'Brown', 'Enterprise Corp', 'CEO', 'alice.brown@enterprise.com', '+1-555-2001', '+1-555-2011', true, (SELECT id FROM auth.users LIMIT 1)),
('Bob', 'Wilson', 'Small Business', 'Owner', 'bob@smallbusiness.com', '+1-555-2002', '+1-555-2012', false, (SELECT id FROM auth.users LIMIT 1)),
('Carol', 'Taylor', 'Mid-size Company', 'Manager', 'carol.taylor@midsize.com', '+1-555-2003', '+1-555-2013', false, (SELECT id FROM auth.users LIMIT 1));

-- Sample deals
INSERT INTO public.deals (title, description, value, stage, probability, close_date, contact_id, priority, created_by) VALUES
('Enterprise Software License', 'Annual software license for 100 users', 75000.00, 'proposal', 70, '2024-03-15', (SELECT id FROM public.contacts LIMIT 1), 'high', (SELECT id FROM auth.users LIMIT 1)),
('Consulting Services', 'Digital transformation consulting project', 45000.00, 'negotiation', 85, '2024-02-28', (SELECT id FROM public.contacts LIMIT 1 OFFSET 1), 'medium', (SELECT id FROM auth.users LIMIT 1)),
('Training Package', 'Employee training and certification program', 12000.00, 'qualified', 40, '2024-04-10', (SELECT id FROM public.contacts LIMIT 1 OFFSET 2), 'low', (SELECT id FROM auth.users LIMIT 1));

-- Sample tasks
INSERT INTO public.tasks (title, description, priority, status, due_date, due_time, category, created_by) VALUES
('Follow up with Enterprise Corp', 'Call Alice Brown to discuss proposal feedback', 'high', 'pending', '2024-01-15', '14:00', 'call', (SELECT id FROM auth.users LIMIT 1)),
('Prepare demo for Small Business', 'Create customized demo for Bob Wilson', 'medium', 'in-progress', '2024-01-18', '10:00', 'demo', (SELECT id FROM auth.users LIMIT 1)),
('Send proposal to Mid-size Company', 'Draft and send detailed proposal to Carol Taylor', 'medium', 'pending', '2024-01-20', '09:00', 'proposal', (SELECT id FROM auth.users LIMIT 1));

-- Sample activities
INSERT INTO public.activities (type, title, description, linked_to, linked_type, created_by) VALUES
('call', 'Initial discovery call with John Smith', 'Discussed requirements and timeline for tech startup project', (SELECT id FROM public.leads LIMIT 1), 'lead', (SELECT id FROM auth.users LIMIT 1)),
('email', 'Sent follow-up email to Sarah Johnson', 'Provided additional information about our services', (SELECT id FROM public.leads LIMIT 1 OFFSET 1), 'lead', (SELECT id FROM auth.users LIMIT 1)),
('meeting', 'Product demo with Alice Brown', 'Demonstrated key features and answered technical questions', (SELECT id FROM public.contacts LIMIT 1), 'contact', (SELECT id FROM auth.users LIMIT 1));

-- Sample notifications
INSERT INTO public.notifications (type, title, message, user_id, priority) VALUES
('task_due', 'Task Due Today', 'Follow up with Enterprise Corp is due today', (SELECT id FROM auth.users LIMIT 1), 'high'),
('deal_stage_change', 'Deal Stage Updated', 'Enterprise Software License moved to proposal stage', (SELECT id FROM auth.users LIMIT 1), 'medium'),
('new_lead', 'New Lead Assigned', 'You have been assigned a new lead: Mike Davis', (SELECT id FROM auth.users LIMIT 1), 'medium');
