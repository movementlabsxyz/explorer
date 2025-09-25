import {AnyAptosWallet} from "@aptos-labs/wallet-adapter-react";
import {Breakpoint} from "@mui/material";
import WalletButton from "./WalletButton";
import WalletsModal from "./WalletModal";
import {useGlobalState} from "../global-config/GlobalConfig";

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
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function WalletConnector({
  networkSupport: _networkSupport,  // Accept but don't use
  handleNavigate,
  sortDefaultWallets: _sortDefaultWallets,  // Accept but don't use
  sortMoreWallets: _sortMoreWallets,  // Accept but don't use
  modalMaxWidth,
}: WalletConnectorProps) {
  const [
    {isWalletConnectModalOpen: modalOpen},
    {setWalletConnectModalOpen: setModalOpen},
  ] = useGlobalState();
  const handleModalOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  return (
    <>
      <WalletButton
        handleModalOpen={handleModalOpen}
        handleNavigate={handleNavigate}
      />
      <WalletsModal
        handleClose={handleClose}
        modalOpen={modalOpen}
        maxWidth={modalMaxWidth}
      />
    </>
  );
}
