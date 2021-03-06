// Initialize Firebase
var config = {
    apiKey: "AIzaSyCULYxDPKYp2RSYGBVjzxBV9fJKWWqUGVA",
    authDomain: "test-project-ndeats.firebaseapp.com",
    databaseURL: "https://test-project-ndeats.firebaseio.com",
    projectId: "test-project-ndeats",
    storageBucket: "test-project-ndeats.appspot.com",
    messagingSenderId: "99363056800"
};
firebase.initializeApp(config);

function getUpdate() {
    const ref = firebase.database().ref('events/') // path to retrieve

    // will hold all the events in a list
    let events = []

    // retrieve data from specified path as object
    ref.on("value", function (snapshot) {
        const curr = snapshot.val() // Object that holds all events

        // maps each individual object to events array
        events = Object.keys(curr).map(event => curr[event])

        // parse location 
        events.map(event => {
            if (event.location !== "") {
                const tempList = event.location.split(',')
                event.xCoord = parseFloat(tempList[0])
                event.yCoord = parseFloat(tempList[1])
            }
        })

        // calculate center of map
        const mapCenter = center(events)

        // load map
        initMap(events, mapCenter)
    }), // on failure
        function (error) {
            console.log("Error: " + error.code)
        }

}

// calculate center
function center(events) {
    let xCenter = 0 // to be avg lat center
    let yCenter = 0 // to be avg lng center
    let eventCounter = 0 // number of events (with a location)

    events.map(event => {
        if (event.location !== "") {
            // sum coordinates and events
            xCenter += event.xCoord
            yCenter += event.yCoord
            eventCounter++
        }
    })

    if (eventCounter === 0) {
        return { // if no events yet, center on da dome
            lat: 41.7056,
            lng: -86.2353
        }
    }
    else {
        return { // calculate center of all events
            lat: xCenter / eventCounter,
            lng: yCenter / eventCounter
        }
    }
}
// load map
function initMap(events, mapCenter) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July',
        'August', 'September', 'October', 'November', 'December'
    ]

    // create initial map
    const map = new google.maps.Map(document.getElementById('map'), {
        scaleControl: true,
        center: mapCenter,
        zoom: 16 // increase to zoom in, decrease to zoom out
    })

    // create markers for each event, list info in window

    events.map(event => {
        if (event.location !== "") {
            // InfoWindow is the thing that pops up on marker click
            const infoWindow = new google.maps.InfoWindow

            // parse date to prettify
            let dateList = event.date.split('-')

            const month = months[parseInt(dateList[0]) - 1]

            if (dateList[1][0] === '0') {
                dateList[1] = dateList[1][1]
            }

            const day = dateList[1]
            const year = dateList[2]

            // construct styled string to be displayed in InfoWindow

            const content =
                `<b>Event: </b>${event.title}<br>
            <b>Host: </b>${event.host}<br>
            <b>Date: </b>${month} ${day}, ${year}<br>
            <b>Start Time: </b>${event.startHour}:${event.startMinute} ${event.startTimeOfDay}<br>
            <b>End Time: </b>${event.endHour}:${event.endMinute} ${event.endTimeOfDay}<br>
            <b>Location Description: </b>${event.locationDesc}<br>
            <b>Description: </b>${event.eventDesc}<br>`

            // set content of pop up window to the styled string
            infoWindow.setContent(content)

            // add marker to map with provided coordinates
            const marker = new google.maps.Marker({
                map: map,
                position: {
                    lat: event.xCoord,
                    lng: event.yCoord
                }
            })

            // add event listener to marker to make infowindow pop up
            marker.addListener('click', function () {
                infoWindow.open(map, marker)
            })
        }
    })
}