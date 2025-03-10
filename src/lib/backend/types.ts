export type UserRole = "school" | "teacher" | "student";

export interface JwtPayload {
  id: string;
  role: UserRole;
  schoolId?: string;
  teacherId?: string;
  studentId?: string;
  username: string;
  reset?: boolean;
  email?: string;
  verificationCode?: string;
  codeExpiry?: number;
  verified?: boolean;
  [key: string]: unknown;
}

export interface BaseResponse {
  success?: boolean;
  error?: string;
}

export interface RegistrationResponse<T> extends BaseResponse {
  data?: T;
  token?: string;
}

export interface LoginResponse extends BaseResponse {
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    username: string;
    role: UserRole;
    dashboardUrl: string;
  };
}

export interface ResetPasswordResponse extends BaseResponse {
  token?: string;
}

export interface VerificationResponse extends BaseResponse {
  verificationCode?: string; // For development only, remove in production
  token?: string;
}

export interface SchoolData {
  id: string;
  schoolName: string;
  schoolId: string;
  email: string;
  username: string;
}

export interface TeacherData {
  id: string;
  teacherName: string;
  teacherId: string;
  email: string;
  username: string;
}

export interface StudentData {
  id: string;
  studentName: string;
  studentId: string;
  email: string;
  username: string;
}
