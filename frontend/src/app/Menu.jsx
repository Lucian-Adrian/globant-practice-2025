import * as React from 'react';
import { Menu as RaMenu, useTranslate, useLocaleState } from 'react-admin';
import { Link } from 'react-router-dom';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import ViewListIcon from '@mui/icons-material/ViewList';
import TuneIcon from '@mui/icons-material/Tune';
import { useAsidePanel } from '../shared/state/AsidePanelContext.jsx';
import { useI18nForceUpdate } from '../i18n/index.js';

export default function Menu() {
  const translate = useTranslate();
  const [locale] = useLocaleState();
  const { collapsed, toggle } = useAsidePanel();
  const isRu = (locale || '').toLowerCase().startsWith('ru');
  // Ensure live updates when language changes outside RA's locale control
  useI18nForceUpdate();
  return (
    <RaMenu>
      <RaMenu.DashboardItem />
      {/* Toggle Aside Panel button */}
      <ListItemButton
        onClick={toggle}
        sx={{
          my: 1,
          mx: 1,
          borderRadius: 1.5,
          bgcolor: 'action.hover',
          // Ensure enough width for long translations like Russian
          minHeight: 44,
          pr: 2,
        }}
      >
        <ListItemIcon>
          <TuneIcon />
        </ListItemIcon>
        <ListItemText
          key={locale}
          primary={collapsed ? translate('common.show_filters', { defaultValue: 'Show Filters' }) : translate('common.hide_filters', { defaultValue: 'Hide Filters' })}
          primaryTypographyProps={{ noWrap: false, sx: { whiteSpace: 'normal', lineHeight: 1.2 } }}
        />
      </ListItemButton>
      <RaMenu.ResourceItem name="students" />
      <RaMenu.ResourceItem name="instructors" />
      <RaMenu.ResourceItem name="resources" />
      <RaMenu.ResourceItem name="classes" />
      <RaMenu.ResourceItem name="payments" />
      <RaMenu.ResourceItem name="enrollments" />
      <RaMenu.ResourceItem name="lessons" />
      <RaMenu.ResourceItem name="scheduledclasses" />
      {isRu ? (
        // RU only: split label into two lines explicitly
        (() => {
          const raw = translate('resources.instructor-availabilities.name', { defaultValue: 'Доступность инструкторов' });
          const parts = String(raw).split(' ');
          const twoLine = parts.length > 1 ? `${parts[0]}\n${parts.slice(1).join(' ')}` : raw;
          return (
            <RaMenu.Item
              to="/admin/instructor-availabilities"
              leftIcon={<ViewListIcon />}
              primaryText={twoLine}
              sx={{
                '& .MuiListItemText-primary': {
                  textAlign: 'left',
                  whiteSpace: 'pre-line',
                  lineHeight: 1.2,
                },
              }}
              component={Link}
            />
          );
        })()
      ) : (
        // Other languages: default single-line RA item
        <RaMenu.ResourceItem name="instructor-availabilities" />
      )}

  <RaMenu.Item to="/admin/students/board" primaryText={translate('common.students.board.title', { defaultValue: 'Students Board' })} component={Link} />
    </RaMenu>
  );
}
