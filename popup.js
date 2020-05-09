(function (win, doc) {
  const WEEKEND_INDEX = 3;
  const MORNING_INDEX = 2;
  const EVENING_INDEX = 1;
  const INBOX_INDEX = 0;

  let taskInput = doc.getElementById("task_input");
  let taskBucketSelect = doc.getElementById("task_bucket_select");
  let tasksList = doc.getElementById("task_list");
  let currentSelectedBucket =
    taskBucketSelect.options[taskBucketSelect.selectedIndex].value;

  taskInput.addEventListener("keydown", function (e) {
    if (e.keyCode === 13 && e.target.value.length) {
      chrome.storage.sync.get("tudu", function (db) {
        db.tudu[currentSelectedBucket] = db.tudu[currentSelectedBucket] || [];
        db.tudu[currentSelectedBucket].push(e.target.value);
        chrome.storage.sync.set(db, function () {
          taskInput.value = "";
          setTasks(db);
        });
      });
    }
  });
  taskBucketSelect.addEventListener("change", function () {
    currentSelectedBucket =
      taskBucketSelect.options[taskBucketSelect.selectedIndex].value;
    console.log(currentSelectedBucket);
    chrome.storage.sync.get("tudu", function (db) {
      setTasks(db);
    });
  });
  //setTasks
  function setTasks(db) {
    console.log("setTask", db);
    let bucketTasks = db.tudu[currentSelectedBucket];
    tasksList.innerHTML = "";
    if (bucketTasks) {
      bucketTasks.forEach((task, i) => {
        let taskElem = doc.createElement("div");
        taskElem.classList.add("list--item");
        taskElem.addEventListener("click", function () {
          onTaskClick(currentSelectedBucket, i);
        });
        taskElem.innerText = task;
        tasksList.append(taskElem);
      });
    }
  }

  //onTaskClick
  function onTaskClick(bucketName, position) {
    console.log("onTaskClick", bucketName, position);
    chrome.storage.sync.get("tudu", function (db) {
      db.tudu[bucketName].splice(position, 1);
      chrome.storage.sync.set(db, function () {
        setTasks(db);
      });
    });
  }

  function setBucket(db) {
    let date = new Date();
    let day = date.getDay();
    let isWeekend = day === 6 || day === 0;
    if (isWeekend) {
      taskBucketSelect.selectedIndex = WEEKEND_INDEX;
      currentSelectedBucket =
        taskBucketSelect.options[taskBucketSelect.selectedIndex].value;
    } else {
      let hrs = myDate.getHours();
      if (hrs < 12) {
        taskBucketSelect.selectedIndex = MORNING_INDEX;
        currentSelectedBucket =
          taskBucketSelect.options[taskBucketSelect.selectedIndex].value;
      } else {
        taskBucketSelect.selectedIndex = EVENING_INDEX;
        currentSelectedBucket =
          taskBucketSelect.options[taskBucketSelect.selectedIndex].value;
      }
    }
    setTasks(db);
  }

  //init tu-du
  chrome.storage.sync.get("tudu", function (db) {
    console.log("inittudu", db);
    if (Object.keys(db).length === 0) {
      tuduObj = {};
      tuduObj.tudu = {};
      tuduObj.tudu.version = 1;
      chrome.storage.sync.set(tuduObj, function () {});
    } else {
      setBucket(db);
    }
  });
})(window, document);
