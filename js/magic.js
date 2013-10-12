function avadaKedavra() {
  chrome.extension.sendRequest({ action: "Avada Kedavra" });
}

function crucio() {
  var colors = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF"];
  function randomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  $.each($("div"), function (i, v) {
    if (!($(v).hasClass("cast-a-spell"))) {
      $(v).css({"color": randomElement(colors)});
      $(v).css({"font-family": ((Math.random() > 0.75) ? "Comic Sans MS" : "Times New Roman")});
      $(v).css({"font-size": (randomNumber(5, 60) + "px")});
    }
  });
}

function expectoPatronum() {
  $.get("http://www.reddit.com/r/aww/new.json?sort=new", function(data) {
    function random(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }
    function contains(s, t) {
      return s.indexOf(t) !=  -1;
    }
    function goodURL(url) {
      return contains(url, "imgur") && (contains(url, "jpg") || contains(url, "png"));
    }
    var goodImages = []
    $.each(data.data.children, function(i, v) {
      if (goodURL(v.data.url)) {
        goodImages.push(v.data.url);
      }
    });
    var imageURL = goodImages[random(0, goodImages.length - 1)];
    window.open(imageURL, "_self", false);
  });
}

function protego() {
  chrome.extension.sendRequest({action: "Protego", url: document.URL});
}

function reparo() {
  window.location.reload();
}

function riddikulus() {
  $("img").attr("src", chrome.extension.getURL("img/zuck.jpg"));
}

