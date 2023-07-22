export class User {
  id?: string;

  point: number;

  email: string;

  ip: string;

  nickname?: string;

  user_tree_belong?: string[];

  created_at: number;

  updated_at: number;

  type: UserType;
}

export type UserType = 'Admin' | 'Normal';
