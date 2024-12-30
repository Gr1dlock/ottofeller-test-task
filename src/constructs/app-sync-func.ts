import * as appsync from "aws-cdk-lib/aws-appsync";
import { Construct } from "constructs";
import path from "path";

/**
 * Custom AppSync function with default properties.
 */
export class DefaultAppsyncFunction extends appsync.AppsyncFunction {
    /**
     * Creates a new AppSync function.
     *
     * @param scope Scope of the construct.
     * @param name Name of the AppSync function, should be in camel case,
     * the source code should be in a graphql/resolvers folder with the
     * same name in snake case and a .js extension.
     * @param environment The environment the AppSync function is running in.
     * @param api The AppSync API the function is attached to.
     * @param dataSource The data source the function is attached to.
     * @param props Additional properties to override the default properties.
     */
    constructor(
        scope: Construct,
        name: string,
        environment: string,
        api: appsync.IGraphqlApi,
        dataSource: appsync.BaseDataSource,
        props?: Partial<appsync.AppsyncFunctionProps>,
    ) {
        super(scope, `${environment}${name}AppSyncFunction`, {
            api: api,
            dataSource: dataSource,
            name: environment + name,
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
            runtime: appsync.FunctionRuntime.JS_1_0_0,
            ...props,
        });
    }
}
