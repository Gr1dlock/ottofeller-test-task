import * as ddb from "@aws-appsync/utils/dynamodb";
import { util } from "@aws-appsync/utils";

export function request(ctx) {
    const { limit = 100, nextToken } = ctx.arguments;

    const queryParameters = {
        index: "GSI1",
        query: { Type: { eq: "ORDER" } },
        limit,
        nextToken,
        consistentRead: true,
    };

    // Check if the products should also be fetched
    // If not, then we can optimize the query by only fetching the metadata
    if (!ctx.info.selectionSetList.includes("products")) {
        queryParameters.query["SK"] = { beginsWith: "METADATA" };
    }

    return ddb.query(queryParameters);
}

export function response(ctx) {
    // Handle errors
    if (ctx.error) {
        util.error(ctx.error.message, ctx.error.type);
    }

    // Organize results into structured orders
    const orders = {};
    ctx.result.items.forEach((item) => {
        const orderId = item.PK.split("#")[1];
        if (!orders[orderId]) {
            orders[orderId] = {
                products: [],
            };
        }
        if (item.SK.startsWith("METADATA")) {
            orders[orderId] = Object.assign(orders[orderId], item);
        } else if (item.SK.startsWith("PRODUCT")) {
            orders[orderId].products.push(item);
        }
    });

    ctx.stash.nextToken = ctx.result.nextToken;

    return Object.values(orders);
}
