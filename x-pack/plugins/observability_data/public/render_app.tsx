import { AppMountParameters } from "@kbn/core/public";
import ReactDOM from "react-dom";
import React from 'react';
import { IObsDataClient } from "../common/api_types";
import { AssetList } from "./components/asset_list";

export async function renderApp({
  appMountParameters,
  obsDataClient
}: {
  appMountParameters: AppMountParameters<unknown>,
  obsDataClient: IObsDataClient
}) {
  ReactDOM.render(
    <div className="app">
      <AssetList client={obsDataClient} />
    </div>,
    appMountParameters.element
  );

  return () => {
    // This needs to be present to fix https://github.com/elastic/kibana/issues/155704
    // as the Overview page renders the UX Section component. That component renders a Lens embeddable
    // via the ExploratoryView app, which uses search sessions. Therefore on unmounting we need to clear
    // these sessions.
    ReactDOM.unmountComponentAtNode(appMountParameters.element);
  };
}