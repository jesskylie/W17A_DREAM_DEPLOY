import { HttpError } from "http-errors";

export interface PlayerId {
  playerId: number;
}

export const playerCreate = (sessionId: number, name: string): PlayerId | HttpError => {
  return { playerId: 0 };
};