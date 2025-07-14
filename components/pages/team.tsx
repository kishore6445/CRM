"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login: string | null;
  avatar_url?: string | null;
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      // Fetch current user profile
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError('Could not fetch current user.');
        setLoading(false);
        return;
      }
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('company')
        .eq('id', user.id)
        .single();
      if (profileError || !profile) {
        setError('Could not fetch user profile.');
        setLoading(false);
        return;
      }
      // Fetch all users in the same company
      const { data: members, error: membersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email, role, is_active, last_login, avatar_url')
        .eq('company', profile.company);
      if (membersError) {
        setError('Could not fetch team members.');
        setLoading(false);
        return;
      }
      setTeamMembers(members || []);
      setLoading(false);
    };
    fetchTeam();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Team Members</h1>
      <div className="border rounded p-4 bg-white dark:bg-gray-900 shadow">
        {loading ? (
          <p>Loading team members...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : teamMembers.length === 0 ? (
          <p>No team members found.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Role</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((member) => (
                <tr key={member.id}>
                  <td className="p-2">{member.first_name} {member.last_name}</td>
                  <td className="p-2">{member.email}</td>
                  <td className="p-2">{member.role}</td>
                  <td className="p-2">{member.is_active ? 'Active' : 'Inactive'}</td>
                  <td className="p-2">{member.last_login ? new Date(member.last_login).toLocaleString() : 'Never'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 