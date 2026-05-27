import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export async function createContext(
  opts: CreateExpressContextOptions
) {

  return {
    req: opts.req,
    res: opts.res,

    user: {
      id: "admin",
      name: "Administrador",
      role: "admin",
    },
  };
}

export type TrpcContext = Awaited<
  ReturnType<typeof createContext>
>;