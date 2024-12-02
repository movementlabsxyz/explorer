import {AnyAptosWallet} from "@aptos-labs/wallet-adapter-react";
import {Breakpoint} from "@mui/material";
import WalletButton from "./WalletButton";
import WalletsModal from "./WalletModal";
import {useEffect, useState} from "react";

export interface WalletConnectorProps {
  networkSupport?: string;
  handleNavigate?: () => void;
  /**
   * An optional function for sorting wallets that are currently installed or
   * loadable in the wallet connector modal.
   */
  sortDefaultWallets?: (a: AnyAptosWallet, b: AnyAptosWallet) => number;
  /**
   * An optional function for sorting wallets that are NOT currently installed or
   * loadable in the wallet connector modal.
   */
  sortMoreWallets?: (a: AnyAptosWallet, b: AnyAptosWallet) => number;
  /** The max width of the wallet selector modal. Defaults to `xs`. */
  modalMaxWidth?: Breakpoint;
  toggleWalletConnectModalVisiblityRef?: React.MutableRefObject<
    (() => void) | null
  >;
}

export function WalletConnector({
  networkSupport,
  handleNavigate,
  sortDefaultWallets,
  sortMoreWallets,
  modalMaxWidth,
  toggleWalletConnectModalVisiblityRef,
}: WalletConnectorProps) {
  const [walletConnectModalOpen, setWalletConnectModalOpen] = useState(false);
  const handleModalOpen = () => setWalletConnectModalOpen(true);
  const handleClose = () => setWalletConnectModalOpen(false);

  useEffect(() => {
    if (toggleWalletConnectModalVisiblityRef) {
      toggleWalletConnectModalVisiblityRef.current = handleModalOpen;
    }
  }, []);

  return (
    <>
      <WalletButton
        handleModalOpen={handleModalOpen}
        handleNavigate={handleNavigate}
      />
      <WalletsModal
        handleClose={handleClose}
        modalOpen={walletConnectModalOpen}
        networkSupport={networkSupport}
        sortDefaultWallets={sortDefaultWallets}
        sortMoreWallets={sortMoreWallets}
        maxWidth={modalMaxWidth}
      />
    </>
  );
}
