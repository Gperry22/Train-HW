  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCOlMGb1V2qVLlTB-VZVrBQeQnPC91fJh4",
    authDomain: "gp-train-scheduler.firebaseapp.com",
    databaseURL: "https://gp-train-scheduler.firebaseio.com",
    projectId: "gp-train-scheduler",
    storageBucket: "gp-train-scheduler.appspot.com",
    messagingSenderId: "135526906861"
  };

  firebase.initializeApp(config);

  var database = firebase.database();
  var trainName = "";
  var destination = "";
  var frequency = 0;
  var startTime = "";

  refreshTrainWindow();
  currentTime();

  $("#submitBtn").on("click", function(event) {
    event.preventDefault();
    if ($("#trainNameInput").val() && $("#destinationInput").val() && $("#frequencyInput").val() && $("#firstStartInput").val()) {

      trainName = $("#trainNameInput").val().trim();
      destination = $("#destinationInput").val().trim();
      frequency = $("#frequencyInput").val().trim();
      startTime = $("#firstStartInput").val().trim();

      // console.log(trainName);
      // console.log(destination);
      // console.log(frequency);
      // console.log(startTime);

      $("#trainNameInput").val("");
      $("#destinationInput").val("");
      $("#frequencyInput").val("");
      $("#firstStartInput").val("");
      $(".form-group").val("");

      database.ref().push({
        trainName: trainName,
        destination: destination,
        frequency: parseInt(frequency),
        startTime: startTime,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
      });
      refreshTrainWindow();
    } else {
      alert("Please Fill out all required boxes.")
    }
  });

  function refreshTrainWindow() {
    $("#trainTableRows").empty();
    database.ref().on("child_added", function(childSnapshot, prevChildKey) {
      var startTimeConverted = moment(childSnapshot.val().startTime, "HH:mm").subtract(1, "years");
      // console.log("the start time is ffffffffff", startTimeConverted);
      var currentTimeNow = moment().local();
      // console.log("the current time is", currentTimeNow);
      var diffTime = moment().local().diff(moment(startTimeConverted), "minutes")
      // console.log("the diff in time is", diffTime);
      var timeRemainder = diffTime % childSnapshot.val().frequency;
      // console.log("the remainder time is", timeRemainder);
      var minsUntilNextTrain = childSnapshot.val().frequency - timeRemainder;
      // console.log("the mins until the next train is", minsUntilNextTrain);
      var nextTrain = moment().local().add(minsUntilNextTrain, 'minutes');
      // console.log("the next train time is", nextTrain);
      var key = childSnapshot.key;
      // console.log(key);
      // console.log(childSnapshot.val());
      // console.log("the start time is a ", typeof(childSnapshot.val().startTime));
      // console.log("the frequency is a ", typeof(childSnapshot.val().frequency));

      var newrow = $("<tr>");
      newrow.append($("<td class='text-center'>" + childSnapshot.val().trainName + "</td>"));
      newrow.append($("<td class='text-center'>" + childSnapshot.val().destination + "</td>"));
      newrow.append($("<td class='text-center'>" + childSnapshot.val().frequency + "</td>"));
      newrow.append($("<td class='text-center'>" + moment(nextTrain).format("LT") + "</td>"));
      newrow.append($("<td class='text-center'>" + moment(minsUntilNextTrain) + "</td>"));
      newrow.append($("<td><button class='deleteTrain btn btn-danger btn-xs gpmargin' data-key='" + key + "'>X</button></td>"));
      $("#trainTableRows").append(newrow);
      setTimeout(refreshTrainWindow, 30000);

      if (minsUntilNextTrain <= 15 && minsUntilNextTrain > 1) {
        newrow.addClass('lessThan4')
      } else if (minsUntilNextTrain <= 1) {
        newrow.addClass('blink1')
      } else {}
    });
  }

  $(document).on("click", ".deleteTrain", function() {
    keyref = $(this).attr("data-key");
    database.ref().child(keyref).remove();
    window.location.reload();
  });

  function currentTime() {
    var current = moment().format('MMMM Do YYYY, h:mm:ss a');
    $("#currentTime").html(current);
    setTimeout(currentTime, 1000);
  }
