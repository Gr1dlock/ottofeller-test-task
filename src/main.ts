import { App } from "aws-cdk-lib";
import { DeploymentStage } from "./stage";

const ENVIRONMENT_CONFIGS = {
    dev: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
};

const app = new App();

for (const [environment, environmentProps] of Object.entries(
    ENVIRONMENT_CONFIGS,
)) {
    new DeploymentStage(app, `${environment}DeploymentStage`, {
        environment,
        env: environmentProps,
    });
}

app.synth();
