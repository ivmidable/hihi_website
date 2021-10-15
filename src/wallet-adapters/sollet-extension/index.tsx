import Wallet from '@project-serum/sol-wallet-adapter';
//import { notify } from '../notifications/notifications';

export function SolletExtensionAdapter(_:any, network:any) {
  const sollet = (window as any).sollet;
  if (sollet) {
    return new Wallet(sollet, network);
  }

  return {
    on: () => {},
    connect: () => {
      /*notify({
        message: 'Sollet Extension Error',
        description: 'Please install the Sollet Extension for Chrome',
      });*/
    }
  }
}