const airports = ["NYC","JFK", "LAX", "ORD", "ATL", "DFW", "DEN", "SFO", "SEA", "MIA", "BOS"];

function getRandomAirport() {
  const randomIndex = Math.floor(Math.random() * airports.length);
  return airports[randomIndex];
}

function calculateReturnDate(startDate, daysToAdd) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split("T")[0];
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function fetchOffersWithRetry(retryCount = 0) {
  const maxFlights = 3;
  const today = new Date().toISOString().split("T")[0];

  // Randomly select origin and destination
  const origin = getRandomAirport();
  let destination = getRandomAirport();
  
  // Ensure origin and destination are not the same
  while (destination === origin) {
    destination = getRandomAirport();
  }

  try {
    const offerRequestResponse = await fetch("https://nesterlify-server-6.onrender.com/api/offer_requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          slices: [
            {
              origin: origin,
              destination: destination,
              departure_date: today,
            },
            {
              origin: destination,
              destination: origin,
              departure_date: calculateReturnDate(today, 11),
            },
          ],
          passengers: [
            { type: "adult" },
            { type: "adult" },
            { age: 1 },
          ],
          cabin_class: "business",
        },
      }),
    });

    const offerRequestData = await offerRequestResponse.json();
    const offerRequestId = offerRequestData.data.id;

    const response = await fetch(`https://nesterlify-server-6.onrender.com/api/offers/${offerRequestId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });

    const data = await response.json();

    if (data.offers && data.offers.length > 0) {
      return data.offers;
    } else {
      if (retryCount < 3) { // Limit the number of retries to avoid infinite loop
        console.log("No offers found, retrying...");
        return fetchOffersWithRetry(retryCount + 1);
      } else {
        throw new Error("No offers found after multiple attempts.");
      }
    }
  } catch (error) {
    throw new Error(`Error fetching offers: ${error.message}`);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const offersContainer = document.getElementById("offers-container");
  const cheapOffersContainer = document.getElementById("cheap-offers-container");
  const maxFlights = 3;

  offersContainer.innerHTML = "<p>Loading offers...</p>";
  cheapOffersContainer.innerHTML = "<p>Loading offers...</p>";

  // Function to fetch offers
  async function fetchOffers() {
    try {
      let offers = await fetchOffersWithRetry();

      let cheapOffers = offers.filter(offer => parseFloat(offer.total_amount) < 800);
      let expensiveOffers = offers.filter(offer => parseFloat(offer.total_amount) >= 800);

      let fetchedCheap = cheapOffers.length > 0;
      let fetchedExpensive = expensiveOffers.length > 0;

      if (fetchedCheap) {
        displayOffers(cheapOffers, cheapOffersContainer, 'cheap');
      } else {
        cheapOffersContainer.innerHTML = "<p>No cheap offers found!</p>";
      }

      if (fetchedExpensive) {
        displayOffers(expensiveOffers, offersContainer, 'expensive');
      } else {
        offersContainer.innerHTML = "<p>No expensive offers found!</p>";
      }

      // Fetch again if only one type of offer was found
      while (!fetchedCheap || !fetchedExpensive) {
        let additionalOffers = await fetchOffersWithRetry();

        if (!fetchedCheap) {
          let additionalCheapOffers = additionalOffers.filter(offer => parseFloat(offer.total_amount) < 800);
          if (additionalCheapOffers.length > 0) {
            cheapOffersContainer.innerHTML = ""; // Clear no offers message
            displayOffers(additionalCheapOffers, cheapOffersContainer, 'cheap');
            fetchedCheap = true;
          } else {
            cheapOffersContainer.innerHTML = "<p>No cheap offers found, retrying...</p>";
          }
        }

        if (!fetchedExpensive) {
          let additionalExpensiveOffers = additionalOffers.filter(offer => parseFloat(offer.total_amount) >= 800);
          if (additionalExpensiveOffers.length > 0) {
            offersContainer.innerHTML = ""; // Clear no offers message
            displayOffers(additionalExpensiveOffers, offersContainer, 'expensive');
            fetchedExpensive = true;
          } else {
            offersContainer.innerHTML = "<p>No expensive offers found, retrying...</p>";
          }
        }
      }
    } catch (error) {
      offersContainer.innerHTML = `<p>Error loading offers: ${error.message}</p>`;
      cheapOffersContainer.innerHTML = `<p>Error loading offers: ${error.message}</p>`;
    }
  }

  // Function to display offers
  function displayOffers(offers, container, type) {
    container.innerHTML = ""; // Clear any existing content
    offers.slice(0, maxFlights).forEach((offer, index) => {
      offer.slices.forEach((slice) => {
        slice.segments.forEach((segment) => {
          const { operating_carrier, departing_at, operating_carrier_flight_number } = segment;
          const { total_currency, total_amount } = offer;
          const { origin, destination, duration } = segment;

          const flightCard = document.createElement("div");
          flightCard.classList.add("col-md-6", "col-xl-3", "mb-3", "mb-md-4", "pb-1");
          flightCard.setAttribute("data-wow-delay", "0.1s");

          flightCard.innerHTML = `
              <div class="card transition-3d-hover shadow-hover-2 h-100">
                  <div class="position-relative">
                      <a href="/html/flights/flight-booking.html?flightNumber=${operating_carrier_flight_number}&departingAt=${departing_at}&origin=${origin.city_name}&destination=${destination.city_name}&duration=${duration}&price=${total_amount}&currency=${total_currency}" class="d-block gradient-overlay-half-bg-gradient-v5">
                          <img class="card-img-top" src="../../assets/img/300x230/img27.jpeg" alt="Image Description"  >
                      </a>
                      <div class="position-absolute top-0 left-0 pt-5 pl-3">
                          <a href="/html/flights/flight-booking.html">
                              <span class="badge badge-pill bg-white text-primary px-4 py-2 font-size-14 font-weight-normal">${total_currency} ${total_amount}</span>
                          </a>
                          <span class="ml-2 text-white">${operating_carrier.name}</span>
                      </div>
                      <div class="position-absolute bottom-0 left-0 right-0">
                          <div class="px-3 pb-2">
                              <div class="text-white my-1"> 
                                  <span class="mr-1 font-size-14">From</span>
                                  <span class="font-weight-bold font-size-19">${origin.city_name}</span>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div class="card-body px-3 pt-2">
                      <a href="/html/flights/flight-booking.html" class="card-title font-size-17 font-weight-bold mb-0 text-dark pt-1 pb-1 d-block">${origin.city_name} to ${destination.city_name}</a>
                      <div class="font-size-14 text-gray-1">
                          Oneway Flight
                      </div>
                  </div>
                  
              </div>
          `;

          container.appendChild(flightCard);
        });
      });
    });
  }

  await fetchOffers();
});



function showFlightDetails(offer) {
  const modalContent = document.getElementById("flightDetailsContent");
  modalContent.innerHTML = ""; // Clear previous details

  // Iterate through each slice and segment to find the selected flight details
  offer.slices.forEach((slice, sliceIndex) => {
    slice.segments.forEach((segment, segmentIndex) => {
      if (sliceIndex === 0 && segmentIndex === 0) {
        const { origin, destination, operating_carrier, duration, operating_carrier_flight_number } = segment;
        const segmentDetails = `
          <div class="segment-detail">
            <h5>${operating_carrier.name}</h5>
            <p>Flight Number: ${operating_carrier_flight_number}</p>
            <p>Duration: ${duration}</p>
            <p>From: ${origin.city_name} (${origin.iata_city_code})</p>
            <p>To: ${destination.city_name} (${destination.iata_city_code})</p>
            <button class="btn btn-sm btn-dark rounded py-2 px-4 book-now" data-flight-number="${operating_carrier_flight_number}" data-departing-at="${segment.departing_at}">Book Now</button>
          </div>
          <hr>
        `;
        modalContent.insertAdjacentHTML("beforeend", segmentDetails);
      }
    });
  });

  // Attach event listeners to "Book Now" buttons in flight details modal
  modalContent.querySelectorAll('.book-now').forEach(button => {
    button.addEventListener('click', (event) => {
      const flightNumber = event.target.getAttribute('data-flight-number');
      const departingAt = event.target.getAttribute('data-departing-at');

      const flightDetailModal = document.getElementById('flightDetailModal');
      const bookingFormModal = document.getElementById('bookingFormModal');

      // Hide the flight detail modal
      const flightDetailModalInstance = bootstrap.Modal.getInstance(flightDetailModal);
      flightDetailModalInstance.hide();

      // Show the booking form modal after a short delay to ensure backdrop is managed
      setTimeout(() => {
        const bookingFormModalInstance = new bootstrap.Modal(bookingFormModal, {
          backdrop: 'static',
          keyboard: false
        });
        bookingFormModalInstance.show();

        // Pass flightNumber and departingAt to displayBookingConfirmation
        displayBookingConfirmation(flightNumber, departingAt);
      }, 300);
    });
  });
}

async function handleBooking(formData) {
  try {
    const response = await fetch('https://nesterlify-server-6.onrender.com/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Booking data sent successfully:', responseData);   

    document.getElementById("bookingForm").reset();
  } catch (error) {
    console.error('Error sending booking data:', error);
    alert('Error sending booking data. Please try again later.');
  }
}

async function createInvoice(formData){
  const InvoiceData = {
    price_amount: formData.flightAmount,
    price_currency: 'btc', 
    order_id: formData.flightNumber,
    order_description: `Flight from ${formData.origin.city_name} (${formData.origin.iata_city_code}) to ${formData.destination.city_name} (${formData.destination.iata_city_code})`,
    pay_currency: 'btc',
    ipn_callback_url: "https://nowpayments.io",
    success_url: "https://nowpayments.io",
    cancel_url: "https://nowpayments.io",
    is_fixed_rate: true,
    is_fee_paid_by_user: false
  };

  try {
    const response = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'YJA2X3S-KHRMN22-P97DR57-XMSHMQG' 
      },
      body: JSON.stringify(InvoiceData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Invoice created successfully:', responseData);

    // Redirect user to the payment page
    window.location.href = responseData.invoice_url;
  } catch (error) {
    console.error('Error creating invoice:', error);
    // Handle error and inform user
  }
}

// Function to display booking confirmation modal
function displayBookingConfirmation(flightNumber, departingAt, destination, flightAmount, origin) {
  const bookingForm = document.getElementById("bookingForm");

  bookingForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const country = document.getElementById("country").value.trim();
    const gender = document.getElementById("gender").value.trim();
    const dob = document.getElementById("dob").value.trim();
    const passportNumber = document.getElementById("passportNumber").value.trim();

    const formData = {
      fullName,
      country,
      gender,
      dob,
      passportNumber,
      flightNumber,
      departingAt,
      destination,
      flightAmount,
      origin
    };

    const modalContent = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Booking Confirmation</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Full Name: ${formData.fullName}</p>
            <p>Country: ${formData.country}</p>
            <p>Gender: ${formData.gender}</p>
            <p>Date of Birth: ${formData.dob}</p>
            <p>Passport Number: ${formData.passportNumber}</p>
            <p>Flight Number: ${formData.flightNumber}</p>
            <p>Departing At: ${formData.departingAt}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" id="confirmReservation">Confirm Reservation</button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          </div>
        </div>
      </div>
    `;

    const bookingFormModal = document.getElementById('bookingFormModal');
    const bookingFormModalInstance = bootstrap.Modal.getInstance(bookingFormModal);
    bookingFormModalInstance.hide();

    const modalElement = document.createElement('div');
    modalElement.classList.add('modal', 'fade');
    modalElement.innerHTML = modalContent;

    document.body.appendChild(modalElement);

    const bootstrapModal = new bootstrap.Modal(modalElement);
    bootstrapModal.show();

    const confirmReservationButton = modalElement.querySelector('#confirmReservation');
    confirmReservationButton.addEventListener('click', () => {
      createInvoice(formData);

      handleBooking(formData);


      alert('Reservation confirmed!');
      console.log('Flight Number:', flightNumber);
      console.log('Departing At:', departingAt);
      bootstrapModal.hide();
    });
  });
}