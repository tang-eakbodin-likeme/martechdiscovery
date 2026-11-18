import * as handlers from '../../../../functions/api/member/favorites.js';
import { adapt } from '@/lib/pages-fn';

export const dynamic = 'force-dynamic';
const route = adapt(handlers);
export const GET = route.GET;
export const POST = route.POST;
export const PUT = route.PUT;
export const PATCH = route.PATCH;
export const DELETE = route.DELETE;
export const OPTIONS = route.OPTIONS;
