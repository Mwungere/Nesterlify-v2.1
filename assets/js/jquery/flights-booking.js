$(document).ready(function () {

    var urlParams = new URLSearchParams(window.location.search);
    var id = urlParams.get('id');

    console.log("GG", id)

    var data = localStorage.getItem("flights");

    // Parse JSON string back to object
    var flights = JSON.parse(data);
    console.log(flights);

    // gets the flightwith id
    function getFlight(id) {
        return flights.filter(flight => flight.id === id)
    }

    // get the time difference between departure and arrival
    function getTimeDifference(startDateTime, endDateTime) {
        const startTime = new Date(startDateTime);
        const endTime = new Date(endDateTime);
    
        const timeDiff = endTime.getTime() - startTime.getTime();
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
        return `${String(hours).padStart(2, '0')} hrs ${String(minutes).padStart(2, '0')} mins`;
    }


    // get time with its zone
    function getTimeWithTimeZone(dateTimeString) {
        const dateTime = new Date(dateTimeString);
        const hours = String(dateTime.getHours()).padStart(2, '0');
        const minutes = String(dateTime.getMinutes()).padStart(2, '0');
        const timeZoneOffset = dateTime.getTimezoneOffset();
        const timeZoneHours = Math.abs(Math.floor(timeZoneOffset / 60));
        const timeZoneMinutes = Math.abs(timeZoneOffset % 60);
        const timeZonePrefix = timeZoneOffset >= 0 ? '+' : '-';
    
        return `${hours}:${minutes} UTC`;
    }

    // render data to html
    function updateHtmText(flight) {
        const start = flight.slices[0].segments[0].departing_at;
        const end = flight.slices[0].segments[0].arriving_at;
        $("#flight-location").val(flight.slices[0].origin.city_name + 'to' + flight.slices[0].destination.city_name);
        $("#flight-duration").text(`${getTimeDifference(start, end)}`);
        $("#startTime").text(`${getTimeWithTimeZone(start)}`);
        $("#endTime").text(`${getTimeWithTimeZone(end)}`);
        $("#startLocation").text(`${flight.slices[0].segments[0].origin.city_name}`);
        $("#endLocation").text(`${flight.slices[0].segments[0].destination.city_name}`);
        $("#airline").text(`${flight.owner.name}`);
        $("#flight-type").text(`${flight.slices[0].segments[0].passengers[1].cabin_class_marketing_name}`);
        $("#base-fare").text(`${flight.total_currency} ${flight.base_amount}`);
        $("#tax-fare").text(`${flight.total_currency} ${flight.tax_amount}`);

        $("#base-fare1").text(`${flight.total_currency} ${flight.base_amount}`);
        $("#tax-fare1").text(`${flight.total_currency} ${flight.tax_amount}`);
        $("#total-fare").text(`${flight.total_currency} ${flight.total_amount}`);
    }

    var flight = getFlight(id);

    updateHtmText(flight[0])

});