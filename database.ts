export type UserRole = 'user' | 'admin';

export type EventStatus = 'open' | 'full' | 'ended' | 'draft';

export type RegistrationStatus = 'confirmed' | 'cancelled' | 'attended';

export interface Category {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string; // 'YYYY-MM-DD'
  start_time: string; // 'HH:mm:ss' or 'HH:mm'
  end_time: string; // 'HH:mm:ss' or 'HH:mm'
  location: string;
  max_people: number;
  category_id: string;
  status: EventStatus;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  category?: Category | null;
  current_participants?: number;
  remaining_seats?: number;
  is_registered?: boolean;
}

export interface Registration {
  id: string;
  user_id: string;
  event_id: string;
  registered_at: string;
  status: RegistrationStatus;
  notes?: string | null;
  // Joined fields
  event?: EventItem;
  user?: Profile;
}

export interface DashboardStats {
  total_events: number;
  open_events: number;
  total_users: number;
  total_registrations: number;
  recent_events: EventItem[];
  recent_registrations: Registration[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedEvents?: EventItem[];
}
