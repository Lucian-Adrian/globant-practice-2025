import React, { useState, useEffect } from 'react';
import { Modal, Box, Typography, Button, TextField, MenuItem } from '@mui/material';
import { fetchInstructorSlots } from '../instructors/instructorApi';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const ScheduleLessonModal = ({ open, onClose, instructorId, onSchedule }) => {
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [studentName, setStudentName] = useState('');

  useEffect(() => {
    if (instructorId) {
      fetchInstructorSlots(instructorId).then(setSlots);
    }
  }, [instructorId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedSlot && studentName) {
      onSchedule({ instructorId, slot: selectedSlot, studentName });
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" sx={{ mb: 2 }}>Programează lecție</Typography>
        <TextField
          label="Nume student"
          value={studentName}
          onChange={e => setStudentName(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          required
        />
        <TextField
          select
          label="Slot disponibil"
          value={selectedSlot}
          onChange={e => setSelectedSlot(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          required
        >
          {slots.map((slot, idx) => (
            <MenuItem key={idx} value={`${slot.date} ${slot.time}`}>
              {slot.date} {slot.time}
            </MenuItem>
          ))}
        </TextField>
        <Button type="submit" variant="contained" fullWidth>Programează</Button>
      </Box>
    </Modal>
  );
};

export default ScheduleLessonModal;
