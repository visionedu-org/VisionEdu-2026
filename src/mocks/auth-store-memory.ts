import type { User } from "@/types/domain";
import { seedUsers } from "@/mocks/data/ceti-seed";

const usersByEmail = new Map<string, User & { password: string }>();

export function resetAuthMemory() {
  usersByEmail.clear();
  for (const user of seedUsers) {
    const password =
      user.role === "student" ? "senhaDemo123" : "senhaDemo123";
    usersByEmail.set(user.email.toLowerCase(), { ...user, password });
  }
}

export function getUserByEmail(email: string) {
  return usersByEmail.get(email.toLowerCase());
}

export function addUser(user: User, password: string) {
  usersByEmail.set(user.email.toLowerCase(), { ...user, password });
}

resetAuthMemory();
