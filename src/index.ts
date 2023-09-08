import { startProxy } from "@viem/anvil";
import type { AbiTypeToPrimitiveType } from "abitype";
import { recoverTypedDataAddress, zeroAddress } from "viem";
import { ALICE, publicClient, walletClient } from "./utils.js";

const domain = {
	name: "Domain",
	version: "1",
	chainId: publicClient.chain.id,
	verifyingContract: zeroAddress,
} as const;

const types = {
	Type: [{ name: "arg", type: "bytes4" }],
} as const;

const recoverSigner = async (arg: AbiTypeToPrimitiveType<"bytes4">) => {
	const signature = await walletClient.signTypedData({
		domain,
		types,
		primaryType: "Type",
		message: {
			arg,
		},
	});

	return await recoverTypedDataAddress({
		domain,
		types,
		primaryType: "Type",
		message: { arg },
		signature,
	});
};

const main = async () => {
	const shutdown = await startProxy({
		port: 8545, // By default, the proxy will listen on port 8545.
		host: "::", // By default, the proxy will listen on all interfaces.
	});

	console.log("Signer: ", ALICE);
	console.log("Zero bytes signer: ", await recoverSigner("0x00000000"));
	console.log("Non-zero bytes signer: ", await recoverSigner("0x00000001"));

	await shutdown();
};

main().catch((err) => console.error(err));
