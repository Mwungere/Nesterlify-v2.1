$(document).ready(function () {


    $("#submitButtonHome").click(function (event) {
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
        var data = JSON.stringify(reqData);
        console.log("DATA", data)
        localStorage.setItem("reqData", data);
        

        window.location.href = 'flights/flights-list.html';
        
    });

 
});