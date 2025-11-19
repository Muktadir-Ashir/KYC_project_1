import jwt from "jsonwebtoken";
import { verifyToken } from "../middleware/authMiddleware";

const createMockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("verifyToken middleware", () => {
  it("returns 401 when no token is provided", () => {
    const req: any = { headers: {} };
    const res = createMockResponse();
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "No token provided",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next when token is valid", () => {
    const token = jwt.sign(
      { userId: "123", username: "john", role: "user" },
      process.env.JWT_SECRET || "your_jwt_secret_key_change_in_env"
    );

    const req: any = { headers: { authorization: `Bearer ${token}` } };
    const res = createMockResponse();
    const next = jest.fn();

    verifyToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.userId).toBe("123");
    expect(req.username).toBe("john");
    expect(req.userRole).toBe("user");
  });
});
