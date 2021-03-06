import * as React from "react";
import { MobileRegistryEntry, QRCodeModalOptions } from "../types";
import { DEFAULT_BUTTON_COLOR, WALLETCONNECT_CTA_TEXT_ID } from "../constants";

import { MOBILE_REGISTRY } from "../assets/registry";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ConnectButton from "./ConnectButton";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import WalletButton from "./WalletButton";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import WalletIcon from "./WalletIcon";
import { TextMap } from "../types";
import { setLocal, MOBILE_LINK_LOCALSTORAGE_KEY, isIOS } from "../utils";

function formatIOSMobile(
  uri: string,
  entry: MobileRegistryEntry,
  host?: string
) {
  const encodedUri: string = encodeURIComponent(uri);
  return entry.universalLink
    ? `${entry.universalLink}/wc?uri=${encodedUri}${
        host ? "&host=" + host : ""
      }`
    : entry.deepLink
    ? `${entry.deepLink}${
        entry.deepLink.endsWith(":") ? "//" : "/"
      }wc?uri=${encodedUri}${host ? "&host=" + host : ""}`
    : "";
}

function saveMobileLinkInfo(data: IMobileLinkInfo) {
  const focusUri = data.href.split("?")[0];
  setLocal(MOBILE_LINK_LOCALSTORAGE_KEY, { ...data, href: focusUri });
}

function getMobileRegistryEntry(name: string): MobileRegistryEntry {
  return MOBILE_REGISTRY.filter((entry: MobileRegistryEntry) =>
    entry.name.toLowerCase().includes(name)
  )[0];
}

function getMobileLinkRegistry(qrcodeModalOptions?: QRCodeModalOptions) {
  let links = MOBILE_REGISTRY;
  if (
    qrcodeModalOptions &&
    qrcodeModalOptions.mobileLinks &&
    qrcodeModalOptions.mobileLinks.length
  ) {
    links = qrcodeModalOptions.mobileLinks.map((name: string) =>
      getMobileRegistryEntry(name)
    );
  }
  return links;
}

interface IMobileLinkInfo {
  name: string;
  href: string;
}
interface MobileLinkDisplayProps {
  qrcodeModalOptions?: QRCodeModalOptions;
  text: TextMap;
  uri: string;
  host?: string;
}

const GRID_MIN_COUNT = 5;
const LINKS_PER_PAGE = 12;

function MobileLinkDisplay(props: MobileLinkDisplayProps) {
  const ios = isIOS();
  const links = getMobileLinkRegistry(props.qrcodeModalOptions);
  const [page, setPage] = React.useState(1);
  const grid = links.length > GRID_MIN_COUNT;
  const pages = Math.ceil(links.length / LINKS_PER_PAGE);
  const range = [(page - 1) * LINKS_PER_PAGE + 1, page * LINKS_PER_PAGE];
  const pageLinks = links.filter(
    (_, index) => index + 1 >= range[0] && index + 1 <= range[1]
  );
  return (
    <div>
      <p id={WALLETCONNECT_CTA_TEXT_ID} className="walletconnect-qrcode__text">
        {ios
          ? props.text.choose_preferred_wallet
          : props.text.connect_mobile_wallet}
      </p>
      <div
        className={`walletconnect-connect__buttons__wrapper${
          !ios ? "__android" : grid ? "__wrap" : ""
        }`}
      >
        {ios ? (
          pageLinks.map((entry: MobileRegistryEntry) => {
            const { color, name, shortName, logo } = entry;
            const href = formatIOSMobile(props.uri, entry, props.host);
            const handleClickIOS = React.useCallback(() => {
              saveMobileLinkInfo({
                name,
                href,
              });
            }, []);
            return !grid ? (
              <WalletButton
                color={color}
                href={href}
                name={name}
                logo={logo}
                onClick={handleClickIOS}
              />
            ) : (
              <WalletIcon
                color={color}
                href={href}
                name={shortName}
                logo={logo}
                onClick={handleClickIOS}
              />
            );
          })
        ) : (
          <ConnectButton
            name={props.text.connect}
            color={DEFAULT_BUTTON_COLOR}
            href={props.uri}
            onClick={React.useCallback(() => {
              saveMobileLinkInfo({
                name: "Unknown",
                href: props.uri,
              });
            }, [])}
          />
        )}
      </div>
      {!!(ios && pages > 1) && (
        <div className="walletconnect-modal__footer">
          {Array(pages)
            .fill(0)
            .map((_, index) => {
              const pageNumber = index + 1;
              const selected = page === pageNumber;
              return (
                <a
                  style={{
                    margin: "auto 10px",
                    fontWeight: selected ? "bold" : "normal",
                  }}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </a>
              );
            })}
        </div>
      )}
    </div>
  );
}

export default MobileLinkDisplay;
