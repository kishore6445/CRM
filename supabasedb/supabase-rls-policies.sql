-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- CREATE POLICY "Users can view team members" ON public.users
--     FOR SELECT USING (
--         EXISTS (
--             SELECT 1 FROM public.users u 
--             WHERE u.id = auth.uid() AND u.company = users.company
--         )
--     );

-- Companies policies
CREATE POLICY "Users can view companies in their organization" ON public.companies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.company = (
                SELECT company FROM public.users WHERE id = companies.created_by
            )
        )
    );

CREATE POLICY "Users can create companies" ON public.companies
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update companies they created or are assigned to" ON public.companies
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        auth.uid() = assigned_to OR
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'manager')
        )
    );

-- Leads policies
CREATE POLICY "Users can view leads in their organization" ON public.leads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.company = (
                SELECT company FROM public.users WHERE id = leads.created_by
            )
        )
    );

CREATE POLICY "Users can create leads" ON public.leads
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update leads they created or are assigned to" ON public.leads
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        auth.uid() = assigned_to OR
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Users can delete leads they created" ON public.leads
    FOR DELETE USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'manager')
        )
    );

-- Contacts policies
CREATE POLICY "Users can view contacts in their organization" ON public.contacts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.company = (
                SELECT company FROM public.users WHERE id = contacts.created_by
            )
        )
    );

CREATE POLICY "Users can create contacts" ON public.contacts
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update contacts they created or are assigned to" ON public.contacts
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        auth.uid() = assigned_to OR
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Users can delete contacts they created" ON public.contacts
    FOR DELETE USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'manager')
        )
    );

-- Deals policies
CREATE POLICY "Users can view deals in their organization" ON public.deals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.company = (
                SELECT company FROM public.users WHERE id = deals.created_by
            )
        )
    );

CREATE POLICY "Users can create deals" ON public.deals
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update deals they created or are assigned to" ON public.deals
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        auth.uid() = assigned_to OR
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Users can delete deals they created" ON public.deals
    FOR DELETE USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'manager')
        )
    );

-- Tasks policies
CREATE POLICY "Users can view tasks in their organization" ON public.tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.company = (
                SELECT company FROM public.users WHERE id = tasks.created_by
            )
        )
    );

CREATE POLICY "Users can create tasks" ON public.tasks
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update tasks they created or are assigned to" ON public.tasks
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        auth.uid() = assigned_to OR
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Users can delete tasks they created" ON public.tasks
    FOR DELETE USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'manager')
        )
    );

-- Activities policies
CREATE POLICY "Users can view activities in their organization" ON public.activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.company = (
                SELECT company FROM public.users WHERE id = activities.created_by
            )
        )
    );

CREATE POLICY "Users can create activities" ON public.activities
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update activities they created or are assigned to" ON public.activities
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        auth.uid() = assigned_to OR
        EXISTS (
            SELECT 1 FROM public.users u 
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'manager')
        )
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- User settings policies
CREATE POLICY "Users can view their own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
