import AWS from 'aws-sdk';
import { readContract } from "@wagmi/core";

import { processEmail } from "./process-email.mjs";
import { IDSwappFactoryAbi, IDSwappAccountAbi } from "./abi.js";
import wagmiConfig from "./wagmi.config.js";
import config from "./config.mjs";

const ACCOUNT_REGEX = /^\d+@\d+\.idswapp\.com$/;
const INVALID_ADDRESS = "0x0000000000000000000000000000000000000000";

const ses = new AWS.SES();

export const handler = async event => {
  try {
    const notification = JSON.parse(event.Records[0].Sns.Message);
    const recipient = notification.mail.destination.find(email =>
      ACCOUNT_REGEX.test(email),
    );

    if (!recipient) {
      console.log(`No valid recipient found. Skipping...`);
      return;
    }

    const subdomain = parseInt(recipient.split("@")[0]);
    const chainId = parseInt(recipient.split("@")[1].split(".")[0]);
    const factoryAddress = config.FACTORY_ADDRESS[chainId];

    console.log({ subdomain, chainId });
    
    const { _contract: contractAddr} = await readContract(wagmiConfig, {
      chainId,
      abi: IDSwappFactoryAbi,
      address: factoryAddress,
      functionName: "getSubdomainDetails",
      args: [subdomain],
    });

    if (contractAddr === INVALID_ADDRESS) {
      console.log("No contract found for subdomain. Skipping...");
      return;
    }

    const [_, forwardEmail] = await readContract(wagmiConfig, {
      chainId,
      abi: IDSwappAccountAbi,
      address: contractAddr,
      functionName: "privateDetails",
      account: config.ADMIN_ADDRESS[chainId],
    });

    if (!forwardEmail) {
      console.log("No forward email configured. Skipping...");
      return;
    }

    const data = Buffer.from(notification.content, "base64").toString("utf-8");
    const modifiedEmail = processEmail(data, forwardEmail);

    await ses.sendRawEmail({ RawMessage: { Data: modifiedEmail } }).promise();
    console.log(`Email forwarded to ${forwardEmail}`);
  } catch (error) {
    console.error(error);
  }
};
