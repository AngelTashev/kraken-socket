//Global Variables
const price = 300;
var globalIsWebSocketOpen = false;
var lastPrice = 0;
var dates = [];
const databaseEndpoint = 'https://cryptoanalizator-default-rtdb.firebaseio.com/.json'

function openWebSocket() {
  var websocketurl = "wss://ws.kraken.com/";
  var connstatus = document.getElementById("connectionstatus");
  var infodiv = document.getElementById("info");

  socket = new WebSocket(websocketurl);
  socket.onopen = function () {
    outputConsoleMessage("Connected! :)")
    globalIsWebSocketOpen = true;
  };

  socket.onclose = function () {
    outputConsoleMessage("Disconnected from the websocket server at: " + websocketurl)
    globalIsWebSocketOpen = false;
  };

  socket.onmessage = function (message) {
    outputConsoleMessage(message.data)
  };
}

function sendWebSocketMessage() {

  if (globalIsWebSocketOpen) {
    var webSocketMessage = document.getElementById("webSocketMessageInput").value;
    //var message = 
    //'{"event":"subscribe", "subscription":{"name":"trade"}, "pair":["XBT/USD"]}';

    if (webSocketMessage !== "") {
      socket.send(webSocketMessage);
      outputConsoleMessage("Sent Message To Server: " + webSocketMessage);
    }
    else {
      alert("You must enter a WebSocket message to be sent!");
    }
  }
  else {
    alert("Open Socket Connection First!");
  }
}

function closeWebSocket() {
  if (globalIsWebSocketOpen) {
    socket.close();
  }
  else {
    alert("Open Socket Connection First!");
  }
}

function outputConsoleMessage(message) {
  var consoleOutput = document.getElementById("outputConsole");

  var d = new Date();

  let data = '';
  try {
    data = JSON.parse(message);
    data = data[1][0][0];
    lastPrice = data;
  } catch(e) {

  }

  console.log(lastPrice);
  var h = d.getHours();
  var m = d.getMinutes();
  var s = d.getSeconds();

  if (m % 15 === 0 && s === 0) {
    if (dates.length > 20) {
      dates.shift();
    }
    console.log('here');
    dates.push({'date': d, 'price': lastPrice})
  }

  for (let entity of dates) {
    console.log(entity);
      let diff = lastPrice - entity.price;
      if (diff >= price) {
        logBump(d, diff, entity.price, lastPrice);
        dates.shift();
      }
      if (diff <= -price) {
        logDump(d, diff, entity.price, lastPrice);
        dates.shift();
      }
      console.log(diff);
  }

  var msg = h + ":" + m + ":" + s + " " + message;

  consoleOutput.innerHTML += msg + "<br/>";
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
}

function logBump(d, diff, oldP, newP) {
  let data = {'date': d, 'info': {status: 'bump', diff, oldP, newP}};
  sendData(data);
}

function logDump(d, diff, oldP, newP) {
  let data = {'date': d, 'info': {status: 'dump', diff, oldP, newP}};
  sendData(data);
}

function sendData(data) {
  fetch(databaseEndpoint, { method: 'POST', body: JSON.stringify(data)});
}