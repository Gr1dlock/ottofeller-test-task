import { util } from "@aws-appsync/utils";

export function request(ctx) {
    // Check if the products should also be fetched
    const resolveProducts = ctx.info.selectionSetList.includes("products");

    if (!ctx.prev.result || !resolveProducts) {
        return;
    }

    // Get the product ids from the previous result
    const productIds = new Set();
    ctx.prev.result.items.forEach((item) => {
        item.products.forEach((product) => {
            productIds.add(product.id);
        });
    });

    // Fetch the products
    return {
        operation: "BatchGetItem",
        tables: {
            [ctx.env.TABLE_NAME]: {
                keys: Array.from(productIds).map((id) =>
                    util.dynamodb.toMapValues({
                        PK: `PRODUCT#${id}`,
                        SK: `METADATA#${id}`,
                    }),
                ),
                consistentRead: true,
            },
        },
    };
}

export function response(ctx) {
    if (ctx.error) {
        util.error(ctx.error.message, ctx.error.type);
    }

    if (!ctx.result.data[ctx.env.TABLE_NAME]) {
        return ctx.prev.result.items;
    }

    // Organize products by id
    const products = {};
    ctx.result.data[ctx.env.TABLE_NAME].forEach((item) => {
        products[item.id] = item;
    });

    // Add the products to the orders
    ctx.prev.result.items.forEach((item) => {
        item.products.forEach((product) => {
            Object.assign(product, products[product.id]);
        });
    });

    return ctx.prev.result.items;
}
