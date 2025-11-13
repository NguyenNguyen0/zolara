/**
 * Types for Prisma JSON values
 * These types are based on Prisma's internal types for JSON values
 */

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;

export interface JsonObject {
  [key: string]: JsonValue;
}

export type JsonArray = JsonValue[];

export type InputJsonValue =
  | string
  | number
  | boolean
  | null
  | InputJsonObject
  | InputJsonArray;

export interface InputJsonObject {
  [key: string]: InputJsonValue;
}

export type InputJsonArray = InputJsonValue[];
