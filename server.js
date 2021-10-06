const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const path = require("path");

const PORT = process.env.PORT || 3000;

const db = require("./models");

const app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/workoutdb",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  }
);

app.get('/exercise', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/exercise.html'));
});

app.get('/stats', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/stats.html'));
});

app.post('/api/workouts', ({ body }, res) => {
  db.Workout.create({})
    .then((dbWorkouts) => {
      res.json(dbWorkouts);
    }).catch((err) => {
      res.json(err);
    });
});


app.put('/api/workouts/:id', (req, res) => {
  db.Workout.findByIdAndUpdate(req.params.id,
    { $push: { exercises: req.body } },
    // function (err, sucess) {
    //   if (err) {
    //     console.log(err)
    //   } else {
    //     res.send(sucess)
    //   }
    // }
  )
    .then((dbWorkouts) => {
      res.json(dbWorkouts);
    }).catch((err) => {
      res.json(err);
    });
});


app.get('/api/workouts', (req, res) => {
  db.Workout.aggregate([{
    $addFields: { totalDuration: { $sum: '$exercise.duration' } }
  }]).then((dbWorkouts) => {
    res.json(dbWorkouts)
  }).catch((err) => {
    res.json(err);
  });
});

app.get('/api/workouts/range', (req, res) => {
  db.Workout.aggregate([{
    $addFields: {
      totalDuration: { $sum: '$exercises.duration' },

    }
  }]).sort({ _id: -1 }).limit(7).then(function (dbWorkouts) {
    res.json(dbWorkouts)
  }).catch((err) => {
    res.json(err);
  });
});

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
