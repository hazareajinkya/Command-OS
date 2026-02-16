/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as agents from "../agents.js";
import type * as broadcasts from "../broadcasts.js";
import type * as chat from "../chat.js";
import type * as costs from "../costs.js";
import type * as directMessages from "../directMessages.js";
import type * as documents from "../documents.js";
import type * as messages from "../messages.js";
import type * as notifications from "../notifications.js";
import type * as seed from "../seed.js";
import type * as seedTasks from "../seedTasks.js";
import type * as system from "../system.js";
import type * as tasks from "../tasks.js";
import type * as waitlist from "../waitlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  agents: typeof agents;
  broadcasts: typeof broadcasts;
  chat: typeof chat;
  costs: typeof costs;
  directMessages: typeof directMessages;
  documents: typeof documents;
  messages: typeof messages;
  notifications: typeof notifications;
  seed: typeof seed;
  seedTasks: typeof seedTasks;
  system: typeof system;
  tasks: typeof tasks;
  waitlist: typeof waitlist;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
