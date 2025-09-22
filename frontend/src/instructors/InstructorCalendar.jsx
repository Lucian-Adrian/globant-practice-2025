import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';
import { useParams } from 'react-router-dom';
import { fetchInstructorSlots } from './instructorApi';

const InstructorCalendar = () => {
  const { id } = useParams();
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    fetchInstructorSlots(id).then(setSlots);
  }, [id]);

  return (
    <Card sx={{ maxWidth: 500, margin: '2rem auto' }}>
      <CardContent>
        <Typography variant="h6">Sloturi disponibile pentru programare lecții</Typography>
        <List>
          {slots.length === 0 ? (
            <ListItem><ListItemText primary="Niciun slot disponibil" /></ListItem>
          ) : (
            slots.map((slot, idx) => (
              <ListItem key={idx}>
                <ListItemText primary={`Data: ${slot.date} | Ora: ${slot.time}`} />
              </ListItem>
            ))
          )}
        </List>
      </CardContent>
    </Card>
  );
};

export default InstructorCalendar;
