/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as activities from "../activities.js";
import type * as canvas from "../canvas.js";
import type * as cleanup from "../cleanup.js";
import type * as crons from "../crons.js";
import type * as maintenance from "../maintenance.js";
import type * as model_canvas from "../model/canvas.js";
import type * as model_cleanup from "../model/cleanup.js";
import type * as model_rooms from "../model/rooms.js";
import type * as model_timer from "../model/timer.js";
import type * as model_users from "../model/users.js";
import type * as model_votes from "../model/votes.js";
import type * as rooms from "../rooms.js";
import type * as timer from "../timer.js";
import type * as users from "../users.js";
import type * as votes from "../votes.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  canvas: typeof canvas;
  cleanup: typeof cleanup;
  crons: typeof crons;
  maintenance: typeof maintenance;
  "model/canvas": typeof model_canvas;
  "model/cleanup": typeof model_cleanup;
  "model/rooms": typeof model_rooms;
  "model/timer": typeof model_timer;
  "model/users": typeof model_users;
  "model/votes": typeof model_votes;
  rooms: typeof rooms;
  timer: typeof timer;
  users: typeof users;
  votes: typeof votes;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
