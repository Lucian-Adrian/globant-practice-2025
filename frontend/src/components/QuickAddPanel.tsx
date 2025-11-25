import * as React from 'react';
import { useMemo, useState } from 'react';
import { Button, ResourceContextProvider, useTranslate, useNotify } from 'react-admin';
import { Card, CardHeader, CardContent, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import InstructorCreate from '../features/instructors/InstructorCreate.jsx';
import { makeResourceCreate } from '../features/resources';
import { makeCourseCreate } from '../features/courses';
import { VEHICLE_CATEGORIES as FALLBACK_VEHICLE } from '../shared/constants/drivingSchool.js';

type OpenKind = null | 'instructor' | 'vehicle' | 'classroom' | 'course';

const QuickAddPanel: React.FC = () => {
  const [open, setOpen] = useState<OpenKind>(null);
  const t = useTranslate();
  const notify = useNotify();
  const ResourceCreateForm = useMemo(() => makeResourceCreate(FALLBACK_VEHICLE), []);
  const courseTypeChoices = useMemo(() => ([
    { id: 'THEORY', name: 'THEORY' },
    { id: 'PRACTICE', name: 'PRACTICE' },
  ]), []);
  const CourseCreateForm = useMemo(() => makeCourseCreate(FALLBACK_VEHICLE, courseTypeChoices), [courseTypeChoices]);

  const close = () => setOpen(null);
  const onCreated = () => {
    try { notify('ra.notification.created', { type: 'info', messageArgs: { smart_count: 1 } }); } catch (_) {}
    close();
  };

  return (
    <Card>
      <CardHeader title={t('common.dashboard.quick_add.title', 'Quick Add')} />
      <CardContent>
        <div
          style={{
            display: 'grid',
            gap: '12px 16px', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            alignItems: 'start',
            maxWidth: 560
          }}
        >
          <div>
            <Button label={t('common.dashboard.quick_add.add_instructor', 'Add New Instructor')} onClick={() => setOpen('instructor')} />
          </div>
          <div>
            <Button label={t('common.dashboard.quick_add.add_vehicle', 'Add New Vehicle')} onClick={() => setOpen('vehicle')} />
          </div>
          <div>
            <Button label={t('common.dashboard.quick_add.add_classroom', 'Add New Classroom')} onClick={() => setOpen('classroom')} />
          </div>
          <div>
            <Button label={t('common.dashboard.quick_add.add_course', 'Add New Course')} onClick={() => setOpen('course')} />
          </div>
        </div>

        {/* Instructor modal */}
        <Dialog open={open === 'instructor'} onClose={close} fullWidth maxWidth="md">
          <DialogTitle>{t('common.dashboard.quick_add.add_instructor', 'Add New Instructor')}</DialogTitle>
          <DialogContent dividers>
            <ResourceContextProvider value="instructors">
              <InstructorCreate redirect={false} mutationOptions={{ onSuccess: onCreated }} />
            </ResourceContextProvider>
          </DialogContent>
          <DialogActions>
            <Button label={t('common.dashboard.quick_add.close', 'Close')} onClick={close} />
          </DialogActions>
        </Dialog>

        {/* Vehicle modal (ResourceCreate) */}
        <Dialog open={open === 'vehicle'} onClose={close} fullWidth maxWidth="md">
          <DialogTitle>{t('common.dashboard.quick_add.add_vehicle', 'Add New Vehicle')}</DialogTitle>
          <DialogContent dividers>
            <ResourceContextProvider value="resources">
              <ResourceCreateForm redirect={false} mutationOptions={{ onSuccess: onCreated }} />
            </ResourceContextProvider>
          </DialogContent>
          <DialogActions>
            <Button label={t('common.dashboard.quick_add.close', 'Close')} onClick={close} />
          </DialogActions>
        </Dialog>

        {/* Classroom modal (ResourceCreate) */}
        <Dialog open={open === 'classroom'} onClose={close} fullWidth maxWidth="md">
          <DialogTitle>{t('common.dashboard.quick_add.add_classroom', 'Add New Classroom')}</DialogTitle>
          <DialogContent dividers>
            <ResourceContextProvider value="resources">
              {/* Provide a sensible default that looks like a classroom (bigger capacity) */}
              <ResourceCreateForm redirect={false} mutationOptions={{ onSuccess: onCreated }} record={{ max_capacity: 30 }} />
            </ResourceContextProvider>
          </DialogContent>
          <DialogActions>
            <Button label={t('common.dashboard.quick_add.close', 'Close')} onClick={close} />
          </DialogActions>
        </Dialog>

        {/* Course modal */}
        <Dialog open={open === 'course'} onClose={close} fullWidth maxWidth="md">
          <DialogTitle>{t('common.dashboard.quick_add.add_course', 'Add New Course')}</DialogTitle>
          <DialogContent dividers>
            <ResourceContextProvider value="classes">
              <CourseCreateForm redirect={false} mutationOptions={{ onSuccess: onCreated }} />
            </ResourceContextProvider>
          </DialogContent>
          <DialogActions>
            <Button label={t('common.dashboard.quick_add.close', 'Close')} onClick={close} />
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default QuickAddPanel;
