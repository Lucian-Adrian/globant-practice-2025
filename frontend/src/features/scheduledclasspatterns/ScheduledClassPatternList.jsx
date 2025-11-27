import * as React from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  NumberField,
  ReferenceField,
  BulkDeleteButton,
  useDataProvider,
  useNotify,
  useRefresh,
  useUnselectAll,
  Button,
  useTranslate,
  Confirm
} from 'react-admin';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ListImportActions from '../../shared/components/ListImportActions.jsx';
import Breadcrumb from '../../shared/components/Breadcrumb.jsx';

// Custom bulk action for generating classes
const BulkGenerateClassesButton = ({ selectedIds }) => {
  const notify = useNotify();
  const refresh = useRefresh();
  const unselectAll = useUnselectAll();
  const t = useTranslate();
  const dataProvider = useDataProvider();
  const [open, setOpen] = React.useState(false);

  const { mutate, isLoading } = useMutation(
    async () => {
      const promises = selectedIds.map(id =>
        dataProvider.create(`scheduled-class-patterns/${id}/generate-classes`, {
          data: {}
        })
        .then(res => ({ status: 'fulfilled', value: res }))
        .catch(err => ({ status: 'rejected', reason: err }))
      );
      const results = await Promise.all(promises);
      
      const successes = results.filter(r => r.status === 'fulfilled');
      const failures = results.filter(r => r.status === 'rejected');
      
      // Count total generated classes from successes
      const totalGenerated = successes.reduce((sum, result) => {
        // The API returns { id, generated_count, enrollment_results }
        const data = result?.value?.data;
        if (data?.generated_count !== undefined) return sum + data.generated_count;
        
        // Fallback for legacy or other formats
        if (Array.isArray(data)) return sum + data.length;
        if (data?.results && Array.isArray(data.results)) return sum + data.results.length;
        return sum;
      }, 0);
      
      return { results, totalGenerated, failureCount: failures.length };
    },
    {
      onSuccess: ({ totalGenerated, failureCount }) => {
        if (failureCount > 0) {
            notify(t('admin.resources.scheduledclasspatterns.bulk.generate_partial_success', { 
                success_count: selectedIds.length - failureCount,
                fail_count: failureCount,
                classes: totalGenerated 
            }), { type: 'warning' });
        } else {
            notify(t('admin.resources.scheduledclasspatterns.bulk.generate_success', { 
                count: selectedIds.length, 
                classes: totalGenerated 
            }), { type: 'success' });
        }
        refresh();
        unselectAll('scheduledclasspatterns');
      },
      onError: (error) => {
        notify(t('admin.resources.scheduledclasspatterns.bulk.generate_error', { error: error.message }), { type: 'error' });
      },
    }
  );

  const handleConfirm = () => {
    mutate();
    setOpen(false);
  };

  const handleClick = () => {
    setOpen(true);
  };

  const safeSelectedIds = selectedIds || [];
  return (
    <>
      <Button
        label={t('admin.resources.scheduledclasspatterns.bulk.generate', 'Generate Classes')}
        onClick={handleClick}
        disabled={isLoading || safeSelectedIds.length === 0}
        startIcon={isLoading ? <CircularProgress size={16} /> : <PlayArrowIcon />}
      />
      <Confirm
        isOpen={open}
        title={t('admin.resources.scheduledclasspatterns.bulk.generate_confirm_title', 'Generate Classes')}
        content={t('admin.resources.scheduledclasspatterns.bulk.generate_confirm_content', {
          count: safeSelectedIds.length,
          defaultValue: 'Are you sure you want to generate classes for {{count}} pattern(s)? This may take some time.'
        })}
        onConfirm={handleConfirm}
        onClose={() => setOpen(false)}
        confirm={t('ra.action.confirm', 'Confirm')}
        cancel={t('ra.action.cancel', 'Cancel')}
      />
    </>
  );
};

// Custom action button to view generated classes for a pattern
const ViewClassesButton = ({ record }) => {
  const navigate = useNavigate();
  const t = useTranslate();

  const handleClick = () => {
    // Navigate to scheduled classes list filtered by this pattern
    navigate(`/admin/scheduledclasses?filter=${encodeURIComponent(JSON.stringify({ pattern_id: record.id }))}`);
  };

  return (
    <Button
      onClick={handleClick}
      label={t('admin.resources.scheduledclasspatterns.viewClasses', 'View Classes')}
      startIcon={<VisibilityIcon />}
      size="small"
    />
  );
};

export default function ScheduledClassPatternList(props) {
  const t = useTranslate();
  return (
    <>
      <Breadcrumb />
      <List
        {...props}
        actions={<ListImportActions endpoint="scheduled-class-patterns" />}
        exporter={false} // We use custom export action in ListImportActions if needed, or we can enable default exporter if it works with our dataProvider
      >
        <Datagrid
          rowClick="edit"
          bulkActionButtons={
            <>
              <BulkGenerateClassesButton />
              <BulkDeleteButton />
            </>
          }
        >
          <TextField source="id" label={t('scheduledclasspatternlist.id', 'ID')} />
          <TextField source="name" label={t('scheduledclasspatternlist.name', 'Name')} />
          <ReferenceField source="course_id" reference="classes" link="show">
            <TextField source="name" />
          </ReferenceField>
          <ReferenceField source="instructor_id" reference="instructors" link="show">
            <TextField source="first_name" />
          </ReferenceField>
          <DateField source="start_date" label={t('scheduledclasspatternlist.startDate', 'Start Date')} />
          <NumberField source="num_lessons" label={t('scheduledclasspatternlist.numLessons', 'Number of Lessons')} />
          <ViewClassesButton />
        </Datagrid>
      </List>
    </>
  );
}