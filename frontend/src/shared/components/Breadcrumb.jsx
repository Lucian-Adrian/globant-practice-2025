import * as React from 'react';
import { Breadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useTranslate } from 'react-admin';

const Breadcrumb = () => {
  const location = useLocation();
  const t = useTranslate();

  // Parse the current path to create breadcrumbs
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Define resource labels
  const resourceLabels = {
    'scheduledclasspatterns': t('resources.scheduledclasspatterns.name', 'Scheduled Class Patterns'),
    'scheduledclasses': t('resources.scheduledclasses.name', 'Scheduled Classes'),
    'students': t('resources.students.name', 'Students'),
    'instructors': t('resources.instructors.name', 'Instructors'),
    'courses': t('resources.courses.name', 'Courses'),
    'resources': t('resources.resources.name', 'Resources'),
    'enrollments': t('resources.enrollments.name', 'Enrollments'),
    'lessons': t('resources.lessons.name', 'Lessons'),
    'payments': t('resources.payments.name', 'Payments'),
  };

  const breadcrumbs = [
    <Link key="home" component={RouterLink} to="/" underline="hover">
      {t('ra.nav.home', 'Home')}
    </Link>
  ];

  let currentPath = '';
  pathnames.forEach((pathname, index) => {
    currentPath += `/${pathname}`;
    const isLast = index === pathnames.length - 1;

    // Handle different path patterns
    if (pathname in resourceLabels) {
      // Resource list page
      if (isLast) {
        breadcrumbs.push(
          <Typography key={pathname} color="text.primary">
            {resourceLabels[pathname]}
          </Typography>
        );
      } else {
        breadcrumbs.push(
          <Link key={pathname} component={RouterLink} to={currentPath} underline="hover">
            {resourceLabels[pathname]}
          </Link>
        );
      }
    } else if (pathname === 'create') {
      breadcrumbs.push(
        <Typography key={pathname} color="text.primary">
          {t('ra.action.create', 'Create')}
        </Typography>
      );
    } else if (pathnames.length > 1 && !isNaN(pathname)) {
      // This is likely an ID on an edit page, show as "Edit"
      const prevPathname = pathnames[index - 1];
      if (prevPathname && prevPathname in resourceLabels) {
        breadcrumbs.push(
          <Typography key={pathname} color="text.primary">
            {t('ra.action.edit', 'Edit')}
          </Typography>
        );
      }
    }
  });

  // Only show breadcrumbs if we have more than just Home
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      sx={{ mb: 2, mt: 1 }}
    >
      {breadcrumbs}
    </Breadcrumbs>
  );
};

export default Breadcrumb;