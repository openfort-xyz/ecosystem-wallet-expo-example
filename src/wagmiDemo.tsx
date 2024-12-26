polyfillForWagmi();

import { useMemo } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Section from "./components/section";
import {
  createConnectorFromWallet,
  Wallets,
} from "@mobile-wallet-protocol/wagmi-connectors";
import * as Linking from "expo-linking";
import {
  http,
  createConfig,
  useAccount,
  useConnect,
  useSignMessage,
  useDisconnect,
  useWriteContract,
} from "wagmi";
import { sepolia } from "wagmi/chains";
import { useCapabilities } from "wagmi/experimental";

export const abi = [
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "_to",
              "type": "address"
          }
      ],
      "name": "mint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  }
]

const PREFIX_URL = Linking.createURL("/");

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    createConnectorFromWallet({
      metadata: {
        name: "Wagmi Demo",
        customScheme: PREFIX_URL,
      },
      wallet: {
        type: 'web',
        name: "Rapid fire wallet",
        scheme: 'https://id.sample.openfort.xyz#policy=pol_a909d815-9b6c-40b2-9f6c-e93505281137',
        iconUrl: 'https://purple-magnificent-bat-958.mypinata.cloud/ipfs/QmfQrh2BiCzugFauYF9Weu9SFddsVh9qV82uw43cxH8UDV',
      },
    }),
  ],
  transports: {
    [sepolia.id]: http(),
  },
});

export default function WagmiDemo() {
  const insets = useSafeAreaInsets();
  const { address } = useAccount();

  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const {
    data: signMessageHash,
    error: signMessageError,
    signMessage,
    reset,
  } = useSignMessage();
  const { data: hash, writeContract, isPending, error } = useWriteContract();


  const { data: capabilities, error: capabilitiesError } = useCapabilities();

  const contentContainerStyle = useMemo(
    () => ({
      paddingTop: insets.top + 16,
      paddingBottom: insets.bottom + 16,
      paddingLeft: insets.left + 16,
      paddingRight: insets.right + 16,
      gap: 16,
    }),
    [insets],
  );

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={contentContainerStyle}
    >
      <Text style={{ fontSize: 24, fontWeight: "600", textAlign: "center" }}>
        {"Smart Wallet Wagmi Demo"}
      </Text>
      {address && (
        <Text style={{ fontSize: 16, fontWeight: "600", textAlign: "center" }}>
          Connected ✅
        </Text>
      )}
      <Section
        key={`connect`}
        title="useConnect"
        result={address}
        buttonLabel="Connect"
        onPress={() => connect({ connector: connectors[0] })}
      />
      {address && (
        <>
          <Section
            key="useDisconnect"
            title="useDisconnect"
            buttonLabel="Disconnect"
            onPress={() => {
              disconnect({ connector: connectors[0] });
              reset();
            }}
          />
          <Section
            key="useSignMessage"
            title="useSignMessage"
            result={signMessageHash ?? signMessageError}
            onPress={() => signMessage({ message: "hello world" })}
          />
          <Section
            key="useWriteContract"
            title="useWriteContract"
            result={hash ?? error}
            onPress={() => writeContract({
              abi,
              address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
              functionName: 'mint',
              args: ['0xd2135CfB216b74109775236E36d4b433F1DF507B'],
            })}
          />
          <Section
            key="useCapabilities"
            title="useCapabilities"
            result={JSON.stringify(capabilities ?? capabilitiesError, null, 2)}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    width: "100%",
    height: "100%",
  },
});

function polyfillForWagmi() {
  const noop = (() => {}) as any;

  window.addEventListener = noop;
  window.dispatchEvent = noop;
  window.removeEventListener = noop;
  window.CustomEvent = function CustomEvent() {
    return {};
  } as any;
}
