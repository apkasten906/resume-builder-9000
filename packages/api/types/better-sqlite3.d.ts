declare module 'better-sqlite3' {
  class Database {
    constructor(filename: string, options?: { readonly?: boolean; fileMustExist?: boolean });
    prepare<T = unknown>(sql: string): Statement<T>;
    exec(sql: string): void;
    close(): void;
  }

  class Statement<T = unknown> {
    run(...params: unknown[]): void;
    get(...params: unknown[]): T;
    all(...params: unknown[]): T[];
  }

  export = Database;
}
