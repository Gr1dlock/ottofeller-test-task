import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export interface StorageStackProps extends cdk.StackProps {
    readonly environment: string;
}

export class StorageStack extends cdk.Stack {
    public readonly table: dynamodb.TableV2;

    constructor(scope: Construct, id: string, props: StorageStackProps) {
        super(scope, id, props);

        this.table = new dynamodb.TableV2(this, `${props.environment}Table`, {
            partitionKey: {
                name: "PK",
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
            billing: dynamodb.Billing.onDemand(),
            removalPolicy: cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE,
        });

        // Add a global secondary index to the table
        this.table.addGlobalSecondaryIndex({
            indexName: "GSI1",
            partitionKey: {
                name: "Type",
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: { name: "SK", type: dynamodb.AttributeType.STRING },
        });
    }
}
