// Whether Current Tab Has Focus
var tab_has_focus = false;

// Leap Motion Settings
var last_frame;
var scene;
var action = null;
var last_action = null;
var start_action = 0;
var intent = false;
var delay_between_actions = 1;
var timeout = null;
var tutorial = false;

// Track Leap Motion Connection
var now, last_poll = new Date().getTime() / 1000;
var connection;
var connection_lost_after = 5;

// Settings for Scroll Events
var width = window.innerWidth;
var height = window.innerHeight;
var scroll_speed = 20;
var scroll_smoothing = 4;

// Size for Finger Rendering in Pixels
var finger_size = 70;

// Colors for Fingers
var gold = '#f8da00';

// Slideout menu options
var menu_active = false;

// Setup Default Settings for Leap Motion
var leap_motion_settings = {
  'fingers': 'yes',
  'color': 'gold',
  'scrolling': 'enabled',
  'history': 'enabled',
  'zoom': 'disabled',
  'rotation': 'disabled'
};

$('body').append('<div class="cast-a-spell">Cast a Spell</div>');
$('.cast-a-spell').css({
  'display': 'block',
  'font-family': 'Lavanderia',
  'font-weight': 'Bold',
  'text-align': 'center',
  'font-size': '100px',
  'position': 'fixed',
  'bottom': '70px',
  'left': '0',
  'width': '100%',
  'z-index': '1000',
  'color': 'rgba(40, 40, 40, 0.94)',
  'text-shadow': 'rgba(255, 224, 25, 0.298039) 0px 0px 10px',
})

$('body').append('<div class="spell">Cast a Spell</div>');
$('.spell').css({
  'font-family': 'Lavanderia',
  'font-weight': 'Bold',
  'text-align': 'center',
  'font-size': '175px',
  'position': 'fixed',
  'top': '200px',
  'left': '0',
  'width': '100%',
  'z-index': '1000',
  'color': 'rgba(40, 40, 40, 0.94)',
  'text-shadow': 'rgba(255, 224, 25, 0.298039) 0px 0px 20px',
  'display': 'none'
})

// Update Settings from Browser Extension
update_settings();

// called when a tab is updated (like changed away from, or refreshed, or loaded)
chrome.storage.onChanged.addListener(update_settings);

// Once Settings are Updates, Initialize Extension
function init()
{
  if(leap_motion_settings.fingers === 'yes')
  {
    add_fingers();
  }

  setInterval(check_focus, 1000);
  connection = setInterval(check_connection, 1000);
}

// Sometimes The Connection Dies, and Leap Motion Needs to be Restarted
function check_connection()
{
  now = new Date().getTime() / 1000;
  if(now - last_poll > connection_lost_after)
  {
    clearInterval(connection);

    try {
      chrome.runtime.sendMessage({ connection: 'lost' }, function(response) {
        console.error('Connection to Leap Motion Lost. Restart Leap Motion and Refresh Page.');

        $('body').append('<div class="leap_mostion_connection" style="display: none;"><\/div>');
        $('.leap_mostion_connection').html('<b>ATTENTION:<\/b> Connection to Leap Motion Lost. Restart Leap Motion and Refresh Page.').css({
          'position': 'fixed',
          'top': '0',
          'left': '0',
          'width': '100%',
          'color': '#222',
          'text-align': 'center',
          'height': '30px',
          'z-index': '1000',
          'line-height': '30px',
          'background-color': '#9AC847'
        }).fadeIn('slow');

        $('.leap_mostion_connection').click(function(){ $(this).fadeOut('slow'); });
      });
    }
    catch(error) {
      console.error(error.message);
    }
  }
}

// Check if Current Tab has Focus, and only run this extension on the active tab
function check_focus()
{
  try {
    chrome.runtime.sendMessage({ tab_status: 'current' }, function(response) {
      if(response.active && window.location.href == response.url && document.hasFocus())
      {
        tab_has_focus = true;
      }
      else
      {
        tab_has_focus = false;
      }
    });
  }
  catch(error) {
    // If you clicked to reload this extension, you will get this error, which a refresh fixes
    if(error.message.indexOf('Error connecting to extension') !== -1)
    {
      document.location.reload(true);
    }
    else
    {
      console.error(error.message);
    }
  }
}

// Add DOM Elements to Page to Render Fingers
function add_fingers()
{
  for(var i=0; i<10; i++)
  {
    $('body').append('<div class="finger" id="finger'+ (i+1) +'"><\/div>');

    switch(leap_motion_settings.color)
    {
      case 'gold':
        $('#finger'+ (i+1) +'').css({
          'background' : '-webkit-radial-gradient(50% 50%, circle farthest-corner, rgba(255, 255, 255, 0.6) 0%, rgba(252, 246, 181, 0.5) 54.24%, rgba(252, 246, 181, 0) 99.78%)',
          'background' : '-webkit-gradient(radial,50% 50% ,0 , 50% 50%, 86.16 ,color-stop(0,rgba(255, 255, 255, 0.6) ),color-stop(0.5424,rgba(252, 246, 181, 0.5) ),color-stop(0.9978,rgba(252, 246, 181, 0) ))'
        });
        break;
    }
  }

  $('.finger').css({
    'width': finger_size + 'px',
    'height': finger_size + 'px',
    'opacity': '0',
    'position': 'absolute',
    '-webkit-border-radius': Math.ceil(finger_size/2) + 'px',
    'border-radius': Math.ceil(finger_size/2) + 'px',
    'z-index': '10000',
    '-webkit-transition': 'opacity 0.15s ease',
    'transition': 'opacity 0.15s ease',
    '-webkit-box-sizing': 'border-box',
    'box-sizing': 'border-box',
    'transform': 'translate3d(0,0,0)'
  });
}

