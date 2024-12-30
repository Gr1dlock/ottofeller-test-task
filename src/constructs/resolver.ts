import * as appsync from "aws-cdk-lib/aws-appsync";
import { Construct } from "constructs";
import path from "path";

/**
 * Custom resolver with default properties.
 */
export class DefaultResolver extends appsync.Resolver {
    // Valid resolver types
    private static readonly VALID_TYPES = ["Query", "Mutation", "Subscription"];

    /**
     * Creates a new resolver.
     *
     * @param scope Scope of the construct.
     * @param name Name of the resolver, should be in camel case,
     * folow the format: <typeName><fieldName>, the source code should
     * be in a graphql/resolvers folder with the same name in snake case
     * and a .js extension.
     * @param environment The environment the resolver is running in.
     * @param api The AppSync API the resolver is attached to.
     * @param dataSource The data source the resolver is attached to.
     * @param appsyncFunctions The functions that constitute the resolver.
     * @param props Additional properties to override the default properties.
     */
    constructor(
        scope: Construct,
        name: string,
        environment: string,
        api: appsync.IGraphqlApi,
        dataSource: appsync.BaseDataSource,
        appsyncFunctions: appsync.IAppsyncFunction[],
        props?: Partial<appsync.ResolverProps>,
    ) {
        // Parse the name of the resolver to get the type and field name
        const [typeName, fieldName] = name.match(/[A-Z][a-z]+/g) || [];
        if (!typeName || !fieldName) {
            throw new Error(
                "Resolver name must be in the format <typeName><fieldName>",
            );
        }
        // Check the type of the resolver
        else if (!DefaultResolver.VALID_TYPES.includes(typeName)) {
            throw new Error(
                `Resolver type must be one of: ${DefaultResolver.VALID_TYPES.join(
                    ", ",
                )}`,
            );
        }

        super(scope, `${environment}${name}Resolver`, {
            api: api,
            fieldName: fieldName,
            typeName: typeName,
            dataSource: dataSource,
            code: appsync.Code.fromAsset(
                path.join(
                    __dirname,
                    "graphql",
                    "resolvers",
                    `${name
                        .replace(/([a-z])([A-Z])/g, "$1-$2")
                        .toLowerCase()}.js`,
                ),
            ),
            pipelineConfig: appsyncFunctions,
            runtime: appsync.FunctionRuntime.JS_1_0_0,
            ...props,
        });
    }
}
