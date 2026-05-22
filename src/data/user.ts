import { auth } from "@/auth";
import { db } from "@/lib/db";

export const findUserById = async (id: string) => {
  return await db.user.findUnique({ where: { id } });
};

export const findUserByPhone = async (phone: string) => {
  return await db.user.findUnique({ where: { phone } });
};

export const findUserByPlayerId = async (playerId: string) => {
  return await db.user.findUnique({ where: { playerId } });
};

export const findUserByReferId = async (referId: string) => {
  return await db.user.findUnique({ where: { referId } });
};

export const findCurrentUser = async () => {
  if (process.env.NODE_ENV !== "production" && process.env.MOCK_USER_ID) {
    const mockUser = await db.user.findUnique({
      where: { id: process.env.MOCK_USER_ID },
      include: { wallet: true }
    });
    if (mockUser) {
      return mockUser;
    }
  }
  const session = await auth();
  
  // Ensure we return a proper user object with ID
  if (session?.user) {
    return session.user;
  }
  
  return null;
};
