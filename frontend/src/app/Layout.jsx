import * as React from 'react';
import { Layout as RaLayout } from 'react-admin';
import LocaleAppBar from './LocaleAppBar.jsx';

export default function Layout(props) {
  return <RaLayout {...props} appBar={LocaleAppBar} />;
}
