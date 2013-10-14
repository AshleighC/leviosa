// Creating the sidebar
$('body').append('<nav class="sidebar"></div>');
$('.sidebar').css({
  'width': '230px',
  'height': '100%',
  'position': 'fixed',
  'left': '-270px',
  'top': '0',
  'padding': '20px',
  'z-index': '2000',
  'background': 'rgba(255, 255, 255, 0.95)',
  'box-shadow': '1px 1px 1px 2px rgba(0, 0, 0, 0.2)',
  'font-family': 'Open Sans', 
  'font-weight': '300',
})
$('.sidebar').append('<img src="' + chrome.extension.getURL("img/leviosa-logo.png") + '"/>')
$('.sidebar img').css({
  'width': '230px',
})

$('.sidebar').append('<h2>Spellbook</h2>');
$('.sidebar h2').css({
  'font-family': 'Open Sans',
  'text-transform': 'uppercase',
  'font-size': '20px',
  'font-weight': '300',
  'text-align': 'center',
  'letter-spacing': '0.3em',
  'color': '#888',
})

$('.sidebar').append('<ul></ul>');

var spellbook = {
  "Avada Kedavra": "Cause instantaneous death to a page.<br><i>Circle gesture</i>",
  "Crucio": "Inflict excruciating pain on a page.<br><i>10 fingers</i>",
  "Expecto Patronum": "Summon a magical guardian, a projection of positive feelings.<br><i>3 fingers</i>",
  "Lumos": "Illuminate a page.<br><i>1 finger</i>",
  "Reparo": "Seamlessly repair a broken page.<br><i>5 fingers</i>",
  "Riddikulus": "Cause a page to assume a humorous form.<br><i>7 fingers</i>"
}

$.each(spellbook, function(spell, description) {
  $('.sidebar ul').append('<li class="spell-menu"><h3>' + spell + '</h3><p>' + description + '</p></li>');
});

$('.sidebar ul li.spell-menu').css({
  'list-style': 'none',
})


$('.spell-menu h3').css({
  'margin-top': '20px',
  'font-size': '15px',
})

$('.spell-menu p').css({
  'margin-top': '3px',
  'font-size': '12px',
})

$('body').append('<div class="sidebar-tab"></div>');
$('.sidebar-tab').css({
  'width': '60px',
  'height': '60px',
  'background': 'rgba(255, 255, 255, 0.95)',
  'background-image': 'url(' + chrome.extension.getURL("img/light.png") + ')',
  'top': '40px',
  'left': '0',
  'position': 'fixed',
  'z-index': '1999',
  'box-shadow': '1px 1px 1px 2px rgba(0, 0, 0, 0.2)',
})

$('.sidebar-tab, .sidebar').css({
  'transition': 'left 2s ease-in',
})

function click() {
  if (menu_active === false) {
    $('.sidebar-tab').css('left', '270px');
    $('.sidebar').css('left', '0');
    menu_active = true;
  }
  else {
    $('.sidebar-tab').css('left', '0');
    $('.sidebar').css('left', '-270px');
    menu_active = false
  }
};

$('.sidebar-tab').on('click', click);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action == "click") {
    click();
  }
});