// Track Finger Movement and Update in Real Time
function update_fingers(scale, frame)
{
  $('.finger').css({ 'opacity': '0' });

  if( !tab_has_focus)
  {
    return;
  }

  var scaled_size = Math.ceil(finger_size * scale);
  var scaled_half = Math.ceil(scaled_size / 2);

  // Make sure there are at least two fingers to render, since that is the minimum for an action
  // Also prevents forehead / face from registering as a finger during typing
  for(var j=0; j<frame.fingers.length; j++)
  {
    var top = ( height / 2 ) - frame.fingers[j].tipPosition.y;
    var left = ( width / 2 ) + frame.fingers[j].tipPosition.x;

    $('#finger' + (j+1)).css({
      'top': 0,
      'left': 0,
      'position': 'fixed',
      'transform': 'translate3d('+left.toFixed(2)+'px, '+top.toFixed(2)+'px, 0)',
      'opacity': '1.0'
    });
  }
}

// Fetch Settings from Local Storage
function update_settings()
{
  leap_motion_settings.color = 'gold';
  init();
}

// Connect to Leap Motion via Web Socket and Manage Actions
Leap.loop({enableGestures: true}, function (frame, done){
  $('.cast-a-spell').css('display', 'block');
  last_poll = new Date().getTime() / 1000;

  // Update Finger Position
  if(leap_motion_settings.fingers === 'yes')
  {
    var scale = (frame.hands.length > 0 && frame.hands[0]._scaleFactor !== 'undefined') ? frame.hands[0]._scaleFactor : 1;
    update_fingers(scale, frame);
  }
  else
  {

  }

  // Try to detect User Intent to reduce firing events not intended ( less jumpy page is good )
  var now = new Date().getTime() / 1000;

  if(start_action === 0)
  {
    start_action = new Date().getTime() / 1000;
  }

  var offset = now - start_action;

  // If nothing is happening, reset interaction
  if (frame.pointables === undefined)
  {
    $('.cast-a-spell').css('display', 'block');
    action = null;
    clearTimeout(timeout);
    return;
  }

  // if (frame.pointables.length === 5)
  // if (frame.gestures && frame.gestures.length > 0)
  // {
  //   if (frame.gestures[0].type === 'swipe' && frame.gestures[0].state === 'stop')
  //   {
  //     action = 'Avada Kedavra';
  //   }
  // }
  if (frame.pointables.length === 10)
  {
    action = 'Avada Kedavra';
  }
  else if (frame.pointables.length === 4)
  {
    action = 'Crucio';
  }
  else if (frame.pointables.length === 3)
  {
    action = 'Expecto Patronum';
  }
  else if (frame.pointables.length === 2)
  {
    action = 'Reparo';
  }
  else if (frame.pointables.length === 6)
  {
    action = 'Riddikulus';
  }
  else if (frame.pointables.length === 8)
  {
    $('.sidebar-tab').click();
  }
  else
  { 
    $('.cast-a-spell').css('display', 'block');
    $('.spell').css('display', 'none');
    action = null;
    clearTimeout(timeout);
  }

  console.log(action);
  console.log(last_action)
  if(action === last_action && offset >= delay_between_actions || tutorial != true)
  {
    intent = true;
  }
  else if(action !== last_action && offset >= delay_between_actions)
  {
    intent = false;
    start_action = 0;
    clearTimeout(timeout);
  }

  if (action === null || tutorial == true)
  {
    intent = false;
  }

  if(intent)
  {
    var color;
    console.log(action);
    switch(action)
    {
      case 'Avada Kedavra':
        timeout = setTimeout(function(){ avadaKedavra(); }, 1000);
        color = 'rgba(51, 224, 18, 0.5) 0px 0px 20px';
        break;
      case 'Crucio':
        timeout = setTimeout(function(){ crucio(); }, 1650);
        color = 'rgba(255, 0, 7, 0.5) 0px 0px 20px';
        break;
      case 'Expecto Patronum':
        timeout = setTimeout(function(){ expectoPatronum(); }, 1650);
        color = 'rgba(0, 209, 237, 0.5) 0px 0px 20px';
        break;
      case 'Reparo':
        timeout = setTimeout(function(){ reparo(); }, 1650);
        color = 'rgba(255, 224, 25, 0.30) 0px 0px 20px';
        break;
      case 'Riddikulus':
        timeout = setTimeout(function(){ riddikulus(); }, 1650);
        color = 'rgba(255, 224, 25, 0.30) 0px 0px 20px';
        break;
    }
    $('.spell').css({
      'display': 'block',
      'text-shadow': color,
    });
    $('.spell').html(action);
    $('.cast-a-spell').css('display', 'none');
  }

  if (frame !== undefined && frame.pointables !== undefined && frame.pointables.length > 0)
  {
    last_frame = frame;
    last_action = action;
  }

  done();
});
