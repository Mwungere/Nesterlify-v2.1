document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const flightNumber = urlParams.get('flightNumber');
  const departingAt = urlParams.get('departingAt');
  const origin = urlParams.get('origin');
  const destination = urlParams.get('destination');
  const duration = urlParams.get('duration');
  const currency = urlParams.get('currency');
  const price = urlParams.get('price');

  // Use these parameters to fetch additional details or display on the page
  const flightDetailsContainer = document.getElementById('flight-details');
  flightDetailsContainer.innerHTML = `
      <div class="flight-header">
          <h2>Flight Details</h2>
          <button class="btn btn-primary book-now" data-flight-number="${flightNumber}" data-departing-at="${departingAt}" data-origin="${origin}" data-destination="${destination}" data-amount="${price}">Select flight</button>
      </div>
      <div class="flight-details">
          <p><strong>Flight Number:</strong> ${flightNumber}</p>
          <p><strong>Departing At:</strong> ${departingAt}</p>
          <p><strong>Duration:</strong> ${duration}</p>
          <p><strong>Origin:</strong> ${origin}</p>
          <p><strong>Destination:</strong> ${destination}</p>
          <p><strong>Price:</strong>${currency} ${price}</p>
      </div>
      <div class="flight-footer">
          <span class="text-muted"></span>
      </div>
  `;

  // Attach event listeners to "Book Now" buttons in cards
  document.querySelectorAll('.book-now').forEach(button => {
    button.addEventListener('click', (event) => {
      const flightNumber = event.target.getAttribute('data-flight-number');
      const departingAt = event.target.getAttribute('data-departing-at');
      const origin = event.target.getAttribute('data-origin');
      const flightAmount = event.target.getAttribute('data-amount');
      const destination = event.target.getAttribute('data-destination');

      const bookingFormModal = document.getElementById('bookingFormModal');

      const bookingFormModalInstance = new bootstrap.Modal(bookingFormModal, {
        backdrop: 'static',
        keyboard: false
      });
      bookingFormModalInstance.show();

      // Pass flightNumber and departingAt to displayBookingConfirmation
      displayBookingConfirmation(flightNumber, departingAt, destination, flightAmount, origin);
    });
  });

});


function calculateReturnDate(startDate, daysToAdd) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split("T")[0];
}


document.getElementById("searchingForm").addEventListener("submit", handleFlightSearch);

