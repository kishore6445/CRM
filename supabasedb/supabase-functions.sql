-- Function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, first_name, last_name, company)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'company', '')
    );
    
    -- Create default user settings
    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.contacts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.deals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.activities
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.notifications
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to create activity log
CREATE OR REPLACE FUNCTION public.log_activity(
    p_type activity_type,
    p_title TEXT,
    p_description TEXT DEFAULT NULL,
    p_linked_to UUID DEFAULT NULL,
    p_linked_type TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO public.activities (
        type, title, description, linked_to, linked_type, created_by
    ) VALUES (
        p_type, p_title, p_description, p_linked_to, p_linked_type, auth.uid()
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_type notification_type,
    p_title TEXT,
    p_message TEXT DEFAULT NULL,
    p_priority task_priority DEFAULT 'medium',
    p_related_id UUID DEFAULT NULL,
    p_related_type TEXT DEFAULT NULL,
    p_action_url TEXT DEFAULT NULL,
    p_action_label TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (
        user_id, type, title, message, priority, related_id, related_type, action_url, action_label
    ) VALUES (
        p_user_id, p_type, p_title, p_message, p_priority, p_related_id, p_related_type, p_action_url, p_action_label
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get dashboard stats
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
    user_company TEXT;
BEGIN
    -- Get user's company
    SELECT company INTO user_company 
    FROM public.users 
    WHERE id = auth.uid();
    
    SELECT json_build_object(
        'total_leads', (
            SELECT COUNT(*) FROM public.leads l
            JOIN public.users u ON l.created_by = u.id
            WHERE u.company = user_company
        ),
        'total_contacts', (
            SELECT COUNT(*) FROM public.contacts c
            JOIN public.users u ON c.created_by = u.id
            WHERE u.company = user_company
        ),
        'total_deals', (
            SELECT COUNT(*) FROM public.deals d
            JOIN public.users u ON d.created_by = u.id
            WHERE u.company = user_company
        ),
        'total_deal_value', (
            SELECT COALESCE(SUM(value), 0) FROM public.deals d
            JOIN public.users u ON d.created_by = u.id
            WHERE u.company = user_company AND stage NOT IN ('lost')
        ),
        'won_deals', (
            SELECT COUNT(*) FROM public.deals d
            JOIN public.users u ON d.created_by = u.id
            WHERE u.company = user_company AND stage = 'won'
        ),
        'pending_tasks', (
            SELECT COUNT(*) FROM public.tasks t
            JOIN public.users u ON t.created_by = u.id
            WHERE u.company = user_company AND status IN ('pending', 'in-progress')
        ),
        'overdue_tasks', (
            SELECT COUNT(*) FROM public.tasks t
            JOIN public.users u ON t.created_by = u.id
            WHERE u.company = user_company 
            AND status IN ('pending', 'in-progress')
            AND due_date < CURRENT_DATE
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to convert lead to contact
CREATE OR REPLACE FUNCTION public.convert_lead_to_contact(lead_id UUID)
RETURNS UUID AS $$
DECLARE
    lead_record RECORD;
    contact_id UUID;
BEGIN
    -- Get lead data
    SELECT * INTO lead_record FROM public.leads WHERE id = lead_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Lead not found';
    END IF;
    
    -- Create contact from lead
    INSERT INTO public.contacts (
        first_name, last_name, company, title, email, phone, website,
        address, city, state, zip_code, country, notes, tags,
        assigned_to, created_by
    ) VALUES (
        lead_record.first_name, lead_record.last_name, lead_record.company,
        lead_record.title, lead_record.email, lead_record.phone, lead_record.website,
        lead_record.address, lead_record.city, lead_record.state, 
        lead_record.zip_code, lead_record.country, lead_record.notes, lead_record.tags,
        lead_record.assigned_to, lead_record.created_by
    ) RETURNING id INTO contact_id;
    
    -- Log activity
    PERFORM public.log_activity(
        'lead_converted',
        'Lead converted to contact: ' || lead_record.first_name || ' ' || lead_record.last_name,
        'Lead ID: ' || lead_id || ', Contact ID: ' || contact_id,
        contact_id,
        'contact'
    );
    
    -- Delete the lead
    DELETE FROM public.leads WHERE id = lead_id;
    
    RETURN contact_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
