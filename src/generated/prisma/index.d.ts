
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Classroom
 * 
 */
export type Classroom = $Result.DefaultSelection<Prisma.$ClassroomPayload>
/**
 * Model Student
 * 
 */
export type Student = $Result.DefaultSelection<Prisma.$StudentPayload>
/**
 * Model GeftResult
 * 
 */
export type GeftResult = $Result.DefaultSelection<Prisma.$GeftResultPayload>
/**
 * Model GameSession
 * 
 */
export type GameSession = $Result.DefaultSelection<Prisma.$GameSessionPayload>
/**
 * Model Leaderboard
 * 
 */
export type Leaderboard = $Result.DefaultSelection<Prisma.$LeaderboardPayload>
/**
 * Model ChatbotKnowledge
 * 
 */
export type ChatbotKnowledge = $Result.DefaultSelection<Prisma.$ChatbotKnowledgePayload>
/**
 * Model Team
 * 
 */
export type Team = $Result.DefaultSelection<Prisma.$TeamPayload>
/**
 * Model TeamMember
 * 
 */
export type TeamMember = $Result.DefaultSelection<Prisma.$TeamMemberPayload>
/**
 * Model TeamMessage
 * 
 */
export type TeamMessage = $Result.DefaultSelection<Prisma.$TeamMessagePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const GeftStatus: {
  not_taken: 'not_taken',
  completed: 'completed'
};

export type GeftStatus = (typeof GeftStatus)[keyof typeof GeftStatus]


export const CognitiveStyle: {
  FI: 'FI',
  FD: 'FD'
};

export type CognitiveStyle = (typeof CognitiveStyle)[keyof typeof CognitiveStyle]

}

export type GeftStatus = $Enums.GeftStatus

export const GeftStatus: typeof $Enums.GeftStatus

export type CognitiveStyle = $Enums.CognitiveStyle

export const CognitiveStyle: typeof $Enums.CognitiveStyle

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Classrooms
 * const classrooms = await prisma.classroom.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Classrooms
   * const classrooms = await prisma.classroom.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.classroom`: Exposes CRUD operations for the **Classroom** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Classrooms
    * const classrooms = await prisma.classroom.findMany()
    * ```
    */
  get classroom(): Prisma.ClassroomDelegate<ExtArgs>;

  /**
   * `prisma.student`: Exposes CRUD operations for the **Student** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Students
    * const students = await prisma.student.findMany()
    * ```
    */
  get student(): Prisma.StudentDelegate<ExtArgs>;

  /**
   * `prisma.geftResult`: Exposes CRUD operations for the **GeftResult** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GeftResults
    * const geftResults = await prisma.geftResult.findMany()
    * ```
    */
  get geftResult(): Prisma.GeftResultDelegate<ExtArgs>;

  /**
   * `prisma.gameSession`: Exposes CRUD operations for the **GameSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GameSessions
    * const gameSessions = await prisma.gameSession.findMany()
    * ```
    */
  get gameSession(): Prisma.GameSessionDelegate<ExtArgs>;

  /**
   * `prisma.leaderboard`: Exposes CRUD operations for the **Leaderboard** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Leaderboards
    * const leaderboards = await prisma.leaderboard.findMany()
    * ```
    */
  get leaderboard(): Prisma.LeaderboardDelegate<ExtArgs>;

  /**
   * `prisma.chatbotKnowledge`: Exposes CRUD operations for the **ChatbotKnowledge** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ChatbotKnowledges
    * const chatbotKnowledges = await prisma.chatbotKnowledge.findMany()
    * ```
    */
  get chatbotKnowledge(): Prisma.ChatbotKnowledgeDelegate<ExtArgs>;

  /**
   * `prisma.team`: Exposes CRUD operations for the **Team** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Teams
    * const teams = await prisma.team.findMany()
    * ```
    */
  get team(): Prisma.TeamDelegate<ExtArgs>;

  /**
   * `prisma.teamMember`: Exposes CRUD operations for the **TeamMember** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TeamMembers
    * const teamMembers = await prisma.teamMember.findMany()
    * ```
    */
  get teamMember(): Prisma.TeamMemberDelegate<ExtArgs>;

  /**
   * `prisma.teamMessage`: Exposes CRUD operations for the **TeamMessage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TeamMessages
    * const teamMessages = await prisma.teamMessage.findMany()
    * ```
    */
  get teamMessage(): Prisma.TeamMessageDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Classroom: 'Classroom',
    Student: 'Student',
    GeftResult: 'GeftResult',
    GameSession: 'GameSession',
    Leaderboard: 'Leaderboard',
    ChatbotKnowledge: 'ChatbotKnowledge',
    Team: 'Team',
    TeamMember: 'TeamMember',
    TeamMessage: 'TeamMessage'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "classroom" | "student" | "geftResult" | "gameSession" | "leaderboard" | "chatbotKnowledge" | "team" | "teamMember" | "teamMessage"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Classroom: {
        payload: Prisma.$ClassroomPayload<ExtArgs>
        fields: Prisma.ClassroomFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ClassroomFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassroomPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ClassroomFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassroomPayload>
          }
          findFirst: {
            args: Prisma.ClassroomFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassroomPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ClassroomFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassroomPayload>
          }
          findMany: {
            args: Prisma.ClassroomFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassroomPayload>[]
          }
          create: {
            args: Prisma.ClassroomCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassroomPayload>
          }
          createMany: {
            args: Prisma.ClassroomCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ClassroomCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassroomPayload>[]
          }
          delete: {
            args: Prisma.ClassroomDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassroomPayload>
          }
          update: {
            args: Prisma.ClassroomUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassroomPayload>
          }
          deleteMany: {
            args: Prisma.ClassroomDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ClassroomUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ClassroomUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassroomPayload>
          }
          aggregate: {
            args: Prisma.ClassroomAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateClassroom>
          }
          groupBy: {
            args: Prisma.ClassroomGroupByArgs<ExtArgs>
            result: $Utils.Optional<ClassroomGroupByOutputType>[]
          }
          count: {
            args: Prisma.ClassroomCountArgs<ExtArgs>
            result: $Utils.Optional<ClassroomCountAggregateOutputType> | number
          }
        }
      }
      Student: {
        payload: Prisma.$StudentPayload<ExtArgs>
        fields: Prisma.StudentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StudentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StudentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>
          }
          findFirst: {
            args: Prisma.StudentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StudentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>
          }
          findMany: {
            args: Prisma.StudentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>[]
          }
          create: {
            args: Prisma.StudentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>
          }
          createMany: {
            args: Prisma.StudentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StudentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>[]
          }
          delete: {
            args: Prisma.StudentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>
          }
          update: {
            args: Prisma.StudentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>
          }
          deleteMany: {
            args: Prisma.StudentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StudentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.StudentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>
          }
          aggregate: {
            args: Prisma.StudentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStudent>
          }
          groupBy: {
            args: Prisma.StudentGroupByArgs<ExtArgs>
            result: $Utils.Optional<StudentGroupByOutputType>[]
          }
          count: {
            args: Prisma.StudentCountArgs<ExtArgs>
            result: $Utils.Optional<StudentCountAggregateOutputType> | number
          }
        }
      }
      GeftResult: {
        payload: Prisma.$GeftResultPayload<ExtArgs>
        fields: Prisma.GeftResultFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GeftResultFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GeftResultPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GeftResultFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GeftResultPayload>
          }
          findFirst: {
            args: Prisma.GeftResultFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GeftResultPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GeftResultFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GeftResultPayload>
          }
          findMany: {
            args: Prisma.GeftResultFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GeftResultPayload>[]
          }
          create: {
            args: Prisma.GeftResultCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GeftResultPayload>
          }
          createMany: {
            args: Prisma.GeftResultCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GeftResultCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GeftResultPayload>[]
          }
          delete: {
            args: Prisma.GeftResultDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GeftResultPayload>
          }
          update: {
            args: Prisma.GeftResultUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GeftResultPayload>
          }
          deleteMany: {
            args: Prisma.GeftResultDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GeftResultUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GeftResultUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GeftResultPayload>
          }
          aggregate: {
            args: Prisma.GeftResultAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGeftResult>
          }
          groupBy: {
            args: Prisma.GeftResultGroupByArgs<ExtArgs>
            result: $Utils.Optional<GeftResultGroupByOutputType>[]
          }
          count: {
            args: Prisma.GeftResultCountArgs<ExtArgs>
            result: $Utils.Optional<GeftResultCountAggregateOutputType> | number
          }
        }
      }
      GameSession: {
        payload: Prisma.$GameSessionPayload<ExtArgs>
        fields: Prisma.GameSessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GameSessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GameSessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>
          }
          findFirst: {
            args: Prisma.GameSessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GameSessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>
          }
          findMany: {
            args: Prisma.GameSessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>[]
          }
          create: {
            args: Prisma.GameSessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>
          }
          createMany: {
            args: Prisma.GameSessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GameSessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>[]
          }
          delete: {
            args: Prisma.GameSessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>
          }
          update: {
            args: Prisma.GameSessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>
          }
          deleteMany: {
            args: Prisma.GameSessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GameSessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GameSessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>
          }
          aggregate: {
            args: Prisma.GameSessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGameSession>
          }
          groupBy: {
            args: Prisma.GameSessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<GameSessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.GameSessionCountArgs<ExtArgs>
            result: $Utils.Optional<GameSessionCountAggregateOutputType> | number
          }
        }
      }
      Leaderboard: {
        payload: Prisma.$LeaderboardPayload<ExtArgs>
        fields: Prisma.LeaderboardFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LeaderboardFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeaderboardPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LeaderboardFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeaderboardPayload>
          }
          findFirst: {
            args: Prisma.LeaderboardFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeaderboardPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LeaderboardFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeaderboardPayload>
          }
          findMany: {
            args: Prisma.LeaderboardFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeaderboardPayload>[]
          }
          create: {
            args: Prisma.LeaderboardCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeaderboardPayload>
          }
          createMany: {
            args: Prisma.LeaderboardCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LeaderboardCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeaderboardPayload>[]
          }
          delete: {
            args: Prisma.LeaderboardDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeaderboardPayload>
          }
          update: {
            args: Prisma.LeaderboardUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeaderboardPayload>
          }
          deleteMany: {
            args: Prisma.LeaderboardDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LeaderboardUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.LeaderboardUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LeaderboardPayload>
          }
          aggregate: {
            args: Prisma.LeaderboardAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLeaderboard>
          }
          groupBy: {
            args: Prisma.LeaderboardGroupByArgs<ExtArgs>
            result: $Utils.Optional<LeaderboardGroupByOutputType>[]
          }
          count: {
            args: Prisma.LeaderboardCountArgs<ExtArgs>
            result: $Utils.Optional<LeaderboardCountAggregateOutputType> | number
          }
        }
      }
      ChatbotKnowledge: {
        payload: Prisma.$ChatbotKnowledgePayload<ExtArgs>
        fields: Prisma.ChatbotKnowledgeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ChatbotKnowledgeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatbotKnowledgePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ChatbotKnowledgeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatbotKnowledgePayload>
          }
          findFirst: {
            args: Prisma.ChatbotKnowledgeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatbotKnowledgePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ChatbotKnowledgeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatbotKnowledgePayload>
          }
          findMany: {
            args: Prisma.ChatbotKnowledgeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatbotKnowledgePayload>[]
          }
          create: {
            args: Prisma.ChatbotKnowledgeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatbotKnowledgePayload>
          }
          createMany: {
            args: Prisma.ChatbotKnowledgeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ChatbotKnowledgeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatbotKnowledgePayload>[]
          }
          delete: {
            args: Prisma.ChatbotKnowledgeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatbotKnowledgePayload>
          }
          update: {
            args: Prisma.ChatbotKnowledgeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatbotKnowledgePayload>
          }
          deleteMany: {
            args: Prisma.ChatbotKnowledgeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ChatbotKnowledgeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ChatbotKnowledgeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChatbotKnowledgePayload>
          }
          aggregate: {
            args: Prisma.ChatbotKnowledgeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateChatbotKnowledge>
          }
          groupBy: {
            args: Prisma.ChatbotKnowledgeGroupByArgs<ExtArgs>
            result: $Utils.Optional<ChatbotKnowledgeGroupByOutputType>[]
          }
          count: {
            args: Prisma.ChatbotKnowledgeCountArgs<ExtArgs>
            result: $Utils.Optional<ChatbotKnowledgeCountAggregateOutputType> | number
          }
        }
      }
      Team: {
        payload: Prisma.$TeamPayload<ExtArgs>
        fields: Prisma.TeamFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TeamFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TeamFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>
          }
          findFirst: {
            args: Prisma.TeamFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TeamFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>
          }
          findMany: {
            args: Prisma.TeamFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>[]
          }
          create: {
            args: Prisma.TeamCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>
          }
          createMany: {
            args: Prisma.TeamCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TeamCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>[]
          }
          delete: {
            args: Prisma.TeamDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>
          }
          update: {
            args: Prisma.TeamUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>
          }
          deleteMany: {
            args: Prisma.TeamDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TeamUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TeamUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamPayload>
          }
          aggregate: {
            args: Prisma.TeamAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTeam>
          }
          groupBy: {
            args: Prisma.TeamGroupByArgs<ExtArgs>
            result: $Utils.Optional<TeamGroupByOutputType>[]
          }
          count: {
            args: Prisma.TeamCountArgs<ExtArgs>
            result: $Utils.Optional<TeamCountAggregateOutputType> | number
          }
        }
      }
      TeamMember: {
        payload: Prisma.$TeamMemberPayload<ExtArgs>
        fields: Prisma.TeamMemberFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TeamMemberFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamMemberPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TeamMemberFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamMemberPayload>
          }
          findFirst: {
            args: Prisma.TeamMemberFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamMemberPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TeamMemberFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamMemberPayload>
          }
          findMany: {
            args: Prisma.TeamMemberFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamMemberPayload>[]
          }
          create: {
            args: Prisma.TeamMemberCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamMemberPayload>
          }
          createMany: {
            args: Prisma.TeamMemberCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TeamMemberCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamMemberPayload>[]
          }
          delete: {
            args: Prisma.TeamMemberDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamMemberPayload>
          }
          update: {
            args: Prisma.TeamMemberUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamMemberPayload>
          }
          deleteMany: {
            args: Prisma.TeamMemberDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TeamMemberUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TeamMemberUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamMemberPayload>
          }
          aggregate: {
            args: Prisma.TeamMemberAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTeamMember>
          }
          groupBy: {
            args: Prisma.TeamMemberGroupByArgs<ExtArgs>
            result: $Utils.Optional<TeamMemberGroupByOutputType>[]
          }
          count: {
            args: Prisma.TeamMemberCountArgs<ExtArgs>
            result: $Utils.Optional<TeamMemberCountAggregateOutputType> | number
          }
        }
      }
      TeamMessage: {
        payload: Prisma.$TeamMessagePayload<ExtArgs>
        fields: Prisma.TeamMessageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TeamMessageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamMessagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TeamMessageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamMessagePayload>
          }
          findFirst: {
            args: Prisma.TeamMessageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamMessagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TeamMessageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamMessagePayload>
          }
          findMany: {
            args: Prisma.TeamMessageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamMessagePayload>[]
          }
          create: {
            args: Prisma.TeamMessageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamMessagePayload>
          }
          createMany: {
            args: Prisma.TeamMessageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TeamMessageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamMessagePayload>[]
          }
          delete: {
            args: Prisma.TeamMessageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamMessagePayload>
          }
          update: {
            args: Prisma.TeamMessageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamMessagePayload>
          }
          deleteMany: {
            args: Prisma.TeamMessageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TeamMessageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TeamMessageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TeamMessagePayload>
          }
          aggregate: {
            args: Prisma.TeamMessageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTeamMessage>
          }
          groupBy: {
            args: Prisma.TeamMessageGroupByArgs<ExtArgs>
            result: $Utils.Optional<TeamMessageGroupByOutputType>[]
          }
          count: {
            args: Prisma.TeamMessageCountArgs<ExtArgs>
            result: $Utils.Optional<TeamMessageCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type ClassroomCountOutputType
   */

  export type ClassroomCountOutputType = {
    students: number
    teams: number
  }

  export type ClassroomCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    students?: boolean | ClassroomCountOutputTypeCountStudentsArgs
    teams?: boolean | ClassroomCountOutputTypeCountTeamsArgs
  }

  // Custom InputTypes
  /**
   * ClassroomCountOutputType without action
   */
  export type ClassroomCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassroomCountOutputType
     */
    select?: ClassroomCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ClassroomCountOutputType without action
   */
  export type ClassroomCountOutputTypeCountStudentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StudentWhereInput
  }

  /**
   * ClassroomCountOutputType without action
   */
  export type ClassroomCountOutputTypeCountTeamsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TeamWhereInput
  }


  /**
   * Count Type StudentCountOutputType
   */

  export type StudentCountOutputType = {
    gameSessions: number
    teamMembers: number
    teamMessages: number
  }

  export type StudentCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    gameSessions?: boolean | StudentCountOutputTypeCountGameSessionsArgs
    teamMembers?: boolean | StudentCountOutputTypeCountTeamMembersArgs
    teamMessages?: boolean | StudentCountOutputTypeCountTeamMessagesArgs
  }

  // Custom InputTypes
  /**
   * StudentCountOutputType without action
   */
  export type StudentCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StudentCountOutputType
     */
    select?: StudentCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * StudentCountOutputType without action
   */
  export type StudentCountOutputTypeCountGameSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GameSessionWhereInput
  }

  /**
   * StudentCountOutputType without action
   */
  export type StudentCountOutputTypeCountTeamMembersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TeamMemberWhereInput
  }

  /**
   * StudentCountOutputType without action
   */
  export type StudentCountOutputTypeCountTeamMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TeamMessageWhereInput
  }


  /**
   * Count Type TeamCountOutputType
   */

  export type TeamCountOutputType = {
    members: number
    chatMessages: number
  }

  export type TeamCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    members?: boolean | TeamCountOutputTypeCountMembersArgs
    chatMessages?: boolean | TeamCountOutputTypeCountChatMessagesArgs
  }

  // Custom InputTypes
  /**
   * TeamCountOutputType without action
   */
  export type TeamCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamCountOutputType
     */
    select?: TeamCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TeamCountOutputType without action
   */
  export type TeamCountOutputTypeCountMembersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TeamMemberWhereInput
  }

  /**
   * TeamCountOutputType without action
   */
  export type TeamCountOutputTypeCountChatMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TeamMessageWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Classroom
   */

  export type AggregateClassroom = {
    _count: ClassroomCountAggregateOutputType | null
    _min: ClassroomMinAggregateOutputType | null
    _max: ClassroomMaxAggregateOutputType | null
  }

  export type ClassroomMinAggregateOutputType = {
    id: string | null
    name: string | null
    grade: string | null
    major: string | null
  }

  export type ClassroomMaxAggregateOutputType = {
    id: string | null
    name: string | null
    grade: string | null
    major: string | null
  }

  export type ClassroomCountAggregateOutputType = {
    id: number
    name: number
    grade: number
    major: number
    _all: number
  }


  export type ClassroomMinAggregateInputType = {
    id?: true
    name?: true
    grade?: true
    major?: true
  }

  export type ClassroomMaxAggregateInputType = {
    id?: true
    name?: true
    grade?: true
    major?: true
  }

  export type ClassroomCountAggregateInputType = {
    id?: true
    name?: true
    grade?: true
    major?: true
    _all?: true
  }

  export type ClassroomAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Classroom to aggregate.
     */
    where?: ClassroomWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Classrooms to fetch.
     */
    orderBy?: ClassroomOrderByWithRelationInput | ClassroomOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ClassroomWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Classrooms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Classrooms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Classrooms
    **/
    _count?: true | ClassroomCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ClassroomMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ClassroomMaxAggregateInputType
  }

  export type GetClassroomAggregateType<T extends ClassroomAggregateArgs> = {
        [P in keyof T & keyof AggregateClassroom]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateClassroom[P]>
      : GetScalarType<T[P], AggregateClassroom[P]>
  }




  export type ClassroomGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClassroomWhereInput
    orderBy?: ClassroomOrderByWithAggregationInput | ClassroomOrderByWithAggregationInput[]
    by: ClassroomScalarFieldEnum[] | ClassroomScalarFieldEnum
    having?: ClassroomScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ClassroomCountAggregateInputType | true
    _min?: ClassroomMinAggregateInputType
    _max?: ClassroomMaxAggregateInputType
  }

  export type ClassroomGroupByOutputType = {
    id: string
    name: string
    grade: string
    major: string
    _count: ClassroomCountAggregateOutputType | null
    _min: ClassroomMinAggregateOutputType | null
    _max: ClassroomMaxAggregateOutputType | null
  }

  type GetClassroomGroupByPayload<T extends ClassroomGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ClassroomGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ClassroomGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ClassroomGroupByOutputType[P]>
            : GetScalarType<T[P], ClassroomGroupByOutputType[P]>
        }
      >
    >


  export type ClassroomSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    grade?: boolean
    major?: boolean
    students?: boolean | Classroom$studentsArgs<ExtArgs>
    teams?: boolean | Classroom$teamsArgs<ExtArgs>
    _count?: boolean | ClassroomCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["classroom"]>

  export type ClassroomSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    grade?: boolean
    major?: boolean
  }, ExtArgs["result"]["classroom"]>

  export type ClassroomSelectScalar = {
    id?: boolean
    name?: boolean
    grade?: boolean
    major?: boolean
  }

  export type ClassroomInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    students?: boolean | Classroom$studentsArgs<ExtArgs>
    teams?: boolean | Classroom$teamsArgs<ExtArgs>
    _count?: boolean | ClassroomCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ClassroomIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ClassroomPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Classroom"
    objects: {
      students: Prisma.$StudentPayload<ExtArgs>[]
      teams: Prisma.$TeamPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      grade: string
      major: string
    }, ExtArgs["result"]["classroom"]>
    composites: {}
  }

  type ClassroomGetPayload<S extends boolean | null | undefined | ClassroomDefaultArgs> = $Result.GetResult<Prisma.$ClassroomPayload, S>

  type ClassroomCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ClassroomFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ClassroomCountAggregateInputType | true
    }

  export interface ClassroomDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Classroom'], meta: { name: 'Classroom' } }
    /**
     * Find zero or one Classroom that matches the filter.
     * @param {ClassroomFindUniqueArgs} args - Arguments to find a Classroom
     * @example
     * // Get one Classroom
     * const classroom = await prisma.classroom.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ClassroomFindUniqueArgs>(args: SelectSubset<T, ClassroomFindUniqueArgs<ExtArgs>>): Prisma__ClassroomClient<$Result.GetResult<Prisma.$ClassroomPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Classroom that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ClassroomFindUniqueOrThrowArgs} args - Arguments to find a Classroom
     * @example
     * // Get one Classroom
     * const classroom = await prisma.classroom.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ClassroomFindUniqueOrThrowArgs>(args: SelectSubset<T, ClassroomFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ClassroomClient<$Result.GetResult<Prisma.$ClassroomPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Classroom that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClassroomFindFirstArgs} args - Arguments to find a Classroom
     * @example
     * // Get one Classroom
     * const classroom = await prisma.classroom.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ClassroomFindFirstArgs>(args?: SelectSubset<T, ClassroomFindFirstArgs<ExtArgs>>): Prisma__ClassroomClient<$Result.GetResult<Prisma.$ClassroomPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Classroom that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClassroomFindFirstOrThrowArgs} args - Arguments to find a Classroom
     * @example
     * // Get one Classroom
     * const classroom = await prisma.classroom.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ClassroomFindFirstOrThrowArgs>(args?: SelectSubset<T, ClassroomFindFirstOrThrowArgs<ExtArgs>>): Prisma__ClassroomClient<$Result.GetResult<Prisma.$ClassroomPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Classrooms that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClassroomFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Classrooms
     * const classrooms = await prisma.classroom.findMany()
     * 
     * // Get first 10 Classrooms
     * const classrooms = await prisma.classroom.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const classroomWithIdOnly = await prisma.classroom.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ClassroomFindManyArgs>(args?: SelectSubset<T, ClassroomFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClassroomPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Classroom.
     * @param {ClassroomCreateArgs} args - Arguments to create a Classroom.
     * @example
     * // Create one Classroom
     * const Classroom = await prisma.classroom.create({
     *   data: {
     *     // ... data to create a Classroom
     *   }
     * })
     * 
     */
    create<T extends ClassroomCreateArgs>(args: SelectSubset<T, ClassroomCreateArgs<ExtArgs>>): Prisma__ClassroomClient<$Result.GetResult<Prisma.$ClassroomPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Classrooms.
     * @param {ClassroomCreateManyArgs} args - Arguments to create many Classrooms.
     * @example
     * // Create many Classrooms
     * const classroom = await prisma.classroom.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ClassroomCreateManyArgs>(args?: SelectSubset<T, ClassroomCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Classrooms and returns the data saved in the database.
     * @param {ClassroomCreateManyAndReturnArgs} args - Arguments to create many Classrooms.
     * @example
     * // Create many Classrooms
     * const classroom = await prisma.classroom.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Classrooms and only return the `id`
     * const classroomWithIdOnly = await prisma.classroom.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ClassroomCreateManyAndReturnArgs>(args?: SelectSubset<T, ClassroomCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClassroomPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Classroom.
     * @param {ClassroomDeleteArgs} args - Arguments to delete one Classroom.
     * @example
     * // Delete one Classroom
     * const Classroom = await prisma.classroom.delete({
     *   where: {
     *     // ... filter to delete one Classroom
     *   }
     * })
     * 
     */
    delete<T extends ClassroomDeleteArgs>(args: SelectSubset<T, ClassroomDeleteArgs<ExtArgs>>): Prisma__ClassroomClient<$Result.GetResult<Prisma.$ClassroomPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Classroom.
     * @param {ClassroomUpdateArgs} args - Arguments to update one Classroom.
     * @example
     * // Update one Classroom
     * const classroom = await prisma.classroom.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ClassroomUpdateArgs>(args: SelectSubset<T, ClassroomUpdateArgs<ExtArgs>>): Prisma__ClassroomClient<$Result.GetResult<Prisma.$ClassroomPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Classrooms.
     * @param {ClassroomDeleteManyArgs} args - Arguments to filter Classrooms to delete.
     * @example
     * // Delete a few Classrooms
     * const { count } = await prisma.classroom.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ClassroomDeleteManyArgs>(args?: SelectSubset<T, ClassroomDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Classrooms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClassroomUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Classrooms
     * const classroom = await prisma.classroom.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ClassroomUpdateManyArgs>(args: SelectSubset<T, ClassroomUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Classroom.
     * @param {ClassroomUpsertArgs} args - Arguments to update or create a Classroom.
     * @example
     * // Update or create a Classroom
     * const classroom = await prisma.classroom.upsert({
     *   create: {
     *     // ... data to create a Classroom
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Classroom we want to update
     *   }
     * })
     */
    upsert<T extends ClassroomUpsertArgs>(args: SelectSubset<T, ClassroomUpsertArgs<ExtArgs>>): Prisma__ClassroomClient<$Result.GetResult<Prisma.$ClassroomPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Classrooms.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClassroomCountArgs} args - Arguments to filter Classrooms to count.
     * @example
     * // Count the number of Classrooms
     * const count = await prisma.classroom.count({
     *   where: {
     *     // ... the filter for the Classrooms we want to count
     *   }
     * })
    **/
    count<T extends ClassroomCountArgs>(
      args?: Subset<T, ClassroomCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ClassroomCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Classroom.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClassroomAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ClassroomAggregateArgs>(args: Subset<T, ClassroomAggregateArgs>): Prisma.PrismaPromise<GetClassroomAggregateType<T>>

    /**
     * Group by Classroom.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClassroomGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ClassroomGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ClassroomGroupByArgs['orderBy'] }
        : { orderBy?: ClassroomGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ClassroomGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClassroomGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Classroom model
   */
  readonly fields: ClassroomFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Classroom.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ClassroomClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    students<T extends Classroom$studentsArgs<ExtArgs> = {}>(args?: Subset<T, Classroom$studentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findMany"> | Null>
    teams<T extends Classroom$teamsArgs<ExtArgs> = {}>(args?: Subset<T, Classroom$teamsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Classroom model
   */ 
  interface ClassroomFieldRefs {
    readonly id: FieldRef<"Classroom", 'String'>
    readonly name: FieldRef<"Classroom", 'String'>
    readonly grade: FieldRef<"Classroom", 'String'>
    readonly major: FieldRef<"Classroom", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Classroom findUnique
   */
  export type ClassroomFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Classroom
     */
    select?: ClassroomSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassroomInclude<ExtArgs> | null
    /**
     * Filter, which Classroom to fetch.
     */
    where: ClassroomWhereUniqueInput
  }

  /**
   * Classroom findUniqueOrThrow
   */
  export type ClassroomFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Classroom
     */
    select?: ClassroomSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassroomInclude<ExtArgs> | null
    /**
     * Filter, which Classroom to fetch.
     */
    where: ClassroomWhereUniqueInput
  }

  /**
   * Classroom findFirst
   */
  export type ClassroomFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Classroom
     */
    select?: ClassroomSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassroomInclude<ExtArgs> | null
    /**
     * Filter, which Classroom to fetch.
     */
    where?: ClassroomWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Classrooms to fetch.
     */
    orderBy?: ClassroomOrderByWithRelationInput | ClassroomOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Classrooms.
     */
    cursor?: ClassroomWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Classrooms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Classrooms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Classrooms.
     */
    distinct?: ClassroomScalarFieldEnum | ClassroomScalarFieldEnum[]
  }

  /**
   * Classroom findFirstOrThrow
   */
  export type ClassroomFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Classroom
     */
    select?: ClassroomSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassroomInclude<ExtArgs> | null
    /**
     * Filter, which Classroom to fetch.
     */
    where?: ClassroomWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Classrooms to fetch.
     */
    orderBy?: ClassroomOrderByWithRelationInput | ClassroomOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Classrooms.
     */
    cursor?: ClassroomWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Classrooms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Classrooms.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Classrooms.
     */
    distinct?: ClassroomScalarFieldEnum | ClassroomScalarFieldEnum[]
  }

  /**
   * Classroom findMany
   */
  export type ClassroomFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Classroom
     */
    select?: ClassroomSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassroomInclude<ExtArgs> | null
    /**
     * Filter, which Classrooms to fetch.
     */
    where?: ClassroomWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Classrooms to fetch.
     */
    orderBy?: ClassroomOrderByWithRelationInput | ClassroomOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Classrooms.
     */
    cursor?: ClassroomWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Classrooms from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Classrooms.
     */
    skip?: number
    distinct?: ClassroomScalarFieldEnum | ClassroomScalarFieldEnum[]
  }

  /**
   * Classroom create
   */
  export type ClassroomCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Classroom
     */
    select?: ClassroomSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassroomInclude<ExtArgs> | null
    /**
     * The data needed to create a Classroom.
     */
    data: XOR<ClassroomCreateInput, ClassroomUncheckedCreateInput>
  }

  /**
   * Classroom createMany
   */
  export type ClassroomCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Classrooms.
     */
    data: ClassroomCreateManyInput | ClassroomCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Classroom createManyAndReturn
   */
  export type ClassroomCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Classroom
     */
    select?: ClassroomSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Classrooms.
     */
    data: ClassroomCreateManyInput | ClassroomCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Classroom update
   */
  export type ClassroomUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Classroom
     */
    select?: ClassroomSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassroomInclude<ExtArgs> | null
    /**
     * The data needed to update a Classroom.
     */
    data: XOR<ClassroomUpdateInput, ClassroomUncheckedUpdateInput>
    /**
     * Choose, which Classroom to update.
     */
    where: ClassroomWhereUniqueInput
  }

  /**
   * Classroom updateMany
   */
  export type ClassroomUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Classrooms.
     */
    data: XOR<ClassroomUpdateManyMutationInput, ClassroomUncheckedUpdateManyInput>
    /**
     * Filter which Classrooms to update
     */
    where?: ClassroomWhereInput
  }

  /**
   * Classroom upsert
   */
  export type ClassroomUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Classroom
     */
    select?: ClassroomSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassroomInclude<ExtArgs> | null
    /**
     * The filter to search for the Classroom to update in case it exists.
     */
    where: ClassroomWhereUniqueInput
    /**
     * In case the Classroom found by the `where` argument doesn't exist, create a new Classroom with this data.
     */
    create: XOR<ClassroomCreateInput, ClassroomUncheckedCreateInput>
    /**
     * In case the Classroom was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ClassroomUpdateInput, ClassroomUncheckedUpdateInput>
  }

  /**
   * Classroom delete
   */
  export type ClassroomDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Classroom
     */
    select?: ClassroomSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassroomInclude<ExtArgs> | null
    /**
     * Filter which Classroom to delete.
     */
    where: ClassroomWhereUniqueInput
  }

  /**
   * Classroom deleteMany
   */
  export type ClassroomDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Classrooms to delete
     */
    where?: ClassroomWhereInput
  }

  /**
   * Classroom.students
   */
  export type Classroom$studentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null
    where?: StudentWhereInput
    orderBy?: StudentOrderByWithRelationInput | StudentOrderByWithRelationInput[]
    cursor?: StudentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: StudentScalarFieldEnum | StudentScalarFieldEnum[]
  }

  /**
   * Classroom.teams
   */
  export type Classroom$teamsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    where?: TeamWhereInput
    orderBy?: TeamOrderByWithRelationInput | TeamOrderByWithRelationInput[]
    cursor?: TeamWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TeamScalarFieldEnum | TeamScalarFieldEnum[]
  }

  /**
   * Classroom without action
   */
  export type ClassroomDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Classroom
     */
    select?: ClassroomSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassroomInclude<ExtArgs> | null
  }


  /**
   * Model Student
   */

  export type AggregateStudent = {
    _count: StudentCountAggregateOutputType | null
    _avg: StudentAvgAggregateOutputType | null
    _sum: StudentSumAggregateOutputType | null
    _min: StudentMinAggregateOutputType | null
    _max: StudentMaxAggregateOutputType | null
  }

  export type StudentAvgAggregateOutputType = {
    diagnosticScore: number | null
  }

  export type StudentSumAggregateOutputType = {
    diagnosticScore: number | null
  }

  export type StudentMinAggregateOutputType = {
    id: string | null
    name: string | null
    nisn: string | null
    classroomId: string | null
    geftStatus: $Enums.GeftStatus | null
    diagnosticScore: number | null
    diagnosticLevel: string | null
    createdAt: Date | null
  }

  export type StudentMaxAggregateOutputType = {
    id: string | null
    name: string | null
    nisn: string | null
    classroomId: string | null
    geftStatus: $Enums.GeftStatus | null
    diagnosticScore: number | null
    diagnosticLevel: string | null
    createdAt: Date | null
  }

  export type StudentCountAggregateOutputType = {
    id: number
    name: number
    nisn: number
    classroomId: number
    geftStatus: number
    diagnosticScore: number
    diagnosticLevel: number
    createdAt: number
    _all: number
  }


  export type StudentAvgAggregateInputType = {
    diagnosticScore?: true
  }

  export type StudentSumAggregateInputType = {
    diagnosticScore?: true
  }

  export type StudentMinAggregateInputType = {
    id?: true
    name?: true
    nisn?: true
    classroomId?: true
    geftStatus?: true
    diagnosticScore?: true
    diagnosticLevel?: true
    createdAt?: true
  }

  export type StudentMaxAggregateInputType = {
    id?: true
    name?: true
    nisn?: true
    classroomId?: true
    geftStatus?: true
    diagnosticScore?: true
    diagnosticLevel?: true
    createdAt?: true
  }

  export type StudentCountAggregateInputType = {
    id?: true
    name?: true
    nisn?: true
    classroomId?: true
    geftStatus?: true
    diagnosticScore?: true
    diagnosticLevel?: true
    createdAt?: true
    _all?: true
  }

  export type StudentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Student to aggregate.
     */
    where?: StudentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Students to fetch.
     */
    orderBy?: StudentOrderByWithRelationInput | StudentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StudentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Students from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Students.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Students
    **/
    _count?: true | StudentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: StudentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: StudentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StudentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StudentMaxAggregateInputType
  }

  export type GetStudentAggregateType<T extends StudentAggregateArgs> = {
        [P in keyof T & keyof AggregateStudent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStudent[P]>
      : GetScalarType<T[P], AggregateStudent[P]>
  }




  export type StudentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StudentWhereInput
    orderBy?: StudentOrderByWithAggregationInput | StudentOrderByWithAggregationInput[]
    by: StudentScalarFieldEnum[] | StudentScalarFieldEnum
    having?: StudentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StudentCountAggregateInputType | true
    _avg?: StudentAvgAggregateInputType
    _sum?: StudentSumAggregateInputType
    _min?: StudentMinAggregateInputType
    _max?: StudentMaxAggregateInputType
  }

  export type StudentGroupByOutputType = {
    id: string
    name: string
    nisn: string
    classroomId: string
    geftStatus: $Enums.GeftStatus
    diagnosticScore: number | null
    diagnosticLevel: string | null
    createdAt: Date
    _count: StudentCountAggregateOutputType | null
    _avg: StudentAvgAggregateOutputType | null
    _sum: StudentSumAggregateOutputType | null
    _min: StudentMinAggregateOutputType | null
    _max: StudentMaxAggregateOutputType | null
  }

  type GetStudentGroupByPayload<T extends StudentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StudentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StudentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StudentGroupByOutputType[P]>
            : GetScalarType<T[P], StudentGroupByOutputType[P]>
        }
      >
    >


  export type StudentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    nisn?: boolean
    classroomId?: boolean
    geftStatus?: boolean
    diagnosticScore?: boolean
    diagnosticLevel?: boolean
    createdAt?: boolean
    geftResult?: boolean | Student$geftResultArgs<ExtArgs>
    gameSessions?: boolean | Student$gameSessionsArgs<ExtArgs>
    leaderboard?: boolean | Student$leaderboardArgs<ExtArgs>
    teamMembers?: boolean | Student$teamMembersArgs<ExtArgs>
    teamMessages?: boolean | Student$teamMessagesArgs<ExtArgs>
    classroom?: boolean | ClassroomDefaultArgs<ExtArgs>
    _count?: boolean | StudentCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["student"]>

  export type StudentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    nisn?: boolean
    classroomId?: boolean
    geftStatus?: boolean
    diagnosticScore?: boolean
    diagnosticLevel?: boolean
    createdAt?: boolean
    classroom?: boolean | ClassroomDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["student"]>

  export type StudentSelectScalar = {
    id?: boolean
    name?: boolean
    nisn?: boolean
    classroomId?: boolean
    geftStatus?: boolean
    diagnosticScore?: boolean
    diagnosticLevel?: boolean
    createdAt?: boolean
  }

  export type StudentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    geftResult?: boolean | Student$geftResultArgs<ExtArgs>
    gameSessions?: boolean | Student$gameSessionsArgs<ExtArgs>
    leaderboard?: boolean | Student$leaderboardArgs<ExtArgs>
    teamMembers?: boolean | Student$teamMembersArgs<ExtArgs>
    teamMessages?: boolean | Student$teamMessagesArgs<ExtArgs>
    classroom?: boolean | ClassroomDefaultArgs<ExtArgs>
    _count?: boolean | StudentCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type StudentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    classroom?: boolean | ClassroomDefaultArgs<ExtArgs>
  }

  export type $StudentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Student"
    objects: {
      geftResult: Prisma.$GeftResultPayload<ExtArgs> | null
      gameSessions: Prisma.$GameSessionPayload<ExtArgs>[]
      leaderboard: Prisma.$LeaderboardPayload<ExtArgs> | null
      teamMembers: Prisma.$TeamMemberPayload<ExtArgs>[]
      teamMessages: Prisma.$TeamMessagePayload<ExtArgs>[]
      classroom: Prisma.$ClassroomPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      nisn: string
      classroomId: string
      geftStatus: $Enums.GeftStatus
      diagnosticScore: number | null
      diagnosticLevel: string | null
      createdAt: Date
    }, ExtArgs["result"]["student"]>
    composites: {}
  }

  type StudentGetPayload<S extends boolean | null | undefined | StudentDefaultArgs> = $Result.GetResult<Prisma.$StudentPayload, S>

  type StudentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<StudentFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: StudentCountAggregateInputType | true
    }

  export interface StudentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Student'], meta: { name: 'Student' } }
    /**
     * Find zero or one Student that matches the filter.
     * @param {StudentFindUniqueArgs} args - Arguments to find a Student
     * @example
     * // Get one Student
     * const student = await prisma.student.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StudentFindUniqueArgs>(args: SelectSubset<T, StudentFindUniqueArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Student that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {StudentFindUniqueOrThrowArgs} args - Arguments to find a Student
     * @example
     * // Get one Student
     * const student = await prisma.student.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StudentFindUniqueOrThrowArgs>(args: SelectSubset<T, StudentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Student that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentFindFirstArgs} args - Arguments to find a Student
     * @example
     * // Get one Student
     * const student = await prisma.student.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StudentFindFirstArgs>(args?: SelectSubset<T, StudentFindFirstArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Student that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentFindFirstOrThrowArgs} args - Arguments to find a Student
     * @example
     * // Get one Student
     * const student = await prisma.student.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StudentFindFirstOrThrowArgs>(args?: SelectSubset<T, StudentFindFirstOrThrowArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Students that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Students
     * const students = await prisma.student.findMany()
     * 
     * // Get first 10 Students
     * const students = await prisma.student.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const studentWithIdOnly = await prisma.student.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StudentFindManyArgs>(args?: SelectSubset<T, StudentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Student.
     * @param {StudentCreateArgs} args - Arguments to create a Student.
     * @example
     * // Create one Student
     * const Student = await prisma.student.create({
     *   data: {
     *     // ... data to create a Student
     *   }
     * })
     * 
     */
    create<T extends StudentCreateArgs>(args: SelectSubset<T, StudentCreateArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Students.
     * @param {StudentCreateManyArgs} args - Arguments to create many Students.
     * @example
     * // Create many Students
     * const student = await prisma.student.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StudentCreateManyArgs>(args?: SelectSubset<T, StudentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Students and returns the data saved in the database.
     * @param {StudentCreateManyAndReturnArgs} args - Arguments to create many Students.
     * @example
     * // Create many Students
     * const student = await prisma.student.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Students and only return the `id`
     * const studentWithIdOnly = await prisma.student.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StudentCreateManyAndReturnArgs>(args?: SelectSubset<T, StudentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Student.
     * @param {StudentDeleteArgs} args - Arguments to delete one Student.
     * @example
     * // Delete one Student
     * const Student = await prisma.student.delete({
     *   where: {
     *     // ... filter to delete one Student
     *   }
     * })
     * 
     */
    delete<T extends StudentDeleteArgs>(args: SelectSubset<T, StudentDeleteArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Student.
     * @param {StudentUpdateArgs} args - Arguments to update one Student.
     * @example
     * // Update one Student
     * const student = await prisma.student.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StudentUpdateArgs>(args: SelectSubset<T, StudentUpdateArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Students.
     * @param {StudentDeleteManyArgs} args - Arguments to filter Students to delete.
     * @example
     * // Delete a few Students
     * const { count } = await prisma.student.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StudentDeleteManyArgs>(args?: SelectSubset<T, StudentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Students.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Students
     * const student = await prisma.student.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StudentUpdateManyArgs>(args: SelectSubset<T, StudentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Student.
     * @param {StudentUpsertArgs} args - Arguments to update or create a Student.
     * @example
     * // Update or create a Student
     * const student = await prisma.student.upsert({
     *   create: {
     *     // ... data to create a Student
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Student we want to update
     *   }
     * })
     */
    upsert<T extends StudentUpsertArgs>(args: SelectSubset<T, StudentUpsertArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Students.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentCountArgs} args - Arguments to filter Students to count.
     * @example
     * // Count the number of Students
     * const count = await prisma.student.count({
     *   where: {
     *     // ... the filter for the Students we want to count
     *   }
     * })
    **/
    count<T extends StudentCountArgs>(
      args?: Subset<T, StudentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StudentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Student.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends StudentAggregateArgs>(args: Subset<T, StudentAggregateArgs>): Prisma.PrismaPromise<GetStudentAggregateType<T>>

    /**
     * Group by Student.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends StudentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StudentGroupByArgs['orderBy'] }
        : { orderBy?: StudentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, StudentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStudentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Student model
   */
  readonly fields: StudentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Student.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StudentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    geftResult<T extends Student$geftResultArgs<ExtArgs> = {}>(args?: Subset<T, Student$geftResultArgs<ExtArgs>>): Prisma__GeftResultClient<$Result.GetResult<Prisma.$GeftResultPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    gameSessions<T extends Student$gameSessionsArgs<ExtArgs> = {}>(args?: Subset<T, Student$gameSessionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "findMany"> | Null>
    leaderboard<T extends Student$leaderboardArgs<ExtArgs> = {}>(args?: Subset<T, Student$leaderboardArgs<ExtArgs>>): Prisma__LeaderboardClient<$Result.GetResult<Prisma.$LeaderboardPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    teamMembers<T extends Student$teamMembersArgs<ExtArgs> = {}>(args?: Subset<T, Student$teamMembersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TeamMemberPayload<ExtArgs>, T, "findMany"> | Null>
    teamMessages<T extends Student$teamMessagesArgs<ExtArgs> = {}>(args?: Subset<T, Student$teamMessagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TeamMessagePayload<ExtArgs>, T, "findMany"> | Null>
    classroom<T extends ClassroomDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClassroomDefaultArgs<ExtArgs>>): Prisma__ClassroomClient<$Result.GetResult<Prisma.$ClassroomPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Student model
   */ 
  interface StudentFieldRefs {
    readonly id: FieldRef<"Student", 'String'>
    readonly name: FieldRef<"Student", 'String'>
    readonly nisn: FieldRef<"Student", 'String'>
    readonly classroomId: FieldRef<"Student", 'String'>
    readonly geftStatus: FieldRef<"Student", 'GeftStatus'>
    readonly diagnosticScore: FieldRef<"Student", 'Int'>
    readonly diagnosticLevel: FieldRef<"Student", 'String'>
    readonly createdAt: FieldRef<"Student", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Student findUnique
   */
  export type StudentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null
    /**
     * Filter, which Student to fetch.
     */
    where: StudentWhereUniqueInput
  }

  /**
   * Student findUniqueOrThrow
   */
  export type StudentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null
    /**
     * Filter, which Student to fetch.
     */
    where: StudentWhereUniqueInput
  }

  /**
   * Student findFirst
   */
  export type StudentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null
    /**
     * Filter, which Student to fetch.
     */
    where?: StudentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Students to fetch.
     */
    orderBy?: StudentOrderByWithRelationInput | StudentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Students.
     */
    cursor?: StudentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Students from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Students.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Students.
     */
    distinct?: StudentScalarFieldEnum | StudentScalarFieldEnum[]
  }

  /**
   * Student findFirstOrThrow
   */
  export type StudentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null
    /**
     * Filter, which Student to fetch.
     */
    where?: StudentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Students to fetch.
     */
    orderBy?: StudentOrderByWithRelationInput | StudentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Students.
     */
    cursor?: StudentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Students from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Students.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Students.
     */
    distinct?: StudentScalarFieldEnum | StudentScalarFieldEnum[]
  }

  /**
   * Student findMany
   */
  export type StudentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null
    /**
     * Filter, which Students to fetch.
     */
    where?: StudentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Students to fetch.
     */
    orderBy?: StudentOrderByWithRelationInput | StudentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Students.
     */
    cursor?: StudentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Students from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Students.
     */
    skip?: number
    distinct?: StudentScalarFieldEnum | StudentScalarFieldEnum[]
  }

  /**
   * Student create
   */
  export type StudentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null
    /**
     * The data needed to create a Student.
     */
    data: XOR<StudentCreateInput, StudentUncheckedCreateInput>
  }

  /**
   * Student createMany
   */
  export type StudentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Students.
     */
    data: StudentCreateManyInput | StudentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Student createManyAndReturn
   */
  export type StudentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Students.
     */
    data: StudentCreateManyInput | StudentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Student update
   */
  export type StudentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null
    /**
     * The data needed to update a Student.
     */
    data: XOR<StudentUpdateInput, StudentUncheckedUpdateInput>
    /**
     * Choose, which Student to update.
     */
    where: StudentWhereUniqueInput
  }

  /**
   * Student updateMany
   */
  export type StudentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Students.
     */
    data: XOR<StudentUpdateManyMutationInput, StudentUncheckedUpdateManyInput>
    /**
     * Filter which Students to update
     */
    where?: StudentWhereInput
  }

  /**
   * Student upsert
   */
  export type StudentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null
    /**
     * The filter to search for the Student to update in case it exists.
     */
    where: StudentWhereUniqueInput
    /**
     * In case the Student found by the `where` argument doesn't exist, create a new Student with this data.
     */
    create: XOR<StudentCreateInput, StudentUncheckedCreateInput>
    /**
     * In case the Student was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StudentUpdateInput, StudentUncheckedUpdateInput>
  }

  /**
   * Student delete
   */
  export type StudentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null
    /**
     * Filter which Student to delete.
     */
    where: StudentWhereUniqueInput
  }

  /**
   * Student deleteMany
   */
  export type StudentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Students to delete
     */
    where?: StudentWhereInput
  }

  /**
   * Student.geftResult
   */
  export type Student$geftResultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeftResult
     */
    select?: GeftResultSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GeftResultInclude<ExtArgs> | null
    where?: GeftResultWhereInput
  }

  /**
   * Student.gameSessions
   */
  export type Student$gameSessionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    where?: GameSessionWhereInput
    orderBy?: GameSessionOrderByWithRelationInput | GameSessionOrderByWithRelationInput[]
    cursor?: GameSessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: GameSessionScalarFieldEnum | GameSessionScalarFieldEnum[]
  }

  /**
   * Student.leaderboard
   */
  export type Student$leaderboardArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Leaderboard
     */
    select?: LeaderboardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeaderboardInclude<ExtArgs> | null
    where?: LeaderboardWhereInput
  }

  /**
   * Student.teamMembers
   */
  export type Student$teamMembersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMember
     */
    select?: TeamMemberSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMemberInclude<ExtArgs> | null
    where?: TeamMemberWhereInput
    orderBy?: TeamMemberOrderByWithRelationInput | TeamMemberOrderByWithRelationInput[]
    cursor?: TeamMemberWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TeamMemberScalarFieldEnum | TeamMemberScalarFieldEnum[]
  }

  /**
   * Student.teamMessages
   */
  export type Student$teamMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMessage
     */
    select?: TeamMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMessageInclude<ExtArgs> | null
    where?: TeamMessageWhereInput
    orderBy?: TeamMessageOrderByWithRelationInput | TeamMessageOrderByWithRelationInput[]
    cursor?: TeamMessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TeamMessageScalarFieldEnum | TeamMessageScalarFieldEnum[]
  }

  /**
   * Student without action
   */
  export type StudentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StudentInclude<ExtArgs> | null
  }


  /**
   * Model GeftResult
   */

  export type AggregateGeftResult = {
    _count: GeftResultCountAggregateOutputType | null
    _avg: GeftResultAvgAggregateOutputType | null
    _sum: GeftResultSumAggregateOutputType | null
    _min: GeftResultMinAggregateOutputType | null
    _max: GeftResultMaxAggregateOutputType | null
  }

  export type GeftResultAvgAggregateOutputType = {
    score: number | null
  }

  export type GeftResultSumAggregateOutputType = {
    score: number | null
  }

  export type GeftResultMinAggregateOutputType = {
    id: string | null
    studentId: string | null
    score: number | null
    cognitiveStyle: $Enums.CognitiveStyle | null
    completedAt: Date | null
  }

  export type GeftResultMaxAggregateOutputType = {
    id: string | null
    studentId: string | null
    score: number | null
    cognitiveStyle: $Enums.CognitiveStyle | null
    completedAt: Date | null
  }

  export type GeftResultCountAggregateOutputType = {
    id: number
    studentId: number
    score: number
    cognitiveStyle: number
    completedAt: number
    _all: number
  }


  export type GeftResultAvgAggregateInputType = {
    score?: true
  }

  export type GeftResultSumAggregateInputType = {
    score?: true
  }

  export type GeftResultMinAggregateInputType = {
    id?: true
    studentId?: true
    score?: true
    cognitiveStyle?: true
    completedAt?: true
  }

  export type GeftResultMaxAggregateInputType = {
    id?: true
    studentId?: true
    score?: true
    cognitiveStyle?: true
    completedAt?: true
  }

  export type GeftResultCountAggregateInputType = {
    id?: true
    studentId?: true
    score?: true
    cognitiveStyle?: true
    completedAt?: true
    _all?: true
  }

  export type GeftResultAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GeftResult to aggregate.
     */
    where?: GeftResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GeftResults to fetch.
     */
    orderBy?: GeftResultOrderByWithRelationInput | GeftResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GeftResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GeftResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GeftResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GeftResults
    **/
    _count?: true | GeftResultCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GeftResultAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GeftResultSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GeftResultMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GeftResultMaxAggregateInputType
  }

  export type GetGeftResultAggregateType<T extends GeftResultAggregateArgs> = {
        [P in keyof T & keyof AggregateGeftResult]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGeftResult[P]>
      : GetScalarType<T[P], AggregateGeftResult[P]>
  }




  export type GeftResultGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GeftResultWhereInput
    orderBy?: GeftResultOrderByWithAggregationInput | GeftResultOrderByWithAggregationInput[]
    by: GeftResultScalarFieldEnum[] | GeftResultScalarFieldEnum
    having?: GeftResultScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GeftResultCountAggregateInputType | true
    _avg?: GeftResultAvgAggregateInputType
    _sum?: GeftResultSumAggregateInputType
    _min?: GeftResultMinAggregateInputType
    _max?: GeftResultMaxAggregateInputType
  }

  export type GeftResultGroupByOutputType = {
    id: string
    studentId: string
    score: number
    cognitiveStyle: $Enums.CognitiveStyle
    completedAt: Date
    _count: GeftResultCountAggregateOutputType | null
    _avg: GeftResultAvgAggregateOutputType | null
    _sum: GeftResultSumAggregateOutputType | null
    _min: GeftResultMinAggregateOutputType | null
    _max: GeftResultMaxAggregateOutputType | null
  }

  type GetGeftResultGroupByPayload<T extends GeftResultGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GeftResultGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GeftResultGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GeftResultGroupByOutputType[P]>
            : GetScalarType<T[P], GeftResultGroupByOutputType[P]>
        }
      >
    >


  export type GeftResultSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    studentId?: boolean
    score?: boolean
    cognitiveStyle?: boolean
    completedAt?: boolean
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["geftResult"]>

  export type GeftResultSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    studentId?: boolean
    score?: boolean
    cognitiveStyle?: boolean
    completedAt?: boolean
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["geftResult"]>

  export type GeftResultSelectScalar = {
    id?: boolean
    studentId?: boolean
    score?: boolean
    cognitiveStyle?: boolean
    completedAt?: boolean
  }

  export type GeftResultInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }
  export type GeftResultIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }

  export type $GeftResultPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GeftResult"
    objects: {
      student: Prisma.$StudentPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      studentId: string
      score: number
      cognitiveStyle: $Enums.CognitiveStyle
      completedAt: Date
    }, ExtArgs["result"]["geftResult"]>
    composites: {}
  }

  type GeftResultGetPayload<S extends boolean | null | undefined | GeftResultDefaultArgs> = $Result.GetResult<Prisma.$GeftResultPayload, S>

  type GeftResultCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<GeftResultFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: GeftResultCountAggregateInputType | true
    }

  export interface GeftResultDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GeftResult'], meta: { name: 'GeftResult' } }
    /**
     * Find zero or one GeftResult that matches the filter.
     * @param {GeftResultFindUniqueArgs} args - Arguments to find a GeftResult
     * @example
     * // Get one GeftResult
     * const geftResult = await prisma.geftResult.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GeftResultFindUniqueArgs>(args: SelectSubset<T, GeftResultFindUniqueArgs<ExtArgs>>): Prisma__GeftResultClient<$Result.GetResult<Prisma.$GeftResultPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one GeftResult that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {GeftResultFindUniqueOrThrowArgs} args - Arguments to find a GeftResult
     * @example
     * // Get one GeftResult
     * const geftResult = await prisma.geftResult.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GeftResultFindUniqueOrThrowArgs>(args: SelectSubset<T, GeftResultFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GeftResultClient<$Result.GetResult<Prisma.$GeftResultPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first GeftResult that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GeftResultFindFirstArgs} args - Arguments to find a GeftResult
     * @example
     * // Get one GeftResult
     * const geftResult = await prisma.geftResult.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GeftResultFindFirstArgs>(args?: SelectSubset<T, GeftResultFindFirstArgs<ExtArgs>>): Prisma__GeftResultClient<$Result.GetResult<Prisma.$GeftResultPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first GeftResult that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GeftResultFindFirstOrThrowArgs} args - Arguments to find a GeftResult
     * @example
     * // Get one GeftResult
     * const geftResult = await prisma.geftResult.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GeftResultFindFirstOrThrowArgs>(args?: SelectSubset<T, GeftResultFindFirstOrThrowArgs<ExtArgs>>): Prisma__GeftResultClient<$Result.GetResult<Prisma.$GeftResultPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more GeftResults that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GeftResultFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GeftResults
     * const geftResults = await prisma.geftResult.findMany()
     * 
     * // Get first 10 GeftResults
     * const geftResults = await prisma.geftResult.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const geftResultWithIdOnly = await prisma.geftResult.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GeftResultFindManyArgs>(args?: SelectSubset<T, GeftResultFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GeftResultPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a GeftResult.
     * @param {GeftResultCreateArgs} args - Arguments to create a GeftResult.
     * @example
     * // Create one GeftResult
     * const GeftResult = await prisma.geftResult.create({
     *   data: {
     *     // ... data to create a GeftResult
     *   }
     * })
     * 
     */
    create<T extends GeftResultCreateArgs>(args: SelectSubset<T, GeftResultCreateArgs<ExtArgs>>): Prisma__GeftResultClient<$Result.GetResult<Prisma.$GeftResultPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many GeftResults.
     * @param {GeftResultCreateManyArgs} args - Arguments to create many GeftResults.
     * @example
     * // Create many GeftResults
     * const geftResult = await prisma.geftResult.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GeftResultCreateManyArgs>(args?: SelectSubset<T, GeftResultCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GeftResults and returns the data saved in the database.
     * @param {GeftResultCreateManyAndReturnArgs} args - Arguments to create many GeftResults.
     * @example
     * // Create many GeftResults
     * const geftResult = await prisma.geftResult.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GeftResults and only return the `id`
     * const geftResultWithIdOnly = await prisma.geftResult.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GeftResultCreateManyAndReturnArgs>(args?: SelectSubset<T, GeftResultCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GeftResultPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a GeftResult.
     * @param {GeftResultDeleteArgs} args - Arguments to delete one GeftResult.
     * @example
     * // Delete one GeftResult
     * const GeftResult = await prisma.geftResult.delete({
     *   where: {
     *     // ... filter to delete one GeftResult
     *   }
     * })
     * 
     */
    delete<T extends GeftResultDeleteArgs>(args: SelectSubset<T, GeftResultDeleteArgs<ExtArgs>>): Prisma__GeftResultClient<$Result.GetResult<Prisma.$GeftResultPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one GeftResult.
     * @param {GeftResultUpdateArgs} args - Arguments to update one GeftResult.
     * @example
     * // Update one GeftResult
     * const geftResult = await prisma.geftResult.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GeftResultUpdateArgs>(args: SelectSubset<T, GeftResultUpdateArgs<ExtArgs>>): Prisma__GeftResultClient<$Result.GetResult<Prisma.$GeftResultPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more GeftResults.
     * @param {GeftResultDeleteManyArgs} args - Arguments to filter GeftResults to delete.
     * @example
     * // Delete a few GeftResults
     * const { count } = await prisma.geftResult.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GeftResultDeleteManyArgs>(args?: SelectSubset<T, GeftResultDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GeftResults.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GeftResultUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GeftResults
     * const geftResult = await prisma.geftResult.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GeftResultUpdateManyArgs>(args: SelectSubset<T, GeftResultUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one GeftResult.
     * @param {GeftResultUpsertArgs} args - Arguments to update or create a GeftResult.
     * @example
     * // Update or create a GeftResult
     * const geftResult = await prisma.geftResult.upsert({
     *   create: {
     *     // ... data to create a GeftResult
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GeftResult we want to update
     *   }
     * })
     */
    upsert<T extends GeftResultUpsertArgs>(args: SelectSubset<T, GeftResultUpsertArgs<ExtArgs>>): Prisma__GeftResultClient<$Result.GetResult<Prisma.$GeftResultPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of GeftResults.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GeftResultCountArgs} args - Arguments to filter GeftResults to count.
     * @example
     * // Count the number of GeftResults
     * const count = await prisma.geftResult.count({
     *   where: {
     *     // ... the filter for the GeftResults we want to count
     *   }
     * })
    **/
    count<T extends GeftResultCountArgs>(
      args?: Subset<T, GeftResultCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GeftResultCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GeftResult.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GeftResultAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GeftResultAggregateArgs>(args: Subset<T, GeftResultAggregateArgs>): Prisma.PrismaPromise<GetGeftResultAggregateType<T>>

    /**
     * Group by GeftResult.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GeftResultGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GeftResultGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GeftResultGroupByArgs['orderBy'] }
        : { orderBy?: GeftResultGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GeftResultGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGeftResultGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GeftResult model
   */
  readonly fields: GeftResultFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GeftResult.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GeftResultClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    student<T extends StudentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, StudentDefaultArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GeftResult model
   */ 
  interface GeftResultFieldRefs {
    readonly id: FieldRef<"GeftResult", 'String'>
    readonly studentId: FieldRef<"GeftResult", 'String'>
    readonly score: FieldRef<"GeftResult", 'Int'>
    readonly cognitiveStyle: FieldRef<"GeftResult", 'CognitiveStyle'>
    readonly completedAt: FieldRef<"GeftResult", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GeftResult findUnique
   */
  export type GeftResultFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeftResult
     */
    select?: GeftResultSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GeftResultInclude<ExtArgs> | null
    /**
     * Filter, which GeftResult to fetch.
     */
    where: GeftResultWhereUniqueInput
  }

  /**
   * GeftResult findUniqueOrThrow
   */
  export type GeftResultFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeftResult
     */
    select?: GeftResultSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GeftResultInclude<ExtArgs> | null
    /**
     * Filter, which GeftResult to fetch.
     */
    where: GeftResultWhereUniqueInput
  }

  /**
   * GeftResult findFirst
   */
  export type GeftResultFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeftResult
     */
    select?: GeftResultSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GeftResultInclude<ExtArgs> | null
    /**
     * Filter, which GeftResult to fetch.
     */
    where?: GeftResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GeftResults to fetch.
     */
    orderBy?: GeftResultOrderByWithRelationInput | GeftResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GeftResults.
     */
    cursor?: GeftResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GeftResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GeftResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GeftResults.
     */
    distinct?: GeftResultScalarFieldEnum | GeftResultScalarFieldEnum[]
  }

  /**
   * GeftResult findFirstOrThrow
   */
  export type GeftResultFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeftResult
     */
    select?: GeftResultSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GeftResultInclude<ExtArgs> | null
    /**
     * Filter, which GeftResult to fetch.
     */
    where?: GeftResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GeftResults to fetch.
     */
    orderBy?: GeftResultOrderByWithRelationInput | GeftResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GeftResults.
     */
    cursor?: GeftResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GeftResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GeftResults.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GeftResults.
     */
    distinct?: GeftResultScalarFieldEnum | GeftResultScalarFieldEnum[]
  }

  /**
   * GeftResult findMany
   */
  export type GeftResultFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeftResult
     */
    select?: GeftResultSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GeftResultInclude<ExtArgs> | null
    /**
     * Filter, which GeftResults to fetch.
     */
    where?: GeftResultWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GeftResults to fetch.
     */
    orderBy?: GeftResultOrderByWithRelationInput | GeftResultOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GeftResults.
     */
    cursor?: GeftResultWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GeftResults from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GeftResults.
     */
    skip?: number
    distinct?: GeftResultScalarFieldEnum | GeftResultScalarFieldEnum[]
  }

  /**
   * GeftResult create
   */
  export type GeftResultCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeftResult
     */
    select?: GeftResultSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GeftResultInclude<ExtArgs> | null
    /**
     * The data needed to create a GeftResult.
     */
    data: XOR<GeftResultCreateInput, GeftResultUncheckedCreateInput>
  }

  /**
   * GeftResult createMany
   */
  export type GeftResultCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GeftResults.
     */
    data: GeftResultCreateManyInput | GeftResultCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GeftResult createManyAndReturn
   */
  export type GeftResultCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeftResult
     */
    select?: GeftResultSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many GeftResults.
     */
    data: GeftResultCreateManyInput | GeftResultCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GeftResultIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * GeftResult update
   */
  export type GeftResultUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeftResult
     */
    select?: GeftResultSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GeftResultInclude<ExtArgs> | null
    /**
     * The data needed to update a GeftResult.
     */
    data: XOR<GeftResultUpdateInput, GeftResultUncheckedUpdateInput>
    /**
     * Choose, which GeftResult to update.
     */
    where: GeftResultWhereUniqueInput
  }

  /**
   * GeftResult updateMany
   */
  export type GeftResultUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GeftResults.
     */
    data: XOR<GeftResultUpdateManyMutationInput, GeftResultUncheckedUpdateManyInput>
    /**
     * Filter which GeftResults to update
     */
    where?: GeftResultWhereInput
  }

  /**
   * GeftResult upsert
   */
  export type GeftResultUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeftResult
     */
    select?: GeftResultSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GeftResultInclude<ExtArgs> | null
    /**
     * The filter to search for the GeftResult to update in case it exists.
     */
    where: GeftResultWhereUniqueInput
    /**
     * In case the GeftResult found by the `where` argument doesn't exist, create a new GeftResult with this data.
     */
    create: XOR<GeftResultCreateInput, GeftResultUncheckedCreateInput>
    /**
     * In case the GeftResult was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GeftResultUpdateInput, GeftResultUncheckedUpdateInput>
  }

  /**
   * GeftResult delete
   */
  export type GeftResultDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeftResult
     */
    select?: GeftResultSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GeftResultInclude<ExtArgs> | null
    /**
     * Filter which GeftResult to delete.
     */
    where: GeftResultWhereUniqueInput
  }

  /**
   * GeftResult deleteMany
   */
  export type GeftResultDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GeftResults to delete
     */
    where?: GeftResultWhereInput
  }

  /**
   * GeftResult without action
   */
  export type GeftResultDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GeftResult
     */
    select?: GeftResultSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GeftResultInclude<ExtArgs> | null
  }


  /**
   * Model GameSession
   */

  export type AggregateGameSession = {
    _count: GameSessionCountAggregateOutputType | null
    _avg: GameSessionAvgAggregateOutputType | null
    _sum: GameSessionSumAggregateOutputType | null
    _min: GameSessionMinAggregateOutputType | null
    _max: GameSessionMaxAggregateOutputType | null
  }

  export type GameSessionAvgAggregateOutputType = {
    levelId: number | null
    xpEarned: number | null
    livesRemaining: number | null
    timeTaken: number | null
  }

  export type GameSessionSumAggregateOutputType = {
    levelId: number | null
    xpEarned: number | null
    livesRemaining: number | null
    timeTaken: number | null
  }

  export type GameSessionMinAggregateOutputType = {
    id: string | null
    studentId: string | null
    levelId: number | null
    cognitiveStyle: string | null
    xpEarned: number | null
    livesRemaining: number | null
    timeTaken: number | null
    verdictAnswer: string | null
    isCorrect: boolean | null
    createdAt: Date | null
  }

  export type GameSessionMaxAggregateOutputType = {
    id: string | null
    studentId: string | null
    levelId: number | null
    cognitiveStyle: string | null
    xpEarned: number | null
    livesRemaining: number | null
    timeTaken: number | null
    verdictAnswer: string | null
    isCorrect: boolean | null
    createdAt: Date | null
  }

  export type GameSessionCountAggregateOutputType = {
    id: number
    studentId: number
    levelId: number
    cognitiveStyle: number
    xpEarned: number
    livesRemaining: number
    timeTaken: number
    verdictAnswer: number
    isCorrect: number
    createdAt: number
    _all: number
  }


  export type GameSessionAvgAggregateInputType = {
    levelId?: true
    xpEarned?: true
    livesRemaining?: true
    timeTaken?: true
  }

  export type GameSessionSumAggregateInputType = {
    levelId?: true
    xpEarned?: true
    livesRemaining?: true
    timeTaken?: true
  }

  export type GameSessionMinAggregateInputType = {
    id?: true
    studentId?: true
    levelId?: true
    cognitiveStyle?: true
    xpEarned?: true
    livesRemaining?: true
    timeTaken?: true
    verdictAnswer?: true
    isCorrect?: true
    createdAt?: true
  }

  export type GameSessionMaxAggregateInputType = {
    id?: true
    studentId?: true
    levelId?: true
    cognitiveStyle?: true
    xpEarned?: true
    livesRemaining?: true
    timeTaken?: true
    verdictAnswer?: true
    isCorrect?: true
    createdAt?: true
  }

  export type GameSessionCountAggregateInputType = {
    id?: true
    studentId?: true
    levelId?: true
    cognitiveStyle?: true
    xpEarned?: true
    livesRemaining?: true
    timeTaken?: true
    verdictAnswer?: true
    isCorrect?: true
    createdAt?: true
    _all?: true
  }

  export type GameSessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GameSession to aggregate.
     */
    where?: GameSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameSessions to fetch.
     */
    orderBy?: GameSessionOrderByWithRelationInput | GameSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GameSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GameSessions
    **/
    _count?: true | GameSessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GameSessionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GameSessionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GameSessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GameSessionMaxAggregateInputType
  }

  export type GetGameSessionAggregateType<T extends GameSessionAggregateArgs> = {
        [P in keyof T & keyof AggregateGameSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGameSession[P]>
      : GetScalarType<T[P], AggregateGameSession[P]>
  }




  export type GameSessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GameSessionWhereInput
    orderBy?: GameSessionOrderByWithAggregationInput | GameSessionOrderByWithAggregationInput[]
    by: GameSessionScalarFieldEnum[] | GameSessionScalarFieldEnum
    having?: GameSessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GameSessionCountAggregateInputType | true
    _avg?: GameSessionAvgAggregateInputType
    _sum?: GameSessionSumAggregateInputType
    _min?: GameSessionMinAggregateInputType
    _max?: GameSessionMaxAggregateInputType
  }

  export type GameSessionGroupByOutputType = {
    id: string
    studentId: string
    levelId: number
    cognitiveStyle: string
    xpEarned: number
    livesRemaining: number
    timeTaken: number
    verdictAnswer: string
    isCorrect: boolean
    createdAt: Date
    _count: GameSessionCountAggregateOutputType | null
    _avg: GameSessionAvgAggregateOutputType | null
    _sum: GameSessionSumAggregateOutputType | null
    _min: GameSessionMinAggregateOutputType | null
    _max: GameSessionMaxAggregateOutputType | null
  }

  type GetGameSessionGroupByPayload<T extends GameSessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GameSessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GameSessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GameSessionGroupByOutputType[P]>
            : GetScalarType<T[P], GameSessionGroupByOutputType[P]>
        }
      >
    >


  export type GameSessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    studentId?: boolean
    levelId?: boolean
    cognitiveStyle?: boolean
    xpEarned?: boolean
    livesRemaining?: boolean
    timeTaken?: boolean
    verdictAnswer?: boolean
    isCorrect?: boolean
    createdAt?: boolean
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["gameSession"]>

  export type GameSessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    studentId?: boolean
    levelId?: boolean
    cognitiveStyle?: boolean
    xpEarned?: boolean
    livesRemaining?: boolean
    timeTaken?: boolean
    verdictAnswer?: boolean
    isCorrect?: boolean
    createdAt?: boolean
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["gameSession"]>

  export type GameSessionSelectScalar = {
    id?: boolean
    studentId?: boolean
    levelId?: boolean
    cognitiveStyle?: boolean
    xpEarned?: boolean
    livesRemaining?: boolean
    timeTaken?: boolean
    verdictAnswer?: boolean
    isCorrect?: boolean
    createdAt?: boolean
  }

  export type GameSessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }
  export type GameSessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }

  export type $GameSessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GameSession"
    objects: {
      student: Prisma.$StudentPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      studentId: string
      levelId: number
      cognitiveStyle: string
      xpEarned: number
      livesRemaining: number
      timeTaken: number
      verdictAnswer: string
      isCorrect: boolean
      createdAt: Date
    }, ExtArgs["result"]["gameSession"]>
    composites: {}
  }

  type GameSessionGetPayload<S extends boolean | null | undefined | GameSessionDefaultArgs> = $Result.GetResult<Prisma.$GameSessionPayload, S>

  type GameSessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<GameSessionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: GameSessionCountAggregateInputType | true
    }

  export interface GameSessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GameSession'], meta: { name: 'GameSession' } }
    /**
     * Find zero or one GameSession that matches the filter.
     * @param {GameSessionFindUniqueArgs} args - Arguments to find a GameSession
     * @example
     * // Get one GameSession
     * const gameSession = await prisma.gameSession.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GameSessionFindUniqueArgs>(args: SelectSubset<T, GameSessionFindUniqueArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one GameSession that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {GameSessionFindUniqueOrThrowArgs} args - Arguments to find a GameSession
     * @example
     * // Get one GameSession
     * const gameSession = await prisma.gameSession.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GameSessionFindUniqueOrThrowArgs>(args: SelectSubset<T, GameSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first GameSession that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameSessionFindFirstArgs} args - Arguments to find a GameSession
     * @example
     * // Get one GameSession
     * const gameSession = await prisma.gameSession.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GameSessionFindFirstArgs>(args?: SelectSubset<T, GameSessionFindFirstArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first GameSession that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameSessionFindFirstOrThrowArgs} args - Arguments to find a GameSession
     * @example
     * // Get one GameSession
     * const gameSession = await prisma.gameSession.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GameSessionFindFirstOrThrowArgs>(args?: SelectSubset<T, GameSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more GameSessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameSessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GameSessions
     * const gameSessions = await prisma.gameSession.findMany()
     * 
     * // Get first 10 GameSessions
     * const gameSessions = await prisma.gameSession.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const gameSessionWithIdOnly = await prisma.gameSession.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GameSessionFindManyArgs>(args?: SelectSubset<T, GameSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a GameSession.
     * @param {GameSessionCreateArgs} args - Arguments to create a GameSession.
     * @example
     * // Create one GameSession
     * const GameSession = await prisma.gameSession.create({
     *   data: {
     *     // ... data to create a GameSession
     *   }
     * })
     * 
     */
    create<T extends GameSessionCreateArgs>(args: SelectSubset<T, GameSessionCreateArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many GameSessions.
     * @param {GameSessionCreateManyArgs} args - Arguments to create many GameSessions.
     * @example
     * // Create many GameSessions
     * const gameSession = await prisma.gameSession.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GameSessionCreateManyArgs>(args?: SelectSubset<T, GameSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GameSessions and returns the data saved in the database.
     * @param {GameSessionCreateManyAndReturnArgs} args - Arguments to create many GameSessions.
     * @example
     * // Create many GameSessions
     * const gameSession = await prisma.gameSession.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GameSessions and only return the `id`
     * const gameSessionWithIdOnly = await prisma.gameSession.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GameSessionCreateManyAndReturnArgs>(args?: SelectSubset<T, GameSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a GameSession.
     * @param {GameSessionDeleteArgs} args - Arguments to delete one GameSession.
     * @example
     * // Delete one GameSession
     * const GameSession = await prisma.gameSession.delete({
     *   where: {
     *     // ... filter to delete one GameSession
     *   }
     * })
     * 
     */
    delete<T extends GameSessionDeleteArgs>(args: SelectSubset<T, GameSessionDeleteArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one GameSession.
     * @param {GameSessionUpdateArgs} args - Arguments to update one GameSession.
     * @example
     * // Update one GameSession
     * const gameSession = await prisma.gameSession.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GameSessionUpdateArgs>(args: SelectSubset<T, GameSessionUpdateArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more GameSessions.
     * @param {GameSessionDeleteManyArgs} args - Arguments to filter GameSessions to delete.
     * @example
     * // Delete a few GameSessions
     * const { count } = await prisma.gameSession.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GameSessionDeleteManyArgs>(args?: SelectSubset<T, GameSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GameSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameSessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GameSessions
     * const gameSession = await prisma.gameSession.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GameSessionUpdateManyArgs>(args: SelectSubset<T, GameSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one GameSession.
     * @param {GameSessionUpsertArgs} args - Arguments to update or create a GameSession.
     * @example
     * // Update or create a GameSession
     * const gameSession = await prisma.gameSession.upsert({
     *   create: {
     *     // ... data to create a GameSession
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GameSession we want to update
     *   }
     * })
     */
    upsert<T extends GameSessionUpsertArgs>(args: SelectSubset<T, GameSessionUpsertArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of GameSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameSessionCountArgs} args - Arguments to filter GameSessions to count.
     * @example
     * // Count the number of GameSessions
     * const count = await prisma.gameSession.count({
     *   where: {
     *     // ... the filter for the GameSessions we want to count
     *   }
     * })
    **/
    count<T extends GameSessionCountArgs>(
      args?: Subset<T, GameSessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GameSessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GameSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameSessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GameSessionAggregateArgs>(args: Subset<T, GameSessionAggregateArgs>): Prisma.PrismaPromise<GetGameSessionAggregateType<T>>

    /**
     * Group by GameSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameSessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GameSessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GameSessionGroupByArgs['orderBy'] }
        : { orderBy?: GameSessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GameSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGameSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GameSession model
   */
  readonly fields: GameSessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GameSession.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GameSessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    student<T extends StudentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, StudentDefaultArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GameSession model
   */ 
  interface GameSessionFieldRefs {
    readonly id: FieldRef<"GameSession", 'String'>
    readonly studentId: FieldRef<"GameSession", 'String'>
    readonly levelId: FieldRef<"GameSession", 'Int'>
    readonly cognitiveStyle: FieldRef<"GameSession", 'String'>
    readonly xpEarned: FieldRef<"GameSession", 'Int'>
    readonly livesRemaining: FieldRef<"GameSession", 'Int'>
    readonly timeTaken: FieldRef<"GameSession", 'Int'>
    readonly verdictAnswer: FieldRef<"GameSession", 'String'>
    readonly isCorrect: FieldRef<"GameSession", 'Boolean'>
    readonly createdAt: FieldRef<"GameSession", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GameSession findUnique
   */
  export type GameSessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * Filter, which GameSession to fetch.
     */
    where: GameSessionWhereUniqueInput
  }

  /**
   * GameSession findUniqueOrThrow
   */
  export type GameSessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * Filter, which GameSession to fetch.
     */
    where: GameSessionWhereUniqueInput
  }

  /**
   * GameSession findFirst
   */
  export type GameSessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * Filter, which GameSession to fetch.
     */
    where?: GameSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameSessions to fetch.
     */
    orderBy?: GameSessionOrderByWithRelationInput | GameSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GameSessions.
     */
    cursor?: GameSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GameSessions.
     */
    distinct?: GameSessionScalarFieldEnum | GameSessionScalarFieldEnum[]
  }

  /**
   * GameSession findFirstOrThrow
   */
  export type GameSessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * Filter, which GameSession to fetch.
     */
    where?: GameSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameSessions to fetch.
     */
    orderBy?: GameSessionOrderByWithRelationInput | GameSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GameSessions.
     */
    cursor?: GameSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GameSessions.
     */
    distinct?: GameSessionScalarFieldEnum | GameSessionScalarFieldEnum[]
  }

  /**
   * GameSession findMany
   */
  export type GameSessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * Filter, which GameSessions to fetch.
     */
    where?: GameSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameSessions to fetch.
     */
    orderBy?: GameSessionOrderByWithRelationInput | GameSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GameSessions.
     */
    cursor?: GameSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameSessions.
     */
    skip?: number
    distinct?: GameSessionScalarFieldEnum | GameSessionScalarFieldEnum[]
  }

  /**
   * GameSession create
   */
  export type GameSessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * The data needed to create a GameSession.
     */
    data: XOR<GameSessionCreateInput, GameSessionUncheckedCreateInput>
  }

  /**
   * GameSession createMany
   */
  export type GameSessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GameSessions.
     */
    data: GameSessionCreateManyInput | GameSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GameSession createManyAndReturn
   */
  export type GameSessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many GameSessions.
     */
    data: GameSessionCreateManyInput | GameSessionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * GameSession update
   */
  export type GameSessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * The data needed to update a GameSession.
     */
    data: XOR<GameSessionUpdateInput, GameSessionUncheckedUpdateInput>
    /**
     * Choose, which GameSession to update.
     */
    where: GameSessionWhereUniqueInput
  }

  /**
   * GameSession updateMany
   */
  export type GameSessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GameSessions.
     */
    data: XOR<GameSessionUpdateManyMutationInput, GameSessionUncheckedUpdateManyInput>
    /**
     * Filter which GameSessions to update
     */
    where?: GameSessionWhereInput
  }

  /**
   * GameSession upsert
   */
  export type GameSessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * The filter to search for the GameSession to update in case it exists.
     */
    where: GameSessionWhereUniqueInput
    /**
     * In case the GameSession found by the `where` argument doesn't exist, create a new GameSession with this data.
     */
    create: XOR<GameSessionCreateInput, GameSessionUncheckedCreateInput>
    /**
     * In case the GameSession was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GameSessionUpdateInput, GameSessionUncheckedUpdateInput>
  }

  /**
   * GameSession delete
   */
  export type GameSessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * Filter which GameSession to delete.
     */
    where: GameSessionWhereUniqueInput
  }

  /**
   * GameSession deleteMany
   */
  export type GameSessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GameSessions to delete
     */
    where?: GameSessionWhereInput
  }

  /**
   * GameSession without action
   */
  export type GameSessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
  }


  /**
   * Model Leaderboard
   */

  export type AggregateLeaderboard = {
    _count: LeaderboardCountAggregateOutputType | null
    _avg: LeaderboardAvgAggregateOutputType | null
    _sum: LeaderboardSumAggregateOutputType | null
    _min: LeaderboardMinAggregateOutputType | null
    _max: LeaderboardMaxAggregateOutputType | null
  }

  export type LeaderboardAvgAggregateOutputType = {
    totalXp: number | null
  }

  export type LeaderboardSumAggregateOutputType = {
    totalXp: number | null
  }

  export type LeaderboardMinAggregateOutputType = {
    id: string | null
    studentId: string | null
    username: string | null
    totalXp: number | null
    updatedAt: Date | null
  }

  export type LeaderboardMaxAggregateOutputType = {
    id: string | null
    studentId: string | null
    username: string | null
    totalXp: number | null
    updatedAt: Date | null
  }

  export type LeaderboardCountAggregateOutputType = {
    id: number
    studentId: number
    username: number
    totalXp: number
    badges: number
    updatedAt: number
    _all: number
  }


  export type LeaderboardAvgAggregateInputType = {
    totalXp?: true
  }

  export type LeaderboardSumAggregateInputType = {
    totalXp?: true
  }

  export type LeaderboardMinAggregateInputType = {
    id?: true
    studentId?: true
    username?: true
    totalXp?: true
    updatedAt?: true
  }

  export type LeaderboardMaxAggregateInputType = {
    id?: true
    studentId?: true
    username?: true
    totalXp?: true
    updatedAt?: true
  }

  export type LeaderboardCountAggregateInputType = {
    id?: true
    studentId?: true
    username?: true
    totalXp?: true
    badges?: true
    updatedAt?: true
    _all?: true
  }

  export type LeaderboardAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Leaderboard to aggregate.
     */
    where?: LeaderboardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Leaderboards to fetch.
     */
    orderBy?: LeaderboardOrderByWithRelationInput | LeaderboardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LeaderboardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Leaderboards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Leaderboards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Leaderboards
    **/
    _count?: true | LeaderboardCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LeaderboardAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LeaderboardSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LeaderboardMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LeaderboardMaxAggregateInputType
  }

  export type GetLeaderboardAggregateType<T extends LeaderboardAggregateArgs> = {
        [P in keyof T & keyof AggregateLeaderboard]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLeaderboard[P]>
      : GetScalarType<T[P], AggregateLeaderboard[P]>
  }




  export type LeaderboardGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LeaderboardWhereInput
    orderBy?: LeaderboardOrderByWithAggregationInput | LeaderboardOrderByWithAggregationInput[]
    by: LeaderboardScalarFieldEnum[] | LeaderboardScalarFieldEnum
    having?: LeaderboardScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LeaderboardCountAggregateInputType | true
    _avg?: LeaderboardAvgAggregateInputType
    _sum?: LeaderboardSumAggregateInputType
    _min?: LeaderboardMinAggregateInputType
    _max?: LeaderboardMaxAggregateInputType
  }

  export type LeaderboardGroupByOutputType = {
    id: string
    studentId: string
    username: string
    totalXp: number
    badges: string[]
    updatedAt: Date
    _count: LeaderboardCountAggregateOutputType | null
    _avg: LeaderboardAvgAggregateOutputType | null
    _sum: LeaderboardSumAggregateOutputType | null
    _min: LeaderboardMinAggregateOutputType | null
    _max: LeaderboardMaxAggregateOutputType | null
  }

  type GetLeaderboardGroupByPayload<T extends LeaderboardGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LeaderboardGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LeaderboardGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LeaderboardGroupByOutputType[P]>
            : GetScalarType<T[P], LeaderboardGroupByOutputType[P]>
        }
      >
    >


  export type LeaderboardSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    studentId?: boolean
    username?: boolean
    totalXp?: boolean
    badges?: boolean
    updatedAt?: boolean
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["leaderboard"]>

  export type LeaderboardSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    studentId?: boolean
    username?: boolean
    totalXp?: boolean
    badges?: boolean
    updatedAt?: boolean
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["leaderboard"]>

  export type LeaderboardSelectScalar = {
    id?: boolean
    studentId?: boolean
    username?: boolean
    totalXp?: boolean
    badges?: boolean
    updatedAt?: boolean
  }

  export type LeaderboardInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }
  export type LeaderboardIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }

  export type $LeaderboardPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Leaderboard"
    objects: {
      student: Prisma.$StudentPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      studentId: string
      username: string
      totalXp: number
      badges: string[]
      updatedAt: Date
    }, ExtArgs["result"]["leaderboard"]>
    composites: {}
  }

  type LeaderboardGetPayload<S extends boolean | null | undefined | LeaderboardDefaultArgs> = $Result.GetResult<Prisma.$LeaderboardPayload, S>

  type LeaderboardCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<LeaderboardFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: LeaderboardCountAggregateInputType | true
    }

  export interface LeaderboardDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Leaderboard'], meta: { name: 'Leaderboard' } }
    /**
     * Find zero or one Leaderboard that matches the filter.
     * @param {LeaderboardFindUniqueArgs} args - Arguments to find a Leaderboard
     * @example
     * // Get one Leaderboard
     * const leaderboard = await prisma.leaderboard.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LeaderboardFindUniqueArgs>(args: SelectSubset<T, LeaderboardFindUniqueArgs<ExtArgs>>): Prisma__LeaderboardClient<$Result.GetResult<Prisma.$LeaderboardPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Leaderboard that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {LeaderboardFindUniqueOrThrowArgs} args - Arguments to find a Leaderboard
     * @example
     * // Get one Leaderboard
     * const leaderboard = await prisma.leaderboard.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LeaderboardFindUniqueOrThrowArgs>(args: SelectSubset<T, LeaderboardFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LeaderboardClient<$Result.GetResult<Prisma.$LeaderboardPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Leaderboard that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeaderboardFindFirstArgs} args - Arguments to find a Leaderboard
     * @example
     * // Get one Leaderboard
     * const leaderboard = await prisma.leaderboard.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LeaderboardFindFirstArgs>(args?: SelectSubset<T, LeaderboardFindFirstArgs<ExtArgs>>): Prisma__LeaderboardClient<$Result.GetResult<Prisma.$LeaderboardPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Leaderboard that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeaderboardFindFirstOrThrowArgs} args - Arguments to find a Leaderboard
     * @example
     * // Get one Leaderboard
     * const leaderboard = await prisma.leaderboard.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LeaderboardFindFirstOrThrowArgs>(args?: SelectSubset<T, LeaderboardFindFirstOrThrowArgs<ExtArgs>>): Prisma__LeaderboardClient<$Result.GetResult<Prisma.$LeaderboardPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Leaderboards that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeaderboardFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Leaderboards
     * const leaderboards = await prisma.leaderboard.findMany()
     * 
     * // Get first 10 Leaderboards
     * const leaderboards = await prisma.leaderboard.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const leaderboardWithIdOnly = await prisma.leaderboard.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LeaderboardFindManyArgs>(args?: SelectSubset<T, LeaderboardFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LeaderboardPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Leaderboard.
     * @param {LeaderboardCreateArgs} args - Arguments to create a Leaderboard.
     * @example
     * // Create one Leaderboard
     * const Leaderboard = await prisma.leaderboard.create({
     *   data: {
     *     // ... data to create a Leaderboard
     *   }
     * })
     * 
     */
    create<T extends LeaderboardCreateArgs>(args: SelectSubset<T, LeaderboardCreateArgs<ExtArgs>>): Prisma__LeaderboardClient<$Result.GetResult<Prisma.$LeaderboardPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Leaderboards.
     * @param {LeaderboardCreateManyArgs} args - Arguments to create many Leaderboards.
     * @example
     * // Create many Leaderboards
     * const leaderboard = await prisma.leaderboard.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LeaderboardCreateManyArgs>(args?: SelectSubset<T, LeaderboardCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Leaderboards and returns the data saved in the database.
     * @param {LeaderboardCreateManyAndReturnArgs} args - Arguments to create many Leaderboards.
     * @example
     * // Create many Leaderboards
     * const leaderboard = await prisma.leaderboard.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Leaderboards and only return the `id`
     * const leaderboardWithIdOnly = await prisma.leaderboard.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LeaderboardCreateManyAndReturnArgs>(args?: SelectSubset<T, LeaderboardCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LeaderboardPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Leaderboard.
     * @param {LeaderboardDeleteArgs} args - Arguments to delete one Leaderboard.
     * @example
     * // Delete one Leaderboard
     * const Leaderboard = await prisma.leaderboard.delete({
     *   where: {
     *     // ... filter to delete one Leaderboard
     *   }
     * })
     * 
     */
    delete<T extends LeaderboardDeleteArgs>(args: SelectSubset<T, LeaderboardDeleteArgs<ExtArgs>>): Prisma__LeaderboardClient<$Result.GetResult<Prisma.$LeaderboardPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Leaderboard.
     * @param {LeaderboardUpdateArgs} args - Arguments to update one Leaderboard.
     * @example
     * // Update one Leaderboard
     * const leaderboard = await prisma.leaderboard.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LeaderboardUpdateArgs>(args: SelectSubset<T, LeaderboardUpdateArgs<ExtArgs>>): Prisma__LeaderboardClient<$Result.GetResult<Prisma.$LeaderboardPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Leaderboards.
     * @param {LeaderboardDeleteManyArgs} args - Arguments to filter Leaderboards to delete.
     * @example
     * // Delete a few Leaderboards
     * const { count } = await prisma.leaderboard.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LeaderboardDeleteManyArgs>(args?: SelectSubset<T, LeaderboardDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Leaderboards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeaderboardUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Leaderboards
     * const leaderboard = await prisma.leaderboard.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LeaderboardUpdateManyArgs>(args: SelectSubset<T, LeaderboardUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Leaderboard.
     * @param {LeaderboardUpsertArgs} args - Arguments to update or create a Leaderboard.
     * @example
     * // Update or create a Leaderboard
     * const leaderboard = await prisma.leaderboard.upsert({
     *   create: {
     *     // ... data to create a Leaderboard
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Leaderboard we want to update
     *   }
     * })
     */
    upsert<T extends LeaderboardUpsertArgs>(args: SelectSubset<T, LeaderboardUpsertArgs<ExtArgs>>): Prisma__LeaderboardClient<$Result.GetResult<Prisma.$LeaderboardPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Leaderboards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeaderboardCountArgs} args - Arguments to filter Leaderboards to count.
     * @example
     * // Count the number of Leaderboards
     * const count = await prisma.leaderboard.count({
     *   where: {
     *     // ... the filter for the Leaderboards we want to count
     *   }
     * })
    **/
    count<T extends LeaderboardCountArgs>(
      args?: Subset<T, LeaderboardCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LeaderboardCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Leaderboard.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeaderboardAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LeaderboardAggregateArgs>(args: Subset<T, LeaderboardAggregateArgs>): Prisma.PrismaPromise<GetLeaderboardAggregateType<T>>

    /**
     * Group by Leaderboard.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LeaderboardGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LeaderboardGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LeaderboardGroupByArgs['orderBy'] }
        : { orderBy?: LeaderboardGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LeaderboardGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLeaderboardGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Leaderboard model
   */
  readonly fields: LeaderboardFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Leaderboard.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LeaderboardClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    student<T extends StudentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, StudentDefaultArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Leaderboard model
   */ 
  interface LeaderboardFieldRefs {
    readonly id: FieldRef<"Leaderboard", 'String'>
    readonly studentId: FieldRef<"Leaderboard", 'String'>
    readonly username: FieldRef<"Leaderboard", 'String'>
    readonly totalXp: FieldRef<"Leaderboard", 'Int'>
    readonly badges: FieldRef<"Leaderboard", 'String[]'>
    readonly updatedAt: FieldRef<"Leaderboard", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Leaderboard findUnique
   */
  export type LeaderboardFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Leaderboard
     */
    select?: LeaderboardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeaderboardInclude<ExtArgs> | null
    /**
     * Filter, which Leaderboard to fetch.
     */
    where: LeaderboardWhereUniqueInput
  }

  /**
   * Leaderboard findUniqueOrThrow
   */
  export type LeaderboardFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Leaderboard
     */
    select?: LeaderboardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeaderboardInclude<ExtArgs> | null
    /**
     * Filter, which Leaderboard to fetch.
     */
    where: LeaderboardWhereUniqueInput
  }

  /**
   * Leaderboard findFirst
   */
  export type LeaderboardFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Leaderboard
     */
    select?: LeaderboardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeaderboardInclude<ExtArgs> | null
    /**
     * Filter, which Leaderboard to fetch.
     */
    where?: LeaderboardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Leaderboards to fetch.
     */
    orderBy?: LeaderboardOrderByWithRelationInput | LeaderboardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Leaderboards.
     */
    cursor?: LeaderboardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Leaderboards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Leaderboards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Leaderboards.
     */
    distinct?: LeaderboardScalarFieldEnum | LeaderboardScalarFieldEnum[]
  }

  /**
   * Leaderboard findFirstOrThrow
   */
  export type LeaderboardFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Leaderboard
     */
    select?: LeaderboardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeaderboardInclude<ExtArgs> | null
    /**
     * Filter, which Leaderboard to fetch.
     */
    where?: LeaderboardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Leaderboards to fetch.
     */
    orderBy?: LeaderboardOrderByWithRelationInput | LeaderboardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Leaderboards.
     */
    cursor?: LeaderboardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Leaderboards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Leaderboards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Leaderboards.
     */
    distinct?: LeaderboardScalarFieldEnum | LeaderboardScalarFieldEnum[]
  }

  /**
   * Leaderboard findMany
   */
  export type LeaderboardFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Leaderboard
     */
    select?: LeaderboardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeaderboardInclude<ExtArgs> | null
    /**
     * Filter, which Leaderboards to fetch.
     */
    where?: LeaderboardWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Leaderboards to fetch.
     */
    orderBy?: LeaderboardOrderByWithRelationInput | LeaderboardOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Leaderboards.
     */
    cursor?: LeaderboardWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Leaderboards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Leaderboards.
     */
    skip?: number
    distinct?: LeaderboardScalarFieldEnum | LeaderboardScalarFieldEnum[]
  }

  /**
   * Leaderboard create
   */
  export type LeaderboardCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Leaderboard
     */
    select?: LeaderboardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeaderboardInclude<ExtArgs> | null
    /**
     * The data needed to create a Leaderboard.
     */
    data: XOR<LeaderboardCreateInput, LeaderboardUncheckedCreateInput>
  }

  /**
   * Leaderboard createMany
   */
  export type LeaderboardCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Leaderboards.
     */
    data: LeaderboardCreateManyInput | LeaderboardCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Leaderboard createManyAndReturn
   */
  export type LeaderboardCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Leaderboard
     */
    select?: LeaderboardSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Leaderboards.
     */
    data: LeaderboardCreateManyInput | LeaderboardCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeaderboardIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Leaderboard update
   */
  export type LeaderboardUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Leaderboard
     */
    select?: LeaderboardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeaderboardInclude<ExtArgs> | null
    /**
     * The data needed to update a Leaderboard.
     */
    data: XOR<LeaderboardUpdateInput, LeaderboardUncheckedUpdateInput>
    /**
     * Choose, which Leaderboard to update.
     */
    where: LeaderboardWhereUniqueInput
  }

  /**
   * Leaderboard updateMany
   */
  export type LeaderboardUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Leaderboards.
     */
    data: XOR<LeaderboardUpdateManyMutationInput, LeaderboardUncheckedUpdateManyInput>
    /**
     * Filter which Leaderboards to update
     */
    where?: LeaderboardWhereInput
  }

  /**
   * Leaderboard upsert
   */
  export type LeaderboardUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Leaderboard
     */
    select?: LeaderboardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeaderboardInclude<ExtArgs> | null
    /**
     * The filter to search for the Leaderboard to update in case it exists.
     */
    where: LeaderboardWhereUniqueInput
    /**
     * In case the Leaderboard found by the `where` argument doesn't exist, create a new Leaderboard with this data.
     */
    create: XOR<LeaderboardCreateInput, LeaderboardUncheckedCreateInput>
    /**
     * In case the Leaderboard was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LeaderboardUpdateInput, LeaderboardUncheckedUpdateInput>
  }

  /**
   * Leaderboard delete
   */
  export type LeaderboardDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Leaderboard
     */
    select?: LeaderboardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeaderboardInclude<ExtArgs> | null
    /**
     * Filter which Leaderboard to delete.
     */
    where: LeaderboardWhereUniqueInput
  }

  /**
   * Leaderboard deleteMany
   */
  export type LeaderboardDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Leaderboards to delete
     */
    where?: LeaderboardWhereInput
  }

  /**
   * Leaderboard without action
   */
  export type LeaderboardDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Leaderboard
     */
    select?: LeaderboardSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: LeaderboardInclude<ExtArgs> | null
  }


  /**
   * Model ChatbotKnowledge
   */

  export type AggregateChatbotKnowledge = {
    _count: ChatbotKnowledgeCountAggregateOutputType | null
    _min: ChatbotKnowledgeMinAggregateOutputType | null
    _max: ChatbotKnowledgeMaxAggregateOutputType | null
  }

  export type ChatbotKnowledgeMinAggregateOutputType = {
    id: string | null
    title: string | null
    content: string | null
    category: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ChatbotKnowledgeMaxAggregateOutputType = {
    id: string | null
    title: string | null
    content: string | null
    category: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ChatbotKnowledgeCountAggregateOutputType = {
    id: number
    title: number
    content: number
    category: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ChatbotKnowledgeMinAggregateInputType = {
    id?: true
    title?: true
    content?: true
    category?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ChatbotKnowledgeMaxAggregateInputType = {
    id?: true
    title?: true
    content?: true
    category?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ChatbotKnowledgeCountAggregateInputType = {
    id?: true
    title?: true
    content?: true
    category?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ChatbotKnowledgeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChatbotKnowledge to aggregate.
     */
    where?: ChatbotKnowledgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatbotKnowledges to fetch.
     */
    orderBy?: ChatbotKnowledgeOrderByWithRelationInput | ChatbotKnowledgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ChatbotKnowledgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatbotKnowledges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatbotKnowledges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ChatbotKnowledges
    **/
    _count?: true | ChatbotKnowledgeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ChatbotKnowledgeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ChatbotKnowledgeMaxAggregateInputType
  }

  export type GetChatbotKnowledgeAggregateType<T extends ChatbotKnowledgeAggregateArgs> = {
        [P in keyof T & keyof AggregateChatbotKnowledge]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateChatbotKnowledge[P]>
      : GetScalarType<T[P], AggregateChatbotKnowledge[P]>
  }




  export type ChatbotKnowledgeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChatbotKnowledgeWhereInput
    orderBy?: ChatbotKnowledgeOrderByWithAggregationInput | ChatbotKnowledgeOrderByWithAggregationInput[]
    by: ChatbotKnowledgeScalarFieldEnum[] | ChatbotKnowledgeScalarFieldEnum
    having?: ChatbotKnowledgeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ChatbotKnowledgeCountAggregateInputType | true
    _min?: ChatbotKnowledgeMinAggregateInputType
    _max?: ChatbotKnowledgeMaxAggregateInputType
  }

  export type ChatbotKnowledgeGroupByOutputType = {
    id: string
    title: string
    content: string
    category: string
    createdAt: Date
    updatedAt: Date
    _count: ChatbotKnowledgeCountAggregateOutputType | null
    _min: ChatbotKnowledgeMinAggregateOutputType | null
    _max: ChatbotKnowledgeMaxAggregateOutputType | null
  }

  type GetChatbotKnowledgeGroupByPayload<T extends ChatbotKnowledgeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ChatbotKnowledgeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ChatbotKnowledgeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ChatbotKnowledgeGroupByOutputType[P]>
            : GetScalarType<T[P], ChatbotKnowledgeGroupByOutputType[P]>
        }
      >
    >


  export type ChatbotKnowledgeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    content?: boolean
    category?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["chatbotKnowledge"]>

  export type ChatbotKnowledgeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    content?: boolean
    category?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["chatbotKnowledge"]>

  export type ChatbotKnowledgeSelectScalar = {
    id?: boolean
    title?: boolean
    content?: boolean
    category?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $ChatbotKnowledgePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ChatbotKnowledge"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      content: string
      category: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["chatbotKnowledge"]>
    composites: {}
  }

  type ChatbotKnowledgeGetPayload<S extends boolean | null | undefined | ChatbotKnowledgeDefaultArgs> = $Result.GetResult<Prisma.$ChatbotKnowledgePayload, S>

  type ChatbotKnowledgeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ChatbotKnowledgeFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ChatbotKnowledgeCountAggregateInputType | true
    }

  export interface ChatbotKnowledgeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ChatbotKnowledge'], meta: { name: 'ChatbotKnowledge' } }
    /**
     * Find zero or one ChatbotKnowledge that matches the filter.
     * @param {ChatbotKnowledgeFindUniqueArgs} args - Arguments to find a ChatbotKnowledge
     * @example
     * // Get one ChatbotKnowledge
     * const chatbotKnowledge = await prisma.chatbotKnowledge.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ChatbotKnowledgeFindUniqueArgs>(args: SelectSubset<T, ChatbotKnowledgeFindUniqueArgs<ExtArgs>>): Prisma__ChatbotKnowledgeClient<$Result.GetResult<Prisma.$ChatbotKnowledgePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ChatbotKnowledge that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ChatbotKnowledgeFindUniqueOrThrowArgs} args - Arguments to find a ChatbotKnowledge
     * @example
     * // Get one ChatbotKnowledge
     * const chatbotKnowledge = await prisma.chatbotKnowledge.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ChatbotKnowledgeFindUniqueOrThrowArgs>(args: SelectSubset<T, ChatbotKnowledgeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ChatbotKnowledgeClient<$Result.GetResult<Prisma.$ChatbotKnowledgePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ChatbotKnowledge that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatbotKnowledgeFindFirstArgs} args - Arguments to find a ChatbotKnowledge
     * @example
     * // Get one ChatbotKnowledge
     * const chatbotKnowledge = await prisma.chatbotKnowledge.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ChatbotKnowledgeFindFirstArgs>(args?: SelectSubset<T, ChatbotKnowledgeFindFirstArgs<ExtArgs>>): Prisma__ChatbotKnowledgeClient<$Result.GetResult<Prisma.$ChatbotKnowledgePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ChatbotKnowledge that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatbotKnowledgeFindFirstOrThrowArgs} args - Arguments to find a ChatbotKnowledge
     * @example
     * // Get one ChatbotKnowledge
     * const chatbotKnowledge = await prisma.chatbotKnowledge.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ChatbotKnowledgeFindFirstOrThrowArgs>(args?: SelectSubset<T, ChatbotKnowledgeFindFirstOrThrowArgs<ExtArgs>>): Prisma__ChatbotKnowledgeClient<$Result.GetResult<Prisma.$ChatbotKnowledgePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ChatbotKnowledges that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatbotKnowledgeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ChatbotKnowledges
     * const chatbotKnowledges = await prisma.chatbotKnowledge.findMany()
     * 
     * // Get first 10 ChatbotKnowledges
     * const chatbotKnowledges = await prisma.chatbotKnowledge.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const chatbotKnowledgeWithIdOnly = await prisma.chatbotKnowledge.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ChatbotKnowledgeFindManyArgs>(args?: SelectSubset<T, ChatbotKnowledgeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChatbotKnowledgePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ChatbotKnowledge.
     * @param {ChatbotKnowledgeCreateArgs} args - Arguments to create a ChatbotKnowledge.
     * @example
     * // Create one ChatbotKnowledge
     * const ChatbotKnowledge = await prisma.chatbotKnowledge.create({
     *   data: {
     *     // ... data to create a ChatbotKnowledge
     *   }
     * })
     * 
     */
    create<T extends ChatbotKnowledgeCreateArgs>(args: SelectSubset<T, ChatbotKnowledgeCreateArgs<ExtArgs>>): Prisma__ChatbotKnowledgeClient<$Result.GetResult<Prisma.$ChatbotKnowledgePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ChatbotKnowledges.
     * @param {ChatbotKnowledgeCreateManyArgs} args - Arguments to create many ChatbotKnowledges.
     * @example
     * // Create many ChatbotKnowledges
     * const chatbotKnowledge = await prisma.chatbotKnowledge.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ChatbotKnowledgeCreateManyArgs>(args?: SelectSubset<T, ChatbotKnowledgeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ChatbotKnowledges and returns the data saved in the database.
     * @param {ChatbotKnowledgeCreateManyAndReturnArgs} args - Arguments to create many ChatbotKnowledges.
     * @example
     * // Create many ChatbotKnowledges
     * const chatbotKnowledge = await prisma.chatbotKnowledge.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ChatbotKnowledges and only return the `id`
     * const chatbotKnowledgeWithIdOnly = await prisma.chatbotKnowledge.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ChatbotKnowledgeCreateManyAndReturnArgs>(args?: SelectSubset<T, ChatbotKnowledgeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChatbotKnowledgePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ChatbotKnowledge.
     * @param {ChatbotKnowledgeDeleteArgs} args - Arguments to delete one ChatbotKnowledge.
     * @example
     * // Delete one ChatbotKnowledge
     * const ChatbotKnowledge = await prisma.chatbotKnowledge.delete({
     *   where: {
     *     // ... filter to delete one ChatbotKnowledge
     *   }
     * })
     * 
     */
    delete<T extends ChatbotKnowledgeDeleteArgs>(args: SelectSubset<T, ChatbotKnowledgeDeleteArgs<ExtArgs>>): Prisma__ChatbotKnowledgeClient<$Result.GetResult<Prisma.$ChatbotKnowledgePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ChatbotKnowledge.
     * @param {ChatbotKnowledgeUpdateArgs} args - Arguments to update one ChatbotKnowledge.
     * @example
     * // Update one ChatbotKnowledge
     * const chatbotKnowledge = await prisma.chatbotKnowledge.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ChatbotKnowledgeUpdateArgs>(args: SelectSubset<T, ChatbotKnowledgeUpdateArgs<ExtArgs>>): Prisma__ChatbotKnowledgeClient<$Result.GetResult<Prisma.$ChatbotKnowledgePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ChatbotKnowledges.
     * @param {ChatbotKnowledgeDeleteManyArgs} args - Arguments to filter ChatbotKnowledges to delete.
     * @example
     * // Delete a few ChatbotKnowledges
     * const { count } = await prisma.chatbotKnowledge.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ChatbotKnowledgeDeleteManyArgs>(args?: SelectSubset<T, ChatbotKnowledgeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ChatbotKnowledges.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatbotKnowledgeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ChatbotKnowledges
     * const chatbotKnowledge = await prisma.chatbotKnowledge.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ChatbotKnowledgeUpdateManyArgs>(args: SelectSubset<T, ChatbotKnowledgeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ChatbotKnowledge.
     * @param {ChatbotKnowledgeUpsertArgs} args - Arguments to update or create a ChatbotKnowledge.
     * @example
     * // Update or create a ChatbotKnowledge
     * const chatbotKnowledge = await prisma.chatbotKnowledge.upsert({
     *   create: {
     *     // ... data to create a ChatbotKnowledge
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ChatbotKnowledge we want to update
     *   }
     * })
     */
    upsert<T extends ChatbotKnowledgeUpsertArgs>(args: SelectSubset<T, ChatbotKnowledgeUpsertArgs<ExtArgs>>): Prisma__ChatbotKnowledgeClient<$Result.GetResult<Prisma.$ChatbotKnowledgePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ChatbotKnowledges.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatbotKnowledgeCountArgs} args - Arguments to filter ChatbotKnowledges to count.
     * @example
     * // Count the number of ChatbotKnowledges
     * const count = await prisma.chatbotKnowledge.count({
     *   where: {
     *     // ... the filter for the ChatbotKnowledges we want to count
     *   }
     * })
    **/
    count<T extends ChatbotKnowledgeCountArgs>(
      args?: Subset<T, ChatbotKnowledgeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ChatbotKnowledgeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ChatbotKnowledge.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatbotKnowledgeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ChatbotKnowledgeAggregateArgs>(args: Subset<T, ChatbotKnowledgeAggregateArgs>): Prisma.PrismaPromise<GetChatbotKnowledgeAggregateType<T>>

    /**
     * Group by ChatbotKnowledge.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChatbotKnowledgeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ChatbotKnowledgeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ChatbotKnowledgeGroupByArgs['orderBy'] }
        : { orderBy?: ChatbotKnowledgeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ChatbotKnowledgeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetChatbotKnowledgeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ChatbotKnowledge model
   */
  readonly fields: ChatbotKnowledgeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ChatbotKnowledge.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ChatbotKnowledgeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ChatbotKnowledge model
   */ 
  interface ChatbotKnowledgeFieldRefs {
    readonly id: FieldRef<"ChatbotKnowledge", 'String'>
    readonly title: FieldRef<"ChatbotKnowledge", 'String'>
    readonly content: FieldRef<"ChatbotKnowledge", 'String'>
    readonly category: FieldRef<"ChatbotKnowledge", 'String'>
    readonly createdAt: FieldRef<"ChatbotKnowledge", 'DateTime'>
    readonly updatedAt: FieldRef<"ChatbotKnowledge", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ChatbotKnowledge findUnique
   */
  export type ChatbotKnowledgeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatbotKnowledge
     */
    select?: ChatbotKnowledgeSelect<ExtArgs> | null
    /**
     * Filter, which ChatbotKnowledge to fetch.
     */
    where: ChatbotKnowledgeWhereUniqueInput
  }

  /**
   * ChatbotKnowledge findUniqueOrThrow
   */
  export type ChatbotKnowledgeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatbotKnowledge
     */
    select?: ChatbotKnowledgeSelect<ExtArgs> | null
    /**
     * Filter, which ChatbotKnowledge to fetch.
     */
    where: ChatbotKnowledgeWhereUniqueInput
  }

  /**
   * ChatbotKnowledge findFirst
   */
  export type ChatbotKnowledgeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatbotKnowledge
     */
    select?: ChatbotKnowledgeSelect<ExtArgs> | null
    /**
     * Filter, which ChatbotKnowledge to fetch.
     */
    where?: ChatbotKnowledgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatbotKnowledges to fetch.
     */
    orderBy?: ChatbotKnowledgeOrderByWithRelationInput | ChatbotKnowledgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChatbotKnowledges.
     */
    cursor?: ChatbotKnowledgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatbotKnowledges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatbotKnowledges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChatbotKnowledges.
     */
    distinct?: ChatbotKnowledgeScalarFieldEnum | ChatbotKnowledgeScalarFieldEnum[]
  }

  /**
   * ChatbotKnowledge findFirstOrThrow
   */
  export type ChatbotKnowledgeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatbotKnowledge
     */
    select?: ChatbotKnowledgeSelect<ExtArgs> | null
    /**
     * Filter, which ChatbotKnowledge to fetch.
     */
    where?: ChatbotKnowledgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatbotKnowledges to fetch.
     */
    orderBy?: ChatbotKnowledgeOrderByWithRelationInput | ChatbotKnowledgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChatbotKnowledges.
     */
    cursor?: ChatbotKnowledgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatbotKnowledges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatbotKnowledges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChatbotKnowledges.
     */
    distinct?: ChatbotKnowledgeScalarFieldEnum | ChatbotKnowledgeScalarFieldEnum[]
  }

  /**
   * ChatbotKnowledge findMany
   */
  export type ChatbotKnowledgeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatbotKnowledge
     */
    select?: ChatbotKnowledgeSelect<ExtArgs> | null
    /**
     * Filter, which ChatbotKnowledges to fetch.
     */
    where?: ChatbotKnowledgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChatbotKnowledges to fetch.
     */
    orderBy?: ChatbotKnowledgeOrderByWithRelationInput | ChatbotKnowledgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ChatbotKnowledges.
     */
    cursor?: ChatbotKnowledgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChatbotKnowledges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChatbotKnowledges.
     */
    skip?: number
    distinct?: ChatbotKnowledgeScalarFieldEnum | ChatbotKnowledgeScalarFieldEnum[]
  }

  /**
   * ChatbotKnowledge create
   */
  export type ChatbotKnowledgeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatbotKnowledge
     */
    select?: ChatbotKnowledgeSelect<ExtArgs> | null
    /**
     * The data needed to create a ChatbotKnowledge.
     */
    data: XOR<ChatbotKnowledgeCreateInput, ChatbotKnowledgeUncheckedCreateInput>
  }

  /**
   * ChatbotKnowledge createMany
   */
  export type ChatbotKnowledgeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ChatbotKnowledges.
     */
    data: ChatbotKnowledgeCreateManyInput | ChatbotKnowledgeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ChatbotKnowledge createManyAndReturn
   */
  export type ChatbotKnowledgeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatbotKnowledge
     */
    select?: ChatbotKnowledgeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ChatbotKnowledges.
     */
    data: ChatbotKnowledgeCreateManyInput | ChatbotKnowledgeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ChatbotKnowledge update
   */
  export type ChatbotKnowledgeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatbotKnowledge
     */
    select?: ChatbotKnowledgeSelect<ExtArgs> | null
    /**
     * The data needed to update a ChatbotKnowledge.
     */
    data: XOR<ChatbotKnowledgeUpdateInput, ChatbotKnowledgeUncheckedUpdateInput>
    /**
     * Choose, which ChatbotKnowledge to update.
     */
    where: ChatbotKnowledgeWhereUniqueInput
  }

  /**
   * ChatbotKnowledge updateMany
   */
  export type ChatbotKnowledgeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ChatbotKnowledges.
     */
    data: XOR<ChatbotKnowledgeUpdateManyMutationInput, ChatbotKnowledgeUncheckedUpdateManyInput>
    /**
     * Filter which ChatbotKnowledges to update
     */
    where?: ChatbotKnowledgeWhereInput
  }

  /**
   * ChatbotKnowledge upsert
   */
  export type ChatbotKnowledgeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatbotKnowledge
     */
    select?: ChatbotKnowledgeSelect<ExtArgs> | null
    /**
     * The filter to search for the ChatbotKnowledge to update in case it exists.
     */
    where: ChatbotKnowledgeWhereUniqueInput
    /**
     * In case the ChatbotKnowledge found by the `where` argument doesn't exist, create a new ChatbotKnowledge with this data.
     */
    create: XOR<ChatbotKnowledgeCreateInput, ChatbotKnowledgeUncheckedCreateInput>
    /**
     * In case the ChatbotKnowledge was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ChatbotKnowledgeUpdateInput, ChatbotKnowledgeUncheckedUpdateInput>
  }

  /**
   * ChatbotKnowledge delete
   */
  export type ChatbotKnowledgeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatbotKnowledge
     */
    select?: ChatbotKnowledgeSelect<ExtArgs> | null
    /**
     * Filter which ChatbotKnowledge to delete.
     */
    where: ChatbotKnowledgeWhereUniqueInput
  }

  /**
   * ChatbotKnowledge deleteMany
   */
  export type ChatbotKnowledgeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChatbotKnowledges to delete
     */
    where?: ChatbotKnowledgeWhereInput
  }

  /**
   * ChatbotKnowledge without action
   */
  export type ChatbotKnowledgeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChatbotKnowledge
     */
    select?: ChatbotKnowledgeSelect<ExtArgs> | null
  }


  /**
   * Model Team
   */

  export type AggregateTeam = {
    _count: TeamCountAggregateOutputType | null
    _avg: TeamAvgAggregateOutputType | null
    _sum: TeamSumAggregateOutputType | null
    _min: TeamMinAggregateOutputType | null
    _max: TeamMaxAggregateOutputType | null
  }

  export type TeamAvgAggregateOutputType = {
    levelId: number | null
    currentStep: number | null
  }

  export type TeamSumAggregateOutputType = {
    levelId: number | null
    currentStep: number | null
  }

  export type TeamMinAggregateOutputType = {
    id: string | null
    classroomId: string | null
    levelId: number | null
    status: string | null
    currentStep: number | null
    verdictAnswer: string | null
    isCorrect: boolean | null
    gamePhase: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TeamMaxAggregateOutputType = {
    id: string | null
    classroomId: string | null
    levelId: number | null
    status: string | null
    currentStep: number | null
    verdictAnswer: string | null
    isCorrect: boolean | null
    gamePhase: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TeamCountAggregateOutputType = {
    id: number
    classroomId: number
    levelId: number
    status: number
    currentStep: number
    histogramState: number
    verdictAnswer: number
    isCorrect: number
    gamePhase: number
    readyVotes: number
    formulaState: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TeamAvgAggregateInputType = {
    levelId?: true
    currentStep?: true
  }

  export type TeamSumAggregateInputType = {
    levelId?: true
    currentStep?: true
  }

  export type TeamMinAggregateInputType = {
    id?: true
    classroomId?: true
    levelId?: true
    status?: true
    currentStep?: true
    verdictAnswer?: true
    isCorrect?: true
    gamePhase?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TeamMaxAggregateInputType = {
    id?: true
    classroomId?: true
    levelId?: true
    status?: true
    currentStep?: true
    verdictAnswer?: true
    isCorrect?: true
    gamePhase?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TeamCountAggregateInputType = {
    id?: true
    classroomId?: true
    levelId?: true
    status?: true
    currentStep?: true
    histogramState?: true
    verdictAnswer?: true
    isCorrect?: true
    gamePhase?: true
    readyVotes?: true
    formulaState?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TeamAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Team to aggregate.
     */
    where?: TeamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Teams to fetch.
     */
    orderBy?: TeamOrderByWithRelationInput | TeamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TeamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Teams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Teams.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Teams
    **/
    _count?: true | TeamCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TeamAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TeamSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TeamMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TeamMaxAggregateInputType
  }

  export type GetTeamAggregateType<T extends TeamAggregateArgs> = {
        [P in keyof T & keyof AggregateTeam]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTeam[P]>
      : GetScalarType<T[P], AggregateTeam[P]>
  }




  export type TeamGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TeamWhereInput
    orderBy?: TeamOrderByWithAggregationInput | TeamOrderByWithAggregationInput[]
    by: TeamScalarFieldEnum[] | TeamScalarFieldEnum
    having?: TeamScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TeamCountAggregateInputType | true
    _avg?: TeamAvgAggregateInputType
    _sum?: TeamSumAggregateInputType
    _min?: TeamMinAggregateInputType
    _max?: TeamMaxAggregateInputType
  }

  export type TeamGroupByOutputType = {
    id: string
    classroomId: string
    levelId: number
    status: string
    currentStep: number
    histogramState: JsonValue | null
    verdictAnswer: string
    isCorrect: boolean
    gamePhase: string
    readyVotes: JsonValue | null
    formulaState: JsonValue | null
    createdAt: Date
    updatedAt: Date
    _count: TeamCountAggregateOutputType | null
    _avg: TeamAvgAggregateOutputType | null
    _sum: TeamSumAggregateOutputType | null
    _min: TeamMinAggregateOutputType | null
    _max: TeamMaxAggregateOutputType | null
  }

  type GetTeamGroupByPayload<T extends TeamGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TeamGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TeamGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TeamGroupByOutputType[P]>
            : GetScalarType<T[P], TeamGroupByOutputType[P]>
        }
      >
    >


  export type TeamSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    classroomId?: boolean
    levelId?: boolean
    status?: boolean
    currentStep?: boolean
    histogramState?: boolean
    verdictAnswer?: boolean
    isCorrect?: boolean
    gamePhase?: boolean
    readyVotes?: boolean
    formulaState?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    members?: boolean | Team$membersArgs<ExtArgs>
    chatMessages?: boolean | Team$chatMessagesArgs<ExtArgs>
    classroom?: boolean | ClassroomDefaultArgs<ExtArgs>
    _count?: boolean | TeamCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["team"]>

  export type TeamSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    classroomId?: boolean
    levelId?: boolean
    status?: boolean
    currentStep?: boolean
    histogramState?: boolean
    verdictAnswer?: boolean
    isCorrect?: boolean
    gamePhase?: boolean
    readyVotes?: boolean
    formulaState?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    classroom?: boolean | ClassroomDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["team"]>

  export type TeamSelectScalar = {
    id?: boolean
    classroomId?: boolean
    levelId?: boolean
    status?: boolean
    currentStep?: boolean
    histogramState?: boolean
    verdictAnswer?: boolean
    isCorrect?: boolean
    gamePhase?: boolean
    readyVotes?: boolean
    formulaState?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TeamInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    members?: boolean | Team$membersArgs<ExtArgs>
    chatMessages?: boolean | Team$chatMessagesArgs<ExtArgs>
    classroom?: boolean | ClassroomDefaultArgs<ExtArgs>
    _count?: boolean | TeamCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TeamIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    classroom?: boolean | ClassroomDefaultArgs<ExtArgs>
  }

  export type $TeamPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Team"
    objects: {
      members: Prisma.$TeamMemberPayload<ExtArgs>[]
      chatMessages: Prisma.$TeamMessagePayload<ExtArgs>[]
      classroom: Prisma.$ClassroomPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      classroomId: string
      levelId: number
      status: string
      currentStep: number
      histogramState: Prisma.JsonValue | null
      verdictAnswer: string
      isCorrect: boolean
      gamePhase: string
      readyVotes: Prisma.JsonValue | null
      formulaState: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["team"]>
    composites: {}
  }

  type TeamGetPayload<S extends boolean | null | undefined | TeamDefaultArgs> = $Result.GetResult<Prisma.$TeamPayload, S>

  type TeamCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TeamFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TeamCountAggregateInputType | true
    }

  export interface TeamDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Team'], meta: { name: 'Team' } }
    /**
     * Find zero or one Team that matches the filter.
     * @param {TeamFindUniqueArgs} args - Arguments to find a Team
     * @example
     * // Get one Team
     * const team = await prisma.team.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TeamFindUniqueArgs>(args: SelectSubset<T, TeamFindUniqueArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Team that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TeamFindUniqueOrThrowArgs} args - Arguments to find a Team
     * @example
     * // Get one Team
     * const team = await prisma.team.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TeamFindUniqueOrThrowArgs>(args: SelectSubset<T, TeamFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Team that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamFindFirstArgs} args - Arguments to find a Team
     * @example
     * // Get one Team
     * const team = await prisma.team.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TeamFindFirstArgs>(args?: SelectSubset<T, TeamFindFirstArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Team that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamFindFirstOrThrowArgs} args - Arguments to find a Team
     * @example
     * // Get one Team
     * const team = await prisma.team.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TeamFindFirstOrThrowArgs>(args?: SelectSubset<T, TeamFindFirstOrThrowArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Teams that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Teams
     * const teams = await prisma.team.findMany()
     * 
     * // Get first 10 Teams
     * const teams = await prisma.team.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const teamWithIdOnly = await prisma.team.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TeamFindManyArgs>(args?: SelectSubset<T, TeamFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Team.
     * @param {TeamCreateArgs} args - Arguments to create a Team.
     * @example
     * // Create one Team
     * const Team = await prisma.team.create({
     *   data: {
     *     // ... data to create a Team
     *   }
     * })
     * 
     */
    create<T extends TeamCreateArgs>(args: SelectSubset<T, TeamCreateArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Teams.
     * @param {TeamCreateManyArgs} args - Arguments to create many Teams.
     * @example
     * // Create many Teams
     * const team = await prisma.team.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TeamCreateManyArgs>(args?: SelectSubset<T, TeamCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Teams and returns the data saved in the database.
     * @param {TeamCreateManyAndReturnArgs} args - Arguments to create many Teams.
     * @example
     * // Create many Teams
     * const team = await prisma.team.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Teams and only return the `id`
     * const teamWithIdOnly = await prisma.team.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TeamCreateManyAndReturnArgs>(args?: SelectSubset<T, TeamCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Team.
     * @param {TeamDeleteArgs} args - Arguments to delete one Team.
     * @example
     * // Delete one Team
     * const Team = await prisma.team.delete({
     *   where: {
     *     // ... filter to delete one Team
     *   }
     * })
     * 
     */
    delete<T extends TeamDeleteArgs>(args: SelectSubset<T, TeamDeleteArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Team.
     * @param {TeamUpdateArgs} args - Arguments to update one Team.
     * @example
     * // Update one Team
     * const team = await prisma.team.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TeamUpdateArgs>(args: SelectSubset<T, TeamUpdateArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Teams.
     * @param {TeamDeleteManyArgs} args - Arguments to filter Teams to delete.
     * @example
     * // Delete a few Teams
     * const { count } = await prisma.team.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TeamDeleteManyArgs>(args?: SelectSubset<T, TeamDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Teams.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Teams
     * const team = await prisma.team.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TeamUpdateManyArgs>(args: SelectSubset<T, TeamUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Team.
     * @param {TeamUpsertArgs} args - Arguments to update or create a Team.
     * @example
     * // Update or create a Team
     * const team = await prisma.team.upsert({
     *   create: {
     *     // ... data to create a Team
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Team we want to update
     *   }
     * })
     */
    upsert<T extends TeamUpsertArgs>(args: SelectSubset<T, TeamUpsertArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Teams.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamCountArgs} args - Arguments to filter Teams to count.
     * @example
     * // Count the number of Teams
     * const count = await prisma.team.count({
     *   where: {
     *     // ... the filter for the Teams we want to count
     *   }
     * })
    **/
    count<T extends TeamCountArgs>(
      args?: Subset<T, TeamCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TeamCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Team.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TeamAggregateArgs>(args: Subset<T, TeamAggregateArgs>): Prisma.PrismaPromise<GetTeamAggregateType<T>>

    /**
     * Group by Team.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TeamGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TeamGroupByArgs['orderBy'] }
        : { orderBy?: TeamGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TeamGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTeamGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Team model
   */
  readonly fields: TeamFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Team.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TeamClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    members<T extends Team$membersArgs<ExtArgs> = {}>(args?: Subset<T, Team$membersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TeamMemberPayload<ExtArgs>, T, "findMany"> | Null>
    chatMessages<T extends Team$chatMessagesArgs<ExtArgs> = {}>(args?: Subset<T, Team$chatMessagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TeamMessagePayload<ExtArgs>, T, "findMany"> | Null>
    classroom<T extends ClassroomDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClassroomDefaultArgs<ExtArgs>>): Prisma__ClassroomClient<$Result.GetResult<Prisma.$ClassroomPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Team model
   */ 
  interface TeamFieldRefs {
    readonly id: FieldRef<"Team", 'String'>
    readonly classroomId: FieldRef<"Team", 'String'>
    readonly levelId: FieldRef<"Team", 'Int'>
    readonly status: FieldRef<"Team", 'String'>
    readonly currentStep: FieldRef<"Team", 'Int'>
    readonly histogramState: FieldRef<"Team", 'Json'>
    readonly verdictAnswer: FieldRef<"Team", 'String'>
    readonly isCorrect: FieldRef<"Team", 'Boolean'>
    readonly gamePhase: FieldRef<"Team", 'String'>
    readonly readyVotes: FieldRef<"Team", 'Json'>
    readonly formulaState: FieldRef<"Team", 'Json'>
    readonly createdAt: FieldRef<"Team", 'DateTime'>
    readonly updatedAt: FieldRef<"Team", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Team findUnique
   */
  export type TeamFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * Filter, which Team to fetch.
     */
    where: TeamWhereUniqueInput
  }

  /**
   * Team findUniqueOrThrow
   */
  export type TeamFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * Filter, which Team to fetch.
     */
    where: TeamWhereUniqueInput
  }

  /**
   * Team findFirst
   */
  export type TeamFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * Filter, which Team to fetch.
     */
    where?: TeamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Teams to fetch.
     */
    orderBy?: TeamOrderByWithRelationInput | TeamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Teams.
     */
    cursor?: TeamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Teams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Teams.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Teams.
     */
    distinct?: TeamScalarFieldEnum | TeamScalarFieldEnum[]
  }

  /**
   * Team findFirstOrThrow
   */
  export type TeamFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * Filter, which Team to fetch.
     */
    where?: TeamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Teams to fetch.
     */
    orderBy?: TeamOrderByWithRelationInput | TeamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Teams.
     */
    cursor?: TeamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Teams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Teams.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Teams.
     */
    distinct?: TeamScalarFieldEnum | TeamScalarFieldEnum[]
  }

  /**
   * Team findMany
   */
  export type TeamFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * Filter, which Teams to fetch.
     */
    where?: TeamWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Teams to fetch.
     */
    orderBy?: TeamOrderByWithRelationInput | TeamOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Teams.
     */
    cursor?: TeamWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Teams from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Teams.
     */
    skip?: number
    distinct?: TeamScalarFieldEnum | TeamScalarFieldEnum[]
  }

  /**
   * Team create
   */
  export type TeamCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * The data needed to create a Team.
     */
    data: XOR<TeamCreateInput, TeamUncheckedCreateInput>
  }

  /**
   * Team createMany
   */
  export type TeamCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Teams.
     */
    data: TeamCreateManyInput | TeamCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Team createManyAndReturn
   */
  export type TeamCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Teams.
     */
    data: TeamCreateManyInput | TeamCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Team update
   */
  export type TeamUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * The data needed to update a Team.
     */
    data: XOR<TeamUpdateInput, TeamUncheckedUpdateInput>
    /**
     * Choose, which Team to update.
     */
    where: TeamWhereUniqueInput
  }

  /**
   * Team updateMany
   */
  export type TeamUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Teams.
     */
    data: XOR<TeamUpdateManyMutationInput, TeamUncheckedUpdateManyInput>
    /**
     * Filter which Teams to update
     */
    where?: TeamWhereInput
  }

  /**
   * Team upsert
   */
  export type TeamUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * The filter to search for the Team to update in case it exists.
     */
    where: TeamWhereUniqueInput
    /**
     * In case the Team found by the `where` argument doesn't exist, create a new Team with this data.
     */
    create: XOR<TeamCreateInput, TeamUncheckedCreateInput>
    /**
     * In case the Team was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TeamUpdateInput, TeamUncheckedUpdateInput>
  }

  /**
   * Team delete
   */
  export type TeamDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
    /**
     * Filter which Team to delete.
     */
    where: TeamWhereUniqueInput
  }

  /**
   * Team deleteMany
   */
  export type TeamDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Teams to delete
     */
    where?: TeamWhereInput
  }

  /**
   * Team.members
   */
  export type Team$membersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMember
     */
    select?: TeamMemberSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMemberInclude<ExtArgs> | null
    where?: TeamMemberWhereInput
    orderBy?: TeamMemberOrderByWithRelationInput | TeamMemberOrderByWithRelationInput[]
    cursor?: TeamMemberWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TeamMemberScalarFieldEnum | TeamMemberScalarFieldEnum[]
  }

  /**
   * Team.chatMessages
   */
  export type Team$chatMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMessage
     */
    select?: TeamMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMessageInclude<ExtArgs> | null
    where?: TeamMessageWhereInput
    orderBy?: TeamMessageOrderByWithRelationInput | TeamMessageOrderByWithRelationInput[]
    cursor?: TeamMessageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TeamMessageScalarFieldEnum | TeamMessageScalarFieldEnum[]
  }

  /**
   * Team without action
   */
  export type TeamDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Team
     */
    select?: TeamSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamInclude<ExtArgs> | null
  }


  /**
   * Model TeamMember
   */

  export type AggregateTeamMember = {
    _count: TeamMemberCountAggregateOutputType | null
    _min: TeamMemberMinAggregateOutputType | null
    _max: TeamMemberMaxAggregateOutputType | null
  }

  export type TeamMemberMinAggregateOutputType = {
    id: string | null
    teamId: string | null
    studentId: string | null
    joinedAt: Date | null
  }

  export type TeamMemberMaxAggregateOutputType = {
    id: string | null
    teamId: string | null
    studentId: string | null
    joinedAt: Date | null
  }

  export type TeamMemberCountAggregateOutputType = {
    id: number
    teamId: number
    studentId: number
    joinedAt: number
    _all: number
  }


  export type TeamMemberMinAggregateInputType = {
    id?: true
    teamId?: true
    studentId?: true
    joinedAt?: true
  }

  export type TeamMemberMaxAggregateInputType = {
    id?: true
    teamId?: true
    studentId?: true
    joinedAt?: true
  }

  export type TeamMemberCountAggregateInputType = {
    id?: true
    teamId?: true
    studentId?: true
    joinedAt?: true
    _all?: true
  }

  export type TeamMemberAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TeamMember to aggregate.
     */
    where?: TeamMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TeamMembers to fetch.
     */
    orderBy?: TeamMemberOrderByWithRelationInput | TeamMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TeamMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TeamMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TeamMembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TeamMembers
    **/
    _count?: true | TeamMemberCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TeamMemberMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TeamMemberMaxAggregateInputType
  }

  export type GetTeamMemberAggregateType<T extends TeamMemberAggregateArgs> = {
        [P in keyof T & keyof AggregateTeamMember]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTeamMember[P]>
      : GetScalarType<T[P], AggregateTeamMember[P]>
  }




  export type TeamMemberGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TeamMemberWhereInput
    orderBy?: TeamMemberOrderByWithAggregationInput | TeamMemberOrderByWithAggregationInput[]
    by: TeamMemberScalarFieldEnum[] | TeamMemberScalarFieldEnum
    having?: TeamMemberScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TeamMemberCountAggregateInputType | true
    _min?: TeamMemberMinAggregateInputType
    _max?: TeamMemberMaxAggregateInputType
  }

  export type TeamMemberGroupByOutputType = {
    id: string
    teamId: string
    studentId: string
    joinedAt: Date
    _count: TeamMemberCountAggregateOutputType | null
    _min: TeamMemberMinAggregateOutputType | null
    _max: TeamMemberMaxAggregateOutputType | null
  }

  type GetTeamMemberGroupByPayload<T extends TeamMemberGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TeamMemberGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TeamMemberGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TeamMemberGroupByOutputType[P]>
            : GetScalarType<T[P], TeamMemberGroupByOutputType[P]>
        }
      >
    >


  export type TeamMemberSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    teamId?: boolean
    studentId?: boolean
    joinedAt?: boolean
    team?: boolean | TeamDefaultArgs<ExtArgs>
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["teamMember"]>

  export type TeamMemberSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    teamId?: boolean
    studentId?: boolean
    joinedAt?: boolean
    team?: boolean | TeamDefaultArgs<ExtArgs>
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["teamMember"]>

  export type TeamMemberSelectScalar = {
    id?: boolean
    teamId?: boolean
    studentId?: boolean
    joinedAt?: boolean
  }

  export type TeamMemberInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    team?: boolean | TeamDefaultArgs<ExtArgs>
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }
  export type TeamMemberIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    team?: boolean | TeamDefaultArgs<ExtArgs>
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }

  export type $TeamMemberPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TeamMember"
    objects: {
      team: Prisma.$TeamPayload<ExtArgs>
      student: Prisma.$StudentPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      teamId: string
      studentId: string
      joinedAt: Date
    }, ExtArgs["result"]["teamMember"]>
    composites: {}
  }

  type TeamMemberGetPayload<S extends boolean | null | undefined | TeamMemberDefaultArgs> = $Result.GetResult<Prisma.$TeamMemberPayload, S>

  type TeamMemberCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TeamMemberFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TeamMemberCountAggregateInputType | true
    }

  export interface TeamMemberDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TeamMember'], meta: { name: 'TeamMember' } }
    /**
     * Find zero or one TeamMember that matches the filter.
     * @param {TeamMemberFindUniqueArgs} args - Arguments to find a TeamMember
     * @example
     * // Get one TeamMember
     * const teamMember = await prisma.teamMember.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TeamMemberFindUniqueArgs>(args: SelectSubset<T, TeamMemberFindUniqueArgs<ExtArgs>>): Prisma__TeamMemberClient<$Result.GetResult<Prisma.$TeamMemberPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TeamMember that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TeamMemberFindUniqueOrThrowArgs} args - Arguments to find a TeamMember
     * @example
     * // Get one TeamMember
     * const teamMember = await prisma.teamMember.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TeamMemberFindUniqueOrThrowArgs>(args: SelectSubset<T, TeamMemberFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TeamMemberClient<$Result.GetResult<Prisma.$TeamMemberPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TeamMember that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamMemberFindFirstArgs} args - Arguments to find a TeamMember
     * @example
     * // Get one TeamMember
     * const teamMember = await prisma.teamMember.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TeamMemberFindFirstArgs>(args?: SelectSubset<T, TeamMemberFindFirstArgs<ExtArgs>>): Prisma__TeamMemberClient<$Result.GetResult<Prisma.$TeamMemberPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TeamMember that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamMemberFindFirstOrThrowArgs} args - Arguments to find a TeamMember
     * @example
     * // Get one TeamMember
     * const teamMember = await prisma.teamMember.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TeamMemberFindFirstOrThrowArgs>(args?: SelectSubset<T, TeamMemberFindFirstOrThrowArgs<ExtArgs>>): Prisma__TeamMemberClient<$Result.GetResult<Prisma.$TeamMemberPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TeamMembers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamMemberFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TeamMembers
     * const teamMembers = await prisma.teamMember.findMany()
     * 
     * // Get first 10 TeamMembers
     * const teamMembers = await prisma.teamMember.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const teamMemberWithIdOnly = await prisma.teamMember.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TeamMemberFindManyArgs>(args?: SelectSubset<T, TeamMemberFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TeamMemberPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TeamMember.
     * @param {TeamMemberCreateArgs} args - Arguments to create a TeamMember.
     * @example
     * // Create one TeamMember
     * const TeamMember = await prisma.teamMember.create({
     *   data: {
     *     // ... data to create a TeamMember
     *   }
     * })
     * 
     */
    create<T extends TeamMemberCreateArgs>(args: SelectSubset<T, TeamMemberCreateArgs<ExtArgs>>): Prisma__TeamMemberClient<$Result.GetResult<Prisma.$TeamMemberPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TeamMembers.
     * @param {TeamMemberCreateManyArgs} args - Arguments to create many TeamMembers.
     * @example
     * // Create many TeamMembers
     * const teamMember = await prisma.teamMember.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TeamMemberCreateManyArgs>(args?: SelectSubset<T, TeamMemberCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TeamMembers and returns the data saved in the database.
     * @param {TeamMemberCreateManyAndReturnArgs} args - Arguments to create many TeamMembers.
     * @example
     * // Create many TeamMembers
     * const teamMember = await prisma.teamMember.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TeamMembers and only return the `id`
     * const teamMemberWithIdOnly = await prisma.teamMember.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TeamMemberCreateManyAndReturnArgs>(args?: SelectSubset<T, TeamMemberCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TeamMemberPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TeamMember.
     * @param {TeamMemberDeleteArgs} args - Arguments to delete one TeamMember.
     * @example
     * // Delete one TeamMember
     * const TeamMember = await prisma.teamMember.delete({
     *   where: {
     *     // ... filter to delete one TeamMember
     *   }
     * })
     * 
     */
    delete<T extends TeamMemberDeleteArgs>(args: SelectSubset<T, TeamMemberDeleteArgs<ExtArgs>>): Prisma__TeamMemberClient<$Result.GetResult<Prisma.$TeamMemberPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TeamMember.
     * @param {TeamMemberUpdateArgs} args - Arguments to update one TeamMember.
     * @example
     * // Update one TeamMember
     * const teamMember = await prisma.teamMember.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TeamMemberUpdateArgs>(args: SelectSubset<T, TeamMemberUpdateArgs<ExtArgs>>): Prisma__TeamMemberClient<$Result.GetResult<Prisma.$TeamMemberPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TeamMembers.
     * @param {TeamMemberDeleteManyArgs} args - Arguments to filter TeamMembers to delete.
     * @example
     * // Delete a few TeamMembers
     * const { count } = await prisma.teamMember.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TeamMemberDeleteManyArgs>(args?: SelectSubset<T, TeamMemberDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TeamMembers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamMemberUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TeamMembers
     * const teamMember = await prisma.teamMember.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TeamMemberUpdateManyArgs>(args: SelectSubset<T, TeamMemberUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TeamMember.
     * @param {TeamMemberUpsertArgs} args - Arguments to update or create a TeamMember.
     * @example
     * // Update or create a TeamMember
     * const teamMember = await prisma.teamMember.upsert({
     *   create: {
     *     // ... data to create a TeamMember
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TeamMember we want to update
     *   }
     * })
     */
    upsert<T extends TeamMemberUpsertArgs>(args: SelectSubset<T, TeamMemberUpsertArgs<ExtArgs>>): Prisma__TeamMemberClient<$Result.GetResult<Prisma.$TeamMemberPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TeamMembers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamMemberCountArgs} args - Arguments to filter TeamMembers to count.
     * @example
     * // Count the number of TeamMembers
     * const count = await prisma.teamMember.count({
     *   where: {
     *     // ... the filter for the TeamMembers we want to count
     *   }
     * })
    **/
    count<T extends TeamMemberCountArgs>(
      args?: Subset<T, TeamMemberCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TeamMemberCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TeamMember.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamMemberAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TeamMemberAggregateArgs>(args: Subset<T, TeamMemberAggregateArgs>): Prisma.PrismaPromise<GetTeamMemberAggregateType<T>>

    /**
     * Group by TeamMember.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamMemberGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TeamMemberGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TeamMemberGroupByArgs['orderBy'] }
        : { orderBy?: TeamMemberGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TeamMemberGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTeamMemberGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TeamMember model
   */
  readonly fields: TeamMemberFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TeamMember.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TeamMemberClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    team<T extends TeamDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TeamDefaultArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    student<T extends StudentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, StudentDefaultArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TeamMember model
   */ 
  interface TeamMemberFieldRefs {
    readonly id: FieldRef<"TeamMember", 'String'>
    readonly teamId: FieldRef<"TeamMember", 'String'>
    readonly studentId: FieldRef<"TeamMember", 'String'>
    readonly joinedAt: FieldRef<"TeamMember", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TeamMember findUnique
   */
  export type TeamMemberFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMember
     */
    select?: TeamMemberSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMemberInclude<ExtArgs> | null
    /**
     * Filter, which TeamMember to fetch.
     */
    where: TeamMemberWhereUniqueInput
  }

  /**
   * TeamMember findUniqueOrThrow
   */
  export type TeamMemberFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMember
     */
    select?: TeamMemberSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMemberInclude<ExtArgs> | null
    /**
     * Filter, which TeamMember to fetch.
     */
    where: TeamMemberWhereUniqueInput
  }

  /**
   * TeamMember findFirst
   */
  export type TeamMemberFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMember
     */
    select?: TeamMemberSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMemberInclude<ExtArgs> | null
    /**
     * Filter, which TeamMember to fetch.
     */
    where?: TeamMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TeamMembers to fetch.
     */
    orderBy?: TeamMemberOrderByWithRelationInput | TeamMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TeamMembers.
     */
    cursor?: TeamMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TeamMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TeamMembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TeamMembers.
     */
    distinct?: TeamMemberScalarFieldEnum | TeamMemberScalarFieldEnum[]
  }

  /**
   * TeamMember findFirstOrThrow
   */
  export type TeamMemberFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMember
     */
    select?: TeamMemberSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMemberInclude<ExtArgs> | null
    /**
     * Filter, which TeamMember to fetch.
     */
    where?: TeamMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TeamMembers to fetch.
     */
    orderBy?: TeamMemberOrderByWithRelationInput | TeamMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TeamMembers.
     */
    cursor?: TeamMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TeamMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TeamMembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TeamMembers.
     */
    distinct?: TeamMemberScalarFieldEnum | TeamMemberScalarFieldEnum[]
  }

  /**
   * TeamMember findMany
   */
  export type TeamMemberFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMember
     */
    select?: TeamMemberSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMemberInclude<ExtArgs> | null
    /**
     * Filter, which TeamMembers to fetch.
     */
    where?: TeamMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TeamMembers to fetch.
     */
    orderBy?: TeamMemberOrderByWithRelationInput | TeamMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TeamMembers.
     */
    cursor?: TeamMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TeamMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TeamMembers.
     */
    skip?: number
    distinct?: TeamMemberScalarFieldEnum | TeamMemberScalarFieldEnum[]
  }

  /**
   * TeamMember create
   */
  export type TeamMemberCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMember
     */
    select?: TeamMemberSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMemberInclude<ExtArgs> | null
    /**
     * The data needed to create a TeamMember.
     */
    data: XOR<TeamMemberCreateInput, TeamMemberUncheckedCreateInput>
  }

  /**
   * TeamMember createMany
   */
  export type TeamMemberCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TeamMembers.
     */
    data: TeamMemberCreateManyInput | TeamMemberCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TeamMember createManyAndReturn
   */
  export type TeamMemberCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMember
     */
    select?: TeamMemberSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TeamMembers.
     */
    data: TeamMemberCreateManyInput | TeamMemberCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMemberIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TeamMember update
   */
  export type TeamMemberUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMember
     */
    select?: TeamMemberSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMemberInclude<ExtArgs> | null
    /**
     * The data needed to update a TeamMember.
     */
    data: XOR<TeamMemberUpdateInput, TeamMemberUncheckedUpdateInput>
    /**
     * Choose, which TeamMember to update.
     */
    where: TeamMemberWhereUniqueInput
  }

  /**
   * TeamMember updateMany
   */
  export type TeamMemberUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TeamMembers.
     */
    data: XOR<TeamMemberUpdateManyMutationInput, TeamMemberUncheckedUpdateManyInput>
    /**
     * Filter which TeamMembers to update
     */
    where?: TeamMemberWhereInput
  }

  /**
   * TeamMember upsert
   */
  export type TeamMemberUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMember
     */
    select?: TeamMemberSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMemberInclude<ExtArgs> | null
    /**
     * The filter to search for the TeamMember to update in case it exists.
     */
    where: TeamMemberWhereUniqueInput
    /**
     * In case the TeamMember found by the `where` argument doesn't exist, create a new TeamMember with this data.
     */
    create: XOR<TeamMemberCreateInput, TeamMemberUncheckedCreateInput>
    /**
     * In case the TeamMember was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TeamMemberUpdateInput, TeamMemberUncheckedUpdateInput>
  }

  /**
   * TeamMember delete
   */
  export type TeamMemberDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMember
     */
    select?: TeamMemberSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMemberInclude<ExtArgs> | null
    /**
     * Filter which TeamMember to delete.
     */
    where: TeamMemberWhereUniqueInput
  }

  /**
   * TeamMember deleteMany
   */
  export type TeamMemberDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TeamMembers to delete
     */
    where?: TeamMemberWhereInput
  }

  /**
   * TeamMember without action
   */
  export type TeamMemberDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMember
     */
    select?: TeamMemberSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMemberInclude<ExtArgs> | null
  }


  /**
   * Model TeamMessage
   */

  export type AggregateTeamMessage = {
    _count: TeamMessageCountAggregateOutputType | null
    _min: TeamMessageMinAggregateOutputType | null
    _max: TeamMessageMaxAggregateOutputType | null
  }

  export type TeamMessageMinAggregateOutputType = {
    id: string | null
    teamId: string | null
    studentId: string | null
    senderName: string | null
    content: string | null
    createdAt: Date | null
  }

  export type TeamMessageMaxAggregateOutputType = {
    id: string | null
    teamId: string | null
    studentId: string | null
    senderName: string | null
    content: string | null
    createdAt: Date | null
  }

  export type TeamMessageCountAggregateOutputType = {
    id: number
    teamId: number
    studentId: number
    senderName: number
    content: number
    createdAt: number
    _all: number
  }


  export type TeamMessageMinAggregateInputType = {
    id?: true
    teamId?: true
    studentId?: true
    senderName?: true
    content?: true
    createdAt?: true
  }

  export type TeamMessageMaxAggregateInputType = {
    id?: true
    teamId?: true
    studentId?: true
    senderName?: true
    content?: true
    createdAt?: true
  }

  export type TeamMessageCountAggregateInputType = {
    id?: true
    teamId?: true
    studentId?: true
    senderName?: true
    content?: true
    createdAt?: true
    _all?: true
  }

  export type TeamMessageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TeamMessage to aggregate.
     */
    where?: TeamMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TeamMessages to fetch.
     */
    orderBy?: TeamMessageOrderByWithRelationInput | TeamMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TeamMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TeamMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TeamMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TeamMessages
    **/
    _count?: true | TeamMessageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TeamMessageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TeamMessageMaxAggregateInputType
  }

  export type GetTeamMessageAggregateType<T extends TeamMessageAggregateArgs> = {
        [P in keyof T & keyof AggregateTeamMessage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTeamMessage[P]>
      : GetScalarType<T[P], AggregateTeamMessage[P]>
  }




  export type TeamMessageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TeamMessageWhereInput
    orderBy?: TeamMessageOrderByWithAggregationInput | TeamMessageOrderByWithAggregationInput[]
    by: TeamMessageScalarFieldEnum[] | TeamMessageScalarFieldEnum
    having?: TeamMessageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TeamMessageCountAggregateInputType | true
    _min?: TeamMessageMinAggregateInputType
    _max?: TeamMessageMaxAggregateInputType
  }

  export type TeamMessageGroupByOutputType = {
    id: string
    teamId: string
    studentId: string
    senderName: string
    content: string
    createdAt: Date
    _count: TeamMessageCountAggregateOutputType | null
    _min: TeamMessageMinAggregateOutputType | null
    _max: TeamMessageMaxAggregateOutputType | null
  }

  type GetTeamMessageGroupByPayload<T extends TeamMessageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TeamMessageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TeamMessageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TeamMessageGroupByOutputType[P]>
            : GetScalarType<T[P], TeamMessageGroupByOutputType[P]>
        }
      >
    >


  export type TeamMessageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    teamId?: boolean
    studentId?: boolean
    senderName?: boolean
    content?: boolean
    createdAt?: boolean
    team?: boolean | TeamDefaultArgs<ExtArgs>
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["teamMessage"]>

  export type TeamMessageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    teamId?: boolean
    studentId?: boolean
    senderName?: boolean
    content?: boolean
    createdAt?: boolean
    team?: boolean | TeamDefaultArgs<ExtArgs>
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["teamMessage"]>

  export type TeamMessageSelectScalar = {
    id?: boolean
    teamId?: boolean
    studentId?: boolean
    senderName?: boolean
    content?: boolean
    createdAt?: boolean
  }

  export type TeamMessageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    team?: boolean | TeamDefaultArgs<ExtArgs>
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }
  export type TeamMessageIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    team?: boolean | TeamDefaultArgs<ExtArgs>
    student?: boolean | StudentDefaultArgs<ExtArgs>
  }

  export type $TeamMessagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TeamMessage"
    objects: {
      team: Prisma.$TeamPayload<ExtArgs>
      student: Prisma.$StudentPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      teamId: string
      studentId: string
      senderName: string
      content: string
      createdAt: Date
    }, ExtArgs["result"]["teamMessage"]>
    composites: {}
  }

  type TeamMessageGetPayload<S extends boolean | null | undefined | TeamMessageDefaultArgs> = $Result.GetResult<Prisma.$TeamMessagePayload, S>

  type TeamMessageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TeamMessageFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TeamMessageCountAggregateInputType | true
    }

  export interface TeamMessageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TeamMessage'], meta: { name: 'TeamMessage' } }
    /**
     * Find zero or one TeamMessage that matches the filter.
     * @param {TeamMessageFindUniqueArgs} args - Arguments to find a TeamMessage
     * @example
     * // Get one TeamMessage
     * const teamMessage = await prisma.teamMessage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TeamMessageFindUniqueArgs>(args: SelectSubset<T, TeamMessageFindUniqueArgs<ExtArgs>>): Prisma__TeamMessageClient<$Result.GetResult<Prisma.$TeamMessagePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TeamMessage that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TeamMessageFindUniqueOrThrowArgs} args - Arguments to find a TeamMessage
     * @example
     * // Get one TeamMessage
     * const teamMessage = await prisma.teamMessage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TeamMessageFindUniqueOrThrowArgs>(args: SelectSubset<T, TeamMessageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TeamMessageClient<$Result.GetResult<Prisma.$TeamMessagePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TeamMessage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamMessageFindFirstArgs} args - Arguments to find a TeamMessage
     * @example
     * // Get one TeamMessage
     * const teamMessage = await prisma.teamMessage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TeamMessageFindFirstArgs>(args?: SelectSubset<T, TeamMessageFindFirstArgs<ExtArgs>>): Prisma__TeamMessageClient<$Result.GetResult<Prisma.$TeamMessagePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TeamMessage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamMessageFindFirstOrThrowArgs} args - Arguments to find a TeamMessage
     * @example
     * // Get one TeamMessage
     * const teamMessage = await prisma.teamMessage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TeamMessageFindFirstOrThrowArgs>(args?: SelectSubset<T, TeamMessageFindFirstOrThrowArgs<ExtArgs>>): Prisma__TeamMessageClient<$Result.GetResult<Prisma.$TeamMessagePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TeamMessages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamMessageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TeamMessages
     * const teamMessages = await prisma.teamMessage.findMany()
     * 
     * // Get first 10 TeamMessages
     * const teamMessages = await prisma.teamMessage.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const teamMessageWithIdOnly = await prisma.teamMessage.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TeamMessageFindManyArgs>(args?: SelectSubset<T, TeamMessageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TeamMessagePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TeamMessage.
     * @param {TeamMessageCreateArgs} args - Arguments to create a TeamMessage.
     * @example
     * // Create one TeamMessage
     * const TeamMessage = await prisma.teamMessage.create({
     *   data: {
     *     // ... data to create a TeamMessage
     *   }
     * })
     * 
     */
    create<T extends TeamMessageCreateArgs>(args: SelectSubset<T, TeamMessageCreateArgs<ExtArgs>>): Prisma__TeamMessageClient<$Result.GetResult<Prisma.$TeamMessagePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TeamMessages.
     * @param {TeamMessageCreateManyArgs} args - Arguments to create many TeamMessages.
     * @example
     * // Create many TeamMessages
     * const teamMessage = await prisma.teamMessage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TeamMessageCreateManyArgs>(args?: SelectSubset<T, TeamMessageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TeamMessages and returns the data saved in the database.
     * @param {TeamMessageCreateManyAndReturnArgs} args - Arguments to create many TeamMessages.
     * @example
     * // Create many TeamMessages
     * const teamMessage = await prisma.teamMessage.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TeamMessages and only return the `id`
     * const teamMessageWithIdOnly = await prisma.teamMessage.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TeamMessageCreateManyAndReturnArgs>(args?: SelectSubset<T, TeamMessageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TeamMessagePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TeamMessage.
     * @param {TeamMessageDeleteArgs} args - Arguments to delete one TeamMessage.
     * @example
     * // Delete one TeamMessage
     * const TeamMessage = await prisma.teamMessage.delete({
     *   where: {
     *     // ... filter to delete one TeamMessage
     *   }
     * })
     * 
     */
    delete<T extends TeamMessageDeleteArgs>(args: SelectSubset<T, TeamMessageDeleteArgs<ExtArgs>>): Prisma__TeamMessageClient<$Result.GetResult<Prisma.$TeamMessagePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TeamMessage.
     * @param {TeamMessageUpdateArgs} args - Arguments to update one TeamMessage.
     * @example
     * // Update one TeamMessage
     * const teamMessage = await prisma.teamMessage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TeamMessageUpdateArgs>(args: SelectSubset<T, TeamMessageUpdateArgs<ExtArgs>>): Prisma__TeamMessageClient<$Result.GetResult<Prisma.$TeamMessagePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TeamMessages.
     * @param {TeamMessageDeleteManyArgs} args - Arguments to filter TeamMessages to delete.
     * @example
     * // Delete a few TeamMessages
     * const { count } = await prisma.teamMessage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TeamMessageDeleteManyArgs>(args?: SelectSubset<T, TeamMessageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TeamMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamMessageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TeamMessages
     * const teamMessage = await prisma.teamMessage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TeamMessageUpdateManyArgs>(args: SelectSubset<T, TeamMessageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TeamMessage.
     * @param {TeamMessageUpsertArgs} args - Arguments to update or create a TeamMessage.
     * @example
     * // Update or create a TeamMessage
     * const teamMessage = await prisma.teamMessage.upsert({
     *   create: {
     *     // ... data to create a TeamMessage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TeamMessage we want to update
     *   }
     * })
     */
    upsert<T extends TeamMessageUpsertArgs>(args: SelectSubset<T, TeamMessageUpsertArgs<ExtArgs>>): Prisma__TeamMessageClient<$Result.GetResult<Prisma.$TeamMessagePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TeamMessages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamMessageCountArgs} args - Arguments to filter TeamMessages to count.
     * @example
     * // Count the number of TeamMessages
     * const count = await prisma.teamMessage.count({
     *   where: {
     *     // ... the filter for the TeamMessages we want to count
     *   }
     * })
    **/
    count<T extends TeamMessageCountArgs>(
      args?: Subset<T, TeamMessageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TeamMessageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TeamMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamMessageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TeamMessageAggregateArgs>(args: Subset<T, TeamMessageAggregateArgs>): Prisma.PrismaPromise<GetTeamMessageAggregateType<T>>

    /**
     * Group by TeamMessage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TeamMessageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TeamMessageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TeamMessageGroupByArgs['orderBy'] }
        : { orderBy?: TeamMessageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TeamMessageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTeamMessageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TeamMessage model
   */
  readonly fields: TeamMessageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TeamMessage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TeamMessageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    team<T extends TeamDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TeamDefaultArgs<ExtArgs>>): Prisma__TeamClient<$Result.GetResult<Prisma.$TeamPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    student<T extends StudentDefaultArgs<ExtArgs> = {}>(args?: Subset<T, StudentDefaultArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TeamMessage model
   */ 
  interface TeamMessageFieldRefs {
    readonly id: FieldRef<"TeamMessage", 'String'>
    readonly teamId: FieldRef<"TeamMessage", 'String'>
    readonly studentId: FieldRef<"TeamMessage", 'String'>
    readonly senderName: FieldRef<"TeamMessage", 'String'>
    readonly content: FieldRef<"TeamMessage", 'String'>
    readonly createdAt: FieldRef<"TeamMessage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TeamMessage findUnique
   */
  export type TeamMessageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMessage
     */
    select?: TeamMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMessageInclude<ExtArgs> | null
    /**
     * Filter, which TeamMessage to fetch.
     */
    where: TeamMessageWhereUniqueInput
  }

  /**
   * TeamMessage findUniqueOrThrow
   */
  export type TeamMessageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMessage
     */
    select?: TeamMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMessageInclude<ExtArgs> | null
    /**
     * Filter, which TeamMessage to fetch.
     */
    where: TeamMessageWhereUniqueInput
  }

  /**
   * TeamMessage findFirst
   */
  export type TeamMessageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMessage
     */
    select?: TeamMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMessageInclude<ExtArgs> | null
    /**
     * Filter, which TeamMessage to fetch.
     */
    where?: TeamMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TeamMessages to fetch.
     */
    orderBy?: TeamMessageOrderByWithRelationInput | TeamMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TeamMessages.
     */
    cursor?: TeamMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TeamMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TeamMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TeamMessages.
     */
    distinct?: TeamMessageScalarFieldEnum | TeamMessageScalarFieldEnum[]
  }

  /**
   * TeamMessage findFirstOrThrow
   */
  export type TeamMessageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMessage
     */
    select?: TeamMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMessageInclude<ExtArgs> | null
    /**
     * Filter, which TeamMessage to fetch.
     */
    where?: TeamMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TeamMessages to fetch.
     */
    orderBy?: TeamMessageOrderByWithRelationInput | TeamMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TeamMessages.
     */
    cursor?: TeamMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TeamMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TeamMessages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TeamMessages.
     */
    distinct?: TeamMessageScalarFieldEnum | TeamMessageScalarFieldEnum[]
  }

  /**
   * TeamMessage findMany
   */
  export type TeamMessageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMessage
     */
    select?: TeamMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMessageInclude<ExtArgs> | null
    /**
     * Filter, which TeamMessages to fetch.
     */
    where?: TeamMessageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TeamMessages to fetch.
     */
    orderBy?: TeamMessageOrderByWithRelationInput | TeamMessageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TeamMessages.
     */
    cursor?: TeamMessageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TeamMessages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TeamMessages.
     */
    skip?: number
    distinct?: TeamMessageScalarFieldEnum | TeamMessageScalarFieldEnum[]
  }

  /**
   * TeamMessage create
   */
  export type TeamMessageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMessage
     */
    select?: TeamMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMessageInclude<ExtArgs> | null
    /**
     * The data needed to create a TeamMessage.
     */
    data: XOR<TeamMessageCreateInput, TeamMessageUncheckedCreateInput>
  }

  /**
   * TeamMessage createMany
   */
  export type TeamMessageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TeamMessages.
     */
    data: TeamMessageCreateManyInput | TeamMessageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TeamMessage createManyAndReturn
   */
  export type TeamMessageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMessage
     */
    select?: TeamMessageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TeamMessages.
     */
    data: TeamMessageCreateManyInput | TeamMessageCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMessageIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TeamMessage update
   */
  export type TeamMessageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMessage
     */
    select?: TeamMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMessageInclude<ExtArgs> | null
    /**
     * The data needed to update a TeamMessage.
     */
    data: XOR<TeamMessageUpdateInput, TeamMessageUncheckedUpdateInput>
    /**
     * Choose, which TeamMessage to update.
     */
    where: TeamMessageWhereUniqueInput
  }

  /**
   * TeamMessage updateMany
   */
  export type TeamMessageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TeamMessages.
     */
    data: XOR<TeamMessageUpdateManyMutationInput, TeamMessageUncheckedUpdateManyInput>
    /**
     * Filter which TeamMessages to update
     */
    where?: TeamMessageWhereInput
  }

  /**
   * TeamMessage upsert
   */
  export type TeamMessageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMessage
     */
    select?: TeamMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMessageInclude<ExtArgs> | null
    /**
     * The filter to search for the TeamMessage to update in case it exists.
     */
    where: TeamMessageWhereUniqueInput
    /**
     * In case the TeamMessage found by the `where` argument doesn't exist, create a new TeamMessage with this data.
     */
    create: XOR<TeamMessageCreateInput, TeamMessageUncheckedCreateInput>
    /**
     * In case the TeamMessage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TeamMessageUpdateInput, TeamMessageUncheckedUpdateInput>
  }

  /**
   * TeamMessage delete
   */
  export type TeamMessageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMessage
     */
    select?: TeamMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMessageInclude<ExtArgs> | null
    /**
     * Filter which TeamMessage to delete.
     */
    where: TeamMessageWhereUniqueInput
  }

  /**
   * TeamMessage deleteMany
   */
  export type TeamMessageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TeamMessages to delete
     */
    where?: TeamMessageWhereInput
  }

  /**
   * TeamMessage without action
   */
  export type TeamMessageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TeamMessage
     */
    select?: TeamMessageSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TeamMessageInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ClassroomScalarFieldEnum: {
    id: 'id',
    name: 'name',
    grade: 'grade',
    major: 'major'
  };

  export type ClassroomScalarFieldEnum = (typeof ClassroomScalarFieldEnum)[keyof typeof ClassroomScalarFieldEnum]


  export const StudentScalarFieldEnum: {
    id: 'id',
    name: 'name',
    nisn: 'nisn',
    classroomId: 'classroomId',
    geftStatus: 'geftStatus',
    diagnosticScore: 'diagnosticScore',
    diagnosticLevel: 'diagnosticLevel',
    createdAt: 'createdAt'
  };

  export type StudentScalarFieldEnum = (typeof StudentScalarFieldEnum)[keyof typeof StudentScalarFieldEnum]


  export const GeftResultScalarFieldEnum: {
    id: 'id',
    studentId: 'studentId',
    score: 'score',
    cognitiveStyle: 'cognitiveStyle',
    completedAt: 'completedAt'
  };

  export type GeftResultScalarFieldEnum = (typeof GeftResultScalarFieldEnum)[keyof typeof GeftResultScalarFieldEnum]


  export const GameSessionScalarFieldEnum: {
    id: 'id',
    studentId: 'studentId',
    levelId: 'levelId',
    cognitiveStyle: 'cognitiveStyle',
    xpEarned: 'xpEarned',
    livesRemaining: 'livesRemaining',
    timeTaken: 'timeTaken',
    verdictAnswer: 'verdictAnswer',
    isCorrect: 'isCorrect',
    createdAt: 'createdAt'
  };

  export type GameSessionScalarFieldEnum = (typeof GameSessionScalarFieldEnum)[keyof typeof GameSessionScalarFieldEnum]


  export const LeaderboardScalarFieldEnum: {
    id: 'id',
    studentId: 'studentId',
    username: 'username',
    totalXp: 'totalXp',
    badges: 'badges',
    updatedAt: 'updatedAt'
  };

  export type LeaderboardScalarFieldEnum = (typeof LeaderboardScalarFieldEnum)[keyof typeof LeaderboardScalarFieldEnum]


  export const ChatbotKnowledgeScalarFieldEnum: {
    id: 'id',
    title: 'title',
    content: 'content',
    category: 'category',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ChatbotKnowledgeScalarFieldEnum = (typeof ChatbotKnowledgeScalarFieldEnum)[keyof typeof ChatbotKnowledgeScalarFieldEnum]


  export const TeamScalarFieldEnum: {
    id: 'id',
    classroomId: 'classroomId',
    levelId: 'levelId',
    status: 'status',
    currentStep: 'currentStep',
    histogramState: 'histogramState',
    verdictAnswer: 'verdictAnswer',
    isCorrect: 'isCorrect',
    gamePhase: 'gamePhase',
    readyVotes: 'readyVotes',
    formulaState: 'formulaState',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TeamScalarFieldEnum = (typeof TeamScalarFieldEnum)[keyof typeof TeamScalarFieldEnum]


  export const TeamMemberScalarFieldEnum: {
    id: 'id',
    teamId: 'teamId',
    studentId: 'studentId',
    joinedAt: 'joinedAt'
  };

  export type TeamMemberScalarFieldEnum = (typeof TeamMemberScalarFieldEnum)[keyof typeof TeamMemberScalarFieldEnum]


  export const TeamMessageScalarFieldEnum: {
    id: 'id',
    teamId: 'teamId',
    studentId: 'studentId',
    senderName: 'senderName',
    content: 'content',
    createdAt: 'createdAt'
  };

  export type TeamMessageScalarFieldEnum = (typeof TeamMessageScalarFieldEnum)[keyof typeof TeamMessageScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'GeftStatus'
   */
  export type EnumGeftStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'GeftStatus'>
    


  /**
   * Reference to a field of type 'GeftStatus[]'
   */
  export type ListEnumGeftStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'GeftStatus[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'CognitiveStyle'
   */
  export type EnumCognitiveStyleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CognitiveStyle'>
    


  /**
   * Reference to a field of type 'CognitiveStyle[]'
   */
  export type ListEnumCognitiveStyleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'CognitiveStyle[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type ClassroomWhereInput = {
    AND?: ClassroomWhereInput | ClassroomWhereInput[]
    OR?: ClassroomWhereInput[]
    NOT?: ClassroomWhereInput | ClassroomWhereInput[]
    id?: StringFilter<"Classroom"> | string
    name?: StringFilter<"Classroom"> | string
    grade?: StringFilter<"Classroom"> | string
    major?: StringFilter<"Classroom"> | string
    students?: StudentListRelationFilter
    teams?: TeamListRelationFilter
  }

  export type ClassroomOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    grade?: SortOrder
    major?: SortOrder
    students?: StudentOrderByRelationAggregateInput
    teams?: TeamOrderByRelationAggregateInput
  }

  export type ClassroomWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ClassroomWhereInput | ClassroomWhereInput[]
    OR?: ClassroomWhereInput[]
    NOT?: ClassroomWhereInput | ClassroomWhereInput[]
    name?: StringFilter<"Classroom"> | string
    grade?: StringFilter<"Classroom"> | string
    major?: StringFilter<"Classroom"> | string
    students?: StudentListRelationFilter
    teams?: TeamListRelationFilter
  }, "id">

  export type ClassroomOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    grade?: SortOrder
    major?: SortOrder
    _count?: ClassroomCountOrderByAggregateInput
    _max?: ClassroomMaxOrderByAggregateInput
    _min?: ClassroomMinOrderByAggregateInput
  }

  export type ClassroomScalarWhereWithAggregatesInput = {
    AND?: ClassroomScalarWhereWithAggregatesInput | ClassroomScalarWhereWithAggregatesInput[]
    OR?: ClassroomScalarWhereWithAggregatesInput[]
    NOT?: ClassroomScalarWhereWithAggregatesInput | ClassroomScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Classroom"> | string
    name?: StringWithAggregatesFilter<"Classroom"> | string
    grade?: StringWithAggregatesFilter<"Classroom"> | string
    major?: StringWithAggregatesFilter<"Classroom"> | string
  }

  export type StudentWhereInput = {
    AND?: StudentWhereInput | StudentWhereInput[]
    OR?: StudentWhereInput[]
    NOT?: StudentWhereInput | StudentWhereInput[]
    id?: StringFilter<"Student"> | string
    name?: StringFilter<"Student"> | string
    nisn?: StringFilter<"Student"> | string
    classroomId?: StringFilter<"Student"> | string
    geftStatus?: EnumGeftStatusFilter<"Student"> | $Enums.GeftStatus
    diagnosticScore?: IntNullableFilter<"Student"> | number | null
    diagnosticLevel?: StringNullableFilter<"Student"> | string | null
    createdAt?: DateTimeFilter<"Student"> | Date | string
    geftResult?: XOR<GeftResultNullableRelationFilter, GeftResultWhereInput> | null
    gameSessions?: GameSessionListRelationFilter
    leaderboard?: XOR<LeaderboardNullableRelationFilter, LeaderboardWhereInput> | null
    teamMembers?: TeamMemberListRelationFilter
    teamMessages?: TeamMessageListRelationFilter
    classroom?: XOR<ClassroomRelationFilter, ClassroomWhereInput>
  }

  export type StudentOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    nisn?: SortOrder
    classroomId?: SortOrder
    geftStatus?: SortOrder
    diagnosticScore?: SortOrderInput | SortOrder
    diagnosticLevel?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    geftResult?: GeftResultOrderByWithRelationInput
    gameSessions?: GameSessionOrderByRelationAggregateInput
    leaderboard?: LeaderboardOrderByWithRelationInput
    teamMembers?: TeamMemberOrderByRelationAggregateInput
    teamMessages?: TeamMessageOrderByRelationAggregateInput
    classroom?: ClassroomOrderByWithRelationInput
  }

  export type StudentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    nisn?: string
    AND?: StudentWhereInput | StudentWhereInput[]
    OR?: StudentWhereInput[]
    NOT?: StudentWhereInput | StudentWhereInput[]
    name?: StringFilter<"Student"> | string
    classroomId?: StringFilter<"Student"> | string
    geftStatus?: EnumGeftStatusFilter<"Student"> | $Enums.GeftStatus
    diagnosticScore?: IntNullableFilter<"Student"> | number | null
    diagnosticLevel?: StringNullableFilter<"Student"> | string | null
    createdAt?: DateTimeFilter<"Student"> | Date | string
    geftResult?: XOR<GeftResultNullableRelationFilter, GeftResultWhereInput> | null
    gameSessions?: GameSessionListRelationFilter
    leaderboard?: XOR<LeaderboardNullableRelationFilter, LeaderboardWhereInput> | null
    teamMembers?: TeamMemberListRelationFilter
    teamMessages?: TeamMessageListRelationFilter
    classroom?: XOR<ClassroomRelationFilter, ClassroomWhereInput>
  }, "id" | "nisn">

  export type StudentOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    nisn?: SortOrder
    classroomId?: SortOrder
    geftStatus?: SortOrder
    diagnosticScore?: SortOrderInput | SortOrder
    diagnosticLevel?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: StudentCountOrderByAggregateInput
    _avg?: StudentAvgOrderByAggregateInput
    _max?: StudentMaxOrderByAggregateInput
    _min?: StudentMinOrderByAggregateInput
    _sum?: StudentSumOrderByAggregateInput
  }

  export type StudentScalarWhereWithAggregatesInput = {
    AND?: StudentScalarWhereWithAggregatesInput | StudentScalarWhereWithAggregatesInput[]
    OR?: StudentScalarWhereWithAggregatesInput[]
    NOT?: StudentScalarWhereWithAggregatesInput | StudentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Student"> | string
    name?: StringWithAggregatesFilter<"Student"> | string
    nisn?: StringWithAggregatesFilter<"Student"> | string
    classroomId?: StringWithAggregatesFilter<"Student"> | string
    geftStatus?: EnumGeftStatusWithAggregatesFilter<"Student"> | $Enums.GeftStatus
    diagnosticScore?: IntNullableWithAggregatesFilter<"Student"> | number | null
    diagnosticLevel?: StringNullableWithAggregatesFilter<"Student"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Student"> | Date | string
  }

  export type GeftResultWhereInput = {
    AND?: GeftResultWhereInput | GeftResultWhereInput[]
    OR?: GeftResultWhereInput[]
    NOT?: GeftResultWhereInput | GeftResultWhereInput[]
    id?: StringFilter<"GeftResult"> | string
    studentId?: StringFilter<"GeftResult"> | string
    score?: IntFilter<"GeftResult"> | number
    cognitiveStyle?: EnumCognitiveStyleFilter<"GeftResult"> | $Enums.CognitiveStyle
    completedAt?: DateTimeFilter<"GeftResult"> | Date | string
    student?: XOR<StudentRelationFilter, StudentWhereInput>
  }

  export type GeftResultOrderByWithRelationInput = {
    id?: SortOrder
    studentId?: SortOrder
    score?: SortOrder
    cognitiveStyle?: SortOrder
    completedAt?: SortOrder
    student?: StudentOrderByWithRelationInput
  }

  export type GeftResultWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    studentId?: string
    AND?: GeftResultWhereInput | GeftResultWhereInput[]
    OR?: GeftResultWhereInput[]
    NOT?: GeftResultWhereInput | GeftResultWhereInput[]
    score?: IntFilter<"GeftResult"> | number
    cognitiveStyle?: EnumCognitiveStyleFilter<"GeftResult"> | $Enums.CognitiveStyle
    completedAt?: DateTimeFilter<"GeftResult"> | Date | string
    student?: XOR<StudentRelationFilter, StudentWhereInput>
  }, "id" | "studentId">

  export type GeftResultOrderByWithAggregationInput = {
    id?: SortOrder
    studentId?: SortOrder
    score?: SortOrder
    cognitiveStyle?: SortOrder
    completedAt?: SortOrder
    _count?: GeftResultCountOrderByAggregateInput
    _avg?: GeftResultAvgOrderByAggregateInput
    _max?: GeftResultMaxOrderByAggregateInput
    _min?: GeftResultMinOrderByAggregateInput
    _sum?: GeftResultSumOrderByAggregateInput
  }

  export type GeftResultScalarWhereWithAggregatesInput = {
    AND?: GeftResultScalarWhereWithAggregatesInput | GeftResultScalarWhereWithAggregatesInput[]
    OR?: GeftResultScalarWhereWithAggregatesInput[]
    NOT?: GeftResultScalarWhereWithAggregatesInput | GeftResultScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GeftResult"> | string
    studentId?: StringWithAggregatesFilter<"GeftResult"> | string
    score?: IntWithAggregatesFilter<"GeftResult"> | number
    cognitiveStyle?: EnumCognitiveStyleWithAggregatesFilter<"GeftResult"> | $Enums.CognitiveStyle
    completedAt?: DateTimeWithAggregatesFilter<"GeftResult"> | Date | string
  }

  export type GameSessionWhereInput = {
    AND?: GameSessionWhereInput | GameSessionWhereInput[]
    OR?: GameSessionWhereInput[]
    NOT?: GameSessionWhereInput | GameSessionWhereInput[]
    id?: StringFilter<"GameSession"> | string
    studentId?: StringFilter<"GameSession"> | string
    levelId?: IntFilter<"GameSession"> | number
    cognitiveStyle?: StringFilter<"GameSession"> | string
    xpEarned?: IntFilter<"GameSession"> | number
    livesRemaining?: IntFilter<"GameSession"> | number
    timeTaken?: IntFilter<"GameSession"> | number
    verdictAnswer?: StringFilter<"GameSession"> | string
    isCorrect?: BoolFilter<"GameSession"> | boolean
    createdAt?: DateTimeFilter<"GameSession"> | Date | string
    student?: XOR<StudentRelationFilter, StudentWhereInput>
  }

  export type GameSessionOrderByWithRelationInput = {
    id?: SortOrder
    studentId?: SortOrder
    levelId?: SortOrder
    cognitiveStyle?: SortOrder
    xpEarned?: SortOrder
    livesRemaining?: SortOrder
    timeTaken?: SortOrder
    verdictAnswer?: SortOrder
    isCorrect?: SortOrder
    createdAt?: SortOrder
    student?: StudentOrderByWithRelationInput
  }

  export type GameSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: GameSessionWhereInput | GameSessionWhereInput[]
    OR?: GameSessionWhereInput[]
    NOT?: GameSessionWhereInput | GameSessionWhereInput[]
    studentId?: StringFilter<"GameSession"> | string
    levelId?: IntFilter<"GameSession"> | number
    cognitiveStyle?: StringFilter<"GameSession"> | string
    xpEarned?: IntFilter<"GameSession"> | number
    livesRemaining?: IntFilter<"GameSession"> | number
    timeTaken?: IntFilter<"GameSession"> | number
    verdictAnswer?: StringFilter<"GameSession"> | string
    isCorrect?: BoolFilter<"GameSession"> | boolean
    createdAt?: DateTimeFilter<"GameSession"> | Date | string
    student?: XOR<StudentRelationFilter, StudentWhereInput>
  }, "id">

  export type GameSessionOrderByWithAggregationInput = {
    id?: SortOrder
    studentId?: SortOrder
    levelId?: SortOrder
    cognitiveStyle?: SortOrder
    xpEarned?: SortOrder
    livesRemaining?: SortOrder
    timeTaken?: SortOrder
    verdictAnswer?: SortOrder
    isCorrect?: SortOrder
    createdAt?: SortOrder
    _count?: GameSessionCountOrderByAggregateInput
    _avg?: GameSessionAvgOrderByAggregateInput
    _max?: GameSessionMaxOrderByAggregateInput
    _min?: GameSessionMinOrderByAggregateInput
    _sum?: GameSessionSumOrderByAggregateInput
  }

  export type GameSessionScalarWhereWithAggregatesInput = {
    AND?: GameSessionScalarWhereWithAggregatesInput | GameSessionScalarWhereWithAggregatesInput[]
    OR?: GameSessionScalarWhereWithAggregatesInput[]
    NOT?: GameSessionScalarWhereWithAggregatesInput | GameSessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GameSession"> | string
    studentId?: StringWithAggregatesFilter<"GameSession"> | string
    levelId?: IntWithAggregatesFilter<"GameSession"> | number
    cognitiveStyle?: StringWithAggregatesFilter<"GameSession"> | string
    xpEarned?: IntWithAggregatesFilter<"GameSession"> | number
    livesRemaining?: IntWithAggregatesFilter<"GameSession"> | number
    timeTaken?: IntWithAggregatesFilter<"GameSession"> | number
    verdictAnswer?: StringWithAggregatesFilter<"GameSession"> | string
    isCorrect?: BoolWithAggregatesFilter<"GameSession"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"GameSession"> | Date | string
  }

  export type LeaderboardWhereInput = {
    AND?: LeaderboardWhereInput | LeaderboardWhereInput[]
    OR?: LeaderboardWhereInput[]
    NOT?: LeaderboardWhereInput | LeaderboardWhereInput[]
    id?: StringFilter<"Leaderboard"> | string
    studentId?: StringFilter<"Leaderboard"> | string
    username?: StringFilter<"Leaderboard"> | string
    totalXp?: IntFilter<"Leaderboard"> | number
    badges?: StringNullableListFilter<"Leaderboard">
    updatedAt?: DateTimeFilter<"Leaderboard"> | Date | string
    student?: XOR<StudentRelationFilter, StudentWhereInput>
  }

  export type LeaderboardOrderByWithRelationInput = {
    id?: SortOrder
    studentId?: SortOrder
    username?: SortOrder
    totalXp?: SortOrder
    badges?: SortOrder
    updatedAt?: SortOrder
    student?: StudentOrderByWithRelationInput
  }

  export type LeaderboardWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    studentId?: string
    AND?: LeaderboardWhereInput | LeaderboardWhereInput[]
    OR?: LeaderboardWhereInput[]
    NOT?: LeaderboardWhereInput | LeaderboardWhereInput[]
    username?: StringFilter<"Leaderboard"> | string
    totalXp?: IntFilter<"Leaderboard"> | number
    badges?: StringNullableListFilter<"Leaderboard">
    updatedAt?: DateTimeFilter<"Leaderboard"> | Date | string
    student?: XOR<StudentRelationFilter, StudentWhereInput>
  }, "id" | "studentId">

  export type LeaderboardOrderByWithAggregationInput = {
    id?: SortOrder
    studentId?: SortOrder
    username?: SortOrder
    totalXp?: SortOrder
    badges?: SortOrder
    updatedAt?: SortOrder
    _count?: LeaderboardCountOrderByAggregateInput
    _avg?: LeaderboardAvgOrderByAggregateInput
    _max?: LeaderboardMaxOrderByAggregateInput
    _min?: LeaderboardMinOrderByAggregateInput
    _sum?: LeaderboardSumOrderByAggregateInput
  }

  export type LeaderboardScalarWhereWithAggregatesInput = {
    AND?: LeaderboardScalarWhereWithAggregatesInput | LeaderboardScalarWhereWithAggregatesInput[]
    OR?: LeaderboardScalarWhereWithAggregatesInput[]
    NOT?: LeaderboardScalarWhereWithAggregatesInput | LeaderboardScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Leaderboard"> | string
    studentId?: StringWithAggregatesFilter<"Leaderboard"> | string
    username?: StringWithAggregatesFilter<"Leaderboard"> | string
    totalXp?: IntWithAggregatesFilter<"Leaderboard"> | number
    badges?: StringNullableListFilter<"Leaderboard">
    updatedAt?: DateTimeWithAggregatesFilter<"Leaderboard"> | Date | string
  }

  export type ChatbotKnowledgeWhereInput = {
    AND?: ChatbotKnowledgeWhereInput | ChatbotKnowledgeWhereInput[]
    OR?: ChatbotKnowledgeWhereInput[]
    NOT?: ChatbotKnowledgeWhereInput | ChatbotKnowledgeWhereInput[]
    id?: StringFilter<"ChatbotKnowledge"> | string
    title?: StringFilter<"ChatbotKnowledge"> | string
    content?: StringFilter<"ChatbotKnowledge"> | string
    category?: StringFilter<"ChatbotKnowledge"> | string
    createdAt?: DateTimeFilter<"ChatbotKnowledge"> | Date | string
    updatedAt?: DateTimeFilter<"ChatbotKnowledge"> | Date | string
  }

  export type ChatbotKnowledgeOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChatbotKnowledgeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ChatbotKnowledgeWhereInput | ChatbotKnowledgeWhereInput[]
    OR?: ChatbotKnowledgeWhereInput[]
    NOT?: ChatbotKnowledgeWhereInput | ChatbotKnowledgeWhereInput[]
    title?: StringFilter<"ChatbotKnowledge"> | string
    content?: StringFilter<"ChatbotKnowledge"> | string
    category?: StringFilter<"ChatbotKnowledge"> | string
    createdAt?: DateTimeFilter<"ChatbotKnowledge"> | Date | string
    updatedAt?: DateTimeFilter<"ChatbotKnowledge"> | Date | string
  }, "id">

  export type ChatbotKnowledgeOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ChatbotKnowledgeCountOrderByAggregateInput
    _max?: ChatbotKnowledgeMaxOrderByAggregateInput
    _min?: ChatbotKnowledgeMinOrderByAggregateInput
  }

  export type ChatbotKnowledgeScalarWhereWithAggregatesInput = {
    AND?: ChatbotKnowledgeScalarWhereWithAggregatesInput | ChatbotKnowledgeScalarWhereWithAggregatesInput[]
    OR?: ChatbotKnowledgeScalarWhereWithAggregatesInput[]
    NOT?: ChatbotKnowledgeScalarWhereWithAggregatesInput | ChatbotKnowledgeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ChatbotKnowledge"> | string
    title?: StringWithAggregatesFilter<"ChatbotKnowledge"> | string
    content?: StringWithAggregatesFilter<"ChatbotKnowledge"> | string
    category?: StringWithAggregatesFilter<"ChatbotKnowledge"> | string
    createdAt?: DateTimeWithAggregatesFilter<"ChatbotKnowledge"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ChatbotKnowledge"> | Date | string
  }

  export type TeamWhereInput = {
    AND?: TeamWhereInput | TeamWhereInput[]
    OR?: TeamWhereInput[]
    NOT?: TeamWhereInput | TeamWhereInput[]
    id?: StringFilter<"Team"> | string
    classroomId?: StringFilter<"Team"> | string
    levelId?: IntFilter<"Team"> | number
    status?: StringFilter<"Team"> | string
    currentStep?: IntFilter<"Team"> | number
    histogramState?: JsonNullableFilter<"Team">
    verdictAnswer?: StringFilter<"Team"> | string
    isCorrect?: BoolFilter<"Team"> | boolean
    gamePhase?: StringFilter<"Team"> | string
    readyVotes?: JsonNullableFilter<"Team">
    formulaState?: JsonNullableFilter<"Team">
    createdAt?: DateTimeFilter<"Team"> | Date | string
    updatedAt?: DateTimeFilter<"Team"> | Date | string
    members?: TeamMemberListRelationFilter
    chatMessages?: TeamMessageListRelationFilter
    classroom?: XOR<ClassroomRelationFilter, ClassroomWhereInput>
  }

  export type TeamOrderByWithRelationInput = {
    id?: SortOrder
    classroomId?: SortOrder
    levelId?: SortOrder
    status?: SortOrder
    currentStep?: SortOrder
    histogramState?: SortOrderInput | SortOrder
    verdictAnswer?: SortOrder
    isCorrect?: SortOrder
    gamePhase?: SortOrder
    readyVotes?: SortOrderInput | SortOrder
    formulaState?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    members?: TeamMemberOrderByRelationAggregateInput
    chatMessages?: TeamMessageOrderByRelationAggregateInput
    classroom?: ClassroomOrderByWithRelationInput
  }

  export type TeamWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TeamWhereInput | TeamWhereInput[]
    OR?: TeamWhereInput[]
    NOT?: TeamWhereInput | TeamWhereInput[]
    classroomId?: StringFilter<"Team"> | string
    levelId?: IntFilter<"Team"> | number
    status?: StringFilter<"Team"> | string
    currentStep?: IntFilter<"Team"> | number
    histogramState?: JsonNullableFilter<"Team">
    verdictAnswer?: StringFilter<"Team"> | string
    isCorrect?: BoolFilter<"Team"> | boolean
    gamePhase?: StringFilter<"Team"> | string
    readyVotes?: JsonNullableFilter<"Team">
    formulaState?: JsonNullableFilter<"Team">
    createdAt?: DateTimeFilter<"Team"> | Date | string
    updatedAt?: DateTimeFilter<"Team"> | Date | string
    members?: TeamMemberListRelationFilter
    chatMessages?: TeamMessageListRelationFilter
    classroom?: XOR<ClassroomRelationFilter, ClassroomWhereInput>
  }, "id">

  export type TeamOrderByWithAggregationInput = {
    id?: SortOrder
    classroomId?: SortOrder
    levelId?: SortOrder
    status?: SortOrder
    currentStep?: SortOrder
    histogramState?: SortOrderInput | SortOrder
    verdictAnswer?: SortOrder
    isCorrect?: SortOrder
    gamePhase?: SortOrder
    readyVotes?: SortOrderInput | SortOrder
    formulaState?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TeamCountOrderByAggregateInput
    _avg?: TeamAvgOrderByAggregateInput
    _max?: TeamMaxOrderByAggregateInput
    _min?: TeamMinOrderByAggregateInput
    _sum?: TeamSumOrderByAggregateInput
  }

  export type TeamScalarWhereWithAggregatesInput = {
    AND?: TeamScalarWhereWithAggregatesInput | TeamScalarWhereWithAggregatesInput[]
    OR?: TeamScalarWhereWithAggregatesInput[]
    NOT?: TeamScalarWhereWithAggregatesInput | TeamScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Team"> | string
    classroomId?: StringWithAggregatesFilter<"Team"> | string
    levelId?: IntWithAggregatesFilter<"Team"> | number
    status?: StringWithAggregatesFilter<"Team"> | string
    currentStep?: IntWithAggregatesFilter<"Team"> | number
    histogramState?: JsonNullableWithAggregatesFilter<"Team">
    verdictAnswer?: StringWithAggregatesFilter<"Team"> | string
    isCorrect?: BoolWithAggregatesFilter<"Team"> | boolean
    gamePhase?: StringWithAggregatesFilter<"Team"> | string
    readyVotes?: JsonNullableWithAggregatesFilter<"Team">
    formulaState?: JsonNullableWithAggregatesFilter<"Team">
    createdAt?: DateTimeWithAggregatesFilter<"Team"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Team"> | Date | string
  }

  export type TeamMemberWhereInput = {
    AND?: TeamMemberWhereInput | TeamMemberWhereInput[]
    OR?: TeamMemberWhereInput[]
    NOT?: TeamMemberWhereInput | TeamMemberWhereInput[]
    id?: StringFilter<"TeamMember"> | string
    teamId?: StringFilter<"TeamMember"> | string
    studentId?: StringFilter<"TeamMember"> | string
    joinedAt?: DateTimeFilter<"TeamMember"> | Date | string
    team?: XOR<TeamRelationFilter, TeamWhereInput>
    student?: XOR<StudentRelationFilter, StudentWhereInput>
  }

  export type TeamMemberOrderByWithRelationInput = {
    id?: SortOrder
    teamId?: SortOrder
    studentId?: SortOrder
    joinedAt?: SortOrder
    team?: TeamOrderByWithRelationInput
    student?: StudentOrderByWithRelationInput
  }

  export type TeamMemberWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    teamId_studentId?: TeamMemberTeamIdStudentIdCompoundUniqueInput
    AND?: TeamMemberWhereInput | TeamMemberWhereInput[]
    OR?: TeamMemberWhereInput[]
    NOT?: TeamMemberWhereInput | TeamMemberWhereInput[]
    teamId?: StringFilter<"TeamMember"> | string
    studentId?: StringFilter<"TeamMember"> | string
    joinedAt?: DateTimeFilter<"TeamMember"> | Date | string
    team?: XOR<TeamRelationFilter, TeamWhereInput>
    student?: XOR<StudentRelationFilter, StudentWhereInput>
  }, "id" | "teamId_studentId">

  export type TeamMemberOrderByWithAggregationInput = {
    id?: SortOrder
    teamId?: SortOrder
    studentId?: SortOrder
    joinedAt?: SortOrder
    _count?: TeamMemberCountOrderByAggregateInput
    _max?: TeamMemberMaxOrderByAggregateInput
    _min?: TeamMemberMinOrderByAggregateInput
  }

  export type TeamMemberScalarWhereWithAggregatesInput = {
    AND?: TeamMemberScalarWhereWithAggregatesInput | TeamMemberScalarWhereWithAggregatesInput[]
    OR?: TeamMemberScalarWhereWithAggregatesInput[]
    NOT?: TeamMemberScalarWhereWithAggregatesInput | TeamMemberScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TeamMember"> | string
    teamId?: StringWithAggregatesFilter<"TeamMember"> | string
    studentId?: StringWithAggregatesFilter<"TeamMember"> | string
    joinedAt?: DateTimeWithAggregatesFilter<"TeamMember"> | Date | string
  }

  export type TeamMessageWhereInput = {
    AND?: TeamMessageWhereInput | TeamMessageWhereInput[]
    OR?: TeamMessageWhereInput[]
    NOT?: TeamMessageWhereInput | TeamMessageWhereInput[]
    id?: StringFilter<"TeamMessage"> | string
    teamId?: StringFilter<"TeamMessage"> | string
    studentId?: StringFilter<"TeamMessage"> | string
    senderName?: StringFilter<"TeamMessage"> | string
    content?: StringFilter<"TeamMessage"> | string
    createdAt?: DateTimeFilter<"TeamMessage"> | Date | string
    team?: XOR<TeamRelationFilter, TeamWhereInput>
    student?: XOR<StudentRelationFilter, StudentWhereInput>
  }

  export type TeamMessageOrderByWithRelationInput = {
    id?: SortOrder
    teamId?: SortOrder
    studentId?: SortOrder
    senderName?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    team?: TeamOrderByWithRelationInput
    student?: StudentOrderByWithRelationInput
  }

  export type TeamMessageWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TeamMessageWhereInput | TeamMessageWhereInput[]
    OR?: TeamMessageWhereInput[]
    NOT?: TeamMessageWhereInput | TeamMessageWhereInput[]
    teamId?: StringFilter<"TeamMessage"> | string
    studentId?: StringFilter<"TeamMessage"> | string
    senderName?: StringFilter<"TeamMessage"> | string
    content?: StringFilter<"TeamMessage"> | string
    createdAt?: DateTimeFilter<"TeamMessage"> | Date | string
    team?: XOR<TeamRelationFilter, TeamWhereInput>
    student?: XOR<StudentRelationFilter, StudentWhereInput>
  }, "id">

  export type TeamMessageOrderByWithAggregationInput = {
    id?: SortOrder
    teamId?: SortOrder
    studentId?: SortOrder
    senderName?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
    _count?: TeamMessageCountOrderByAggregateInput
    _max?: TeamMessageMaxOrderByAggregateInput
    _min?: TeamMessageMinOrderByAggregateInput
  }

  export type TeamMessageScalarWhereWithAggregatesInput = {
    AND?: TeamMessageScalarWhereWithAggregatesInput | TeamMessageScalarWhereWithAggregatesInput[]
    OR?: TeamMessageScalarWhereWithAggregatesInput[]
    NOT?: TeamMessageScalarWhereWithAggregatesInput | TeamMessageScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TeamMessage"> | string
    teamId?: StringWithAggregatesFilter<"TeamMessage"> | string
    studentId?: StringWithAggregatesFilter<"TeamMessage"> | string
    senderName?: StringWithAggregatesFilter<"TeamMessage"> | string
    content?: StringWithAggregatesFilter<"TeamMessage"> | string
    createdAt?: DateTimeWithAggregatesFilter<"TeamMessage"> | Date | string
  }

  export type ClassroomCreateInput = {
    id?: string
    name: string
    grade: string
    major: string
    students?: StudentCreateNestedManyWithoutClassroomInput
    teams?: TeamCreateNestedManyWithoutClassroomInput
  }

  export type ClassroomUncheckedCreateInput = {
    id?: string
    name: string
    grade: string
    major: string
    students?: StudentUncheckedCreateNestedManyWithoutClassroomInput
    teams?: TeamUncheckedCreateNestedManyWithoutClassroomInput
  }

  export type ClassroomUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    grade?: StringFieldUpdateOperationsInput | string
    major?: StringFieldUpdateOperationsInput | string
    students?: StudentUpdateManyWithoutClassroomNestedInput
    teams?: TeamUpdateManyWithoutClassroomNestedInput
  }

  export type ClassroomUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    grade?: StringFieldUpdateOperationsInput | string
    major?: StringFieldUpdateOperationsInput | string
    students?: StudentUncheckedUpdateManyWithoutClassroomNestedInput
    teams?: TeamUncheckedUpdateManyWithoutClassroomNestedInput
  }

  export type ClassroomCreateManyInput = {
    id?: string
    name: string
    grade: string
    major: string
  }

  export type ClassroomUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    grade?: StringFieldUpdateOperationsInput | string
    major?: StringFieldUpdateOperationsInput | string
  }

  export type ClassroomUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    grade?: StringFieldUpdateOperationsInput | string
    major?: StringFieldUpdateOperationsInput | string
  }

  export type StudentCreateInput = {
    id?: string
    name: string
    nisn: string
    geftStatus?: $Enums.GeftStatus
    diagnosticScore?: number | null
    diagnosticLevel?: string | null
    createdAt?: Date | string
    geftResult?: GeftResultCreateNestedOneWithoutStudentInput
    gameSessions?: GameSessionCreateNestedManyWithoutStudentInput
    leaderboard?: LeaderboardCreateNestedOneWithoutStudentInput
    teamMembers?: TeamMemberCreateNestedManyWithoutStudentInput
    teamMessages?: TeamMessageCreateNestedManyWithoutStudentInput
    classroom: ClassroomCreateNestedOneWithoutStudentsInput
  }

  export type StudentUncheckedCreateInput = {
    id?: string
    name: string
    nisn: string
    classroomId: string
    geftStatus?: $Enums.GeftStatus
    diagnosticScore?: number | null
    diagnosticLevel?: string | null
    createdAt?: Date | string
    geftResult?: GeftResultUncheckedCreateNestedOneWithoutStudentInput
    gameSessions?: GameSessionUncheckedCreateNestedManyWithoutStudentInput
    leaderboard?: LeaderboardUncheckedCreateNestedOneWithoutStudentInput
    teamMembers?: TeamMemberUncheckedCreateNestedManyWithoutStudentInput
    teamMessages?: TeamMessageUncheckedCreateNestedManyWithoutStudentInput
  }

  export type StudentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    diagnosticScore?: NullableIntFieldUpdateOperationsInput | number | null
    diagnosticLevel?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    geftResult?: GeftResultUpdateOneWithoutStudentNestedInput
    gameSessions?: GameSessionUpdateManyWithoutStudentNestedInput
    leaderboard?: LeaderboardUpdateOneWithoutStudentNestedInput
    teamMembers?: TeamMemberUpdateManyWithoutStudentNestedInput
    teamMessages?: TeamMessageUpdateManyWithoutStudentNestedInput
    classroom?: ClassroomUpdateOneRequiredWithoutStudentsNestedInput
  }

  export type StudentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    classroomId?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    diagnosticScore?: NullableIntFieldUpdateOperationsInput | number | null
    diagnosticLevel?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    geftResult?: GeftResultUncheckedUpdateOneWithoutStudentNestedInput
    gameSessions?: GameSessionUncheckedUpdateManyWithoutStudentNestedInput
    leaderboard?: LeaderboardUncheckedUpdateOneWithoutStudentNestedInput
    teamMembers?: TeamMemberUncheckedUpdateManyWithoutStudentNestedInput
    teamMessages?: TeamMessageUncheckedUpdateManyWithoutStudentNestedInput
  }

  export type StudentCreateManyInput = {
    id?: string
    name: string
    nisn: string
    classroomId: string
    geftStatus?: $Enums.GeftStatus
    diagnosticScore?: number | null
    diagnosticLevel?: string | null
    createdAt?: Date | string
  }

  export type StudentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    diagnosticScore?: NullableIntFieldUpdateOperationsInput | number | null
    diagnosticLevel?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StudentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    classroomId?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    diagnosticScore?: NullableIntFieldUpdateOperationsInput | number | null
    diagnosticLevel?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GeftResultCreateInput = {
    id?: string
    score: number
    cognitiveStyle: $Enums.CognitiveStyle
    completedAt?: Date | string
    student: StudentCreateNestedOneWithoutGeftResultInput
  }

  export type GeftResultUncheckedCreateInput = {
    id?: string
    studentId: string
    score: number
    cognitiveStyle: $Enums.CognitiveStyle
    completedAt?: Date | string
  }

  export type GeftResultUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    score?: IntFieldUpdateOperationsInput | number
    cognitiveStyle?: EnumCognitiveStyleFieldUpdateOperationsInput | $Enums.CognitiveStyle
    completedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    student?: StudentUpdateOneRequiredWithoutGeftResultNestedInput
  }

  export type GeftResultUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    score?: IntFieldUpdateOperationsInput | number
    cognitiveStyle?: EnumCognitiveStyleFieldUpdateOperationsInput | $Enums.CognitiveStyle
    completedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GeftResultCreateManyInput = {
    id?: string
    studentId: string
    score: number
    cognitiveStyle: $Enums.CognitiveStyle
    completedAt?: Date | string
  }

  export type GeftResultUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    score?: IntFieldUpdateOperationsInput | number
    cognitiveStyle?: EnumCognitiveStyleFieldUpdateOperationsInput | $Enums.CognitiveStyle
    completedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GeftResultUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    score?: IntFieldUpdateOperationsInput | number
    cognitiveStyle?: EnumCognitiveStyleFieldUpdateOperationsInput | $Enums.CognitiveStyle
    completedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GameSessionCreateInput = {
    id?: string
    levelId: number
    cognitiveStyle: string
    xpEarned: number
    livesRemaining: number
    timeTaken: number
    verdictAnswer: string
    isCorrect: boolean
    createdAt?: Date | string
    student: StudentCreateNestedOneWithoutGameSessionsInput
  }

  export type GameSessionUncheckedCreateInput = {
    id?: string
    studentId: string
    levelId: number
    cognitiveStyle: string
    xpEarned: number
    livesRemaining: number
    timeTaken: number
    verdictAnswer: string
    isCorrect: boolean
    createdAt?: Date | string
  }

  export type GameSessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    levelId?: IntFieldUpdateOperationsInput | number
    cognitiveStyle?: StringFieldUpdateOperationsInput | string
    xpEarned?: IntFieldUpdateOperationsInput | number
    livesRemaining?: IntFieldUpdateOperationsInput | number
    timeTaken?: IntFieldUpdateOperationsInput | number
    verdictAnswer?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    student?: StudentUpdateOneRequiredWithoutGameSessionsNestedInput
  }

  export type GameSessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    levelId?: IntFieldUpdateOperationsInput | number
    cognitiveStyle?: StringFieldUpdateOperationsInput | string
    xpEarned?: IntFieldUpdateOperationsInput | number
    livesRemaining?: IntFieldUpdateOperationsInput | number
    timeTaken?: IntFieldUpdateOperationsInput | number
    verdictAnswer?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GameSessionCreateManyInput = {
    id?: string
    studentId: string
    levelId: number
    cognitiveStyle: string
    xpEarned: number
    livesRemaining: number
    timeTaken: number
    verdictAnswer: string
    isCorrect: boolean
    createdAt?: Date | string
  }

  export type GameSessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    levelId?: IntFieldUpdateOperationsInput | number
    cognitiveStyle?: StringFieldUpdateOperationsInput | string
    xpEarned?: IntFieldUpdateOperationsInput | number
    livesRemaining?: IntFieldUpdateOperationsInput | number
    timeTaken?: IntFieldUpdateOperationsInput | number
    verdictAnswer?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GameSessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    levelId?: IntFieldUpdateOperationsInput | number
    cognitiveStyle?: StringFieldUpdateOperationsInput | string
    xpEarned?: IntFieldUpdateOperationsInput | number
    livesRemaining?: IntFieldUpdateOperationsInput | number
    timeTaken?: IntFieldUpdateOperationsInput | number
    verdictAnswer?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LeaderboardCreateInput = {
    id?: string
    username: string
    totalXp?: number
    badges?: LeaderboardCreatebadgesInput | string[]
    updatedAt?: Date | string
    student: StudentCreateNestedOneWithoutLeaderboardInput
  }

  export type LeaderboardUncheckedCreateInput = {
    id?: string
    studentId: string
    username: string
    totalXp?: number
    badges?: LeaderboardCreatebadgesInput | string[]
    updatedAt?: Date | string
  }

  export type LeaderboardUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    totalXp?: IntFieldUpdateOperationsInput | number
    badges?: LeaderboardUpdatebadgesInput | string[]
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    student?: StudentUpdateOneRequiredWithoutLeaderboardNestedInput
  }

  export type LeaderboardUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    totalXp?: IntFieldUpdateOperationsInput | number
    badges?: LeaderboardUpdatebadgesInput | string[]
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LeaderboardCreateManyInput = {
    id?: string
    studentId: string
    username: string
    totalXp?: number
    badges?: LeaderboardCreatebadgesInput | string[]
    updatedAt?: Date | string
  }

  export type LeaderboardUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    totalXp?: IntFieldUpdateOperationsInput | number
    badges?: LeaderboardUpdatebadgesInput | string[]
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LeaderboardUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    totalXp?: IntFieldUpdateOperationsInput | number
    badges?: LeaderboardUpdatebadgesInput | string[]
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChatbotKnowledgeCreateInput = {
    id?: string
    title: string
    content: string
    category?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChatbotKnowledgeUncheckedCreateInput = {
    id?: string
    title: string
    content: string
    category?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChatbotKnowledgeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChatbotKnowledgeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChatbotKnowledgeCreateManyInput = {
    id?: string
    title: string
    content: string
    category?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChatbotKnowledgeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChatbotKnowledgeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamCreateInput = {
    id?: string
    levelId: number
    status?: string
    currentStep?: number
    histogramState?: NullableJsonNullValueInput | InputJsonValue
    verdictAnswer?: string
    isCorrect?: boolean
    gamePhase?: string
    readyVotes?: NullableJsonNullValueInput | InputJsonValue
    formulaState?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    members?: TeamMemberCreateNestedManyWithoutTeamInput
    chatMessages?: TeamMessageCreateNestedManyWithoutTeamInput
    classroom: ClassroomCreateNestedOneWithoutTeamsInput
  }

  export type TeamUncheckedCreateInput = {
    id?: string
    classroomId: string
    levelId: number
    status?: string
    currentStep?: number
    histogramState?: NullableJsonNullValueInput | InputJsonValue
    verdictAnswer?: string
    isCorrect?: boolean
    gamePhase?: string
    readyVotes?: NullableJsonNullValueInput | InputJsonValue
    formulaState?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    members?: TeamMemberUncheckedCreateNestedManyWithoutTeamInput
    chatMessages?: TeamMessageUncheckedCreateNestedManyWithoutTeamInput
  }

  export type TeamUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    levelId?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: IntFieldUpdateOperationsInput | number
    histogramState?: NullableJsonNullValueInput | InputJsonValue
    verdictAnswer?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    gamePhase?: StringFieldUpdateOperationsInput | string
    readyVotes?: NullableJsonNullValueInput | InputJsonValue
    formulaState?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    members?: TeamMemberUpdateManyWithoutTeamNestedInput
    chatMessages?: TeamMessageUpdateManyWithoutTeamNestedInput
    classroom?: ClassroomUpdateOneRequiredWithoutTeamsNestedInput
  }

  export type TeamUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    classroomId?: StringFieldUpdateOperationsInput | string
    levelId?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: IntFieldUpdateOperationsInput | number
    histogramState?: NullableJsonNullValueInput | InputJsonValue
    verdictAnswer?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    gamePhase?: StringFieldUpdateOperationsInput | string
    readyVotes?: NullableJsonNullValueInput | InputJsonValue
    formulaState?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    members?: TeamMemberUncheckedUpdateManyWithoutTeamNestedInput
    chatMessages?: TeamMessageUncheckedUpdateManyWithoutTeamNestedInput
  }

  export type TeamCreateManyInput = {
    id?: string
    classroomId: string
    levelId: number
    status?: string
    currentStep?: number
    histogramState?: NullableJsonNullValueInput | InputJsonValue
    verdictAnswer?: string
    isCorrect?: boolean
    gamePhase?: string
    readyVotes?: NullableJsonNullValueInput | InputJsonValue
    formulaState?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TeamUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    levelId?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: IntFieldUpdateOperationsInput | number
    histogramState?: NullableJsonNullValueInput | InputJsonValue
    verdictAnswer?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    gamePhase?: StringFieldUpdateOperationsInput | string
    readyVotes?: NullableJsonNullValueInput | InputJsonValue
    formulaState?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    classroomId?: StringFieldUpdateOperationsInput | string
    levelId?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: IntFieldUpdateOperationsInput | number
    histogramState?: NullableJsonNullValueInput | InputJsonValue
    verdictAnswer?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    gamePhase?: StringFieldUpdateOperationsInput | string
    readyVotes?: NullableJsonNullValueInput | InputJsonValue
    formulaState?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamMemberCreateInput = {
    id?: string
    joinedAt?: Date | string
    team: TeamCreateNestedOneWithoutMembersInput
    student: StudentCreateNestedOneWithoutTeamMembersInput
  }

  export type TeamMemberUncheckedCreateInput = {
    id?: string
    teamId: string
    studentId: string
    joinedAt?: Date | string
  }

  export type TeamMemberUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    team?: TeamUpdateOneRequiredWithoutMembersNestedInput
    student?: StudentUpdateOneRequiredWithoutTeamMembersNestedInput
  }

  export type TeamMemberUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    teamId?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamMemberCreateManyInput = {
    id?: string
    teamId: string
    studentId: string
    joinedAt?: Date | string
  }

  export type TeamMemberUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamMemberUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    teamId?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamMessageCreateInput = {
    id?: string
    senderName: string
    content: string
    createdAt?: Date | string
    team: TeamCreateNestedOneWithoutChatMessagesInput
    student: StudentCreateNestedOneWithoutTeamMessagesInput
  }

  export type TeamMessageUncheckedCreateInput = {
    id?: string
    teamId: string
    studentId: string
    senderName: string
    content: string
    createdAt?: Date | string
  }

  export type TeamMessageUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    team?: TeamUpdateOneRequiredWithoutChatMessagesNestedInput
    student?: StudentUpdateOneRequiredWithoutTeamMessagesNestedInput
  }

  export type TeamMessageUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    teamId?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamMessageCreateManyInput = {
    id?: string
    teamId: string
    studentId: string
    senderName: string
    content: string
    createdAt?: Date | string
  }

  export type TeamMessageUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamMessageUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    teamId?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StudentListRelationFilter = {
    every?: StudentWhereInput
    some?: StudentWhereInput
    none?: StudentWhereInput
  }

  export type TeamListRelationFilter = {
    every?: TeamWhereInput
    some?: TeamWhereInput
    none?: TeamWhereInput
  }

  export type StudentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TeamOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ClassroomCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    grade?: SortOrder
    major?: SortOrder
  }

  export type ClassroomMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    grade?: SortOrder
    major?: SortOrder
  }

  export type ClassroomMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    grade?: SortOrder
    major?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumGeftStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.GeftStatus | EnumGeftStatusFieldRefInput<$PrismaModel>
    in?: $Enums.GeftStatus[] | ListEnumGeftStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.GeftStatus[] | ListEnumGeftStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumGeftStatusFilter<$PrismaModel> | $Enums.GeftStatus
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type GeftResultNullableRelationFilter = {
    is?: GeftResultWhereInput | null
    isNot?: GeftResultWhereInput | null
  }

  export type GameSessionListRelationFilter = {
    every?: GameSessionWhereInput
    some?: GameSessionWhereInput
    none?: GameSessionWhereInput
  }

  export type LeaderboardNullableRelationFilter = {
    is?: LeaderboardWhereInput | null
    isNot?: LeaderboardWhereInput | null
  }

  export type TeamMemberListRelationFilter = {
    every?: TeamMemberWhereInput
    some?: TeamMemberWhereInput
    none?: TeamMemberWhereInput
  }

  export type TeamMessageListRelationFilter = {
    every?: TeamMessageWhereInput
    some?: TeamMessageWhereInput
    none?: TeamMessageWhereInput
  }

  export type ClassroomRelationFilter = {
    is?: ClassroomWhereInput
    isNot?: ClassroomWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type GameSessionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TeamMemberOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TeamMessageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type StudentCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    nisn?: SortOrder
    classroomId?: SortOrder
    geftStatus?: SortOrder
    diagnosticScore?: SortOrder
    diagnosticLevel?: SortOrder
    createdAt?: SortOrder
  }

  export type StudentAvgOrderByAggregateInput = {
    diagnosticScore?: SortOrder
  }

  export type StudentMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    nisn?: SortOrder
    classroomId?: SortOrder
    geftStatus?: SortOrder
    diagnosticScore?: SortOrder
    diagnosticLevel?: SortOrder
    createdAt?: SortOrder
  }

  export type StudentMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    nisn?: SortOrder
    classroomId?: SortOrder
    geftStatus?: SortOrder
    diagnosticScore?: SortOrder
    diagnosticLevel?: SortOrder
    createdAt?: SortOrder
  }

  export type StudentSumOrderByAggregateInput = {
    diagnosticScore?: SortOrder
  }

  export type EnumGeftStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.GeftStatus | EnumGeftStatusFieldRefInput<$PrismaModel>
    in?: $Enums.GeftStatus[] | ListEnumGeftStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.GeftStatus[] | ListEnumGeftStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumGeftStatusWithAggregatesFilter<$PrismaModel> | $Enums.GeftStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumGeftStatusFilter<$PrismaModel>
    _max?: NestedEnumGeftStatusFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type EnumCognitiveStyleFilter<$PrismaModel = never> = {
    equals?: $Enums.CognitiveStyle | EnumCognitiveStyleFieldRefInput<$PrismaModel>
    in?: $Enums.CognitiveStyle[] | ListEnumCognitiveStyleFieldRefInput<$PrismaModel>
    notIn?: $Enums.CognitiveStyle[] | ListEnumCognitiveStyleFieldRefInput<$PrismaModel>
    not?: NestedEnumCognitiveStyleFilter<$PrismaModel> | $Enums.CognitiveStyle
  }

  export type StudentRelationFilter = {
    is?: StudentWhereInput
    isNot?: StudentWhereInput
  }

  export type GeftResultCountOrderByAggregateInput = {
    id?: SortOrder
    studentId?: SortOrder
    score?: SortOrder
    cognitiveStyle?: SortOrder
    completedAt?: SortOrder
  }

  export type GeftResultAvgOrderByAggregateInput = {
    score?: SortOrder
  }

  export type GeftResultMaxOrderByAggregateInput = {
    id?: SortOrder
    studentId?: SortOrder
    score?: SortOrder
    cognitiveStyle?: SortOrder
    completedAt?: SortOrder
  }

  export type GeftResultMinOrderByAggregateInput = {
    id?: SortOrder
    studentId?: SortOrder
    score?: SortOrder
    cognitiveStyle?: SortOrder
    completedAt?: SortOrder
  }

  export type GeftResultSumOrderByAggregateInput = {
    score?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type EnumCognitiveStyleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CognitiveStyle | EnumCognitiveStyleFieldRefInput<$PrismaModel>
    in?: $Enums.CognitiveStyle[] | ListEnumCognitiveStyleFieldRefInput<$PrismaModel>
    notIn?: $Enums.CognitiveStyle[] | ListEnumCognitiveStyleFieldRefInput<$PrismaModel>
    not?: NestedEnumCognitiveStyleWithAggregatesFilter<$PrismaModel> | $Enums.CognitiveStyle
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCognitiveStyleFilter<$PrismaModel>
    _max?: NestedEnumCognitiveStyleFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type GameSessionCountOrderByAggregateInput = {
    id?: SortOrder
    studentId?: SortOrder
    levelId?: SortOrder
    cognitiveStyle?: SortOrder
    xpEarned?: SortOrder
    livesRemaining?: SortOrder
    timeTaken?: SortOrder
    verdictAnswer?: SortOrder
    isCorrect?: SortOrder
    createdAt?: SortOrder
  }

  export type GameSessionAvgOrderByAggregateInput = {
    levelId?: SortOrder
    xpEarned?: SortOrder
    livesRemaining?: SortOrder
    timeTaken?: SortOrder
  }

  export type GameSessionMaxOrderByAggregateInput = {
    id?: SortOrder
    studentId?: SortOrder
    levelId?: SortOrder
    cognitiveStyle?: SortOrder
    xpEarned?: SortOrder
    livesRemaining?: SortOrder
    timeTaken?: SortOrder
    verdictAnswer?: SortOrder
    isCorrect?: SortOrder
    createdAt?: SortOrder
  }

  export type GameSessionMinOrderByAggregateInput = {
    id?: SortOrder
    studentId?: SortOrder
    levelId?: SortOrder
    cognitiveStyle?: SortOrder
    xpEarned?: SortOrder
    livesRemaining?: SortOrder
    timeTaken?: SortOrder
    verdictAnswer?: SortOrder
    isCorrect?: SortOrder
    createdAt?: SortOrder
  }

  export type GameSessionSumOrderByAggregateInput = {
    levelId?: SortOrder
    xpEarned?: SortOrder
    livesRemaining?: SortOrder
    timeTaken?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type LeaderboardCountOrderByAggregateInput = {
    id?: SortOrder
    studentId?: SortOrder
    username?: SortOrder
    totalXp?: SortOrder
    badges?: SortOrder
    updatedAt?: SortOrder
  }

  export type LeaderboardAvgOrderByAggregateInput = {
    totalXp?: SortOrder
  }

  export type LeaderboardMaxOrderByAggregateInput = {
    id?: SortOrder
    studentId?: SortOrder
    username?: SortOrder
    totalXp?: SortOrder
    updatedAt?: SortOrder
  }

  export type LeaderboardMinOrderByAggregateInput = {
    id?: SortOrder
    studentId?: SortOrder
    username?: SortOrder
    totalXp?: SortOrder
    updatedAt?: SortOrder
  }

  export type LeaderboardSumOrderByAggregateInput = {
    totalXp?: SortOrder
  }

  export type ChatbotKnowledgeCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChatbotKnowledgeMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChatbotKnowledgeMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }
  export type JsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type TeamCountOrderByAggregateInput = {
    id?: SortOrder
    classroomId?: SortOrder
    levelId?: SortOrder
    status?: SortOrder
    currentStep?: SortOrder
    histogramState?: SortOrder
    verdictAnswer?: SortOrder
    isCorrect?: SortOrder
    gamePhase?: SortOrder
    readyVotes?: SortOrder
    formulaState?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TeamAvgOrderByAggregateInput = {
    levelId?: SortOrder
    currentStep?: SortOrder
  }

  export type TeamMaxOrderByAggregateInput = {
    id?: SortOrder
    classroomId?: SortOrder
    levelId?: SortOrder
    status?: SortOrder
    currentStep?: SortOrder
    verdictAnswer?: SortOrder
    isCorrect?: SortOrder
    gamePhase?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TeamMinOrderByAggregateInput = {
    id?: SortOrder
    classroomId?: SortOrder
    levelId?: SortOrder
    status?: SortOrder
    currentStep?: SortOrder
    verdictAnswer?: SortOrder
    isCorrect?: SortOrder
    gamePhase?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TeamSumOrderByAggregateInput = {
    levelId?: SortOrder
    currentStep?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type TeamRelationFilter = {
    is?: TeamWhereInput
    isNot?: TeamWhereInput
  }

  export type TeamMemberTeamIdStudentIdCompoundUniqueInput = {
    teamId: string
    studentId: string
  }

  export type TeamMemberCountOrderByAggregateInput = {
    id?: SortOrder
    teamId?: SortOrder
    studentId?: SortOrder
    joinedAt?: SortOrder
  }

  export type TeamMemberMaxOrderByAggregateInput = {
    id?: SortOrder
    teamId?: SortOrder
    studentId?: SortOrder
    joinedAt?: SortOrder
  }

  export type TeamMemberMinOrderByAggregateInput = {
    id?: SortOrder
    teamId?: SortOrder
    studentId?: SortOrder
    joinedAt?: SortOrder
  }

  export type TeamMessageCountOrderByAggregateInput = {
    id?: SortOrder
    teamId?: SortOrder
    studentId?: SortOrder
    senderName?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
  }

  export type TeamMessageMaxOrderByAggregateInput = {
    id?: SortOrder
    teamId?: SortOrder
    studentId?: SortOrder
    senderName?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
  }

  export type TeamMessageMinOrderByAggregateInput = {
    id?: SortOrder
    teamId?: SortOrder
    studentId?: SortOrder
    senderName?: SortOrder
    content?: SortOrder
    createdAt?: SortOrder
  }

  export type StudentCreateNestedManyWithoutClassroomInput = {
    create?: XOR<StudentCreateWithoutClassroomInput, StudentUncheckedCreateWithoutClassroomInput> | StudentCreateWithoutClassroomInput[] | StudentUncheckedCreateWithoutClassroomInput[]
    connectOrCreate?: StudentCreateOrConnectWithoutClassroomInput | StudentCreateOrConnectWithoutClassroomInput[]
    createMany?: StudentCreateManyClassroomInputEnvelope
    connect?: StudentWhereUniqueInput | StudentWhereUniqueInput[]
  }

  export type TeamCreateNestedManyWithoutClassroomInput = {
    create?: XOR<TeamCreateWithoutClassroomInput, TeamUncheckedCreateWithoutClassroomInput> | TeamCreateWithoutClassroomInput[] | TeamUncheckedCreateWithoutClassroomInput[]
    connectOrCreate?: TeamCreateOrConnectWithoutClassroomInput | TeamCreateOrConnectWithoutClassroomInput[]
    createMany?: TeamCreateManyClassroomInputEnvelope
    connect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
  }

  export type StudentUncheckedCreateNestedManyWithoutClassroomInput = {
    create?: XOR<StudentCreateWithoutClassroomInput, StudentUncheckedCreateWithoutClassroomInput> | StudentCreateWithoutClassroomInput[] | StudentUncheckedCreateWithoutClassroomInput[]
    connectOrCreate?: StudentCreateOrConnectWithoutClassroomInput | StudentCreateOrConnectWithoutClassroomInput[]
    createMany?: StudentCreateManyClassroomInputEnvelope
    connect?: StudentWhereUniqueInput | StudentWhereUniqueInput[]
  }

  export type TeamUncheckedCreateNestedManyWithoutClassroomInput = {
    create?: XOR<TeamCreateWithoutClassroomInput, TeamUncheckedCreateWithoutClassroomInput> | TeamCreateWithoutClassroomInput[] | TeamUncheckedCreateWithoutClassroomInput[]
    connectOrCreate?: TeamCreateOrConnectWithoutClassroomInput | TeamCreateOrConnectWithoutClassroomInput[]
    createMany?: TeamCreateManyClassroomInputEnvelope
    connect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type StudentUpdateManyWithoutClassroomNestedInput = {
    create?: XOR<StudentCreateWithoutClassroomInput, StudentUncheckedCreateWithoutClassroomInput> | StudentCreateWithoutClassroomInput[] | StudentUncheckedCreateWithoutClassroomInput[]
    connectOrCreate?: StudentCreateOrConnectWithoutClassroomInput | StudentCreateOrConnectWithoutClassroomInput[]
    upsert?: StudentUpsertWithWhereUniqueWithoutClassroomInput | StudentUpsertWithWhereUniqueWithoutClassroomInput[]
    createMany?: StudentCreateManyClassroomInputEnvelope
    set?: StudentWhereUniqueInput | StudentWhereUniqueInput[]
    disconnect?: StudentWhereUniqueInput | StudentWhereUniqueInput[]
    delete?: StudentWhereUniqueInput | StudentWhereUniqueInput[]
    connect?: StudentWhereUniqueInput | StudentWhereUniqueInput[]
    update?: StudentUpdateWithWhereUniqueWithoutClassroomInput | StudentUpdateWithWhereUniqueWithoutClassroomInput[]
    updateMany?: StudentUpdateManyWithWhereWithoutClassroomInput | StudentUpdateManyWithWhereWithoutClassroomInput[]
    deleteMany?: StudentScalarWhereInput | StudentScalarWhereInput[]
  }

  export type TeamUpdateManyWithoutClassroomNestedInput = {
    create?: XOR<TeamCreateWithoutClassroomInput, TeamUncheckedCreateWithoutClassroomInput> | TeamCreateWithoutClassroomInput[] | TeamUncheckedCreateWithoutClassroomInput[]
    connectOrCreate?: TeamCreateOrConnectWithoutClassroomInput | TeamCreateOrConnectWithoutClassroomInput[]
    upsert?: TeamUpsertWithWhereUniqueWithoutClassroomInput | TeamUpsertWithWhereUniqueWithoutClassroomInput[]
    createMany?: TeamCreateManyClassroomInputEnvelope
    set?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    disconnect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    delete?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    connect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    update?: TeamUpdateWithWhereUniqueWithoutClassroomInput | TeamUpdateWithWhereUniqueWithoutClassroomInput[]
    updateMany?: TeamUpdateManyWithWhereWithoutClassroomInput | TeamUpdateManyWithWhereWithoutClassroomInput[]
    deleteMany?: TeamScalarWhereInput | TeamScalarWhereInput[]
  }

  export type StudentUncheckedUpdateManyWithoutClassroomNestedInput = {
    create?: XOR<StudentCreateWithoutClassroomInput, StudentUncheckedCreateWithoutClassroomInput> | StudentCreateWithoutClassroomInput[] | StudentUncheckedCreateWithoutClassroomInput[]
    connectOrCreate?: StudentCreateOrConnectWithoutClassroomInput | StudentCreateOrConnectWithoutClassroomInput[]
    upsert?: StudentUpsertWithWhereUniqueWithoutClassroomInput | StudentUpsertWithWhereUniqueWithoutClassroomInput[]
    createMany?: StudentCreateManyClassroomInputEnvelope
    set?: StudentWhereUniqueInput | StudentWhereUniqueInput[]
    disconnect?: StudentWhereUniqueInput | StudentWhereUniqueInput[]
    delete?: StudentWhereUniqueInput | StudentWhereUniqueInput[]
    connect?: StudentWhereUniqueInput | StudentWhereUniqueInput[]
    update?: StudentUpdateWithWhereUniqueWithoutClassroomInput | StudentUpdateWithWhereUniqueWithoutClassroomInput[]
    updateMany?: StudentUpdateManyWithWhereWithoutClassroomInput | StudentUpdateManyWithWhereWithoutClassroomInput[]
    deleteMany?: StudentScalarWhereInput | StudentScalarWhereInput[]
  }

  export type TeamUncheckedUpdateManyWithoutClassroomNestedInput = {
    create?: XOR<TeamCreateWithoutClassroomInput, TeamUncheckedCreateWithoutClassroomInput> | TeamCreateWithoutClassroomInput[] | TeamUncheckedCreateWithoutClassroomInput[]
    connectOrCreate?: TeamCreateOrConnectWithoutClassroomInput | TeamCreateOrConnectWithoutClassroomInput[]
    upsert?: TeamUpsertWithWhereUniqueWithoutClassroomInput | TeamUpsertWithWhereUniqueWithoutClassroomInput[]
    createMany?: TeamCreateManyClassroomInputEnvelope
    set?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    disconnect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    delete?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    connect?: TeamWhereUniqueInput | TeamWhereUniqueInput[]
    update?: TeamUpdateWithWhereUniqueWithoutClassroomInput | TeamUpdateWithWhereUniqueWithoutClassroomInput[]
    updateMany?: TeamUpdateManyWithWhereWithoutClassroomInput | TeamUpdateManyWithWhereWithoutClassroomInput[]
    deleteMany?: TeamScalarWhereInput | TeamScalarWhereInput[]
  }

  export type GeftResultCreateNestedOneWithoutStudentInput = {
    create?: XOR<GeftResultCreateWithoutStudentInput, GeftResultUncheckedCreateWithoutStudentInput>
    connectOrCreate?: GeftResultCreateOrConnectWithoutStudentInput
    connect?: GeftResultWhereUniqueInput
  }

  export type GameSessionCreateNestedManyWithoutStudentInput = {
    create?: XOR<GameSessionCreateWithoutStudentInput, GameSessionUncheckedCreateWithoutStudentInput> | GameSessionCreateWithoutStudentInput[] | GameSessionUncheckedCreateWithoutStudentInput[]
    connectOrCreate?: GameSessionCreateOrConnectWithoutStudentInput | GameSessionCreateOrConnectWithoutStudentInput[]
    createMany?: GameSessionCreateManyStudentInputEnvelope
    connect?: GameSessionWhereUniqueInput | GameSessionWhereUniqueInput[]
  }

  export type LeaderboardCreateNestedOneWithoutStudentInput = {
    create?: XOR<LeaderboardCreateWithoutStudentInput, LeaderboardUncheckedCreateWithoutStudentInput>
    connectOrCreate?: LeaderboardCreateOrConnectWithoutStudentInput
    connect?: LeaderboardWhereUniqueInput
  }

  export type TeamMemberCreateNestedManyWithoutStudentInput = {
    create?: XOR<TeamMemberCreateWithoutStudentInput, TeamMemberUncheckedCreateWithoutStudentInput> | TeamMemberCreateWithoutStudentInput[] | TeamMemberUncheckedCreateWithoutStudentInput[]
    connectOrCreate?: TeamMemberCreateOrConnectWithoutStudentInput | TeamMemberCreateOrConnectWithoutStudentInput[]
    createMany?: TeamMemberCreateManyStudentInputEnvelope
    connect?: TeamMemberWhereUniqueInput | TeamMemberWhereUniqueInput[]
  }

  export type TeamMessageCreateNestedManyWithoutStudentInput = {
    create?: XOR<TeamMessageCreateWithoutStudentInput, TeamMessageUncheckedCreateWithoutStudentInput> | TeamMessageCreateWithoutStudentInput[] | TeamMessageUncheckedCreateWithoutStudentInput[]
    connectOrCreate?: TeamMessageCreateOrConnectWithoutStudentInput | TeamMessageCreateOrConnectWithoutStudentInput[]
    createMany?: TeamMessageCreateManyStudentInputEnvelope
    connect?: TeamMessageWhereUniqueInput | TeamMessageWhereUniqueInput[]
  }

  export type ClassroomCreateNestedOneWithoutStudentsInput = {
    create?: XOR<ClassroomCreateWithoutStudentsInput, ClassroomUncheckedCreateWithoutStudentsInput>
    connectOrCreate?: ClassroomCreateOrConnectWithoutStudentsInput
    connect?: ClassroomWhereUniqueInput
  }

  export type GeftResultUncheckedCreateNestedOneWithoutStudentInput = {
    create?: XOR<GeftResultCreateWithoutStudentInput, GeftResultUncheckedCreateWithoutStudentInput>
    connectOrCreate?: GeftResultCreateOrConnectWithoutStudentInput
    connect?: GeftResultWhereUniqueInput
  }

  export type GameSessionUncheckedCreateNestedManyWithoutStudentInput = {
    create?: XOR<GameSessionCreateWithoutStudentInput, GameSessionUncheckedCreateWithoutStudentInput> | GameSessionCreateWithoutStudentInput[] | GameSessionUncheckedCreateWithoutStudentInput[]
    connectOrCreate?: GameSessionCreateOrConnectWithoutStudentInput | GameSessionCreateOrConnectWithoutStudentInput[]
    createMany?: GameSessionCreateManyStudentInputEnvelope
    connect?: GameSessionWhereUniqueInput | GameSessionWhereUniqueInput[]
  }

  export type LeaderboardUncheckedCreateNestedOneWithoutStudentInput = {
    create?: XOR<LeaderboardCreateWithoutStudentInput, LeaderboardUncheckedCreateWithoutStudentInput>
    connectOrCreate?: LeaderboardCreateOrConnectWithoutStudentInput
    connect?: LeaderboardWhereUniqueInput
  }

  export type TeamMemberUncheckedCreateNestedManyWithoutStudentInput = {
    create?: XOR<TeamMemberCreateWithoutStudentInput, TeamMemberUncheckedCreateWithoutStudentInput> | TeamMemberCreateWithoutStudentInput[] | TeamMemberUncheckedCreateWithoutStudentInput[]
    connectOrCreate?: TeamMemberCreateOrConnectWithoutStudentInput | TeamMemberCreateOrConnectWithoutStudentInput[]
    createMany?: TeamMemberCreateManyStudentInputEnvelope
    connect?: TeamMemberWhereUniqueInput | TeamMemberWhereUniqueInput[]
  }

  export type TeamMessageUncheckedCreateNestedManyWithoutStudentInput = {
    create?: XOR<TeamMessageCreateWithoutStudentInput, TeamMessageUncheckedCreateWithoutStudentInput> | TeamMessageCreateWithoutStudentInput[] | TeamMessageUncheckedCreateWithoutStudentInput[]
    connectOrCreate?: TeamMessageCreateOrConnectWithoutStudentInput | TeamMessageCreateOrConnectWithoutStudentInput[]
    createMany?: TeamMessageCreateManyStudentInputEnvelope
    connect?: TeamMessageWhereUniqueInput | TeamMessageWhereUniqueInput[]
  }

  export type EnumGeftStatusFieldUpdateOperationsInput = {
    set?: $Enums.GeftStatus
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type GeftResultUpdateOneWithoutStudentNestedInput = {
    create?: XOR<GeftResultCreateWithoutStudentInput, GeftResultUncheckedCreateWithoutStudentInput>
    connectOrCreate?: GeftResultCreateOrConnectWithoutStudentInput
    upsert?: GeftResultUpsertWithoutStudentInput
    disconnect?: GeftResultWhereInput | boolean
    delete?: GeftResultWhereInput | boolean
    connect?: GeftResultWhereUniqueInput
    update?: XOR<XOR<GeftResultUpdateToOneWithWhereWithoutStudentInput, GeftResultUpdateWithoutStudentInput>, GeftResultUncheckedUpdateWithoutStudentInput>
  }

  export type GameSessionUpdateManyWithoutStudentNestedInput = {
    create?: XOR<GameSessionCreateWithoutStudentInput, GameSessionUncheckedCreateWithoutStudentInput> | GameSessionCreateWithoutStudentInput[] | GameSessionUncheckedCreateWithoutStudentInput[]
    connectOrCreate?: GameSessionCreateOrConnectWithoutStudentInput | GameSessionCreateOrConnectWithoutStudentInput[]
    upsert?: GameSessionUpsertWithWhereUniqueWithoutStudentInput | GameSessionUpsertWithWhereUniqueWithoutStudentInput[]
    createMany?: GameSessionCreateManyStudentInputEnvelope
    set?: GameSessionWhereUniqueInput | GameSessionWhereUniqueInput[]
    disconnect?: GameSessionWhereUniqueInput | GameSessionWhereUniqueInput[]
    delete?: GameSessionWhereUniqueInput | GameSessionWhereUniqueInput[]
    connect?: GameSessionWhereUniqueInput | GameSessionWhereUniqueInput[]
    update?: GameSessionUpdateWithWhereUniqueWithoutStudentInput | GameSessionUpdateWithWhereUniqueWithoutStudentInput[]
    updateMany?: GameSessionUpdateManyWithWhereWithoutStudentInput | GameSessionUpdateManyWithWhereWithoutStudentInput[]
    deleteMany?: GameSessionScalarWhereInput | GameSessionScalarWhereInput[]
  }

  export type LeaderboardUpdateOneWithoutStudentNestedInput = {
    create?: XOR<LeaderboardCreateWithoutStudentInput, LeaderboardUncheckedCreateWithoutStudentInput>
    connectOrCreate?: LeaderboardCreateOrConnectWithoutStudentInput
    upsert?: LeaderboardUpsertWithoutStudentInput
    disconnect?: LeaderboardWhereInput | boolean
    delete?: LeaderboardWhereInput | boolean
    connect?: LeaderboardWhereUniqueInput
    update?: XOR<XOR<LeaderboardUpdateToOneWithWhereWithoutStudentInput, LeaderboardUpdateWithoutStudentInput>, LeaderboardUncheckedUpdateWithoutStudentInput>
  }

  export type TeamMemberUpdateManyWithoutStudentNestedInput = {
    create?: XOR<TeamMemberCreateWithoutStudentInput, TeamMemberUncheckedCreateWithoutStudentInput> | TeamMemberCreateWithoutStudentInput[] | TeamMemberUncheckedCreateWithoutStudentInput[]
    connectOrCreate?: TeamMemberCreateOrConnectWithoutStudentInput | TeamMemberCreateOrConnectWithoutStudentInput[]
    upsert?: TeamMemberUpsertWithWhereUniqueWithoutStudentInput | TeamMemberUpsertWithWhereUniqueWithoutStudentInput[]
    createMany?: TeamMemberCreateManyStudentInputEnvelope
    set?: TeamMemberWhereUniqueInput | TeamMemberWhereUniqueInput[]
    disconnect?: TeamMemberWhereUniqueInput | TeamMemberWhereUniqueInput[]
    delete?: TeamMemberWhereUniqueInput | TeamMemberWhereUniqueInput[]
    connect?: TeamMemberWhereUniqueInput | TeamMemberWhereUniqueInput[]
    update?: TeamMemberUpdateWithWhereUniqueWithoutStudentInput | TeamMemberUpdateWithWhereUniqueWithoutStudentInput[]
    updateMany?: TeamMemberUpdateManyWithWhereWithoutStudentInput | TeamMemberUpdateManyWithWhereWithoutStudentInput[]
    deleteMany?: TeamMemberScalarWhereInput | TeamMemberScalarWhereInput[]
  }

  export type TeamMessageUpdateManyWithoutStudentNestedInput = {
    create?: XOR<TeamMessageCreateWithoutStudentInput, TeamMessageUncheckedCreateWithoutStudentInput> | TeamMessageCreateWithoutStudentInput[] | TeamMessageUncheckedCreateWithoutStudentInput[]
    connectOrCreate?: TeamMessageCreateOrConnectWithoutStudentInput | TeamMessageCreateOrConnectWithoutStudentInput[]
    upsert?: TeamMessageUpsertWithWhereUniqueWithoutStudentInput | TeamMessageUpsertWithWhereUniqueWithoutStudentInput[]
    createMany?: TeamMessageCreateManyStudentInputEnvelope
    set?: TeamMessageWhereUniqueInput | TeamMessageWhereUniqueInput[]
    disconnect?: TeamMessageWhereUniqueInput | TeamMessageWhereUniqueInput[]
    delete?: TeamMessageWhereUniqueInput | TeamMessageWhereUniqueInput[]
    connect?: TeamMessageWhereUniqueInput | TeamMessageWhereUniqueInput[]
    update?: TeamMessageUpdateWithWhereUniqueWithoutStudentInput | TeamMessageUpdateWithWhereUniqueWithoutStudentInput[]
    updateMany?: TeamMessageUpdateManyWithWhereWithoutStudentInput | TeamMessageUpdateManyWithWhereWithoutStudentInput[]
    deleteMany?: TeamMessageScalarWhereInput | TeamMessageScalarWhereInput[]
  }

  export type ClassroomUpdateOneRequiredWithoutStudentsNestedInput = {
    create?: XOR<ClassroomCreateWithoutStudentsInput, ClassroomUncheckedCreateWithoutStudentsInput>
    connectOrCreate?: ClassroomCreateOrConnectWithoutStudentsInput
    upsert?: ClassroomUpsertWithoutStudentsInput
    connect?: ClassroomWhereUniqueInput
    update?: XOR<XOR<ClassroomUpdateToOneWithWhereWithoutStudentsInput, ClassroomUpdateWithoutStudentsInput>, ClassroomUncheckedUpdateWithoutStudentsInput>
  }

  export type GeftResultUncheckedUpdateOneWithoutStudentNestedInput = {
    create?: XOR<GeftResultCreateWithoutStudentInput, GeftResultUncheckedCreateWithoutStudentInput>
    connectOrCreate?: GeftResultCreateOrConnectWithoutStudentInput
    upsert?: GeftResultUpsertWithoutStudentInput
    disconnect?: GeftResultWhereInput | boolean
    delete?: GeftResultWhereInput | boolean
    connect?: GeftResultWhereUniqueInput
    update?: XOR<XOR<GeftResultUpdateToOneWithWhereWithoutStudentInput, GeftResultUpdateWithoutStudentInput>, GeftResultUncheckedUpdateWithoutStudentInput>
  }

  export type GameSessionUncheckedUpdateManyWithoutStudentNestedInput = {
    create?: XOR<GameSessionCreateWithoutStudentInput, GameSessionUncheckedCreateWithoutStudentInput> | GameSessionCreateWithoutStudentInput[] | GameSessionUncheckedCreateWithoutStudentInput[]
    connectOrCreate?: GameSessionCreateOrConnectWithoutStudentInput | GameSessionCreateOrConnectWithoutStudentInput[]
    upsert?: GameSessionUpsertWithWhereUniqueWithoutStudentInput | GameSessionUpsertWithWhereUniqueWithoutStudentInput[]
    createMany?: GameSessionCreateManyStudentInputEnvelope
    set?: GameSessionWhereUniqueInput | GameSessionWhereUniqueInput[]
    disconnect?: GameSessionWhereUniqueInput | GameSessionWhereUniqueInput[]
    delete?: GameSessionWhereUniqueInput | GameSessionWhereUniqueInput[]
    connect?: GameSessionWhereUniqueInput | GameSessionWhereUniqueInput[]
    update?: GameSessionUpdateWithWhereUniqueWithoutStudentInput | GameSessionUpdateWithWhereUniqueWithoutStudentInput[]
    updateMany?: GameSessionUpdateManyWithWhereWithoutStudentInput | GameSessionUpdateManyWithWhereWithoutStudentInput[]
    deleteMany?: GameSessionScalarWhereInput | GameSessionScalarWhereInput[]
  }

  export type LeaderboardUncheckedUpdateOneWithoutStudentNestedInput = {
    create?: XOR<LeaderboardCreateWithoutStudentInput, LeaderboardUncheckedCreateWithoutStudentInput>
    connectOrCreate?: LeaderboardCreateOrConnectWithoutStudentInput
    upsert?: LeaderboardUpsertWithoutStudentInput
    disconnect?: LeaderboardWhereInput | boolean
    delete?: LeaderboardWhereInput | boolean
    connect?: LeaderboardWhereUniqueInput
    update?: XOR<XOR<LeaderboardUpdateToOneWithWhereWithoutStudentInput, LeaderboardUpdateWithoutStudentInput>, LeaderboardUncheckedUpdateWithoutStudentInput>
  }

  export type TeamMemberUncheckedUpdateManyWithoutStudentNestedInput = {
    create?: XOR<TeamMemberCreateWithoutStudentInput, TeamMemberUncheckedCreateWithoutStudentInput> | TeamMemberCreateWithoutStudentInput[] | TeamMemberUncheckedCreateWithoutStudentInput[]
    connectOrCreate?: TeamMemberCreateOrConnectWithoutStudentInput | TeamMemberCreateOrConnectWithoutStudentInput[]
    upsert?: TeamMemberUpsertWithWhereUniqueWithoutStudentInput | TeamMemberUpsertWithWhereUniqueWithoutStudentInput[]
    createMany?: TeamMemberCreateManyStudentInputEnvelope
    set?: TeamMemberWhereUniqueInput | TeamMemberWhereUniqueInput[]
    disconnect?: TeamMemberWhereUniqueInput | TeamMemberWhereUniqueInput[]
    delete?: TeamMemberWhereUniqueInput | TeamMemberWhereUniqueInput[]
    connect?: TeamMemberWhereUniqueInput | TeamMemberWhereUniqueInput[]
    update?: TeamMemberUpdateWithWhereUniqueWithoutStudentInput | TeamMemberUpdateWithWhereUniqueWithoutStudentInput[]
    updateMany?: TeamMemberUpdateManyWithWhereWithoutStudentInput | TeamMemberUpdateManyWithWhereWithoutStudentInput[]
    deleteMany?: TeamMemberScalarWhereInput | TeamMemberScalarWhereInput[]
  }

  export type TeamMessageUncheckedUpdateManyWithoutStudentNestedInput = {
    create?: XOR<TeamMessageCreateWithoutStudentInput, TeamMessageUncheckedCreateWithoutStudentInput> | TeamMessageCreateWithoutStudentInput[] | TeamMessageUncheckedCreateWithoutStudentInput[]
    connectOrCreate?: TeamMessageCreateOrConnectWithoutStudentInput | TeamMessageCreateOrConnectWithoutStudentInput[]
    upsert?: TeamMessageUpsertWithWhereUniqueWithoutStudentInput | TeamMessageUpsertWithWhereUniqueWithoutStudentInput[]
    createMany?: TeamMessageCreateManyStudentInputEnvelope
    set?: TeamMessageWhereUniqueInput | TeamMessageWhereUniqueInput[]
    disconnect?: TeamMessageWhereUniqueInput | TeamMessageWhereUniqueInput[]
    delete?: TeamMessageWhereUniqueInput | TeamMessageWhereUniqueInput[]
    connect?: TeamMessageWhereUniqueInput | TeamMessageWhereUniqueInput[]
    update?: TeamMessageUpdateWithWhereUniqueWithoutStudentInput | TeamMessageUpdateWithWhereUniqueWithoutStudentInput[]
    updateMany?: TeamMessageUpdateManyWithWhereWithoutStudentInput | TeamMessageUpdateManyWithWhereWithoutStudentInput[]
    deleteMany?: TeamMessageScalarWhereInput | TeamMessageScalarWhereInput[]
  }

  export type StudentCreateNestedOneWithoutGeftResultInput = {
    create?: XOR<StudentCreateWithoutGeftResultInput, StudentUncheckedCreateWithoutGeftResultInput>
    connectOrCreate?: StudentCreateOrConnectWithoutGeftResultInput
    connect?: StudentWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumCognitiveStyleFieldUpdateOperationsInput = {
    set?: $Enums.CognitiveStyle
  }

  export type StudentUpdateOneRequiredWithoutGeftResultNestedInput = {
    create?: XOR<StudentCreateWithoutGeftResultInput, StudentUncheckedCreateWithoutGeftResultInput>
    connectOrCreate?: StudentCreateOrConnectWithoutGeftResultInput
    upsert?: StudentUpsertWithoutGeftResultInput
    connect?: StudentWhereUniqueInput
    update?: XOR<XOR<StudentUpdateToOneWithWhereWithoutGeftResultInput, StudentUpdateWithoutGeftResultInput>, StudentUncheckedUpdateWithoutGeftResultInput>
  }

  export type StudentCreateNestedOneWithoutGameSessionsInput = {
    create?: XOR<StudentCreateWithoutGameSessionsInput, StudentUncheckedCreateWithoutGameSessionsInput>
    connectOrCreate?: StudentCreateOrConnectWithoutGameSessionsInput
    connect?: StudentWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type StudentUpdateOneRequiredWithoutGameSessionsNestedInput = {
    create?: XOR<StudentCreateWithoutGameSessionsInput, StudentUncheckedCreateWithoutGameSessionsInput>
    connectOrCreate?: StudentCreateOrConnectWithoutGameSessionsInput
    upsert?: StudentUpsertWithoutGameSessionsInput
    connect?: StudentWhereUniqueInput
    update?: XOR<XOR<StudentUpdateToOneWithWhereWithoutGameSessionsInput, StudentUpdateWithoutGameSessionsInput>, StudentUncheckedUpdateWithoutGameSessionsInput>
  }

  export type LeaderboardCreatebadgesInput = {
    set: string[]
  }

  export type StudentCreateNestedOneWithoutLeaderboardInput = {
    create?: XOR<StudentCreateWithoutLeaderboardInput, StudentUncheckedCreateWithoutLeaderboardInput>
    connectOrCreate?: StudentCreateOrConnectWithoutLeaderboardInput
    connect?: StudentWhereUniqueInput
  }

  export type LeaderboardUpdatebadgesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type StudentUpdateOneRequiredWithoutLeaderboardNestedInput = {
    create?: XOR<StudentCreateWithoutLeaderboardInput, StudentUncheckedCreateWithoutLeaderboardInput>
    connectOrCreate?: StudentCreateOrConnectWithoutLeaderboardInput
    upsert?: StudentUpsertWithoutLeaderboardInput
    connect?: StudentWhereUniqueInput
    update?: XOR<XOR<StudentUpdateToOneWithWhereWithoutLeaderboardInput, StudentUpdateWithoutLeaderboardInput>, StudentUncheckedUpdateWithoutLeaderboardInput>
  }

  export type TeamMemberCreateNestedManyWithoutTeamInput = {
    create?: XOR<TeamMemberCreateWithoutTeamInput, TeamMemberUncheckedCreateWithoutTeamInput> | TeamMemberCreateWithoutTeamInput[] | TeamMemberUncheckedCreateWithoutTeamInput[]
    connectOrCreate?: TeamMemberCreateOrConnectWithoutTeamInput | TeamMemberCreateOrConnectWithoutTeamInput[]
    createMany?: TeamMemberCreateManyTeamInputEnvelope
    connect?: TeamMemberWhereUniqueInput | TeamMemberWhereUniqueInput[]
  }

  export type TeamMessageCreateNestedManyWithoutTeamInput = {
    create?: XOR<TeamMessageCreateWithoutTeamInput, TeamMessageUncheckedCreateWithoutTeamInput> | TeamMessageCreateWithoutTeamInput[] | TeamMessageUncheckedCreateWithoutTeamInput[]
    connectOrCreate?: TeamMessageCreateOrConnectWithoutTeamInput | TeamMessageCreateOrConnectWithoutTeamInput[]
    createMany?: TeamMessageCreateManyTeamInputEnvelope
    connect?: TeamMessageWhereUniqueInput | TeamMessageWhereUniqueInput[]
  }

  export type ClassroomCreateNestedOneWithoutTeamsInput = {
    create?: XOR<ClassroomCreateWithoutTeamsInput, ClassroomUncheckedCreateWithoutTeamsInput>
    connectOrCreate?: ClassroomCreateOrConnectWithoutTeamsInput
    connect?: ClassroomWhereUniqueInput
  }

  export type TeamMemberUncheckedCreateNestedManyWithoutTeamInput = {
    create?: XOR<TeamMemberCreateWithoutTeamInput, TeamMemberUncheckedCreateWithoutTeamInput> | TeamMemberCreateWithoutTeamInput[] | TeamMemberUncheckedCreateWithoutTeamInput[]
    connectOrCreate?: TeamMemberCreateOrConnectWithoutTeamInput | TeamMemberCreateOrConnectWithoutTeamInput[]
    createMany?: TeamMemberCreateManyTeamInputEnvelope
    connect?: TeamMemberWhereUniqueInput | TeamMemberWhereUniqueInput[]
  }

  export type TeamMessageUncheckedCreateNestedManyWithoutTeamInput = {
    create?: XOR<TeamMessageCreateWithoutTeamInput, TeamMessageUncheckedCreateWithoutTeamInput> | TeamMessageCreateWithoutTeamInput[] | TeamMessageUncheckedCreateWithoutTeamInput[]
    connectOrCreate?: TeamMessageCreateOrConnectWithoutTeamInput | TeamMessageCreateOrConnectWithoutTeamInput[]
    createMany?: TeamMessageCreateManyTeamInputEnvelope
    connect?: TeamMessageWhereUniqueInput | TeamMessageWhereUniqueInput[]
  }

  export type TeamMemberUpdateManyWithoutTeamNestedInput = {
    create?: XOR<TeamMemberCreateWithoutTeamInput, TeamMemberUncheckedCreateWithoutTeamInput> | TeamMemberCreateWithoutTeamInput[] | TeamMemberUncheckedCreateWithoutTeamInput[]
    connectOrCreate?: TeamMemberCreateOrConnectWithoutTeamInput | TeamMemberCreateOrConnectWithoutTeamInput[]
    upsert?: TeamMemberUpsertWithWhereUniqueWithoutTeamInput | TeamMemberUpsertWithWhereUniqueWithoutTeamInput[]
    createMany?: TeamMemberCreateManyTeamInputEnvelope
    set?: TeamMemberWhereUniqueInput | TeamMemberWhereUniqueInput[]
    disconnect?: TeamMemberWhereUniqueInput | TeamMemberWhereUniqueInput[]
    delete?: TeamMemberWhereUniqueInput | TeamMemberWhereUniqueInput[]
    connect?: TeamMemberWhereUniqueInput | TeamMemberWhereUniqueInput[]
    update?: TeamMemberUpdateWithWhereUniqueWithoutTeamInput | TeamMemberUpdateWithWhereUniqueWithoutTeamInput[]
    updateMany?: TeamMemberUpdateManyWithWhereWithoutTeamInput | TeamMemberUpdateManyWithWhereWithoutTeamInput[]
    deleteMany?: TeamMemberScalarWhereInput | TeamMemberScalarWhereInput[]
  }

  export type TeamMessageUpdateManyWithoutTeamNestedInput = {
    create?: XOR<TeamMessageCreateWithoutTeamInput, TeamMessageUncheckedCreateWithoutTeamInput> | TeamMessageCreateWithoutTeamInput[] | TeamMessageUncheckedCreateWithoutTeamInput[]
    connectOrCreate?: TeamMessageCreateOrConnectWithoutTeamInput | TeamMessageCreateOrConnectWithoutTeamInput[]
    upsert?: TeamMessageUpsertWithWhereUniqueWithoutTeamInput | TeamMessageUpsertWithWhereUniqueWithoutTeamInput[]
    createMany?: TeamMessageCreateManyTeamInputEnvelope
    set?: TeamMessageWhereUniqueInput | TeamMessageWhereUniqueInput[]
    disconnect?: TeamMessageWhereUniqueInput | TeamMessageWhereUniqueInput[]
    delete?: TeamMessageWhereUniqueInput | TeamMessageWhereUniqueInput[]
    connect?: TeamMessageWhereUniqueInput | TeamMessageWhereUniqueInput[]
    update?: TeamMessageUpdateWithWhereUniqueWithoutTeamInput | TeamMessageUpdateWithWhereUniqueWithoutTeamInput[]
    updateMany?: TeamMessageUpdateManyWithWhereWithoutTeamInput | TeamMessageUpdateManyWithWhereWithoutTeamInput[]
    deleteMany?: TeamMessageScalarWhereInput | TeamMessageScalarWhereInput[]
  }

  export type ClassroomUpdateOneRequiredWithoutTeamsNestedInput = {
    create?: XOR<ClassroomCreateWithoutTeamsInput, ClassroomUncheckedCreateWithoutTeamsInput>
    connectOrCreate?: ClassroomCreateOrConnectWithoutTeamsInput
    upsert?: ClassroomUpsertWithoutTeamsInput
    connect?: ClassroomWhereUniqueInput
    update?: XOR<XOR<ClassroomUpdateToOneWithWhereWithoutTeamsInput, ClassroomUpdateWithoutTeamsInput>, ClassroomUncheckedUpdateWithoutTeamsInput>
  }

  export type TeamMemberUncheckedUpdateManyWithoutTeamNestedInput = {
    create?: XOR<TeamMemberCreateWithoutTeamInput, TeamMemberUncheckedCreateWithoutTeamInput> | TeamMemberCreateWithoutTeamInput[] | TeamMemberUncheckedCreateWithoutTeamInput[]
    connectOrCreate?: TeamMemberCreateOrConnectWithoutTeamInput | TeamMemberCreateOrConnectWithoutTeamInput[]
    upsert?: TeamMemberUpsertWithWhereUniqueWithoutTeamInput | TeamMemberUpsertWithWhereUniqueWithoutTeamInput[]
    createMany?: TeamMemberCreateManyTeamInputEnvelope
    set?: TeamMemberWhereUniqueInput | TeamMemberWhereUniqueInput[]
    disconnect?: TeamMemberWhereUniqueInput | TeamMemberWhereUniqueInput[]
    delete?: TeamMemberWhereUniqueInput | TeamMemberWhereUniqueInput[]
    connect?: TeamMemberWhereUniqueInput | TeamMemberWhereUniqueInput[]
    update?: TeamMemberUpdateWithWhereUniqueWithoutTeamInput | TeamMemberUpdateWithWhereUniqueWithoutTeamInput[]
    updateMany?: TeamMemberUpdateManyWithWhereWithoutTeamInput | TeamMemberUpdateManyWithWhereWithoutTeamInput[]
    deleteMany?: TeamMemberScalarWhereInput | TeamMemberScalarWhereInput[]
  }

  export type TeamMessageUncheckedUpdateManyWithoutTeamNestedInput = {
    create?: XOR<TeamMessageCreateWithoutTeamInput, TeamMessageUncheckedCreateWithoutTeamInput> | TeamMessageCreateWithoutTeamInput[] | TeamMessageUncheckedCreateWithoutTeamInput[]
    connectOrCreate?: TeamMessageCreateOrConnectWithoutTeamInput | TeamMessageCreateOrConnectWithoutTeamInput[]
    upsert?: TeamMessageUpsertWithWhereUniqueWithoutTeamInput | TeamMessageUpsertWithWhereUniqueWithoutTeamInput[]
    createMany?: TeamMessageCreateManyTeamInputEnvelope
    set?: TeamMessageWhereUniqueInput | TeamMessageWhereUniqueInput[]
    disconnect?: TeamMessageWhereUniqueInput | TeamMessageWhereUniqueInput[]
    delete?: TeamMessageWhereUniqueInput | TeamMessageWhereUniqueInput[]
    connect?: TeamMessageWhereUniqueInput | TeamMessageWhereUniqueInput[]
    update?: TeamMessageUpdateWithWhereUniqueWithoutTeamInput | TeamMessageUpdateWithWhereUniqueWithoutTeamInput[]
    updateMany?: TeamMessageUpdateManyWithWhereWithoutTeamInput | TeamMessageUpdateManyWithWhereWithoutTeamInput[]
    deleteMany?: TeamMessageScalarWhereInput | TeamMessageScalarWhereInput[]
  }

  export type TeamCreateNestedOneWithoutMembersInput = {
    create?: XOR<TeamCreateWithoutMembersInput, TeamUncheckedCreateWithoutMembersInput>
    connectOrCreate?: TeamCreateOrConnectWithoutMembersInput
    connect?: TeamWhereUniqueInput
  }

  export type StudentCreateNestedOneWithoutTeamMembersInput = {
    create?: XOR<StudentCreateWithoutTeamMembersInput, StudentUncheckedCreateWithoutTeamMembersInput>
    connectOrCreate?: StudentCreateOrConnectWithoutTeamMembersInput
    connect?: StudentWhereUniqueInput
  }

  export type TeamUpdateOneRequiredWithoutMembersNestedInput = {
    create?: XOR<TeamCreateWithoutMembersInput, TeamUncheckedCreateWithoutMembersInput>
    connectOrCreate?: TeamCreateOrConnectWithoutMembersInput
    upsert?: TeamUpsertWithoutMembersInput
    connect?: TeamWhereUniqueInput
    update?: XOR<XOR<TeamUpdateToOneWithWhereWithoutMembersInput, TeamUpdateWithoutMembersInput>, TeamUncheckedUpdateWithoutMembersInput>
  }

  export type StudentUpdateOneRequiredWithoutTeamMembersNestedInput = {
    create?: XOR<StudentCreateWithoutTeamMembersInput, StudentUncheckedCreateWithoutTeamMembersInput>
    connectOrCreate?: StudentCreateOrConnectWithoutTeamMembersInput
    upsert?: StudentUpsertWithoutTeamMembersInput
    connect?: StudentWhereUniqueInput
    update?: XOR<XOR<StudentUpdateToOneWithWhereWithoutTeamMembersInput, StudentUpdateWithoutTeamMembersInput>, StudentUncheckedUpdateWithoutTeamMembersInput>
  }

  export type TeamCreateNestedOneWithoutChatMessagesInput = {
    create?: XOR<TeamCreateWithoutChatMessagesInput, TeamUncheckedCreateWithoutChatMessagesInput>
    connectOrCreate?: TeamCreateOrConnectWithoutChatMessagesInput
    connect?: TeamWhereUniqueInput
  }

  export type StudentCreateNestedOneWithoutTeamMessagesInput = {
    create?: XOR<StudentCreateWithoutTeamMessagesInput, StudentUncheckedCreateWithoutTeamMessagesInput>
    connectOrCreate?: StudentCreateOrConnectWithoutTeamMessagesInput
    connect?: StudentWhereUniqueInput
  }

  export type TeamUpdateOneRequiredWithoutChatMessagesNestedInput = {
    create?: XOR<TeamCreateWithoutChatMessagesInput, TeamUncheckedCreateWithoutChatMessagesInput>
    connectOrCreate?: TeamCreateOrConnectWithoutChatMessagesInput
    upsert?: TeamUpsertWithoutChatMessagesInput
    connect?: TeamWhereUniqueInput
    update?: XOR<XOR<TeamUpdateToOneWithWhereWithoutChatMessagesInput, TeamUpdateWithoutChatMessagesInput>, TeamUncheckedUpdateWithoutChatMessagesInput>
  }

  export type StudentUpdateOneRequiredWithoutTeamMessagesNestedInput = {
    create?: XOR<StudentCreateWithoutTeamMessagesInput, StudentUncheckedCreateWithoutTeamMessagesInput>
    connectOrCreate?: StudentCreateOrConnectWithoutTeamMessagesInput
    upsert?: StudentUpsertWithoutTeamMessagesInput
    connect?: StudentWhereUniqueInput
    update?: XOR<XOR<StudentUpdateToOneWithWhereWithoutTeamMessagesInput, StudentUpdateWithoutTeamMessagesInput>, StudentUncheckedUpdateWithoutTeamMessagesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumGeftStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.GeftStatus | EnumGeftStatusFieldRefInput<$PrismaModel>
    in?: $Enums.GeftStatus[] | ListEnumGeftStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.GeftStatus[] | ListEnumGeftStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumGeftStatusFilter<$PrismaModel> | $Enums.GeftStatus
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedEnumGeftStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.GeftStatus | EnumGeftStatusFieldRefInput<$PrismaModel>
    in?: $Enums.GeftStatus[] | ListEnumGeftStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.GeftStatus[] | ListEnumGeftStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumGeftStatusWithAggregatesFilter<$PrismaModel> | $Enums.GeftStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumGeftStatusFilter<$PrismaModel>
    _max?: NestedEnumGeftStatusFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumCognitiveStyleFilter<$PrismaModel = never> = {
    equals?: $Enums.CognitiveStyle | EnumCognitiveStyleFieldRefInput<$PrismaModel>
    in?: $Enums.CognitiveStyle[] | ListEnumCognitiveStyleFieldRefInput<$PrismaModel>
    notIn?: $Enums.CognitiveStyle[] | ListEnumCognitiveStyleFieldRefInput<$PrismaModel>
    not?: NestedEnumCognitiveStyleFilter<$PrismaModel> | $Enums.CognitiveStyle
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumCognitiveStyleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.CognitiveStyle | EnumCognitiveStyleFieldRefInput<$PrismaModel>
    in?: $Enums.CognitiveStyle[] | ListEnumCognitiveStyleFieldRefInput<$PrismaModel>
    notIn?: $Enums.CognitiveStyle[] | ListEnumCognitiveStyleFieldRefInput<$PrismaModel>
    not?: NestedEnumCognitiveStyleWithAggregatesFilter<$PrismaModel> | $Enums.CognitiveStyle
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumCognitiveStyleFilter<$PrismaModel>
    _max?: NestedEnumCognitiveStyleFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type StudentCreateWithoutClassroomInput = {
    id?: string
    name: string
    nisn: string
    geftStatus?: $Enums.GeftStatus
    diagnosticScore?: number | null
    diagnosticLevel?: string | null
    createdAt?: Date | string
    geftResult?: GeftResultCreateNestedOneWithoutStudentInput
    gameSessions?: GameSessionCreateNestedManyWithoutStudentInput
    leaderboard?: LeaderboardCreateNestedOneWithoutStudentInput
    teamMembers?: TeamMemberCreateNestedManyWithoutStudentInput
    teamMessages?: TeamMessageCreateNestedManyWithoutStudentInput
  }

  export type StudentUncheckedCreateWithoutClassroomInput = {
    id?: string
    name: string
    nisn: string
    geftStatus?: $Enums.GeftStatus
    diagnosticScore?: number | null
    diagnosticLevel?: string | null
    createdAt?: Date | string
    geftResult?: GeftResultUncheckedCreateNestedOneWithoutStudentInput
    gameSessions?: GameSessionUncheckedCreateNestedManyWithoutStudentInput
    leaderboard?: LeaderboardUncheckedCreateNestedOneWithoutStudentInput
    teamMembers?: TeamMemberUncheckedCreateNestedManyWithoutStudentInput
    teamMessages?: TeamMessageUncheckedCreateNestedManyWithoutStudentInput
  }

  export type StudentCreateOrConnectWithoutClassroomInput = {
    where: StudentWhereUniqueInput
    create: XOR<StudentCreateWithoutClassroomInput, StudentUncheckedCreateWithoutClassroomInput>
  }

  export type StudentCreateManyClassroomInputEnvelope = {
    data: StudentCreateManyClassroomInput | StudentCreateManyClassroomInput[]
    skipDuplicates?: boolean
  }

  export type TeamCreateWithoutClassroomInput = {
    id?: string
    levelId: number
    status?: string
    currentStep?: number
    histogramState?: NullableJsonNullValueInput | InputJsonValue
    verdictAnswer?: string
    isCorrect?: boolean
    gamePhase?: string
    readyVotes?: NullableJsonNullValueInput | InputJsonValue
    formulaState?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    members?: TeamMemberCreateNestedManyWithoutTeamInput
    chatMessages?: TeamMessageCreateNestedManyWithoutTeamInput
  }

  export type TeamUncheckedCreateWithoutClassroomInput = {
    id?: string
    levelId: number
    status?: string
    currentStep?: number
    histogramState?: NullableJsonNullValueInput | InputJsonValue
    verdictAnswer?: string
    isCorrect?: boolean
    gamePhase?: string
    readyVotes?: NullableJsonNullValueInput | InputJsonValue
    formulaState?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    members?: TeamMemberUncheckedCreateNestedManyWithoutTeamInput
    chatMessages?: TeamMessageUncheckedCreateNestedManyWithoutTeamInput
  }

  export type TeamCreateOrConnectWithoutClassroomInput = {
    where: TeamWhereUniqueInput
    create: XOR<TeamCreateWithoutClassroomInput, TeamUncheckedCreateWithoutClassroomInput>
  }

  export type TeamCreateManyClassroomInputEnvelope = {
    data: TeamCreateManyClassroomInput | TeamCreateManyClassroomInput[]
    skipDuplicates?: boolean
  }

  export type StudentUpsertWithWhereUniqueWithoutClassroomInput = {
    where: StudentWhereUniqueInput
    update: XOR<StudentUpdateWithoutClassroomInput, StudentUncheckedUpdateWithoutClassroomInput>
    create: XOR<StudentCreateWithoutClassroomInput, StudentUncheckedCreateWithoutClassroomInput>
  }

  export type StudentUpdateWithWhereUniqueWithoutClassroomInput = {
    where: StudentWhereUniqueInput
    data: XOR<StudentUpdateWithoutClassroomInput, StudentUncheckedUpdateWithoutClassroomInput>
  }

  export type StudentUpdateManyWithWhereWithoutClassroomInput = {
    where: StudentScalarWhereInput
    data: XOR<StudentUpdateManyMutationInput, StudentUncheckedUpdateManyWithoutClassroomInput>
  }

  export type StudentScalarWhereInput = {
    AND?: StudentScalarWhereInput | StudentScalarWhereInput[]
    OR?: StudentScalarWhereInput[]
    NOT?: StudentScalarWhereInput | StudentScalarWhereInput[]
    id?: StringFilter<"Student"> | string
    name?: StringFilter<"Student"> | string
    nisn?: StringFilter<"Student"> | string
    classroomId?: StringFilter<"Student"> | string
    geftStatus?: EnumGeftStatusFilter<"Student"> | $Enums.GeftStatus
    diagnosticScore?: IntNullableFilter<"Student"> | number | null
    diagnosticLevel?: StringNullableFilter<"Student"> | string | null
    createdAt?: DateTimeFilter<"Student"> | Date | string
  }

  export type TeamUpsertWithWhereUniqueWithoutClassroomInput = {
    where: TeamWhereUniqueInput
    update: XOR<TeamUpdateWithoutClassroomInput, TeamUncheckedUpdateWithoutClassroomInput>
    create: XOR<TeamCreateWithoutClassroomInput, TeamUncheckedCreateWithoutClassroomInput>
  }

  export type TeamUpdateWithWhereUniqueWithoutClassroomInput = {
    where: TeamWhereUniqueInput
    data: XOR<TeamUpdateWithoutClassroomInput, TeamUncheckedUpdateWithoutClassroomInput>
  }

  export type TeamUpdateManyWithWhereWithoutClassroomInput = {
    where: TeamScalarWhereInput
    data: XOR<TeamUpdateManyMutationInput, TeamUncheckedUpdateManyWithoutClassroomInput>
  }

  export type TeamScalarWhereInput = {
    AND?: TeamScalarWhereInput | TeamScalarWhereInput[]
    OR?: TeamScalarWhereInput[]
    NOT?: TeamScalarWhereInput | TeamScalarWhereInput[]
    id?: StringFilter<"Team"> | string
    classroomId?: StringFilter<"Team"> | string
    levelId?: IntFilter<"Team"> | number
    status?: StringFilter<"Team"> | string
    currentStep?: IntFilter<"Team"> | number
    histogramState?: JsonNullableFilter<"Team">
    verdictAnswer?: StringFilter<"Team"> | string
    isCorrect?: BoolFilter<"Team"> | boolean
    gamePhase?: StringFilter<"Team"> | string
    readyVotes?: JsonNullableFilter<"Team">
    formulaState?: JsonNullableFilter<"Team">
    createdAt?: DateTimeFilter<"Team"> | Date | string
    updatedAt?: DateTimeFilter<"Team"> | Date | string
  }

  export type GeftResultCreateWithoutStudentInput = {
    id?: string
    score: number
    cognitiveStyle: $Enums.CognitiveStyle
    completedAt?: Date | string
  }

  export type GeftResultUncheckedCreateWithoutStudentInput = {
    id?: string
    score: number
    cognitiveStyle: $Enums.CognitiveStyle
    completedAt?: Date | string
  }

  export type GeftResultCreateOrConnectWithoutStudentInput = {
    where: GeftResultWhereUniqueInput
    create: XOR<GeftResultCreateWithoutStudentInput, GeftResultUncheckedCreateWithoutStudentInput>
  }

  export type GameSessionCreateWithoutStudentInput = {
    id?: string
    levelId: number
    cognitiveStyle: string
    xpEarned: number
    livesRemaining: number
    timeTaken: number
    verdictAnswer: string
    isCorrect: boolean
    createdAt?: Date | string
  }

  export type GameSessionUncheckedCreateWithoutStudentInput = {
    id?: string
    levelId: number
    cognitiveStyle: string
    xpEarned: number
    livesRemaining: number
    timeTaken: number
    verdictAnswer: string
    isCorrect: boolean
    createdAt?: Date | string
  }

  export type GameSessionCreateOrConnectWithoutStudentInput = {
    where: GameSessionWhereUniqueInput
    create: XOR<GameSessionCreateWithoutStudentInput, GameSessionUncheckedCreateWithoutStudentInput>
  }

  export type GameSessionCreateManyStudentInputEnvelope = {
    data: GameSessionCreateManyStudentInput | GameSessionCreateManyStudentInput[]
    skipDuplicates?: boolean
  }

  export type LeaderboardCreateWithoutStudentInput = {
    id?: string
    username: string
    totalXp?: number
    badges?: LeaderboardCreatebadgesInput | string[]
    updatedAt?: Date | string
  }

  export type LeaderboardUncheckedCreateWithoutStudentInput = {
    id?: string
    username: string
    totalXp?: number
    badges?: LeaderboardCreatebadgesInput | string[]
    updatedAt?: Date | string
  }

  export type LeaderboardCreateOrConnectWithoutStudentInput = {
    where: LeaderboardWhereUniqueInput
    create: XOR<LeaderboardCreateWithoutStudentInput, LeaderboardUncheckedCreateWithoutStudentInput>
  }

  export type TeamMemberCreateWithoutStudentInput = {
    id?: string
    joinedAt?: Date | string
    team: TeamCreateNestedOneWithoutMembersInput
  }

  export type TeamMemberUncheckedCreateWithoutStudentInput = {
    id?: string
    teamId: string
    joinedAt?: Date | string
  }

  export type TeamMemberCreateOrConnectWithoutStudentInput = {
    where: TeamMemberWhereUniqueInput
    create: XOR<TeamMemberCreateWithoutStudentInput, TeamMemberUncheckedCreateWithoutStudentInput>
  }

  export type TeamMemberCreateManyStudentInputEnvelope = {
    data: TeamMemberCreateManyStudentInput | TeamMemberCreateManyStudentInput[]
    skipDuplicates?: boolean
  }

  export type TeamMessageCreateWithoutStudentInput = {
    id?: string
    senderName: string
    content: string
    createdAt?: Date | string
    team: TeamCreateNestedOneWithoutChatMessagesInput
  }

  export type TeamMessageUncheckedCreateWithoutStudentInput = {
    id?: string
    teamId: string
    senderName: string
    content: string
    createdAt?: Date | string
  }

  export type TeamMessageCreateOrConnectWithoutStudentInput = {
    where: TeamMessageWhereUniqueInput
    create: XOR<TeamMessageCreateWithoutStudentInput, TeamMessageUncheckedCreateWithoutStudentInput>
  }

  export type TeamMessageCreateManyStudentInputEnvelope = {
    data: TeamMessageCreateManyStudentInput | TeamMessageCreateManyStudentInput[]
    skipDuplicates?: boolean
  }

  export type ClassroomCreateWithoutStudentsInput = {
    id?: string
    name: string
    grade: string
    major: string
    teams?: TeamCreateNestedManyWithoutClassroomInput
  }

  export type ClassroomUncheckedCreateWithoutStudentsInput = {
    id?: string
    name: string
    grade: string
    major: string
    teams?: TeamUncheckedCreateNestedManyWithoutClassroomInput
  }

  export type ClassroomCreateOrConnectWithoutStudentsInput = {
    where: ClassroomWhereUniqueInput
    create: XOR<ClassroomCreateWithoutStudentsInput, ClassroomUncheckedCreateWithoutStudentsInput>
  }

  export type GeftResultUpsertWithoutStudentInput = {
    update: XOR<GeftResultUpdateWithoutStudentInput, GeftResultUncheckedUpdateWithoutStudentInput>
    create: XOR<GeftResultCreateWithoutStudentInput, GeftResultUncheckedCreateWithoutStudentInput>
    where?: GeftResultWhereInput
  }

  export type GeftResultUpdateToOneWithWhereWithoutStudentInput = {
    where?: GeftResultWhereInput
    data: XOR<GeftResultUpdateWithoutStudentInput, GeftResultUncheckedUpdateWithoutStudentInput>
  }

  export type GeftResultUpdateWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    score?: IntFieldUpdateOperationsInput | number
    cognitiveStyle?: EnumCognitiveStyleFieldUpdateOperationsInput | $Enums.CognitiveStyle
    completedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GeftResultUncheckedUpdateWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    score?: IntFieldUpdateOperationsInput | number
    cognitiveStyle?: EnumCognitiveStyleFieldUpdateOperationsInput | $Enums.CognitiveStyle
    completedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GameSessionUpsertWithWhereUniqueWithoutStudentInput = {
    where: GameSessionWhereUniqueInput
    update: XOR<GameSessionUpdateWithoutStudentInput, GameSessionUncheckedUpdateWithoutStudentInput>
    create: XOR<GameSessionCreateWithoutStudentInput, GameSessionUncheckedCreateWithoutStudentInput>
  }

  export type GameSessionUpdateWithWhereUniqueWithoutStudentInput = {
    where: GameSessionWhereUniqueInput
    data: XOR<GameSessionUpdateWithoutStudentInput, GameSessionUncheckedUpdateWithoutStudentInput>
  }

  export type GameSessionUpdateManyWithWhereWithoutStudentInput = {
    where: GameSessionScalarWhereInput
    data: XOR<GameSessionUpdateManyMutationInput, GameSessionUncheckedUpdateManyWithoutStudentInput>
  }

  export type GameSessionScalarWhereInput = {
    AND?: GameSessionScalarWhereInput | GameSessionScalarWhereInput[]
    OR?: GameSessionScalarWhereInput[]
    NOT?: GameSessionScalarWhereInput | GameSessionScalarWhereInput[]
    id?: StringFilter<"GameSession"> | string
    studentId?: StringFilter<"GameSession"> | string
    levelId?: IntFilter<"GameSession"> | number
    cognitiveStyle?: StringFilter<"GameSession"> | string
    xpEarned?: IntFilter<"GameSession"> | number
    livesRemaining?: IntFilter<"GameSession"> | number
    timeTaken?: IntFilter<"GameSession"> | number
    verdictAnswer?: StringFilter<"GameSession"> | string
    isCorrect?: BoolFilter<"GameSession"> | boolean
    createdAt?: DateTimeFilter<"GameSession"> | Date | string
  }

  export type LeaderboardUpsertWithoutStudentInput = {
    update: XOR<LeaderboardUpdateWithoutStudentInput, LeaderboardUncheckedUpdateWithoutStudentInput>
    create: XOR<LeaderboardCreateWithoutStudentInput, LeaderboardUncheckedCreateWithoutStudentInput>
    where?: LeaderboardWhereInput
  }

  export type LeaderboardUpdateToOneWithWhereWithoutStudentInput = {
    where?: LeaderboardWhereInput
    data: XOR<LeaderboardUpdateWithoutStudentInput, LeaderboardUncheckedUpdateWithoutStudentInput>
  }

  export type LeaderboardUpdateWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    totalXp?: IntFieldUpdateOperationsInput | number
    badges?: LeaderboardUpdatebadgesInput | string[]
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LeaderboardUncheckedUpdateWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    username?: StringFieldUpdateOperationsInput | string
    totalXp?: IntFieldUpdateOperationsInput | number
    badges?: LeaderboardUpdatebadgesInput | string[]
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamMemberUpsertWithWhereUniqueWithoutStudentInput = {
    where: TeamMemberWhereUniqueInput
    update: XOR<TeamMemberUpdateWithoutStudentInput, TeamMemberUncheckedUpdateWithoutStudentInput>
    create: XOR<TeamMemberCreateWithoutStudentInput, TeamMemberUncheckedCreateWithoutStudentInput>
  }

  export type TeamMemberUpdateWithWhereUniqueWithoutStudentInput = {
    where: TeamMemberWhereUniqueInput
    data: XOR<TeamMemberUpdateWithoutStudentInput, TeamMemberUncheckedUpdateWithoutStudentInput>
  }

  export type TeamMemberUpdateManyWithWhereWithoutStudentInput = {
    where: TeamMemberScalarWhereInput
    data: XOR<TeamMemberUpdateManyMutationInput, TeamMemberUncheckedUpdateManyWithoutStudentInput>
  }

  export type TeamMemberScalarWhereInput = {
    AND?: TeamMemberScalarWhereInput | TeamMemberScalarWhereInput[]
    OR?: TeamMemberScalarWhereInput[]
    NOT?: TeamMemberScalarWhereInput | TeamMemberScalarWhereInput[]
    id?: StringFilter<"TeamMember"> | string
    teamId?: StringFilter<"TeamMember"> | string
    studentId?: StringFilter<"TeamMember"> | string
    joinedAt?: DateTimeFilter<"TeamMember"> | Date | string
  }

  export type TeamMessageUpsertWithWhereUniqueWithoutStudentInput = {
    where: TeamMessageWhereUniqueInput
    update: XOR<TeamMessageUpdateWithoutStudentInput, TeamMessageUncheckedUpdateWithoutStudentInput>
    create: XOR<TeamMessageCreateWithoutStudentInput, TeamMessageUncheckedCreateWithoutStudentInput>
  }

  export type TeamMessageUpdateWithWhereUniqueWithoutStudentInput = {
    where: TeamMessageWhereUniqueInput
    data: XOR<TeamMessageUpdateWithoutStudentInput, TeamMessageUncheckedUpdateWithoutStudentInput>
  }

  export type TeamMessageUpdateManyWithWhereWithoutStudentInput = {
    where: TeamMessageScalarWhereInput
    data: XOR<TeamMessageUpdateManyMutationInput, TeamMessageUncheckedUpdateManyWithoutStudentInput>
  }

  export type TeamMessageScalarWhereInput = {
    AND?: TeamMessageScalarWhereInput | TeamMessageScalarWhereInput[]
    OR?: TeamMessageScalarWhereInput[]
    NOT?: TeamMessageScalarWhereInput | TeamMessageScalarWhereInput[]
    id?: StringFilter<"TeamMessage"> | string
    teamId?: StringFilter<"TeamMessage"> | string
    studentId?: StringFilter<"TeamMessage"> | string
    senderName?: StringFilter<"TeamMessage"> | string
    content?: StringFilter<"TeamMessage"> | string
    createdAt?: DateTimeFilter<"TeamMessage"> | Date | string
  }

  export type ClassroomUpsertWithoutStudentsInput = {
    update: XOR<ClassroomUpdateWithoutStudentsInput, ClassroomUncheckedUpdateWithoutStudentsInput>
    create: XOR<ClassroomCreateWithoutStudentsInput, ClassroomUncheckedCreateWithoutStudentsInput>
    where?: ClassroomWhereInput
  }

  export type ClassroomUpdateToOneWithWhereWithoutStudentsInput = {
    where?: ClassroomWhereInput
    data: XOR<ClassroomUpdateWithoutStudentsInput, ClassroomUncheckedUpdateWithoutStudentsInput>
  }

  export type ClassroomUpdateWithoutStudentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    grade?: StringFieldUpdateOperationsInput | string
    major?: StringFieldUpdateOperationsInput | string
    teams?: TeamUpdateManyWithoutClassroomNestedInput
  }

  export type ClassroomUncheckedUpdateWithoutStudentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    grade?: StringFieldUpdateOperationsInput | string
    major?: StringFieldUpdateOperationsInput | string
    teams?: TeamUncheckedUpdateManyWithoutClassroomNestedInput
  }

  export type StudentCreateWithoutGeftResultInput = {
    id?: string
    name: string
    nisn: string
    geftStatus?: $Enums.GeftStatus
    diagnosticScore?: number | null
    diagnosticLevel?: string | null
    createdAt?: Date | string
    gameSessions?: GameSessionCreateNestedManyWithoutStudentInput
    leaderboard?: LeaderboardCreateNestedOneWithoutStudentInput
    teamMembers?: TeamMemberCreateNestedManyWithoutStudentInput
    teamMessages?: TeamMessageCreateNestedManyWithoutStudentInput
    classroom: ClassroomCreateNestedOneWithoutStudentsInput
  }

  export type StudentUncheckedCreateWithoutGeftResultInput = {
    id?: string
    name: string
    nisn: string
    classroomId: string
    geftStatus?: $Enums.GeftStatus
    diagnosticScore?: number | null
    diagnosticLevel?: string | null
    createdAt?: Date | string
    gameSessions?: GameSessionUncheckedCreateNestedManyWithoutStudentInput
    leaderboard?: LeaderboardUncheckedCreateNestedOneWithoutStudentInput
    teamMembers?: TeamMemberUncheckedCreateNestedManyWithoutStudentInput
    teamMessages?: TeamMessageUncheckedCreateNestedManyWithoutStudentInput
  }

  export type StudentCreateOrConnectWithoutGeftResultInput = {
    where: StudentWhereUniqueInput
    create: XOR<StudentCreateWithoutGeftResultInput, StudentUncheckedCreateWithoutGeftResultInput>
  }

  export type StudentUpsertWithoutGeftResultInput = {
    update: XOR<StudentUpdateWithoutGeftResultInput, StudentUncheckedUpdateWithoutGeftResultInput>
    create: XOR<StudentCreateWithoutGeftResultInput, StudentUncheckedCreateWithoutGeftResultInput>
    where?: StudentWhereInput
  }

  export type StudentUpdateToOneWithWhereWithoutGeftResultInput = {
    where?: StudentWhereInput
    data: XOR<StudentUpdateWithoutGeftResultInput, StudentUncheckedUpdateWithoutGeftResultInput>
  }

  export type StudentUpdateWithoutGeftResultInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    diagnosticScore?: NullableIntFieldUpdateOperationsInput | number | null
    diagnosticLevel?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    gameSessions?: GameSessionUpdateManyWithoutStudentNestedInput
    leaderboard?: LeaderboardUpdateOneWithoutStudentNestedInput
    teamMembers?: TeamMemberUpdateManyWithoutStudentNestedInput
    teamMessages?: TeamMessageUpdateManyWithoutStudentNestedInput
    classroom?: ClassroomUpdateOneRequiredWithoutStudentsNestedInput
  }

  export type StudentUncheckedUpdateWithoutGeftResultInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    classroomId?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    diagnosticScore?: NullableIntFieldUpdateOperationsInput | number | null
    diagnosticLevel?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    gameSessions?: GameSessionUncheckedUpdateManyWithoutStudentNestedInput
    leaderboard?: LeaderboardUncheckedUpdateOneWithoutStudentNestedInput
    teamMembers?: TeamMemberUncheckedUpdateManyWithoutStudentNestedInput
    teamMessages?: TeamMessageUncheckedUpdateManyWithoutStudentNestedInput
  }

  export type StudentCreateWithoutGameSessionsInput = {
    id?: string
    name: string
    nisn: string
    geftStatus?: $Enums.GeftStatus
    diagnosticScore?: number | null
    diagnosticLevel?: string | null
    createdAt?: Date | string
    geftResult?: GeftResultCreateNestedOneWithoutStudentInput
    leaderboard?: LeaderboardCreateNestedOneWithoutStudentInput
    teamMembers?: TeamMemberCreateNestedManyWithoutStudentInput
    teamMessages?: TeamMessageCreateNestedManyWithoutStudentInput
    classroom: ClassroomCreateNestedOneWithoutStudentsInput
  }

  export type StudentUncheckedCreateWithoutGameSessionsInput = {
    id?: string
    name: string
    nisn: string
    classroomId: string
    geftStatus?: $Enums.GeftStatus
    diagnosticScore?: number | null
    diagnosticLevel?: string | null
    createdAt?: Date | string
    geftResult?: GeftResultUncheckedCreateNestedOneWithoutStudentInput
    leaderboard?: LeaderboardUncheckedCreateNestedOneWithoutStudentInput
    teamMembers?: TeamMemberUncheckedCreateNestedManyWithoutStudentInput
    teamMessages?: TeamMessageUncheckedCreateNestedManyWithoutStudentInput
  }

  export type StudentCreateOrConnectWithoutGameSessionsInput = {
    where: StudentWhereUniqueInput
    create: XOR<StudentCreateWithoutGameSessionsInput, StudentUncheckedCreateWithoutGameSessionsInput>
  }

  export type StudentUpsertWithoutGameSessionsInput = {
    update: XOR<StudentUpdateWithoutGameSessionsInput, StudentUncheckedUpdateWithoutGameSessionsInput>
    create: XOR<StudentCreateWithoutGameSessionsInput, StudentUncheckedCreateWithoutGameSessionsInput>
    where?: StudentWhereInput
  }

  export type StudentUpdateToOneWithWhereWithoutGameSessionsInput = {
    where?: StudentWhereInput
    data: XOR<StudentUpdateWithoutGameSessionsInput, StudentUncheckedUpdateWithoutGameSessionsInput>
  }

  export type StudentUpdateWithoutGameSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    diagnosticScore?: NullableIntFieldUpdateOperationsInput | number | null
    diagnosticLevel?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    geftResult?: GeftResultUpdateOneWithoutStudentNestedInput
    leaderboard?: LeaderboardUpdateOneWithoutStudentNestedInput
    teamMembers?: TeamMemberUpdateManyWithoutStudentNestedInput
    teamMessages?: TeamMessageUpdateManyWithoutStudentNestedInput
    classroom?: ClassroomUpdateOneRequiredWithoutStudentsNestedInput
  }

  export type StudentUncheckedUpdateWithoutGameSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    classroomId?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    diagnosticScore?: NullableIntFieldUpdateOperationsInput | number | null
    diagnosticLevel?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    geftResult?: GeftResultUncheckedUpdateOneWithoutStudentNestedInput
    leaderboard?: LeaderboardUncheckedUpdateOneWithoutStudentNestedInput
    teamMembers?: TeamMemberUncheckedUpdateManyWithoutStudentNestedInput
    teamMessages?: TeamMessageUncheckedUpdateManyWithoutStudentNestedInput
  }

  export type StudentCreateWithoutLeaderboardInput = {
    id?: string
    name: string
    nisn: string
    geftStatus?: $Enums.GeftStatus
    diagnosticScore?: number | null
    diagnosticLevel?: string | null
    createdAt?: Date | string
    geftResult?: GeftResultCreateNestedOneWithoutStudentInput
    gameSessions?: GameSessionCreateNestedManyWithoutStudentInput
    teamMembers?: TeamMemberCreateNestedManyWithoutStudentInput
    teamMessages?: TeamMessageCreateNestedManyWithoutStudentInput
    classroom: ClassroomCreateNestedOneWithoutStudentsInput
  }

  export type StudentUncheckedCreateWithoutLeaderboardInput = {
    id?: string
    name: string
    nisn: string
    classroomId: string
    geftStatus?: $Enums.GeftStatus
    diagnosticScore?: number | null
    diagnosticLevel?: string | null
    createdAt?: Date | string
    geftResult?: GeftResultUncheckedCreateNestedOneWithoutStudentInput
    gameSessions?: GameSessionUncheckedCreateNestedManyWithoutStudentInput
    teamMembers?: TeamMemberUncheckedCreateNestedManyWithoutStudentInput
    teamMessages?: TeamMessageUncheckedCreateNestedManyWithoutStudentInput
  }

  export type StudentCreateOrConnectWithoutLeaderboardInput = {
    where: StudentWhereUniqueInput
    create: XOR<StudentCreateWithoutLeaderboardInput, StudentUncheckedCreateWithoutLeaderboardInput>
  }

  export type StudentUpsertWithoutLeaderboardInput = {
    update: XOR<StudentUpdateWithoutLeaderboardInput, StudentUncheckedUpdateWithoutLeaderboardInput>
    create: XOR<StudentCreateWithoutLeaderboardInput, StudentUncheckedCreateWithoutLeaderboardInput>
    where?: StudentWhereInput
  }

  export type StudentUpdateToOneWithWhereWithoutLeaderboardInput = {
    where?: StudentWhereInput
    data: XOR<StudentUpdateWithoutLeaderboardInput, StudentUncheckedUpdateWithoutLeaderboardInput>
  }

  export type StudentUpdateWithoutLeaderboardInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    diagnosticScore?: NullableIntFieldUpdateOperationsInput | number | null
    diagnosticLevel?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    geftResult?: GeftResultUpdateOneWithoutStudentNestedInput
    gameSessions?: GameSessionUpdateManyWithoutStudentNestedInput
    teamMembers?: TeamMemberUpdateManyWithoutStudentNestedInput
    teamMessages?: TeamMessageUpdateManyWithoutStudentNestedInput
    classroom?: ClassroomUpdateOneRequiredWithoutStudentsNestedInput
  }

  export type StudentUncheckedUpdateWithoutLeaderboardInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    classroomId?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    diagnosticScore?: NullableIntFieldUpdateOperationsInput | number | null
    diagnosticLevel?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    geftResult?: GeftResultUncheckedUpdateOneWithoutStudentNestedInput
    gameSessions?: GameSessionUncheckedUpdateManyWithoutStudentNestedInput
    teamMembers?: TeamMemberUncheckedUpdateManyWithoutStudentNestedInput
    teamMessages?: TeamMessageUncheckedUpdateManyWithoutStudentNestedInput
  }

  export type TeamMemberCreateWithoutTeamInput = {
    id?: string
    joinedAt?: Date | string
    student: StudentCreateNestedOneWithoutTeamMembersInput
  }

  export type TeamMemberUncheckedCreateWithoutTeamInput = {
    id?: string
    studentId: string
    joinedAt?: Date | string
  }

  export type TeamMemberCreateOrConnectWithoutTeamInput = {
    where: TeamMemberWhereUniqueInput
    create: XOR<TeamMemberCreateWithoutTeamInput, TeamMemberUncheckedCreateWithoutTeamInput>
  }

  export type TeamMemberCreateManyTeamInputEnvelope = {
    data: TeamMemberCreateManyTeamInput | TeamMemberCreateManyTeamInput[]
    skipDuplicates?: boolean
  }

  export type TeamMessageCreateWithoutTeamInput = {
    id?: string
    senderName: string
    content: string
    createdAt?: Date | string
    student: StudentCreateNestedOneWithoutTeamMessagesInput
  }

  export type TeamMessageUncheckedCreateWithoutTeamInput = {
    id?: string
    studentId: string
    senderName: string
    content: string
    createdAt?: Date | string
  }

  export type TeamMessageCreateOrConnectWithoutTeamInput = {
    where: TeamMessageWhereUniqueInput
    create: XOR<TeamMessageCreateWithoutTeamInput, TeamMessageUncheckedCreateWithoutTeamInput>
  }

  export type TeamMessageCreateManyTeamInputEnvelope = {
    data: TeamMessageCreateManyTeamInput | TeamMessageCreateManyTeamInput[]
    skipDuplicates?: boolean
  }

  export type ClassroomCreateWithoutTeamsInput = {
    id?: string
    name: string
    grade: string
    major: string
    students?: StudentCreateNestedManyWithoutClassroomInput
  }

  export type ClassroomUncheckedCreateWithoutTeamsInput = {
    id?: string
    name: string
    grade: string
    major: string
    students?: StudentUncheckedCreateNestedManyWithoutClassroomInput
  }

  export type ClassroomCreateOrConnectWithoutTeamsInput = {
    where: ClassroomWhereUniqueInput
    create: XOR<ClassroomCreateWithoutTeamsInput, ClassroomUncheckedCreateWithoutTeamsInput>
  }

  export type TeamMemberUpsertWithWhereUniqueWithoutTeamInput = {
    where: TeamMemberWhereUniqueInput
    update: XOR<TeamMemberUpdateWithoutTeamInput, TeamMemberUncheckedUpdateWithoutTeamInput>
    create: XOR<TeamMemberCreateWithoutTeamInput, TeamMemberUncheckedCreateWithoutTeamInput>
  }

  export type TeamMemberUpdateWithWhereUniqueWithoutTeamInput = {
    where: TeamMemberWhereUniqueInput
    data: XOR<TeamMemberUpdateWithoutTeamInput, TeamMemberUncheckedUpdateWithoutTeamInput>
  }

  export type TeamMemberUpdateManyWithWhereWithoutTeamInput = {
    where: TeamMemberScalarWhereInput
    data: XOR<TeamMemberUpdateManyMutationInput, TeamMemberUncheckedUpdateManyWithoutTeamInput>
  }

  export type TeamMessageUpsertWithWhereUniqueWithoutTeamInput = {
    where: TeamMessageWhereUniqueInput
    update: XOR<TeamMessageUpdateWithoutTeamInput, TeamMessageUncheckedUpdateWithoutTeamInput>
    create: XOR<TeamMessageCreateWithoutTeamInput, TeamMessageUncheckedCreateWithoutTeamInput>
  }

  export type TeamMessageUpdateWithWhereUniqueWithoutTeamInput = {
    where: TeamMessageWhereUniqueInput
    data: XOR<TeamMessageUpdateWithoutTeamInput, TeamMessageUncheckedUpdateWithoutTeamInput>
  }

  export type TeamMessageUpdateManyWithWhereWithoutTeamInput = {
    where: TeamMessageScalarWhereInput
    data: XOR<TeamMessageUpdateManyMutationInput, TeamMessageUncheckedUpdateManyWithoutTeamInput>
  }

  export type ClassroomUpsertWithoutTeamsInput = {
    update: XOR<ClassroomUpdateWithoutTeamsInput, ClassroomUncheckedUpdateWithoutTeamsInput>
    create: XOR<ClassroomCreateWithoutTeamsInput, ClassroomUncheckedCreateWithoutTeamsInput>
    where?: ClassroomWhereInput
  }

  export type ClassroomUpdateToOneWithWhereWithoutTeamsInput = {
    where?: ClassroomWhereInput
    data: XOR<ClassroomUpdateWithoutTeamsInput, ClassroomUncheckedUpdateWithoutTeamsInput>
  }

  export type ClassroomUpdateWithoutTeamsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    grade?: StringFieldUpdateOperationsInput | string
    major?: StringFieldUpdateOperationsInput | string
    students?: StudentUpdateManyWithoutClassroomNestedInput
  }

  export type ClassroomUncheckedUpdateWithoutTeamsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    grade?: StringFieldUpdateOperationsInput | string
    major?: StringFieldUpdateOperationsInput | string
    students?: StudentUncheckedUpdateManyWithoutClassroomNestedInput
  }

  export type TeamCreateWithoutMembersInput = {
    id?: string
    levelId: number
    status?: string
    currentStep?: number
    histogramState?: NullableJsonNullValueInput | InputJsonValue
    verdictAnswer?: string
    isCorrect?: boolean
    gamePhase?: string
    readyVotes?: NullableJsonNullValueInput | InputJsonValue
    formulaState?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    chatMessages?: TeamMessageCreateNestedManyWithoutTeamInput
    classroom: ClassroomCreateNestedOneWithoutTeamsInput
  }

  export type TeamUncheckedCreateWithoutMembersInput = {
    id?: string
    classroomId: string
    levelId: number
    status?: string
    currentStep?: number
    histogramState?: NullableJsonNullValueInput | InputJsonValue
    verdictAnswer?: string
    isCorrect?: boolean
    gamePhase?: string
    readyVotes?: NullableJsonNullValueInput | InputJsonValue
    formulaState?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    chatMessages?: TeamMessageUncheckedCreateNestedManyWithoutTeamInput
  }

  export type TeamCreateOrConnectWithoutMembersInput = {
    where: TeamWhereUniqueInput
    create: XOR<TeamCreateWithoutMembersInput, TeamUncheckedCreateWithoutMembersInput>
  }

  export type StudentCreateWithoutTeamMembersInput = {
    id?: string
    name: string
    nisn: string
    geftStatus?: $Enums.GeftStatus
    diagnosticScore?: number | null
    diagnosticLevel?: string | null
    createdAt?: Date | string
    geftResult?: GeftResultCreateNestedOneWithoutStudentInput
    gameSessions?: GameSessionCreateNestedManyWithoutStudentInput
    leaderboard?: LeaderboardCreateNestedOneWithoutStudentInput
    teamMessages?: TeamMessageCreateNestedManyWithoutStudentInput
    classroom: ClassroomCreateNestedOneWithoutStudentsInput
  }

  export type StudentUncheckedCreateWithoutTeamMembersInput = {
    id?: string
    name: string
    nisn: string
    classroomId: string
    geftStatus?: $Enums.GeftStatus
    diagnosticScore?: number | null
    diagnosticLevel?: string | null
    createdAt?: Date | string
    geftResult?: GeftResultUncheckedCreateNestedOneWithoutStudentInput
    gameSessions?: GameSessionUncheckedCreateNestedManyWithoutStudentInput
    leaderboard?: LeaderboardUncheckedCreateNestedOneWithoutStudentInput
    teamMessages?: TeamMessageUncheckedCreateNestedManyWithoutStudentInput
  }

  export type StudentCreateOrConnectWithoutTeamMembersInput = {
    where: StudentWhereUniqueInput
    create: XOR<StudentCreateWithoutTeamMembersInput, StudentUncheckedCreateWithoutTeamMembersInput>
  }

  export type TeamUpsertWithoutMembersInput = {
    update: XOR<TeamUpdateWithoutMembersInput, TeamUncheckedUpdateWithoutMembersInput>
    create: XOR<TeamCreateWithoutMembersInput, TeamUncheckedCreateWithoutMembersInput>
    where?: TeamWhereInput
  }

  export type TeamUpdateToOneWithWhereWithoutMembersInput = {
    where?: TeamWhereInput
    data: XOR<TeamUpdateWithoutMembersInput, TeamUncheckedUpdateWithoutMembersInput>
  }

  export type TeamUpdateWithoutMembersInput = {
    id?: StringFieldUpdateOperationsInput | string
    levelId?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: IntFieldUpdateOperationsInput | number
    histogramState?: NullableJsonNullValueInput | InputJsonValue
    verdictAnswer?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    gamePhase?: StringFieldUpdateOperationsInput | string
    readyVotes?: NullableJsonNullValueInput | InputJsonValue
    formulaState?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    chatMessages?: TeamMessageUpdateManyWithoutTeamNestedInput
    classroom?: ClassroomUpdateOneRequiredWithoutTeamsNestedInput
  }

  export type TeamUncheckedUpdateWithoutMembersInput = {
    id?: StringFieldUpdateOperationsInput | string
    classroomId?: StringFieldUpdateOperationsInput | string
    levelId?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: IntFieldUpdateOperationsInput | number
    histogramState?: NullableJsonNullValueInput | InputJsonValue
    verdictAnswer?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    gamePhase?: StringFieldUpdateOperationsInput | string
    readyVotes?: NullableJsonNullValueInput | InputJsonValue
    formulaState?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    chatMessages?: TeamMessageUncheckedUpdateManyWithoutTeamNestedInput
  }

  export type StudentUpsertWithoutTeamMembersInput = {
    update: XOR<StudentUpdateWithoutTeamMembersInput, StudentUncheckedUpdateWithoutTeamMembersInput>
    create: XOR<StudentCreateWithoutTeamMembersInput, StudentUncheckedCreateWithoutTeamMembersInput>
    where?: StudentWhereInput
  }

  export type StudentUpdateToOneWithWhereWithoutTeamMembersInput = {
    where?: StudentWhereInput
    data: XOR<StudentUpdateWithoutTeamMembersInput, StudentUncheckedUpdateWithoutTeamMembersInput>
  }

  export type StudentUpdateWithoutTeamMembersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    diagnosticScore?: NullableIntFieldUpdateOperationsInput | number | null
    diagnosticLevel?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    geftResult?: GeftResultUpdateOneWithoutStudentNestedInput
    gameSessions?: GameSessionUpdateManyWithoutStudentNestedInput
    leaderboard?: LeaderboardUpdateOneWithoutStudentNestedInput
    teamMessages?: TeamMessageUpdateManyWithoutStudentNestedInput
    classroom?: ClassroomUpdateOneRequiredWithoutStudentsNestedInput
  }

  export type StudentUncheckedUpdateWithoutTeamMembersInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    classroomId?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    diagnosticScore?: NullableIntFieldUpdateOperationsInput | number | null
    diagnosticLevel?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    geftResult?: GeftResultUncheckedUpdateOneWithoutStudentNestedInput
    gameSessions?: GameSessionUncheckedUpdateManyWithoutStudentNestedInput
    leaderboard?: LeaderboardUncheckedUpdateOneWithoutStudentNestedInput
    teamMessages?: TeamMessageUncheckedUpdateManyWithoutStudentNestedInput
  }

  export type TeamCreateWithoutChatMessagesInput = {
    id?: string
    levelId: number
    status?: string
    currentStep?: number
    histogramState?: NullableJsonNullValueInput | InputJsonValue
    verdictAnswer?: string
    isCorrect?: boolean
    gamePhase?: string
    readyVotes?: NullableJsonNullValueInput | InputJsonValue
    formulaState?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    members?: TeamMemberCreateNestedManyWithoutTeamInput
    classroom: ClassroomCreateNestedOneWithoutTeamsInput
  }

  export type TeamUncheckedCreateWithoutChatMessagesInput = {
    id?: string
    classroomId: string
    levelId: number
    status?: string
    currentStep?: number
    histogramState?: NullableJsonNullValueInput | InputJsonValue
    verdictAnswer?: string
    isCorrect?: boolean
    gamePhase?: string
    readyVotes?: NullableJsonNullValueInput | InputJsonValue
    formulaState?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    members?: TeamMemberUncheckedCreateNestedManyWithoutTeamInput
  }

  export type TeamCreateOrConnectWithoutChatMessagesInput = {
    where: TeamWhereUniqueInput
    create: XOR<TeamCreateWithoutChatMessagesInput, TeamUncheckedCreateWithoutChatMessagesInput>
  }

  export type StudentCreateWithoutTeamMessagesInput = {
    id?: string
    name: string
    nisn: string
    geftStatus?: $Enums.GeftStatus
    diagnosticScore?: number | null
    diagnosticLevel?: string | null
    createdAt?: Date | string
    geftResult?: GeftResultCreateNestedOneWithoutStudentInput
    gameSessions?: GameSessionCreateNestedManyWithoutStudentInput
    leaderboard?: LeaderboardCreateNestedOneWithoutStudentInput
    teamMembers?: TeamMemberCreateNestedManyWithoutStudentInput
    classroom: ClassroomCreateNestedOneWithoutStudentsInput
  }

  export type StudentUncheckedCreateWithoutTeamMessagesInput = {
    id?: string
    name: string
    nisn: string
    classroomId: string
    geftStatus?: $Enums.GeftStatus
    diagnosticScore?: number | null
    diagnosticLevel?: string | null
    createdAt?: Date | string
    geftResult?: GeftResultUncheckedCreateNestedOneWithoutStudentInput
    gameSessions?: GameSessionUncheckedCreateNestedManyWithoutStudentInput
    leaderboard?: LeaderboardUncheckedCreateNestedOneWithoutStudentInput
    teamMembers?: TeamMemberUncheckedCreateNestedManyWithoutStudentInput
  }

  export type StudentCreateOrConnectWithoutTeamMessagesInput = {
    where: StudentWhereUniqueInput
    create: XOR<StudentCreateWithoutTeamMessagesInput, StudentUncheckedCreateWithoutTeamMessagesInput>
  }

  export type TeamUpsertWithoutChatMessagesInput = {
    update: XOR<TeamUpdateWithoutChatMessagesInput, TeamUncheckedUpdateWithoutChatMessagesInput>
    create: XOR<TeamCreateWithoutChatMessagesInput, TeamUncheckedCreateWithoutChatMessagesInput>
    where?: TeamWhereInput
  }

  export type TeamUpdateToOneWithWhereWithoutChatMessagesInput = {
    where?: TeamWhereInput
    data: XOR<TeamUpdateWithoutChatMessagesInput, TeamUncheckedUpdateWithoutChatMessagesInput>
  }

  export type TeamUpdateWithoutChatMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    levelId?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: IntFieldUpdateOperationsInput | number
    histogramState?: NullableJsonNullValueInput | InputJsonValue
    verdictAnswer?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    gamePhase?: StringFieldUpdateOperationsInput | string
    readyVotes?: NullableJsonNullValueInput | InputJsonValue
    formulaState?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    members?: TeamMemberUpdateManyWithoutTeamNestedInput
    classroom?: ClassroomUpdateOneRequiredWithoutTeamsNestedInput
  }

  export type TeamUncheckedUpdateWithoutChatMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    classroomId?: StringFieldUpdateOperationsInput | string
    levelId?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: IntFieldUpdateOperationsInput | number
    histogramState?: NullableJsonNullValueInput | InputJsonValue
    verdictAnswer?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    gamePhase?: StringFieldUpdateOperationsInput | string
    readyVotes?: NullableJsonNullValueInput | InputJsonValue
    formulaState?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    members?: TeamMemberUncheckedUpdateManyWithoutTeamNestedInput
  }

  export type StudentUpsertWithoutTeamMessagesInput = {
    update: XOR<StudentUpdateWithoutTeamMessagesInput, StudentUncheckedUpdateWithoutTeamMessagesInput>
    create: XOR<StudentCreateWithoutTeamMessagesInput, StudentUncheckedCreateWithoutTeamMessagesInput>
    where?: StudentWhereInput
  }

  export type StudentUpdateToOneWithWhereWithoutTeamMessagesInput = {
    where?: StudentWhereInput
    data: XOR<StudentUpdateWithoutTeamMessagesInput, StudentUncheckedUpdateWithoutTeamMessagesInput>
  }

  export type StudentUpdateWithoutTeamMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    diagnosticScore?: NullableIntFieldUpdateOperationsInput | number | null
    diagnosticLevel?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    geftResult?: GeftResultUpdateOneWithoutStudentNestedInput
    gameSessions?: GameSessionUpdateManyWithoutStudentNestedInput
    leaderboard?: LeaderboardUpdateOneWithoutStudentNestedInput
    teamMembers?: TeamMemberUpdateManyWithoutStudentNestedInput
    classroom?: ClassroomUpdateOneRequiredWithoutStudentsNestedInput
  }

  export type StudentUncheckedUpdateWithoutTeamMessagesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    classroomId?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    diagnosticScore?: NullableIntFieldUpdateOperationsInput | number | null
    diagnosticLevel?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    geftResult?: GeftResultUncheckedUpdateOneWithoutStudentNestedInput
    gameSessions?: GameSessionUncheckedUpdateManyWithoutStudentNestedInput
    leaderboard?: LeaderboardUncheckedUpdateOneWithoutStudentNestedInput
    teamMembers?: TeamMemberUncheckedUpdateManyWithoutStudentNestedInput
  }

  export type StudentCreateManyClassroomInput = {
    id?: string
    name: string
    nisn: string
    geftStatus?: $Enums.GeftStatus
    diagnosticScore?: number | null
    diagnosticLevel?: string | null
    createdAt?: Date | string
  }

  export type TeamCreateManyClassroomInput = {
    id?: string
    levelId: number
    status?: string
    currentStep?: number
    histogramState?: NullableJsonNullValueInput | InputJsonValue
    verdictAnswer?: string
    isCorrect?: boolean
    gamePhase?: string
    readyVotes?: NullableJsonNullValueInput | InputJsonValue
    formulaState?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StudentUpdateWithoutClassroomInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    diagnosticScore?: NullableIntFieldUpdateOperationsInput | number | null
    diagnosticLevel?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    geftResult?: GeftResultUpdateOneWithoutStudentNestedInput
    gameSessions?: GameSessionUpdateManyWithoutStudentNestedInput
    leaderboard?: LeaderboardUpdateOneWithoutStudentNestedInput
    teamMembers?: TeamMemberUpdateManyWithoutStudentNestedInput
    teamMessages?: TeamMessageUpdateManyWithoutStudentNestedInput
  }

  export type StudentUncheckedUpdateWithoutClassroomInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    diagnosticScore?: NullableIntFieldUpdateOperationsInput | number | null
    diagnosticLevel?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    geftResult?: GeftResultUncheckedUpdateOneWithoutStudentNestedInput
    gameSessions?: GameSessionUncheckedUpdateManyWithoutStudentNestedInput
    leaderboard?: LeaderboardUncheckedUpdateOneWithoutStudentNestedInput
    teamMembers?: TeamMemberUncheckedUpdateManyWithoutStudentNestedInput
    teamMessages?: TeamMessageUncheckedUpdateManyWithoutStudentNestedInput
  }

  export type StudentUncheckedUpdateManyWithoutClassroomInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    diagnosticScore?: NullableIntFieldUpdateOperationsInput | number | null
    diagnosticLevel?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamUpdateWithoutClassroomInput = {
    id?: StringFieldUpdateOperationsInput | string
    levelId?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: IntFieldUpdateOperationsInput | number
    histogramState?: NullableJsonNullValueInput | InputJsonValue
    verdictAnswer?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    gamePhase?: StringFieldUpdateOperationsInput | string
    readyVotes?: NullableJsonNullValueInput | InputJsonValue
    formulaState?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    members?: TeamMemberUpdateManyWithoutTeamNestedInput
    chatMessages?: TeamMessageUpdateManyWithoutTeamNestedInput
  }

  export type TeamUncheckedUpdateWithoutClassroomInput = {
    id?: StringFieldUpdateOperationsInput | string
    levelId?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: IntFieldUpdateOperationsInput | number
    histogramState?: NullableJsonNullValueInput | InputJsonValue
    verdictAnswer?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    gamePhase?: StringFieldUpdateOperationsInput | string
    readyVotes?: NullableJsonNullValueInput | InputJsonValue
    formulaState?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    members?: TeamMemberUncheckedUpdateManyWithoutTeamNestedInput
    chatMessages?: TeamMessageUncheckedUpdateManyWithoutTeamNestedInput
  }

  export type TeamUncheckedUpdateManyWithoutClassroomInput = {
    id?: StringFieldUpdateOperationsInput | string
    levelId?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    currentStep?: IntFieldUpdateOperationsInput | number
    histogramState?: NullableJsonNullValueInput | InputJsonValue
    verdictAnswer?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    gamePhase?: StringFieldUpdateOperationsInput | string
    readyVotes?: NullableJsonNullValueInput | InputJsonValue
    formulaState?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GameSessionCreateManyStudentInput = {
    id?: string
    levelId: number
    cognitiveStyle: string
    xpEarned: number
    livesRemaining: number
    timeTaken: number
    verdictAnswer: string
    isCorrect: boolean
    createdAt?: Date | string
  }

  export type TeamMemberCreateManyStudentInput = {
    id?: string
    teamId: string
    joinedAt?: Date | string
  }

  export type TeamMessageCreateManyStudentInput = {
    id?: string
    teamId: string
    senderName: string
    content: string
    createdAt?: Date | string
  }

  export type GameSessionUpdateWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    levelId?: IntFieldUpdateOperationsInput | number
    cognitiveStyle?: StringFieldUpdateOperationsInput | string
    xpEarned?: IntFieldUpdateOperationsInput | number
    livesRemaining?: IntFieldUpdateOperationsInput | number
    timeTaken?: IntFieldUpdateOperationsInput | number
    verdictAnswer?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GameSessionUncheckedUpdateWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    levelId?: IntFieldUpdateOperationsInput | number
    cognitiveStyle?: StringFieldUpdateOperationsInput | string
    xpEarned?: IntFieldUpdateOperationsInput | number
    livesRemaining?: IntFieldUpdateOperationsInput | number
    timeTaken?: IntFieldUpdateOperationsInput | number
    verdictAnswer?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GameSessionUncheckedUpdateManyWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    levelId?: IntFieldUpdateOperationsInput | number
    cognitiveStyle?: StringFieldUpdateOperationsInput | string
    xpEarned?: IntFieldUpdateOperationsInput | number
    livesRemaining?: IntFieldUpdateOperationsInput | number
    timeTaken?: IntFieldUpdateOperationsInput | number
    verdictAnswer?: StringFieldUpdateOperationsInput | string
    isCorrect?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamMemberUpdateWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    team?: TeamUpdateOneRequiredWithoutMembersNestedInput
  }

  export type TeamMemberUncheckedUpdateWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    teamId?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamMemberUncheckedUpdateManyWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    teamId?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamMessageUpdateWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    team?: TeamUpdateOneRequiredWithoutChatMessagesNestedInput
  }

  export type TeamMessageUncheckedUpdateWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    teamId?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamMessageUncheckedUpdateManyWithoutStudentInput = {
    id?: StringFieldUpdateOperationsInput | string
    teamId?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamMemberCreateManyTeamInput = {
    id?: string
    studentId: string
    joinedAt?: Date | string
  }

  export type TeamMessageCreateManyTeamInput = {
    id?: string
    studentId: string
    senderName: string
    content: string
    createdAt?: Date | string
  }

  export type TeamMemberUpdateWithoutTeamInput = {
    id?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    student?: StudentUpdateOneRequiredWithoutTeamMembersNestedInput
  }

  export type TeamMemberUncheckedUpdateWithoutTeamInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamMemberUncheckedUpdateManyWithoutTeamInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    joinedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamMessageUpdateWithoutTeamInput = {
    id?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    student?: StudentUpdateOneRequiredWithoutTeamMessagesNestedInput
  }

  export type TeamMessageUncheckedUpdateWithoutTeamInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TeamMessageUncheckedUpdateManyWithoutTeamInput = {
    id?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    senderName?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use ClassroomCountOutputTypeDefaultArgs instead
     */
    export type ClassroomCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ClassroomCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use StudentCountOutputTypeDefaultArgs instead
     */
    export type StudentCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = StudentCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TeamCountOutputTypeDefaultArgs instead
     */
    export type TeamCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TeamCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ClassroomDefaultArgs instead
     */
    export type ClassroomArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ClassroomDefaultArgs<ExtArgs>
    /**
     * @deprecated Use StudentDefaultArgs instead
     */
    export type StudentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = StudentDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GeftResultDefaultArgs instead
     */
    export type GeftResultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GeftResultDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GameSessionDefaultArgs instead
     */
    export type GameSessionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GameSessionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use LeaderboardDefaultArgs instead
     */
    export type LeaderboardArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = LeaderboardDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ChatbotKnowledgeDefaultArgs instead
     */
    export type ChatbotKnowledgeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ChatbotKnowledgeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TeamDefaultArgs instead
     */
    export type TeamArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TeamDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TeamMemberDefaultArgs instead
     */
    export type TeamMemberArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TeamMemberDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TeamMessageDefaultArgs instead
     */
    export type TeamMessageArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TeamMessageDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}