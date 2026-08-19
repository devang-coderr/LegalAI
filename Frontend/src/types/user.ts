export type UserRole = "CITIZEN" | "LAWYER";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  barEnrolmentNumber?: string;
  courtAdmission?: string;
}
