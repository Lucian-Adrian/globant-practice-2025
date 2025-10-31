import * as React from 'react';
import { Layout as RaLayout } from 'react-admin';
import LocaleAppBar from './LocaleAppBar.jsx';
import Menu from './Menu.jsx';
import { AsidePanelProvider } from '../shared/state/AsidePanelContext.jsx';

export default function Layout(props) {
  return (
    <AsidePanelProvider>
      <RaLayout {...props} appBar={LocaleAppBar} menu={Menu} />
    </AsidePanelProvider>
  );
}
