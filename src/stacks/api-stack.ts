import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as appsync from "aws-cdk-lib/aws-appsync";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import path from "path";
import { DefaultAppsyncFunction } from "../constructs/app-sync-func";
import { DefaultResolver } from "../constructs/resolver";

export interface ApiStackProps extends cdk.StackProps {
    readonly environment: string;
    readonly table: dynamodb.TableV2;
}

export class ApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);

        const api = new appsync.GraphqlApi(this, `${props.environment}Api`, {
            name: `${props.environment}Api`,
            definition: appsync.Definition.fromFile(
                path.join(__dirname, "graphql", "schema.graphql"),
            ),
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: appsync.AuthorizationType.API_KEY,
                    apiKeyConfig: {
                        expires: cdk.Expiration.after(cdk.Duration.days(14)),
                    },
                },
            },
            queryDepthLimit: 3,
            logConfig: {
                fieldLogLevel: appsync.FieldLogLevel.ALL,
                excludeVerboseContent: false,
                retention: logs.RetentionDays.ONE_WEEK,
            },
        });

        const dataSource = api.addDynamoDbDataSource(
            `${props.environment}DataSource`,
            props.table,
        );

        const getOrdersFunction = new DefaultAppsyncFunction(
            this,
            "GetOrders",
            props.environment,
            api,
            dataSource,
        );

        const getCustomerFunction = new DefaultAppsyncFunction(
            this,
            "GetCustomer",
            props.environment,
            api,
            dataSource,
        );

        const getProductsFunction = new DefaultAppsyncFunction(
            this,
            "GetProducts",
            props.environment,
            api,
            dataSource,
        );

        const getOrdersResolver = new DefaultResolver(
            this,
            "QueryOrders",
            props.environment,
            api,
            dataSource,
            [getOrdersFunction, getCustomerFunction, getProductsFunction],
        );
    }
}
