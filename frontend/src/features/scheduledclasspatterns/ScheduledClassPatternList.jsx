import * as React from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  NumberField,
  ReferenceField,
  BulkDeleteButton,
  BulkUpdateButton,
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
import RefreshIcon from '@mui/icons-material/Refresh';
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
            notify(t('resources.scheduledclasspatterns.bulk.generate_partial_success', { 
                success_count: selectedIds.length - failureCount,
                fail_count: failureCount,
                classes: totalGenerated 
            }), { type: 'warning' });
        } else {
            notify(t('resources.scheduledclasspatterns.bulk.generate_success', { 
                count: selectedIds.length, 
                classes: totalGenerated 
            }), { type: 'success' });
        }
        refresh();
        unselectAll('scheduled-class-patterns');
      },
      onError: (error) => {
        notify(t('resources.scheduledclasspatterns.bulk.generate_error', { error: error.message }), { type: 'error' });
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
        label={t('resources.scheduledclasspatterns.bulk.generate', 'Generate Classes')}
        onClick={handleClick}
        disabled={isLoading || safeSelectedIds.length === 0}
        startIcon={isLoading ? <CircularProgress size={16} /> : <PlayArrowIcon />}
      />
      <Confirm
        isOpen={open}
        title={t('resources.scheduledclasspatterns.bulk.generate_confirm_title', 'Generate Classes')}
        content={t('resources.scheduledclasspatterns.bulk.generate_confirm_content', {
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

// Custom bulk action for regenerating classes
const BulkRegenerateClassesButton = ({ selectedIds }) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const unselectAll = useUnselectAll();
  const t = useTranslate();
  const [open, setOpen] = React.useState(false);

  const { mutate, isLoading } = useMutation(
    async () => {
      const promises = selectedIds.map(id =>
        dataProvider.create(`scheduled-class-patterns/${id}/regenerate-classes`, {
          data: {}
        })
      );
      const results = await Promise.all(promises);
      // Count total generated and deleted classes
      const stats = results.reduce((acc, result) => {
        return {
          deleted: acc.deleted + (result?.data?.deleted_count || 0),
          generated: acc.generated + (result?.data?.generated_count || 0)
        };
      }, { deleted: 0, generated: 0 });
      return stats;
    },
    {
      onSuccess: ({ deleted, generated }) => {
        notify(t('resources.scheduledclasspatterns.bulk.regenerate_success', { 
          count: selectedIds.length,
          deleted,
          generated
        }), { type: 'success' });
        refresh();
        unselectAll('scheduled-class-patterns');
      },
      onError: (error) => {
        notify(t('resources.scheduledclasspatterns.bulk.regenerate_error', { error: error.message }), { type: 'error' });
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
        label={t('resources.scheduledclasspatterns.bulk.regenerate', 'Regenerate Classes')}
        onClick={handleClick}
        disabled={isLoading || safeSelectedIds.length === 0}
        startIcon={isLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
      />
      <Confirm
        isOpen={open}
        title={t('resources.scheduledclasspatterns.bulk.regenerate_confirm_title', 'Regenerate Classes')}
        content={t('resources.scheduledclasspatterns.bulk.regenerate_confirm_content', {
          count: safeSelectedIds.length,
          defaultValue: 'Are you sure you want to regenerate classes for {{count}} pattern(s)? This will delete existing classes and create new ones.'
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

  const handleClick = (e) => {
    e.stopPropagation();
    if (record && record.id) {
        navigate(`/admin/scheduled-classes?filter=${encodeURIComponent(JSON.stringify({ pattern_id: record.id }))}`);
    }
  };

  if (!record) return null;

  return (
    <Button
      onClick={handleClick}
      label={t('resources.scheduledclasspatterns.viewClasses', 'View Classes')}
      startIcon={<VisibilityIcon />}
      size="small"
    />
  );
};

export default function ScheduledClassPatternList(props) {
  return (
    <>
      <Breadcrumb />
      <List
        {...props}
        actions={<ListImportActions endpoint="scheduled-class-patterns" />}
      >
        <Datagrid
          rowClick="edit"
          bulkActionButtons={
            <>
              <BulkGenerateClassesButton />
              <BulkRegenerateClassesButton />
              <BulkDeleteButton />
            </>
          }
        >
          <TextField source="id" />
          <TextField source="name" />
          <ReferenceField source="course_id" reference="classes" link="show">
            <TextField source="name" />
          </ReferenceField>
          <ReferenceField source="instructor_id" reference="instructors" link="show">
            <TextField source="first_name" />
          </ReferenceField>
          <DateField source="start_date" />
          <NumberField source="num_lessons" />
          <ViewClassesButton />
        </Datagrid>
      </List>
    </>
  );
}
