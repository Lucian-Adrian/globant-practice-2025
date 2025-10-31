import * as React from 'react';
import { Menu as RaMenu } from 'react-admin';
import { Link } from 'react-router-dom';
import { useTranslate } from 'react-admin';

export default function Menu() {
  const translate = useTranslate();
  return (
    <RaMenu>
      <RaMenu.DashboardItem />
      <RaMenu.ResourceItem name="students" />
      <RaMenu.ResourceItem name="instructors" />
      <RaMenu.ResourceItem name="resources" />
      <RaMenu.ResourceItem name="classes" />
      <RaMenu.ResourceItem name="payments" />
      <RaMenu.ResourceItem name="enrollments" />
      <RaMenu.ResourceItem name="lessons" />
  <RaMenu.ResourceItem name="instructor-availabilities" />

  <RaMenu.Item to="/admin/students/board" primaryText={translate('common.students.board.title', { defaultValue: 'Students Board' })} component={Link} />
    </RaMenu>
  );
}
