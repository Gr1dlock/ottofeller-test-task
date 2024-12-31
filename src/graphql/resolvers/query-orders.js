export function request(ctx) {}

export function response(ctx) {
    const nextToken = ctx.stash.nextToken;
    const items = ctx.result.items;
    return { items, nextToken };
}
