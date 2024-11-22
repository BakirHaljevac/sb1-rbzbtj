import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useCalendarStore } from '../store/calendarStore';

const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

function Calendar() {
  const { events, addEvent, removeEvent } = useCalendarStore();
  const calendarRef = useRef<any>(null);

  const handleDateSelect = (selectInfo: any) => {
    const title = prompt('Please enter event title');
    if (title) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      addEvent({
        title,
        start: selectInfo.start,
        end: selectInfo.end,
        color
      });
    }
  };

  const handleEventClick = (clickInfo: any) => {
    if (confirm('Would you like to delete this event?')) {
      removeEvent(clickInfo.event.id);
    }
  };

  const handleAddEvent = () => {
    const now = new Date();
    const endTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
    handleDateSelect({ start: now, end: endTime });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6"
    >
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
        <button
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          onClick={handleAddEvent}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-4">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="auto"
        />
      </div>
    </motion.div>
  );
}

export default Calendar;