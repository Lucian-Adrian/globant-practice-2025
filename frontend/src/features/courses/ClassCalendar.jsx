import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../shared/components/ui/Card';

const ClassCalendar = ({ classId, className = '' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [lessons, setLessons] = useState([]);
  const [view, setView] = useState('month'); // month, week, day
  const [filterType, setFilterType] = useState('all'); // all, theory, practice
  const [loading, setLoading] = useState(true);

  // Mock lessons data
  useEffect(() => {
    const fetchLessons = async () => {
      setLoading(true);
      
      // Mock lessons for the class
      /*
      const mockLessons = [
        {
          id: 1,
          title: "Lecție Teorie - Semnalizarea",
          type: "theory",
          date: "2024-09-26",
          time: "09:00",
          duration: 50,
          instructor: "Ion Vasilescu",
          students: ["Gabriela Botvișelyi", "Alexandru Popescu"],
          location: "Sala A",
          status: "scheduled"
        },
        {
          id: 2,
          title: "Lecție Practică - Parcaj",
          type: "practice",
          date: "2024-09-26",
          time: "14:00",
          duration: 100,
          instructor: "Maria Popescu",
          students: ["Gabriela Botvișelyi"],
          location: "Poligon",
          vehicle: "Dacia Logan - B123XYZ",
          status: "scheduled"
        },
        {
          id: 3,
          title: "Lecție Teorie - Legislație",
          type: "theory",
          date: "2024-09-27",
          time: "10:00",
          duration: 50,
          instructor: "Ion Vasilescu",
          students: ["Alexandru Popescu", "Maria Ionescu"],
          location: "Sala B",
          status: "scheduled"
        },
        {
          id: 4,
          title: "Lecție Practică - Oraș",
          type: "practice",
          date: "2024-09-27",
          time: "16:00",
          duration: 100,
          instructor: "Ana Ionescu",
          students: ["Maria Ionescu"],
          location: "Centru oraș",
          vehicle: "Ford Focus - B456ABC",
          status: "completed"
        },
        {
          id: 5,
          title: "Lecție Practică - Autostradă",
          type: "practice",
          date: "2024-09-28",
          time: "11:00",
          duration: 120,
          instructor: "Maria Popescu",
          students: ["Alexandru Popescu"],
          location: "A1 Chișinău-Bălți",
          vehicle: "Dacia Logan - B123XYZ",
          status: "scheduled"
        }
      ];
      */

      setLessons([]); // Set empty array instead of mock data
      setLoading(false);
    };

    fetchLessons();
  }, [classId]);

  const filteredLessons = lessons.filter(lesson => {
    if (filterType === 'all') return true;
    return lesson.type === filterType;
  });

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getLessonsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return filteredLessons.filter(lesson => lesson.date === dateStr);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'border-blue-500 bg-blue-50';
      case 'completed': return 'border-green-500 bg-green-50';
      case 'cancelled': return 'border-red-500 bg-red-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'theory': return 'text-purple-600';
      case 'practice': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Calendar Lecții</CardTitle>
          
          {/* Filter buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded text-sm ${
                filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Toate
            </button>
            <button
              onClick={() => setFilterType('theory')}
              className={`px-3 py-1 rounded text-sm ${
                filterType === 'theory' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Teorie
            </button>
            <button
              onClick={() => setFilterType('practice')}
              className={`px-3 py-1 rounded text-sm ${
                filterType === 'practice' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              Practică
            </button>
          </div>
        </div>
        
        {/* Month navigation */}
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h3 className="text-lg font-medium">
            {currentDate.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}
          </h3>
          
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Day headers */}
          {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {getDaysInMonth(currentDate).map((date, index) => {
            const dayLessons = getLessonsForDate(date);
            const isToday = date && date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                className={`min-h-[100px] p-1 border border-gray-200 ${
                  date ? 'hover:bg-gray-50' : ''
                } ${isToday ? 'bg-blue-50 border-blue-300' : ''}`}
              >
                {date && (
                  <>
                    <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {date.getDate()}
                    </div>
                    
                    {/* Lessons for this day */}
                    <div className="space-y-1 mt-1">
                      {dayLessons.slice(0, 2).map(lesson => (
                        <div
                          key={lesson.id}
                          className={`text-xs p-1 rounded border-l-2 ${getStatusColor(lesson.status)}`}
                          title={`${lesson.title} - ${lesson.time} (${lesson.instructor})`}
                        >
                          <div className={`font-medium ${getTypeColor(lesson.type)}`}>
                            {lesson.time}
                          </div>
                          <div className="truncate">
                            {lesson.title}
                          </div>
                        </div>
                      ))}
                      
                      {dayLessons.length > 2 && (
                        <div className="text-xs text-gray-500 pl-1">
                          +{dayLessons.length - 2} mai multe
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border-l-2 border-purple-500 bg-purple-50"></div>
            <span>Teorie</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border-l-2 border-green-500 bg-green-50"></div>
            <span>Practică</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border-l-2 border-blue-500 bg-blue-50"></div>
            <span>Programat</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 border-l-2 border-green-500 bg-green-50"></div>
            <span>Completat</span>
          </div>
        </div>

        {/* Today's lessons detail */}
        {(() => {
          const todayLessons = getLessonsForDate(new Date());
          if (todayLessons.length > 0) {
            return (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Lecțiile de astăzi</h4>
                <div className="space-y-2">
                  {todayLessons.map(lesson => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${getTypeColor(lesson.type)}`}>
                            {lesson.time}
                          </span>
                          <span className="text-gray-900">{lesson.title}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Instructor: {lesson.instructor} | Locația: {lesson.location}
                          {lesson.vehicle && ` | Vehicul: ${lesson.vehicle}`}
                        </div>
                        <div className="text-sm text-gray-600">
                          Studenți: {lesson.students.join(', ')}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        lesson.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                        lesson.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lesson.status === 'scheduled' ? 'Programat' : 
                         lesson.status === 'completed' ? 'Completat' : lesson.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          return null;
        })()}
      </CardContent>
    </Card>
  );
};

export default ClassCalendar;
