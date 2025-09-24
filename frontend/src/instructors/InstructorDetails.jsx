import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText, Button } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchInstructorDetails, fetchInstructorLessons } from './instructorApi';

const InstructorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [instructor, setInstructor] = useState(null);
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    fetchInstructorDetails(id).then(setInstructor);
    fetchInstructorLessons(id).then(setLessons);
  }, [id]);

  if (!instructor) return <div>Loading...</div>;

  return (
    <Card sx={{ maxWidth: 500, margin: '2rem auto' }}>
      <CardContent>
        <Typography variant="h5">{instructor.first_name} {instructor.last_name}</Typography>
        <Typography variant="subtitle1">Email: {instructor.email}</Typography>
        <Typography variant="subtitle1">Telefon: {instructor.phone}</Typography>
        <Button sx={{ mt: 2, mb: 2 }} variant="contained" onClick={() => navigate(`/instructors/${id}/calendar`)}>
          Vezi calendarul sloturilor
        </Button>
        <Typography variant="subtitle2" sx={{ mt: 2 }}>Lecții programate:</Typography>
        <List>
          {lessons.length === 0 ? (
            <ListItem><ListItemText primary="Nicio lecție programată" /></ListItem>
          ) : (
            lessons.map(lesson => (
              <ListItem key={lesson.id}>
                <ListItemText
                  primary={`Data: ${lesson.date} | Ora: ${lesson.time}`}
                  secondary={`Student: ${lesson.student_name}`}
                />
              </ListItem>
            ))
          )}
        </List>
      </CardContent>
    </Card>
  );
};

export default InstructorDetails;
