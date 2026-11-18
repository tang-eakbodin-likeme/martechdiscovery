// Runs the existing Cloudflare Pages Functions (functions/api/*) inside Next.js route handlers,
// so the sign-in, member, lead and admin APIs keep their logic and the same D1 database.
import { getCloudflareContext } from '@opennextjs/cloudflare';

type PagesContext = { request: Request; env: CloudflareEnv; params: Record<string, string>; next: () => Promise<Response> };
type PagesHandler = (ctx: PagesContext) => Response | Promise<Response>;
type PagesModule = Partial<Record<'onRequest' | 'onRequestGet' | 'onRequestPost' | 'onRequestPut' | 'onRequestPatch' | 'onRequestDelete' | 'onRequestOptions', PagesHandler>>;
type RouteContext = { params?: Promise<Record<string, string>> };

const METHOD = { GET: 'onRequestGet', POST: 'onRequestPost', PUT: 'onRequestPut', PATCH: 'onRequestPatch', DELETE: 'onRequestDelete', OPTIONS: 'onRequestOptions' } as const;

export function adapt(mod: PagesModule) {
  const run = (method: keyof typeof METHOD) => async (request: Request, ctx: RouteContext) => {
    const handler = mod[METHOD[method]] ?? mod.onRequest;
    if (!handler) return new Response(JSON.stringify({ error: 'Method not allowed.' }), { status: 405, headers: { 'content-type': 'application/json' } });
    const { env } = await getCloudflareContext({ async: true });
    const params = (await ctx?.params) ?? {};
    return handler({ request, env, params, next: async () => new Response(null, { status: 404 }) });
  };
  return { GET: run('GET'), POST: run('POST'), PUT: run('PUT'), PATCH: run('PATCH'), DELETE: run('DELETE'), OPTIONS: run('OPTIONS') };
}
