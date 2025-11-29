import * as React from 'react';
import { 
  Show, 
  SimpleShowLayout, 
  TextField, 
  DateField, 
  NumberField, 
  ReferenceField, 
  ArrayField, 
  SingleFieldList, 
  ChipField, 
  useRecordContext, 
  TopToolbar, 
  ListButton, 
  EditButton, 
  useTranslate, 
  Confirm, 
  Button,
  useDataProvider, 
  useNotify, 
  useRefresh,
  FunctionField
} from 'react-admin';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Chip } from '@mui/material';

const GenerateClassesButton = () => {
  const record = useRecordContext();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const t = useTranslate();
  const [open, setOpen] = React.useState(false);

  const handleGenerate = () => {
    dataProvider.create(`scheduled-class-patterns/${record.id}/generate-classes`, { data: {} })
      .then(() => {
        notify(t('resources.scheduled-class-patterns.generate.success', 'Classes generated successfully'), { type: 'success' });
        refresh();
        setOpen(false);
      })
      .catch((error) => {
        notify(t('resources.scheduled-class-patterns.generate.error', 'Error generating classes'), { type: 'error' });
      });
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        label={t('resources.scheduled-class-patterns.generate.button', 'Generate Classes')}
      >
        <PlayArrowIcon />
      </Button>
      <Confirm
        isOpen={open}
        title={t('resources.scheduled-class-patterns.generate.confirm_title', 'Generate Classes')}
        content={t('resources.scheduled-class-patterns.generate.confirm_content', 'Generate scheduled classes for this pattern?')}
        onConfirm={handleGenerate}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

const PatternShowActions = () => (
  <TopToolbar>
    <ListButton />
    <EditButton />
    <GenerateClassesButton />
  </TopToolbar>
);

export default function ScheduledClassPatternShow(props) {
  const t = useTranslate();

  return (
    <Show {...props} actions={<PatternShowActions />}>
      <SimpleShowLayout>
        <TextField source="name" label={t('resources.scheduled-class-patterns.fields.name', 'Name')} />
        <ReferenceField source="course_id" reference="classes" label={t('resources.scheduled-class-patterns.fields.course', 'Course')}>
          <TextField source="name" />
        </ReferenceField>
        <ReferenceField source="instructor_id" reference="instructors" label={t('resources.scheduled-class-patterns.fields.instructor', 'Instructor')}>
          <TextField source="first_name" />
        </ReferenceField>
        <ReferenceField source="resource_id" reference="resources" label={t('resources.scheduled-class-patterns.fields.resource', 'Resource')}>
          <TextField source="name" />
        </ReferenceField>
        <ArrayField source="recurrence_days" label={t('resources.scheduled-class-patterns.fields.recurrence_days', 'Recurrence Days')}>
          <SingleFieldList>
            <FunctionField render={record => <Chip label={record} size="small" />} />
          </SingleFieldList>
        </ArrayField>
        <ArrayField source="times" label={t('resources.scheduled-class-patterns.fields.times', 'Times')}>
          <SingleFieldList>
            <FunctionField render={record => <Chip label={record} size="small" />} />
          </SingleFieldList>
        </ArrayField>
        <DateField source="start_date" label={t('resources.scheduled-class-patterns.fields.start_date', 'Start Date')} />
        <NumberField source="num_lessons" label={t('resources.scheduled-class-patterns.fields.num_lessons', 'Number of Lessons')} />
        <NumberField source="default_duration_minutes" label={t('resources.scheduled-class-patterns.fields.default_duration_minutes', 'Default Duration (min)')} />
        <NumberField source="default_max_students" label={t('resources.scheduled-class-patterns.fields.default_max_students', 'Default Max Students')} />
        <ArrayField source="students" label={t('resources.scheduled-class-patterns.fields.students', 'Students')}>
          <SingleFieldList>
            <FunctionField render={record => <Chip label={`${record.first_name} ${record.last_name}`} size="small" />} />
          </SingleFieldList>
        </ArrayField>
      </SimpleShowLayout>
    </Show>
  );
}
