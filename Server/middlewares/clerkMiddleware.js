import { getAuth } from "@clerk/express";

export const requireClerkAuth = (req, res, next) => {

  const { isAuthenticated, userId } = getAuth(req);

  if (!isAuthenticated || !userId) {
    
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  req.clerkUserId = userId;

  next();
};
