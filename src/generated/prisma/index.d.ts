
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
    Leaderboard: 'Leaderboard'
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
      modelProps: "classroom" | "student" | "geftResult" | "gameSession" | "leaderboard"
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
  }

  export type ClassroomCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    students?: boolean | ClassroomCountOutputTypeCountStudentsArgs
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
   * Count Type StudentCountOutputType
   */

  export type StudentCountOutputType = {
    gameSessions: number
  }

  export type StudentCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    gameSessions?: boolean | StudentCountOutputTypeCountGameSessionsArgs
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
    _count?: boolean | ClassroomCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ClassroomIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ClassroomPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Classroom"
    objects: {
      students: Prisma.$StudentPayload<ExtArgs>[]
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
    _min: StudentMinAggregateOutputType | null
    _max: StudentMaxAggregateOutputType | null
  }

  export type StudentMinAggregateOutputType = {
    id: string | null
    name: string | null
    nisn: string | null
    classroomId: string | null
    geftStatus: $Enums.GeftStatus | null
    createdAt: Date | null
  }

  export type StudentMaxAggregateOutputType = {
    id: string | null
    name: string | null
    nisn: string | null
    classroomId: string | null
    geftStatus: $Enums.GeftStatus | null
    createdAt: Date | null
  }

  export type StudentCountAggregateOutputType = {
    id: number
    name: number
    nisn: number
    classroomId: number
    geftStatus: number
    createdAt: number
    _all: number
  }


  export type StudentMinAggregateInputType = {
    id?: true
    name?: true
    nisn?: true
    classroomId?: true
    geftStatus?: true
    createdAt?: true
  }

  export type StudentMaxAggregateInputType = {
    id?: true
    name?: true
    nisn?: true
    classroomId?: true
    geftStatus?: true
    createdAt?: true
  }

  export type StudentCountAggregateInputType = {
    id?: true
    name?: true
    nisn?: true
    classroomId?: true
    geftStatus?: true
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
    _min?: StudentMinAggregateInputType
    _max?: StudentMaxAggregateInputType
  }

  export type StudentGroupByOutputType = {
    id: string
    name: string
    nisn: string
    classroomId: string
    geftStatus: $Enums.GeftStatus
    createdAt: Date
    _count: StudentCountAggregateOutputType | null
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
    createdAt?: boolean
    geftResult?: boolean | Student$geftResultArgs<ExtArgs>
    gameSessions?: boolean | Student$gameSessionsArgs<ExtArgs>
    leaderboard?: boolean | Student$leaderboardArgs<ExtArgs>
    classroom?: boolean | ClassroomDefaultArgs<ExtArgs>
    _count?: boolean | StudentCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["student"]>

  export type StudentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    nisn?: boolean
    classroomId?: boolean
    geftStatus?: boolean
    createdAt?: boolean
    classroom?: boolean | ClassroomDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["student"]>

  export type StudentSelectScalar = {
    id?: boolean
    name?: boolean
    nisn?: boolean
    classroomId?: boolean
    geftStatus?: boolean
    createdAt?: boolean
  }

  export type StudentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    geftResult?: boolean | Student$geftResultArgs<ExtArgs>
    gameSessions?: boolean | Student$gameSessionsArgs<ExtArgs>
    leaderboard?: boolean | Student$leaderboardArgs<ExtArgs>
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
      classroom: Prisma.$ClassroomPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      nisn: string
      classroomId: string
      geftStatus: $Enums.GeftStatus
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


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


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
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


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
  }

  export type ClassroomOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    grade?: SortOrder
    major?: SortOrder
    students?: StudentOrderByRelationAggregateInput
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
    createdAt?: DateTimeFilter<"Student"> | Date | string
    geftResult?: XOR<GeftResultNullableRelationFilter, GeftResultWhereInput> | null
    gameSessions?: GameSessionListRelationFilter
    leaderboard?: XOR<LeaderboardNullableRelationFilter, LeaderboardWhereInput> | null
    classroom?: XOR<ClassroomRelationFilter, ClassroomWhereInput>
  }

  export type StudentOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    nisn?: SortOrder
    classroomId?: SortOrder
    geftStatus?: SortOrder
    createdAt?: SortOrder
    geftResult?: GeftResultOrderByWithRelationInput
    gameSessions?: GameSessionOrderByRelationAggregateInput
    leaderboard?: LeaderboardOrderByWithRelationInput
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
    createdAt?: DateTimeFilter<"Student"> | Date | string
    geftResult?: XOR<GeftResultNullableRelationFilter, GeftResultWhereInput> | null
    gameSessions?: GameSessionListRelationFilter
    leaderboard?: XOR<LeaderboardNullableRelationFilter, LeaderboardWhereInput> | null
    classroom?: XOR<ClassroomRelationFilter, ClassroomWhereInput>
  }, "id" | "nisn">

  export type StudentOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    nisn?: SortOrder
    classroomId?: SortOrder
    geftStatus?: SortOrder
    createdAt?: SortOrder
    _count?: StudentCountOrderByAggregateInput
    _max?: StudentMaxOrderByAggregateInput
    _min?: StudentMinOrderByAggregateInput
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

  export type ClassroomCreateInput = {
    id?: string
    name: string
    grade: string
    major: string
    students?: StudentCreateNestedManyWithoutClassroomInput
  }

  export type ClassroomUncheckedCreateInput = {
    id?: string
    name: string
    grade: string
    major: string
    students?: StudentUncheckedCreateNestedManyWithoutClassroomInput
  }

  export type ClassroomUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    grade?: StringFieldUpdateOperationsInput | string
    major?: StringFieldUpdateOperationsInput | string
    students?: StudentUpdateManyWithoutClassroomNestedInput
  }

  export type ClassroomUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    grade?: StringFieldUpdateOperationsInput | string
    major?: StringFieldUpdateOperationsInput | string
    students?: StudentUncheckedUpdateManyWithoutClassroomNestedInput
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
    createdAt?: Date | string
    geftResult?: GeftResultCreateNestedOneWithoutStudentInput
    gameSessions?: GameSessionCreateNestedManyWithoutStudentInput
    leaderboard?: LeaderboardCreateNestedOneWithoutStudentInput
    classroom: ClassroomCreateNestedOneWithoutStudentsInput
  }

  export type StudentUncheckedCreateInput = {
    id?: string
    name: string
    nisn: string
    classroomId: string
    geftStatus?: $Enums.GeftStatus
    createdAt?: Date | string
    geftResult?: GeftResultUncheckedCreateNestedOneWithoutStudentInput
    gameSessions?: GameSessionUncheckedCreateNestedManyWithoutStudentInput
    leaderboard?: LeaderboardUncheckedCreateNestedOneWithoutStudentInput
  }

  export type StudentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    geftResult?: GeftResultUpdateOneWithoutStudentNestedInput
    gameSessions?: GameSessionUpdateManyWithoutStudentNestedInput
    leaderboard?: LeaderboardUpdateOneWithoutStudentNestedInput
    classroom?: ClassroomUpdateOneRequiredWithoutStudentsNestedInput
  }

  export type StudentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    classroomId?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    geftResult?: GeftResultUncheckedUpdateOneWithoutStudentNestedInput
    gameSessions?: GameSessionUncheckedUpdateManyWithoutStudentNestedInput
    leaderboard?: LeaderboardUncheckedUpdateOneWithoutStudentNestedInput
  }

  export type StudentCreateManyInput = {
    id?: string
    name: string
    nisn: string
    classroomId: string
    geftStatus?: $Enums.GeftStatus
    createdAt?: Date | string
  }

  export type StudentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StudentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    classroomId?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
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

  export type StudentOrderByRelationAggregateInput = {
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

  export type ClassroomRelationFilter = {
    is?: ClassroomWhereInput
    isNot?: ClassroomWhereInput
  }

  export type GameSessionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type StudentCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    nisn?: SortOrder
    classroomId?: SortOrder
    geftStatus?: SortOrder
    createdAt?: SortOrder
  }

  export type StudentMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    nisn?: SortOrder
    classroomId?: SortOrder
    geftStatus?: SortOrder
    createdAt?: SortOrder
  }

  export type StudentMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    nisn?: SortOrder
    classroomId?: SortOrder
    geftStatus?: SortOrder
    createdAt?: SortOrder
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

  export type StudentCreateNestedManyWithoutClassroomInput = {
    create?: XOR<StudentCreateWithoutClassroomInput, StudentUncheckedCreateWithoutClassroomInput> | StudentCreateWithoutClassroomInput[] | StudentUncheckedCreateWithoutClassroomInput[]
    connectOrCreate?: StudentCreateOrConnectWithoutClassroomInput | StudentCreateOrConnectWithoutClassroomInput[]
    createMany?: StudentCreateManyClassroomInputEnvelope
    connect?: StudentWhereUniqueInput | StudentWhereUniqueInput[]
  }

  export type StudentUncheckedCreateNestedManyWithoutClassroomInput = {
    create?: XOR<StudentCreateWithoutClassroomInput, StudentUncheckedCreateWithoutClassroomInput> | StudentCreateWithoutClassroomInput[] | StudentUncheckedCreateWithoutClassroomInput[]
    connectOrCreate?: StudentCreateOrConnectWithoutClassroomInput | StudentCreateOrConnectWithoutClassroomInput[]
    createMany?: StudentCreateManyClassroomInputEnvelope
    connect?: StudentWhereUniqueInput | StudentWhereUniqueInput[]
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

  export type EnumGeftStatusFieldUpdateOperationsInput = {
    set?: $Enums.GeftStatus
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

  export type StudentCreateWithoutClassroomInput = {
    id?: string
    name: string
    nisn: string
    geftStatus?: $Enums.GeftStatus
    createdAt?: Date | string
    geftResult?: GeftResultCreateNestedOneWithoutStudentInput
    gameSessions?: GameSessionCreateNestedManyWithoutStudentInput
    leaderboard?: LeaderboardCreateNestedOneWithoutStudentInput
  }

  export type StudentUncheckedCreateWithoutClassroomInput = {
    id?: string
    name: string
    nisn: string
    geftStatus?: $Enums.GeftStatus
    createdAt?: Date | string
    geftResult?: GeftResultUncheckedCreateNestedOneWithoutStudentInput
    gameSessions?: GameSessionUncheckedCreateNestedManyWithoutStudentInput
    leaderboard?: LeaderboardUncheckedCreateNestedOneWithoutStudentInput
  }

  export type StudentCreateOrConnectWithoutClassroomInput = {
    where: StudentWhereUniqueInput
    create: XOR<StudentCreateWithoutClassroomInput, StudentUncheckedCreateWithoutClassroomInput>
  }

  export type StudentCreateManyClassroomInputEnvelope = {
    data: StudentCreateManyClassroomInput | StudentCreateManyClassroomInput[]
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
    createdAt?: DateTimeFilter<"Student"> | Date | string
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

  export type ClassroomCreateWithoutStudentsInput = {
    id?: string
    name: string
    grade: string
    major: string
  }

  export type ClassroomUncheckedCreateWithoutStudentsInput = {
    id?: string
    name: string
    grade: string
    major: string
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
  }

  export type ClassroomUncheckedUpdateWithoutStudentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    grade?: StringFieldUpdateOperationsInput | string
    major?: StringFieldUpdateOperationsInput | string
  }

  export type StudentCreateWithoutGeftResultInput = {
    id?: string
    name: string
    nisn: string
    geftStatus?: $Enums.GeftStatus
    createdAt?: Date | string
    gameSessions?: GameSessionCreateNestedManyWithoutStudentInput
    leaderboard?: LeaderboardCreateNestedOneWithoutStudentInput
    classroom: ClassroomCreateNestedOneWithoutStudentsInput
  }

  export type StudentUncheckedCreateWithoutGeftResultInput = {
    id?: string
    name: string
    nisn: string
    classroomId: string
    geftStatus?: $Enums.GeftStatus
    createdAt?: Date | string
    gameSessions?: GameSessionUncheckedCreateNestedManyWithoutStudentInput
    leaderboard?: LeaderboardUncheckedCreateNestedOneWithoutStudentInput
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
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    gameSessions?: GameSessionUpdateManyWithoutStudentNestedInput
    leaderboard?: LeaderboardUpdateOneWithoutStudentNestedInput
    classroom?: ClassroomUpdateOneRequiredWithoutStudentsNestedInput
  }

  export type StudentUncheckedUpdateWithoutGeftResultInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    classroomId?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    gameSessions?: GameSessionUncheckedUpdateManyWithoutStudentNestedInput
    leaderboard?: LeaderboardUncheckedUpdateOneWithoutStudentNestedInput
  }

  export type StudentCreateWithoutGameSessionsInput = {
    id?: string
    name: string
    nisn: string
    geftStatus?: $Enums.GeftStatus
    createdAt?: Date | string
    geftResult?: GeftResultCreateNestedOneWithoutStudentInput
    leaderboard?: LeaderboardCreateNestedOneWithoutStudentInput
    classroom: ClassroomCreateNestedOneWithoutStudentsInput
  }

  export type StudentUncheckedCreateWithoutGameSessionsInput = {
    id?: string
    name: string
    nisn: string
    classroomId: string
    geftStatus?: $Enums.GeftStatus
    createdAt?: Date | string
    geftResult?: GeftResultUncheckedCreateNestedOneWithoutStudentInput
    leaderboard?: LeaderboardUncheckedCreateNestedOneWithoutStudentInput
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
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    geftResult?: GeftResultUpdateOneWithoutStudentNestedInput
    leaderboard?: LeaderboardUpdateOneWithoutStudentNestedInput
    classroom?: ClassroomUpdateOneRequiredWithoutStudentsNestedInput
  }

  export type StudentUncheckedUpdateWithoutGameSessionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    classroomId?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    geftResult?: GeftResultUncheckedUpdateOneWithoutStudentNestedInput
    leaderboard?: LeaderboardUncheckedUpdateOneWithoutStudentNestedInput
  }

  export type StudentCreateWithoutLeaderboardInput = {
    id?: string
    name: string
    nisn: string
    geftStatus?: $Enums.GeftStatus
    createdAt?: Date | string
    geftResult?: GeftResultCreateNestedOneWithoutStudentInput
    gameSessions?: GameSessionCreateNestedManyWithoutStudentInput
    classroom: ClassroomCreateNestedOneWithoutStudentsInput
  }

  export type StudentUncheckedCreateWithoutLeaderboardInput = {
    id?: string
    name: string
    nisn: string
    classroomId: string
    geftStatus?: $Enums.GeftStatus
    createdAt?: Date | string
    geftResult?: GeftResultUncheckedCreateNestedOneWithoutStudentInput
    gameSessions?: GameSessionUncheckedCreateNestedManyWithoutStudentInput
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
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    geftResult?: GeftResultUpdateOneWithoutStudentNestedInput
    gameSessions?: GameSessionUpdateManyWithoutStudentNestedInput
    classroom?: ClassroomUpdateOneRequiredWithoutStudentsNestedInput
  }

  export type StudentUncheckedUpdateWithoutLeaderboardInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    classroomId?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    geftResult?: GeftResultUncheckedUpdateOneWithoutStudentNestedInput
    gameSessions?: GameSessionUncheckedUpdateManyWithoutStudentNestedInput
  }

  export type StudentCreateManyClassroomInput = {
    id?: string
    name: string
    nisn: string
    geftStatus?: $Enums.GeftStatus
    createdAt?: Date | string
  }

  export type StudentUpdateWithoutClassroomInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    geftResult?: GeftResultUpdateOneWithoutStudentNestedInput
    gameSessions?: GameSessionUpdateManyWithoutStudentNestedInput
    leaderboard?: LeaderboardUpdateOneWithoutStudentNestedInput
  }

  export type StudentUncheckedUpdateWithoutClassroomInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    geftResult?: GeftResultUncheckedUpdateOneWithoutStudentNestedInput
    gameSessions?: GameSessionUncheckedUpdateManyWithoutStudentNestedInput
    leaderboard?: LeaderboardUncheckedUpdateOneWithoutStudentNestedInput
  }

  export type StudentUncheckedUpdateManyWithoutClassroomInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    nisn?: StringFieldUpdateOperationsInput | string
    geftStatus?: EnumGeftStatusFieldUpdateOperationsInput | $Enums.GeftStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
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