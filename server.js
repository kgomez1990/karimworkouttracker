const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3000;

const db = require("./models");

const app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/fitnessdb",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  }
);

app.get('/exercise', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/excercise.html'));
});

app.get('/stats', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/stats.html'));
});

app.post('/api/workouts', ({ body }, res) => {
  db.Workout.create(body).then(({ _id }) => db.Workout.findOneandupdate({ $push: { exercises: _id } }, { new: true }
  )
  ).then((dbWorkouts) => {
    res.json(dbWorkouts);
  }).catch((err) => {
    res.json(err);
  });
});

app.post('/api/workouts/:id', (req, res) => {
  const id = req.params.id
  db.Workout.findOneandupdate({ _id: id },
    { $push: { exercises: req.body } },
    function (err, sucess) {
      if (err) {
        console.log(err)
      } else {
        res.send(sucess)
      }
    }
  )
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
      totalDuration: { $sum: '$excercises.duration' },
      dateDifference: {
        $subtract: [new Date(), '$day'],
      },
    }
  }]).then(function (dbWorkouts) {
    res.json(dbWorkouts)
  });
});

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
