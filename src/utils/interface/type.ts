interface JwtPayload {
  id: string;
  role: string;
}

export interface CustomRequest extends Request {
  user?: JwtPayload;
}
