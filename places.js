var client = new simplegeo.PlacesClient('A4SHeDsBquESjQ2JVYcvgRfuCZCtFMhv');

var po = org.polymaps;
var map = po.map()
    .container(document.getElementById("map").appendChild(po.svg("svg")))
    .add(po.interact())
    .add(po.hash())
    .on("move", move)
    .on("resize", move);

map.add(po.image()
    .url(po.url("http://{S}tile.cloudmade.com"
    + "/1a1b06b230af4efdbb989ea99e9841af" // http://cloudmade.com/register
    + "/998/256/{Z}/{X}/{Y}.png")
    .hosts(["a.", "b.", "c.", ""])));

var geojson = po.geoJson()
                .on("load", setMarkers);
map.add(geojson);
map.add(po.compass().pan("none"))

client.getLocationByIP(function(err, position) {
    positionMap(err, position);
    client.watchLocationHTML5({enableHighAccuracy: true}, positionMap);
});

function positionMap(err, position) {
    if (err) { 
        (typeof console == "undefined") ? alert(e) : console.error(e);
    } else {
        var coords = position.coords;
        map.center({lat: coords.latitude, lon: coords.longitude});
        map.zoom(15);
    }
}

var radius = 10, tips = {};
var timeout, delay = 300;

function move() {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(refresh, delay);
}

function refresh() {
    var search = document.getElementById("search");
    if (search.value != "")  {
        timeout = setTimeout(function () {}, delay);
        client.search(map.center().lat, map.center().lon, {q: search.value}, function(err, data) {
            if (err) 
                (typeof console == "undefined") ? alert(e) : console.error(e);
            else
                geojson.features(data.features);
        });
    }
}

function setMarkers(e) {
  var features = e.features;
  if (!features.length) return;
  $("a.xtooltip").each(function() {document.body.removeChild(this)});
  for (var i = 0; i < features.length; i++) {
    var f = features[i];
    var properties = f.data.properties;
    f.element.setAttribute("r", radius);
    var p = map.locationPoint({
        lat: f.data.geometry.coordinates[1],
        lon: f.data.geometry.coordinates[0]
      });
    var anchor = document.body.appendChild(document.createElement("a"));
    anchor.setAttribute("class", "xtooltip");
    anchor.style.left = p.x - radius + "px";
    anchor.style.top = p.y - radius + "px";
    anchor.style.position = "absolute";
    anchor.style.visibility = "hidden";
    anchor.style.width = radius * 2 + "px";
    anchor.style.height = radius * 2 + "px";
    var cat = "", tags = "";
    for (var c = 0; c < properties.classifiers.length; c++) {
        var cls = properties.classifiers[c];
        cat += cls.category + (cls.subcategory ? " &raquo; " + cls.subcategory : "") + "<br />";
    }
    for (var c = 0; c < properties.tags.length; c++)
        if (properties.tags[c])
            tags += "#" + properties.tags[c] + " ";
    $(anchor).tipsy({
        html: true,
        fallback: '<div class="business">'
          + properties.name + "<br />"
          + '<div style="font-size: smaller">'
          + properties.address + "<br />"
          + properties.city + " " + properties.province + " " + properties.postcode + "<br />"
          + properties.phone
          + ((cat || tags) ? "<br /><br />" : "")
          + cat
          + (tags ? "<br />" + tags : "")
          + '</div>'
          + '</div>',
        gravity: $.fn.tipsy.autoNS,
        fade: true
    });
    f.element.addEventListener("mouseover", toggle(anchor, "show"), false);
    f.element.addEventListener("mouseout", toggle(anchor, "hide"), false);
  } 
}

function toggle(f, op) {
    return function() { $(f).tipsy(op) };
}
