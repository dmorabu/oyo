const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");


// MongoDB connection
const mongoURI ="mongodb+srv://dtailor:iaMRe8QXcMfbHzOW@Cluster0.tspdp.mongodb.net/user_credentials?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB Atlas
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB Atlas successfully.");
}).catch((error) => {
  console.error("Error connecting to MongoDB Atlas:", error);
});

const RoomSchema = new mongoose.Schema({
  unique_id: String,
  dates: [
    {
      _id: false,  // Disable automatic _id generation for each date object
      date: {type: String},
      time_periods: [
        { _id: false,
          start_time: {type: String},
          end_time: {type: String},
        },
      ],
    },
  ],
},{ versionKey: false });



const Room = mongoose.model("Room", RoomSchema,'Room');

// Initialize the Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Route to get room user IDs based on date and time range
app.post("/rooms", async (req, res) => {
  const { date, startTime, endTime } = req.query;
  try {

    Room.aggregate([
      {
        $project: {
          unique_id: 1,  // Include unique_id in the output
          dates: 1,  // Include the dates array in the output
        },
      },
      {
        $match: {
          $or: [
            // Case 1: The "dates" array does not have the given date
            {
              dates: { $not: { $elemMatch: { date: date } } },
            },
            // Case 2: The "dates" array has the given date, but the time period does not match
            {
              dates: {
                $elemMatch: {
                  date: date, // The document must have the given date
                  time_periods: {
                    $not: {
                      $elemMatch: { start_time: startTime, end_time: endTime }, // Time period doesn't match
                    },
                  },
                },
              },
            },
          ],
        },
      },
    ])
    
    .then(rooms => {
    const roomUserIds = rooms.map((room) => room.unique_id);
      res.json({ roomUserIds });
  })
  .catch(err => {
    console.error('Error:', err);
  });
  } catch (error) {
    console.log("also")
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Failed to fetch room details." });
  }
});

app.post("/book", async (req, res) => {
  const { userId, date, startTime, endTime } = req.body; 

  if (!userId || !date || !startTime || !endTime) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  try {
    // Assuming you have a Room model with a 'dates' array and 'time_periods' array inside it.
    const Room = mongoose.model("Room", RoomSchema);

    // Find the room for the given userId and the date
    const room = await Room.findOne({
      unique_id: userId,
    });

   

    // Check if the time period already exists for this date
    const dateEntry = room.dates.find((entry) => entry.date === date);
    if(!dateEntry){
      //add the time period for that date
      const newdateEntry={
        date: date,
        time_periods: [],
      };
      newdateEntry.time_periods.push({
        start_time: startTime,
        end_time: endTime,
      });
      room.dates.push(newdateEntry);
    }
    

    // Add the new time period to the room's date entry
    else{
      dateEntry.time_periods.push({
      start_time: startTime,
      end_time: endTime,
    });
  }
    
    // Save the updated room
    await room.save();

    // Send a success response
    res.json({ message: "Time period successfully added." });
  } catch (error) {
    console.error("Error booking time period:", error);
    res.status(500).json({ error: "Failed to book time period." });
  }
});


// Start the server
app.listen(4000, () => {
  console.log("Server running on http://localhost:5000");
});
