import { http, createConfig } from "@wagmi/core";
import { bsc, bscTestnet, localhost } from "@wagmi/core/chains";

export default createConfig({
    chains: [bsc, bscTestnet, localhost],
    transports: {
      [bsc.id]: http(),
      [bscTestnet.id]: http(),
      [localhost.id]: http(process.env.LOCALHOST_URL),
  },
});