// Function to display flight search results
function displayFlightResults(results, container) {
  const offersContainer = container;
  offersContainer.innerHTML = ""; // Clear existing offers

  const displayedCarriers = new Set();

  results.forEach((offer, index) => {
    offer.slices.forEach((slice) => {
      slice.segments.forEach((segment) => {
        const { operating_carrier, departing_at, operating_carrier_flight_number } = segment;

        if (!displayedCarriers.has(operating_carrier_flight_number) && !displayedCarriers.has(departing_at)) {
          displayedCarriers.add(operating_carrier_flight_number);
          displayedCarriers.add(departing_at);

          const flightCard = document.createElement("div");
          flightCard.classList.add("col-lg-4", "col-md-6", "wow", "fadeInUp");
          flightCard.setAttribute("data-wow-delay", "0.1s");

          const { total_currency, total_amount } = offer;
          const { origin, destination, duration } = segment;

          flightCard.innerHTML = `
    <div class="card transition-3d-hover shadow-hover-2 h-100">
        <div class="position-relative">
            <a href="/html/flights/flight-booking.html?flightNumber=${operating_carrier_flight_number}&departingAt=${departing_at}&origin=${origin.city_name}&destination=${destination.city_name}&duration=${duration}&price=${total_amount}&currency=${total_currency}" class="d-block gradient-overlay-half-bg-gradient-v5">
                <img class="card-img-top" src="../../assets/img/300x230/img27.jpg" alt="Image Description">
            </a>
            <div class="position-absolute top-0 right-0 end-0 p-2">
                <img src="${operating_carrier.logo_symbol_url}" alt="${operating_carrier.name} Logo" class="img-fluid" style="width: 60px; height: auto;">
            </div>
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


          offersContainer.appendChild(flightCard);
        }
      });
    });
  });

  // Attach event listeners to "View Detail" buttons
  document.querySelectorAll(".view-detail").forEach((button) => {
    button.addEventListener("click", (event) => {
      const offerIndex = event.target.getAttribute("data-offer-index");
      showFlightDetails(results[offerIndex]);
    });
  });

  // Attach event listeners to "Book Now" buttons in cards
  document.querySelectorAll('.book-now').forEach(button => {
    button.addEventListener('click', (event) => {
      const flightNumber = event.target.getAttribute('data-flight-number');
      const departingAt = event.target.getAttribute('data-departing-at');
      const origin = event.target.getAttribute('data-origin');
      const flightAmount = event.target.getAttribute('data-amount');
      const destination = event.target.getAttribute('data-destination');

      const bookingFormModal = document.getElementById('bookingFormModal');

      const bookingFormModalInstance = new bootstrap.Modal(bookingFormModal, {
        backdrop: 'static',
        keyboard: false
      });
      bookingFormModalInstance.show();

      // Pass flightNumber and departingAt to displayBookingConfirmation
      displayBookingConfirmation(flightNumber, departingAt, destination, flightAmount, origin);
    });
  });
}

// Function to handle flight search
async function handleFlightSearch(event) {
  event.preventDefault();

  const fromWhere = document.getElementById('fromWhere').value.trim();
  const toWhere = document.getElementById('toWhere').value.trim();
  const departReturn = document.getElementById('departReturn').value.trim();
  const travelers = document.getElementById('travelers').value.split(' ');
  const numAdults = parseInt(travelers[0], 10);
  const cabinClass = travelers[1].toLowerCase();
  console.log(departReturn);
  
  // Function to parse and format the date
  function formatDate(dateStr) {
      const [month, day, year] = dateStr.split(/[\/ ]/).filter(Boolean);
      const date = new Date(`${month} ${day}, ${year}`);
      const yearFormatted = date.getFullYear();
      const monthFormatted = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JS
      const dayFormatted = String(date.getDate()).padStart(2, '0');
      return `${yearFormatted}-${monthFormatted}-${dayFormatted}`;
  }
  
  // Extract depart and return dates
  const [departDateStr, returnDateStr] = departReturn.split('-').map(date => date.trim());
  const departDate = formatDate(departDateStr);
  const returnDate = formatDate(returnDateStr);
  
  console.log(departDate, returnDate);
  
  // Determine trip type
  const tripType = document.querySelector('.tab-pane.active').id; // id of active tab
  let slices = [];
  let passengers = Array(numAdults).fill({ type: "adult" });
  
  if (tripType === 'pills-two-example2') {
      // One-way trip
      slices = [
          {
              origin: fromWhere,
              destination: toWhere,
              departure_date: departDate
          }
      ];
  } else if (tripType === 'pills-one-example2') {
      // Round trip
      slices = [
          {
              origin: fromWhere,
              destination: toWhere,
              departure_date: departDate
          },
          {
              origin: toWhere,
              destination: fromWhere,
              departure_date: returnDate
          }
      ];
  } else if (tripType === 'pills-three-example2') {
      // Multi-city trip
      slices = [
          {
              origin: fromWhere,
              destination: toWhere,
              departure_date: departDate
          }
          // Additional slices for multi-city trips should be added here
      ];
  }
  
  try {
      const offerRequestResponse = await fetch("https://nesterlify-server-6.onrender.com/api/offer_requests", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({
              data: {
                  slices: slices,
                  passengers: passengers,
                  cabin_class: cabinClass
              }
          })
      });

      const offerRequestData = await offerRequestResponse.json();
      const offerRequestId = offerRequestData.data.id;

      const response = await fetch(`https://nesterlify-server-6.onrender.com/api/offers/${offerRequestId}`, {
          method: "GET",
          headers: {
              "Content-Type": "application/json"
          }
      });

      const data = await response.json();

      if (data.offers && data.offers.length > 0) {
          console.log("Search Results:", data.offers);
          localStorage.setItem('flightSearchResults', JSON.stringify(data.offers));
          if (!window.location.pathname.includes('flights-list.html')) {
            window.location.href = '/html/flights/flights-list.html';        
          } else {
              const offersContainer = document.getElementById("flights-container");
              displayFlightResults(data.offers, offersContainer);
          }
      } else {
          console.log("No offers found!");
          alert("No offers found. Please try again.");
      }

  } catch (error) {
      console.error("Error fetching offers:", error);
      alert("Error fetching offers. Please try again later.");
  }
}


// Function to handle booking form submission and send booking data
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


async function createInvoiceAndGetId(formData) {
  const invoiceData = {
    price_amount: formData.flightAmount,
    price_currency: 'usd', // Currency in which price amount is specified
    order_id: formData.flightNumber,
    order_description: `Flight from ${formData.origin} to ${formData.destination}`,
    pay_currency: formData.currency, // Currency in which the customer will pay
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
      body: JSON.stringify(invoiceData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Invoice created successfully:', responseData);

    // Extract the invoice ID from the response
    const invoiceId = responseData.id; // Assuming the response contains 'id' as the invoice ID
    console.log('Invoice ID:', invoiceId);

    return invoiceId;

  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}

async function createPaymentByInvoice(invoiceId, formData) {
 // Define the payout addresses for different currencies
 const payoutAddresses = {
  btc: "bc1q76rq5503wz0jc03n3y5vc4xm600kshsarhwsvh",
  eth: "0x2F67ba7d67e4Cf9DEe708fe0f5a329788C806265"
};

// Select the payout address based on the currency
const payoutAddress = payoutAddresses[formData.currency.toLowerCase()];

// Prepare the payment data
const paymentData = {
  iid: invoiceId,
  pay_currency: formData.currency, // Currency in which the customer will pay
  order_description: `Flight from ${formData.origin.city_name} to ${formData.destination.city_name}`,
  customer_email: formData.email,
  payout_address: payoutAddress, 
  payout_extra_id: null,
  payout_currency: formData.currency
};

  try {
    const response = await fetch('https://api.nowpayments.io/v1/invoice-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'YJA2X3S-KHRMN22-P97DR57-XMSHMQG'
      },
      body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Payment created successfully:', responseData);

    // Display payment details on your site
    displayPaymentDetails(responseData);
  } catch (error) {
    console.error('Error creating payment:', error);
    // Handle error and inform user
  }
}

function displayPaymentDetails(paymentData) {
  const paymentModalContent = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Complete Your Payment</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>Payment Address: ${paymentData.pay_address}</p>
          <p>Amount: ${paymentData.pay_amount} ${paymentData.pay_currency}</p>
          <p>Order Description: ${paymentData.order_description}</p>
          <p>Please send the payment to the above address or scan the QR code below.</p>
          <div id="qrcode"></div> <!-- QR code will be inserted here -->
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  `;

  const paymentModal = document.createElement('div');
  paymentModal.classList.add('modal', 'fade');
  paymentModal.innerHTML = paymentModalContent;

  document.body.appendChild(paymentModal);

  const bootstrapModal = new bootstrap.Modal(paymentModal);
  bootstrapModal.show();

  // Generate the QR code
  const qrCodeData = `${paymentData.pay_address}?amount=${paymentData.pay_amount}`;
  new QRCode(document.getElementById("qrcode"), qrCodeData);
}

function displayBookingConfirmation(flightNumber, departingAt, destination, flightAmount, origin) {
  const bookingForm = document.getElementById("bookingForm");
  console.log(destination, origin);

  bookingForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const country = document.getElementById("country").value.trim();
    const gender = document.getElementById("gender").value.trim();
    const dob = document.getElementById("dob").value.trim();
    const passportNumber = document.getElementById("passportNumber").value.trim();
    const email = document.getElementById("email").value.trim();
    const currency = document.getElementById("currency").value.trim(); // Get selected currency

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
      origin,
      email, // Add email to formData
      currency // Add selected currency to formData
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
            <p>Origin: ${formData.origin}</p>
            <p>Destination: ${formData.destination}</p>
            <p>Flight Number: ${formData.flightNumber}</p>
            <p>Departing At: ${formData.departingAt}</p>
            <p>Payment Currency: ${formData.currency}</p> <!-- Display selected currency -->
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
    confirmReservationButton.addEventListener('click', async () => {
      try {
        // Create the invoice and get its ID
        const invoiceId = await createInvoiceAndGetId(formData);
        formData.invoiceId = invoiceId;
        // Create payment with the invoice ID
        await createPaymentByInvoice(invoiceId, formData);

        alert('Reservation confirmed!');
        console.log('Flight Number:', flightNumber);
        console.log('Departing At:', departingAt);
        bootstrapModal.hide();
      } catch (error) {
        console.error('Error confirming reservation:', error);
      }
    });
  });
}
