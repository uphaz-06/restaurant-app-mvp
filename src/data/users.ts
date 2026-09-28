export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: 'customer' | 'manager';
}

export const mockUsers: User[] = [
  { id: 1, name: 'Alice', email: 'customer@test.com', password: 'password1', role: 'customer' },
  { id: 2, name: 'Bob', email: 'manager@test.com', password: 'password1', role: 'manager' }
];