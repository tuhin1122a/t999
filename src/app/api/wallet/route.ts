import { findCurrentUser } from "@/data/user";
import { INTERNAL_SERVER_ERROR } from "@/error";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = async () => {
  try {
    const user = await findCurrentUser();

    if (!user) {
      return Response.json({ error: "Authentication Failed" }, { status: 401 });
    }

    // Extract user ID from the session object
    const userId = user.id || (user as any)?.sub;
    
    if (!userId) {
      return Response.json({ error: "User ID is missing" }, { status: 500 });
    }

    const wallet = await db.wallet.findUnique({
      where: {
        userId: userId,
      },
    });

    if (!wallet) {
      return Response.json({ error: "Wallet not found" }, { status: 404 });
    }

    return Response.json({ payload: wallet }, { status: 200 });
  } catch (error){
    console.error("Wallet error:", error);
    return Response.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
};
