import React, { useState } from 'react';
import { DatePicker, Button } from 'antd';

const MultiSelectDatePicker = ({ selectedDates, onDateSelect }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleSaveDate = () => {
    if (selectedDate) {
        const formattedDate = selectedDate.format(' YYYY-MM-DD '); // Format the selected date as a string
        onDateSelect(formattedDate);
        setSelectedDate(null); // Clear the selected date
      }
  };

  

  return (
    <div>
      <h4>Selected Dates:</h4>
      <ul>
        {selectedDates.map((date) => (
          <li key={date.toString()}>{date}</li> // Convert the date to a string
        ))}
      </ul>
      <h4>Choose Dates:</h4>
      <DatePicker
        value={selectedDate}
        onChange={handleDateSelect}
        showToday={false} // Disable "Today" button
      />
      <Button onClick={handleSaveDate}>Save Date</Button>
    </div>
  );
};

export default MultiSelectDatePicker;
