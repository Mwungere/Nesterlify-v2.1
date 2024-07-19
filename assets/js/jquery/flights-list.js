$(document).ready(function () {

    var dataPresent = false;
    function getTomorrowsDate() {
        // Create a Date object for today
        const today = new Date();

        // Increment the date by 1 to get tomorrow's date
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Format the date in YYYY-MM-DD 
        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const dd = String(tomorrow.getDate()).padStart(2, '0');

        const formattedDate = `${yyyy}-${mm}-${dd}`;
        return formattedDate;
    }

    function loadingToggler() {
        if (dataPresent) {
            $('#flights-container').show();
            $('#loading-display').hide();
        } else {
            $('#flights-container').hide();
            $('#loading-display').show();
        }
    }

    var data = localStorage.getItem("reqData");

    if (data) {
        // Parse JSON string back to object
        var reqData = JSON.parse(data);
        loadingToggler();
        postData("http://localhost:5000/api/flights", reqData);
    }



    // Create a Date object from the ISO 8601 formatted string
    function convertDateFormat(dateString) {

        const dateObject = new Date(dateString);

        const options = {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            timeZone: 'GMT',
            timeZoneName: 'short'
        };
        return dateObject.toLocaleString('en-US', options);
    }

    function postData(url, data) {
        $.ajax({
            url: url,
            type: "POST",
            data: data,
            dataType: "json",
            success: function (response) {
                var flights = response.data.data.offers;


                var data = JSON.stringify(response.data.data.offers);

                dataPresent = true;
                localStorage.setItem("flights", data);


                flights.forEach(function (flight) {
                    console.log("IMAGE", flight.owner.logo_symbol_url)
                    var html = '<div id="flight-template" class="col-md-6 col-xl-4">' +
                        '<div class="mb-5">' +
                        '<div class="card w-100 shadow-hover-3">' +
                        '<a href="../flights/flights-booking.html" class="d-block mb-0 mx-1 mt-1 p-3" tabindex="0">' +
                        '<img class="card-img-top" src="' + flight.owner.logo_lockup_url + '" alt="airline logo" />' +
                        '</a>' +
                        '<div class="card-body px-3 pt-0 pb-3 my-0 mx-1">' +
                        '<div class="col-6">' +
                        '<a href="../flights/flights-booking.html?id=' + flight.id + '" class="card-title text-dark font-size-17 font-weight-bold" tabindex="0">' + flight.slices[0].destination.city_name + '</a>' +
                        '<span class="card-type font-weight-normal font-size-14 d-block text-color-1">Oneway flight</span>' +
                        '</div>' +
                        '<span class="col-4"><div class="text-right">' +
                        '<h6 class="card-title card-price font-weight-bold font-size-17 text-gray-3 ">' + '$' + flight.total_amount + '</h6>' +
                        '<span class="font-weight-normal font-size-14 d-block text-color-1">avg/person</span>' +
                        '</span>' +
                        '</div>' +
                        '</div>' +
                        '</div> <div class="mb-3 pb-1">' +
                        '<div class="border-bottom pb-3 mb-3">' +
                        '<div class="px-3"> <div class="d-flex mx-1">' +
                        '<i class="flaticon-aeroplane font-size-30 text-primary mr-3"></i>' +
                        '<div class="d-flex flex-column">' +
                        '<span class="font-weight-normal text-gray-5">Take off</span>' +
                        '<span class="card-departurefont-size-14 text-gray-1">' + convertDateFormat(flight.slices[0].segments[0].departing_at) + '</span>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '<div class="border-bottom pb-3 mb-3">' +
                        '<div class="px-3">' +
                        '<div class="d-flex mx-1">' +
                        '<i class="d-block rotate-90 flaticon-aeroplane font-size-30 text-primary mr-3"></i>' +
                        '<div class="d-flex flex-column">' +
                        '<span class="font-weight-normal text-gray-5">Landing</span>' +
                        '<span class="font-size-14 text-gray-1">' + convertDateFormat(flight.slices[0].segments[0].arriving_at) + '</span>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '<div class="text-center font-size-14 text-primary mb-3">' +

                        '<a class="font-size-14 text-gray-1 d-block" href="#ontargetMod" data-modal-target="#ontargetMod" data-modal-effect="fadein">' +

                        '</a>' +
                        '<div id="ontargetMod" class="js-modal-window u-modal-window max-width-960" data-modal-type="ontarget" data-open-effect="fadeIn" data-close-effect="fadeOut" data-speed="500">' +
                        '<div class="card mx-4 mx-xl-0 mb-4 mb-md-0">' +
                        '<button type="button" class="border-0 width-50 height-50 bg-primary flex-content-center position-absolute rounded-circle mt-n4 mr-n4 top-0 right-0" aria-label="Close" onclick="Custombox.modal.close();">' +
                        '<i aria-hidden="true" class="flaticon-close text-white font-size-14"></i>' +
                        '</button>' +

                        '<header class="card-header bg-light py-4 px-4">' +
                        '<div class="row align-items-center text-center">' +
                        '<div class="col-md-auto mb-4 mb-md-0">' +
                        '<div class="d-block d-lg-flex flex-horizontal-center">' +
                        '<img class="img-fluid mr-3 mb-3 mb-lg-0" src="../../assets/img/90x90/img1.png" alt="Image-Description" />' +
                        '<div class="font-size-14">' + flight.owner.name + '</div>' +
                        '</div>' +
                        '</div>' +
                        '<div class="col-md-auto mb-4 mb-md-0">' +
                        '<div class="mx-2 mx-xl-3 flex-content-center align-items-start d-block d-lg-flex">' +
                        '<div class="mr-lg-3 mb-1 mb-lg-0">' +
                        '<i class="flaticon-aeroplane font-size-30 text-primary"></i>' +
                        '</div>' +
                        '<div class="text-lg-left">' +
                        '<h6 class="font-weight-bold font-size-21 text-gray-5 mb-0">18:30</h6>' +
                        '<div class="font-size-14 text-gray-5">Sat, 21 Sep 19</div>' +
                        '<span class="font-size-14 text-gray-1">New Delhi, India</span>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '<div class="col-md-auto mb-4 mb-md-0">' +
                        '<div class="mx-2 mx-xl-3 flex-content-center flex-column">' +
                        '<h6 class="font-size-14 font-weight-bold text-gray-5 mb-0">02 hrs 45 mins</h6>' +
                        '<div class="width-60 border-top border-primary border-width-2 my-1"></div>' +
                        '<div class="font-size-14 text-gray-1">Non Stop</div>' +
                        '</div>' +
                        '</div>' +
                        '<div class="col-md-auto mb-4 mb-md-0">' +
                        '<div class="mx-2 mx-xl-3 flex-content-center align-items-start d-block d-lg-flex">' +
                        '<div class="mr-lg-3 mb-1 mb-lg-0">' +
                        '<i class="d-block rotate-90 flaticon-aeroplane font-size-30 text-primary"></i>' +
                        '</div>' +
                        '<div class="text-lg-left">' +
                        '<h6 class="font-weight-bold font-size-21 text-gray-5 mb-0">21.15</h6>' +
                        '<div class="font-size-14 text-gray-5">Sun, 22 Sep 19</div>' +
                        '<span class="font-size-14 text-gray-1">Bengaluru, India</span>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</header>' +

                        '<div class="card-body py-4 p-md-5">' +
                        '<div class="row">' +
                        '<div class="col">' +
                        '<ul class="d-block d-md-flex list-group list-group-borderless list-group-horizontal list-group-flush no-gutters">' +
                        '<li class="mr-md-8 mr-lg-10 mb-5 list-group-item py-0">' +
                        '<div class="font-weight-bold text-dark">Baggage</div>' +
                        '<span class="text-gray-1">Adult</span>' +
                        '</li>' +
                        '<li class="mr-md-8 mr-lg-10 mb-5 list-group-item py-0">' +
                        '<div class="font-weight-bold text-dark">Check-in</div>' +
                        '<span class="text-gray-1">15 Kgs</span>' +
                        '</li>' +
                        '<li class="mr-md-8 mr-lg-10 mb-5 list-group-item py-0">' +
                        '<div class="font-weight-bold text-dark">Cabin</div>' +
                        '<span class="text-gray-1">7 Kgs</span>' +
                        '</li>' +
                        '</ul>' +
                        '</div>' +
                        '<div class="col-auto">' +
                        '<div class="min-width-250">' +
                        '<h5 class="font-size-17 font-weight-bold text-dark">Fare breakup</h5>' +
                        '<ul class="list-unstyled font-size-1 mb-0 font-size-16">' +
                        '<li class="d-flex justify-content-between py-2">' +
                        '<span class="font-weight-medium">Base Fare</span>' +
                        '<span class="text-secondary">€580,00</span>' +
                        '</li>' +

                        '<li class="d-flex justify-content-between py-2">' +
                        '<span class="font-weight-medium">Surcharges</span>' +
                        '<span class="text-secondary">€0,00</span>' +
                        '</li>' +


                        '<li class="d-flex justify-content-between py-2 font-size-17 font-weight-bold">' +
                        '<span class="font-weight-bold">Pay Amount</span>' +
                        '<span class="">€580,00</span>' +
                        '</li>' +
                        '</ul>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +

                        '</div>' +
                        '</div>' +

                        '</div>' +
                        '<div class="d-flex justify-content-center">' +
                        '<a href="../flights/flights-booking.html?id=' + flight.id + '" class="btn btn-blue-1 font-size-14 width-260 text-lh-lg transition-3d-hover py-1">Choose</a>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>';

                    var container = $("#flights-container");
                    container.append(html);

                });

                loadingToggler()
            },
            error: function (jqXHR, textStatus, errorThrown) {
                // Handle error during the request
                console.error("Error posting data:", textStatus, errorThrown);
                // Display error message to user or take appropriate action
            }
        });
    }

    $("#submitButton").click(function (event) {
        event.preventDefault(); // Prevent default form submission behavior
        var fromWhere = $("#fromWhere").val();
        var toWhere = $("#toWhere").val();
        var departReturn = $("#departReturn").val();
        var travelers = $("#travelers").val();

        var type = travelers.split(" ")[0];
        var cabin_class = travelers.split(" ")[1];

        const reqData = {
            data: {
                "slices": [
                    {
                        "origin": fromWhere,
                        "destination": toWhere,
                        "departure_date": departReturn,
                    }
                ],
                "passengers": [
                    {
                        "family_name": "Earhart",
                        "given_name": "Amelia",
                        "loyalty_programme_accounts": [
                            {
                                "account_number": "12901014",
                                "airline_iata_code": "BA"
                            }
                        ],
                        "type": type
                    },
                    {
                        "fare_type": "student"
                    },
                    {
                        "age": 5,
                        "fare_type": "contract_bulk_child"
                    }
                ],
                "max_connections": 0,
                "cabin_class": cabin_class
            }
        }

        loadingToggler()
        postData("http://localhost:5000/api/flights", reqData);

    });


});