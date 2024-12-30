import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { StorageStack } from "./stacks/storage-stack";
import { ApiStack } from "./stacks/api-stack";

export interface DeploymentStageProps extends cdk.StageProps {
    readonly environment: string;
}

export class DeploymentStage extends cdk.Stage {
    constructor(scope: Construct, id: string, props: DeploymentStageProps) {
        super(scope, id, props);

        const storageStack = new StorageStack(
            this,
            `${props.environment}StorageStack`,
            {
                environment: props.environment,
            },
        );

        const apiStack = new ApiStack(this, `${props.environment}ApiStack`, {
            environment: props.environment,
            table: storageStack.table,
        });

        apiStack.addDependency(storageStack);
    }
}
