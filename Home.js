import React, { useState } from "react";
import axios from "axios";

import { useNavigate } from "react-router-dom";
import './Home.css';


function Home() {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [availableRooms, setAvailableRooms] = useState([]);
  // const [roomId, setroomId] = useState("");
  const timeSlots = [...Array(9).keys()].map((i) => {
    const hour = 9 + i;
    const formattedStartTime = `${hour % 12 === 0 ? 12 : hour % 12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
    const formattedEndTime = `${(hour + 1) % 12 === 0 ? 12 : (hour + 1) % 12}:00 ${hour + 1 < 12 ? 'AM' : 'PM'}`;

    return {
      start: formattedStartTime,
      end: formattedEndTime
    };
  });

  const navigate = useNavigate();
  const checkToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");  // Redirect to login if token is not found
    }
    return token;
  };
  // Function to handle form submission
  const handleSubmit = async () => {
    const token = checkToken();
    if (!token) return;
    // Construct the UR
    const queryString = `?date=${encodeURIComponent(date)}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`;
    const url = `http://localhost:4000/rooms${queryString}`;
    // console.log(queryString);
    // console.log("Request URL:", url);  // Log the request URL for debugging
  
    try {
      // console.log("EFR");
    
      const response = await axios.post(url);
    
      // Check for non-2xx status codes explicitly
      if (response.status !== 200) {  // Axios will give you status in response.status
        console.log("check 1");
        throw new Error(`HTTP error! status: ${response.status}`); // Handle non-OK responses
      }
    
      // Axios automatically parses the JSON response in the `data` field
      const roomIds = response.data.roomUserIds;  // No need for `.json()`
      // console.log(roomIds);
      setAvailableRooms(roomIds); // Set the available rooms in the state
    
    } catch (error) {
      console.log("check 2");
      console.error("Error fetching rooms:", error); // Correctly log the actual error object
    }
    
  };

  // Function to handle booking the room
const handleBooking = async (roomId) => {
  // Get the necessary booking data (e.g., from form inputs or variables)
   // The end time for the booking
   const token = checkToken();
    if (!token) return;
    
  // Simulate sending the booking request to the server
  console.log(`Booking room with ID: ${roomId}`);

  // Create the booking request payload
  const bookingData = {
      userId: roomId,
      date: date,
      startTime: startTime,
      endTime: endTime
  };

  // Send the booking request to the server using fetch
  fetch('http://localhost:4000/book', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData) // Send the booking data in the body of the request
  })
  .then((response) => response.json())
  .then((data) => {
      if (data.error) {
          // Handle errors, such as when time period is already booked or invalid input
          alert('Booking failed: ' + data.error);
      } else {
          // Handle successful booking
          alert('Booking successful: ' + data.message);
      }
  })
  .catch((error) => {
      console.error('Error booking room:', error);
      alert('An error occurred while booking the room.');
  });
};

  return (
    <div className="dashboard-container">
      <div className="profile-dashboard">
        <h1>Profile Dashboard</h1>

        {/* Date Picker */}
        <div className="input-group">
          <label htmlFor="date">Select Date:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="date-picker"
          />
        </div>

        {/* Time Slot Picker */}
        <div className="input-group">
          <label htmlFor="time-period">Select Time Period:</label>
          <select
            id="time-period"
            value={startTime}
            onChange={(e) => {
              const selectedTime = timeSlots.find((slot) => slot.start === e.target.value);
              setStartTime(selectedTime.start);
              setEndTime(selectedTime.end);
            }}
            className="time-picker"
          >
            {timeSlots.map((slot, index) => (
              <option key={index} value={slot.start}>
                {slot.start} - {slot.end}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button onClick={handleSubmit} className="submit-button">Submit</button>

        {/* Available Rooms List */}
        <div className="available-rooms">
          <h2>Available Rooms:</h2>
          <ul>
            {availableRooms.length === 0 ? (
              <li>No rooms available at this time</li>
            ) : (
              availableRooms.map((roomId, index) => <li key={index}>
              <button 
                onClick={() => handleBooking(roomId)} 
                className="booking-button">
                Book Room {roomId}
              </button></li>)
              // typeof(availableRooms)
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Home;
