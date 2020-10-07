const five = require('johnny-five');
const pixel = require('node-pixel');
const tmi = require('tmi.js');

let board = new five.Board({port: "<put your board's port here>"});

board.on('ready', ()=>{
  // Our code will go here.
  console.log("Board ready.")
})

const tmi = require('tmi.js')
//Add these lines

const STRIP_LENGTH = 100; // Change this to the number of pixels in your strip. This has a maximum of 192 pixels.
const STRIP_PIN = 6; // Change this to the pin you have connected to the data pin on your strip.
//....

board.on('ready', ()=>{
  console.log("Board ready.")

  let strip = new pixel.Strip({
    board,
    controller: 'FIRMATA',
    strips: [{ pin: STRIP_PIN}],
    gamma: 2.8,
    length: STRIP_LENGTH
  })

  strip.on('ready', ()=>{
    console.log("Strip ready.");
  })
})

let isOn = false;

strip.on('ready', ()=>{
  console.log("Strip ready.");
  setInterval(()=>{
    if (isOn) {
      strip.off();
      isOn = false;
    } else {
      strip.color([0,0,255]);
      isOn = true;
    }
  }, 1000);//Set this to how many milliseconds you want between each change.
})

strip.on('ready', ()=>{
  console.log("Strip ready.");
  let client = new tmi.client({
    channels: ['jackpattillo']//add your twitch channel name here. You can get this from your twitch URL
  })

  client.on('message', (channel, userstate, message)=>{
    //Channel is the name of the channel the message came from. userstate includes some extra info like emotes, sub status and the user who sent the message and message is the text of the message.
    strip.color([0,0,255])
    setTimeout(()=>strip.off(), 300)
  })

  client.connect();
})

client.on('subscription', (channel, username, methods, message, userstate)=>{
  //Your code to flash lights etc. would go here.
})

strip.on('ready', ()=>{
  console.log("Strip ready.");
  let client = new tmi.client({
    channels: ['jackpattillo']
  })

  client.on('cheer', (channel, userstate, message)=>{
    let numBits = userstate.bits; // numBits will now be the amount of bits cheered.
    strip.color([0,0,255])
    setTimeout(()=>strip.off(), 300)
  })

  client.on('hosted', (channel, username, viewers, autoHost) =>{
    //Viewers will be the number of people who have come across
    strip.color([0,255,0])
    setTimeout(()=>strip.off(), 300)
  })

  client.on('raided', (channel, username, viewers) => {
    //Viewers will be the number of people who have come across
    strip.color([255,0,0])
    setTimeout(()=>strip.off(), 300)
  })

  client.on('resub', (channel, username, streakMonths, message, userstate, methods)=>{
    //streakMonths is the streak the user is on. It will be 0 if the user doesn't want to share their streak.
    let totalMonths = userstate['msg-param-cumulative-months'];
    //totalMonths is the total number of months this user has been subscribed.
    strip.color([255,255,0])
    setTimeout(()=>strip.off(), 300)
  })

  client.on('submysterygift', (channel, username, numOfSubs, methods, userstate) => {
    //numOfSubs is how many usename is gifting.
    let totalPastSubs = userstate['msg-param-sender-count']
    //totalPastSubs is how many the sender has gifted to the channel in total.
    strip.color([255,0,255])
    setTimeout(()=>strip.off(), 300)
  })

  client.on('subscription', (channel, username, methods, message, userstate) => {
    //Username is the subscriber.
    //Message is the message the user attached to their sub.
    strip.color([0,255,255])
    setTimeout(()=>strip.off(), 300)
  })

  client.connect();
})
