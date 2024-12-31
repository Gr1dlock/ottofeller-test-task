import { util } from "@aws-appsync/utils";

export function request(ctx) {
    // Check if the customer should also be fetched
    const resolveCustomer = ctx.info.selectionSetList.includes("customer");

    if (!ctx.prev.result || !resolveCustomer) {
        return;
    }

    // Get the customer emails from the previous result
    const customerEmails = new Set();
    ctx.prev.result.items.forEach((item) => {
        customerEmails.add(item.customerEmail);
    });

    // Fetch the customers
    return {
        operation: "BatchGetItem",
        tables: {
            [ctx.env.TABLE_NAME]: {
                keys: Array.from(customerEmails).map((email) =>
                    util.dynamodb.toMapValues({
                        PK: `CUSTOMER#${email}`,
                        SK: `METADATA#${email}`,
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

    // Organize customers by email
    const customers = {};
    ctx.result.data[ctx.env.TABLE_NAME].forEach((item) => {
        customers[item.email] = item;
    });

    // Add the customers to the orders
    ctx.prev.result.items.forEach((item) => {
        item.customer = customers[item.customerEmail];
    });

    return ctx.prev.result.items;
}
