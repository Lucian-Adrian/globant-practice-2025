// Mock API functions. Înlocuiește cu fetch real din backend când ai endpoint-uri.

export async function fetchInstructorDetails(id) {
  // Exemplu mock
  return {
    id,
    first_name: 'Ion',
    last_name: 'Popescu',
    email: 'ion.popescu@example.com',
    phone: '+40712345678',
  };
}

export async function fetchInstructorLessons(id) {
  // Exemplu mock
  return [
    {
      id: 1,
      date: '2025-09-22',
      time: '10:00',
      student_name: 'Gabriela Bbiuih',
    },
    {
      id: 2,
      date: '2025-09-23',
      time: '14:00',
      student_name: 'Alex Ionescu',
    },
  ];
}

export async function fetchInstructorSlots(id) {
  // Exemplu mock pentru calendar sloturi
  return [
    { date: '2025-09-24', time: '09:00' },
    { date: '2025-09-24', time: '11:00' },
    { date: '2025-09-25', time: '15:00' },
  ];
}
