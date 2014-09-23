define([
  'commons/websocket'
],function(
  websocket
) {

  var defaultTime = { "startTime": "", "endTime": "", "rolling": "20minutes" };

  var streams = {
    actor:      websocket.subscribe('type', 'actor'),
    actors:     websocket.subscribe('type', 'actors'),
    deviation:  websocket.subscribe('type', 'deviation'),
    deviations: websocket.subscribe('type', 'deviations'),
    request:    websocket.subscribe('type', 'request'),
    requests:   websocket.subscribe('type', 'requests')
  }

  var filters = {
    active:     ko.observable([]).extend({ throttle: 50 }), // Store the activated filters labels

    actor:      ko.observable().extend({ throttle: 50 }),
    actors:     ko.observable().extend({ throttle: 50 }),
    deviation:  ko.observable().extend({ throttle: 50 }),
    deviations: ko.observable().extend({ throttle: 50 }),
    request:    ko.observable().extend({ throttle: 50 }),
    requests:   ko.observable().extend({ throttle: 50 })
  }

  var overview = [{
    "name": "overview",
    "paging": {
      "offset": 0,
      "limit": 10000
    },
    "scope": {}
  }];

  /**
   Send an InspectRequest
   */
  function send(message){
    websocket.send({
      request: 'InspectRequest',
      location: message
    });
  }

  function reset(){
    send({
      "commands": [{
        "module": "lifecycle",
        "command": "reset"
      }]
    });
  }
  reset();


  function request(){
    setTimeout(function() {
      send({
        modules: filters.active().map(function(label) { return filters[label](); }).concat(overview),
        time: defaultTime // TODO: Time? Should we get rid of it?
      });
    },10)
  }
  // Every time a filter change, we do a request.
  $.each(filters, function(label, obs) {
    obs.subscribe(request);
  });

  return {
    streams:      streams,
    filters:      filters,
    request:      request,
    send:         send,
    reset:        reset
  };

})
