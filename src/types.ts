export type UserRole = 'teacher' | 'student';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  updated_at: string;
}

export interface Course {
  id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  created_at: string;
  is_public: boolean;
}

export interface Interaction {
  id: string;
  course_id: string;
  type: 'question' | 'note' | 'quiz';
  timestamp: number; // in seconds
  content: any; // JSON object containing question text, options, etc.
  created_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  progress: number; // 0 to 100
}

export interface StudentResponse {
  id: string;
  student_id: string;
  interaction_id: string;
  response: any;
  is_correct: boolean | null;
  created_at: string;
}
